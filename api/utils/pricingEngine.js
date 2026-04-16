/**
 * pricingEngine.js
 * Dynamic Delivery Fee Calculation Engine for SwasthRoute.
 *
 * Pricing Formula:
 *   Base Delivery Cost = BASE_FEE + (distanceKm × RATE_PER_KM) + (distanceKm × FUEL_COST_PER_KM)
 *   Surge Multiplier   = 1.0 + emergencyAdder + peakHourAdder + weatherAdder + demandAdder
 *   Delivery Fee       = round(Base Delivery Cost × Surge Multiplier) + PLATFORM_FEE
 *   Rider Payout       = FIXED_RIDER_EARNING + (distanceKm × FUEL_COST_PER_KM)
 */

import NodeCache from 'node-cache';
import { getRouteDistance } from './geoUtils.js';
import Rider from '../models/Rider.js';
import Order from '../models/Order.js';

// ─── In-Memory Cache (30-min TTL for weather data) ───────────────────────────
const weatherCache = new NodeCache({ stdTTL: 1800 });

// ─── Pricing Constants ────────────────────────────────────────────────────────
export const PRICING_CONFIG = {
  BASE_FEE:             40,   // ₹ flat base fee
  RATE_PER_KM:          10,   // ₹ per km (rider income component)
  FUEL_COST_PER_KM:      3,   // ₹ per km (fuel reimbursement)
  FIXED_RIDER_EARNING:  15,   // ₹ guaranteed per delivery
  PLATFORM_FEE:          5,   // ₹ flat platform charge
  SURGE: {
    EMERGENCY_ADDER:   0.5,   // +50% on emergency orders
    PEAK_HOUR_ADDER:   0.2,   // +20% between 18:00 – 22:00
    WEATHER_ADDER:     0.3,   // +30% during rain / thunderstorm
    DEMAND_MAX_ADDER:  0.5,   // cap on demand-based surge
    DEMAND_THRESHOLD:  1.5,   // active_orders > riders × threshold → surge
  },
  PEAK_HOUR_START:  18,        // 6 PM
  PEAK_HOUR_END:    22,        // 10 PM
};

// ─── Weather Helper ───────────────────────────────────────────────────────────
/**
 * Fetches current weather for a lat/lng.
 * Caches per rounded location (1-decimal precision) for 30 min.
 * @returns {{ isRainy: boolean, condition: string }}
 */
async function getWeatherCondition(lat, lng) {
  const cacheKey = `weather_${lat.toFixed(1)}_${lng.toFixed(1)}`;
  const cached = weatherCache.get(cacheKey);
  if (cached) return cached;

  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    console.warn('[PricingEngine] OPENWEATHER_API_KEY not set. Skipping weather surge.');
    return { isRainy: false, condition: 'unknown' };
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`OpenWeather HTTP ${response.status}`);

    const data = await response.json();
    const condition = data.weather?.[0]?.main || 'Clear';
    const surgeConditions = ['Rain', 'Thunderstorm', 'Snow', 'Drizzle'];
    const result = {
      isRainy: surgeConditions.includes(condition),
      condition,
    };

    weatherCache.set(cacheKey, result);
    return result;
  } catch (err) {
    console.warn('[PricingEngine] Weather fetch failed:', err.message);
    return { isRainy: false, condition: 'unavailable' };
  }
}

// ─── Peak Hour Check ──────────────────────────────────────────────────────────
function isPeakHour() {
  const hour = new Date().getHours(); // uses server local time
  return hour >= PRICING_CONFIG.PEAK_HOUR_START && hour < PRICING_CONFIG.PEAK_HOUR_END;
}

// ─── Demand / Supply Multiplier ───────────────────────────────────────────────
/**
 * If active orders outnumber available riders by > 1.5×, apply a dynamic surge.
 * @returns {{ adder: number, activeOrders: number, availableRiders: number }}
 */
async function getDemandMultiplier() {
  try {
    const [activeOrders, availableRiders] = await Promise.all([
      Order.countDocuments({ status: { $in: ['pending', 'accepted', 'processing', 'assigned', 'picked_up'] } }),
      Rider.countDocuments({ status: 'available' }),
    ]);

    const threshold = PRICING_CONFIG.SURGE.DEMAND_THRESHOLD;
    const riderFloor = availableRiders || 1;
    const ratio = activeOrders / riderFloor;

    let adder = 0;
    if (ratio > threshold) {
      // Scale: each 0.5 excess ratio adds 0.1 surge, capped at DEMAND_MAX_ADDER
      adder = Math.min(
        ((ratio - threshold) / 0.5) * 0.1,
        PRICING_CONFIG.SURGE.DEMAND_MAX_ADDER
      );
      adder = +adder.toFixed(2);
    }

    return { adder, activeOrders, availableRiders };
  } catch (err) {
    console.warn('[PricingEngine] Demand check failed:', err.message);
    return { adder: 0, activeOrders: 0, availableRiders: 0 };
  }
}

// ─── Main Engine ──────────────────────────────────────────────────────────────
/**
 * Calculates the complete delivery fee breakdown.
 *
 * @param {{
 *   pharmacyCoords: { lat: number, lng: number },
 *   deliveryCoords:  { lat: number, lng: number },
 *   isEmergency?:    boolean,
 * }} params
 *
 * @returns {Promise<{
 *   baseFee:          number,
 *   distanceKm:       number,
 *   distanceCharge:   number,
 *   fuelCharge:       number,
 *   platformFee:      number,
 *   surgeMultiplier:  number,
 *   surgeFactors: {
 *     isEmergency:    boolean,
 *     isPeakHour:     boolean,
 *     isWeatherSurge: boolean,
 *     isDemandSurge:  boolean,
 *     weatherCondition: string,
 *     activeOrders:   number,
 *     availableRiders:number,
 *   },
 *   deliveryFee:      number,
 *   riderPayout:      number,
 *   estimatedMinutes: number,
 *   distanceSource:   string,
 * }>}
 */
export async function calculateDeliveryFee({ pharmacyCoords, deliveryCoords, isEmergency = false }) {
  const cfg = PRICING_CONFIG;

  // 1. Get driving distance
  const { distanceKm, durationMin, source: distanceSource } = await getRouteDistance(
    pharmacyCoords.lng, pharmacyCoords.lat,
    deliveryCoords.lng,  deliveryCoords.lat
  );

  // 2. Base cost components
  const baseFee        = cfg.BASE_FEE;
  const distanceCharge = +(distanceKm * cfg.RATE_PER_KM).toFixed(2);
  const fuelCharge     = +(distanceKm * cfg.FUEL_COST_PER_KM).toFixed(2);
  const platformFee    = cfg.PLATFORM_FEE;
  const baseDeliveryCost = baseFee + distanceCharge + fuelCharge;

  // 3. Surge factors (run concurrently where possible)
  const [weatherResult, demandResult] = await Promise.all([
    getWeatherCondition(deliveryCoords.lat, deliveryCoords.lng),
    getDemandMultiplier(),
  ]);
  const peakHour = isPeakHour();

  let surgeMultiplier = 1.0;
  if (isEmergency)           surgeMultiplier += cfg.SURGE.EMERGENCY_ADDER;
  if (peakHour)              surgeMultiplier += cfg.SURGE.PEAK_HOUR_ADDER;
  if (weatherResult.isRainy) surgeMultiplier += cfg.SURGE.WEATHER_ADDER;
  if (demandResult.adder > 0) surgeMultiplier += demandResult.adder;
  surgeMultiplier = +surgeMultiplier.toFixed(2);

  // 4. Final delivery fee
  const deliveryFee = Math.round(baseDeliveryCost * surgeMultiplier) + platformFee;

  // 5. Rider payout: fixed earning + fuel reimbursement for this trip
  const riderPayout = +(cfg.FIXED_RIDER_EARNING + fuelCharge).toFixed(2);

  return {
    baseFee,
    distanceKm,
    distanceCharge,
    fuelCharge,
    platformFee,
    surgeMultiplier,
    surgeFactors: {
      isEmergency,
      isPeakHour: peakHour,
      isWeatherSurge: weatherResult.isRainy,
      weatherCondition: weatherResult.condition,
      isDemandSurge: demandResult.adder > 0,
      demandAdder: demandResult.adder,
      activeOrders: demandResult.activeOrders,
      availableRiders: demandResult.availableRiders,
    },
    deliveryFee,
    riderPayout,
    estimatedMinutes: durationMin,
    distanceSource,
  };
}
