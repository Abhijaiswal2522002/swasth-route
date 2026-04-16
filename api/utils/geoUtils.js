/**
 * geoUtils.js
 * Geospatial utilities for SwasthRoute Dynamic Pricing Engine.
 * Uses Haversine as a fast fallback and Mapbox Directions for real road distance.
 */

/**
 * Haversine formula — straight-line distance between two lat/lng points.
 * @param {number} lat1 - Origin latitude
 * @param {number} lng1 - Origin longitude
 * @param {number} lat2 - Destination latitude
 * @param {number} lng2 - Destination longitude
 * @returns {number} Distance in kilometres
 */
export function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth radius in km
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Fetches real driving distance from Mapbox Directions API.
 * Falls back to Haversine if the request fails or token is missing.
 * @param {number} originLng  - Pharmacy longitude
 * @param {number} originLat  - Pharmacy latitude
 * @param {number} destLng    - Customer delivery longitude
 * @param {number} destLat    - Customer delivery latitude
 * @returns {Promise<{ distanceKm: number, durationMin: number, source: string }>}
 */
export async function getRouteDistance(originLng, originLat, destLng, destLat) {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || process.env.MAPBOX_TOKEN;

  if (token) {
    try {
      const url =
        `https://api.mapbox.com/directions/v5/mapbox/driving/` +
        `${originLng},${originLat};${destLng},${destLat}` +
        `?access_token=${token}&geometries=geojson&overview=false`;

      const response = await fetch(url);
      if (!response.ok) throw new Error(`Mapbox HTTP ${response.status}`);

      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        return {
          distanceKm: +(route.distance / 1000).toFixed(2), // metres → km
          durationMin: Math.ceil(route.duration / 60),      // seconds → min
          source: 'mapbox',
        };
      }
    } catch (err) {
      console.warn('[PricingEngine] Mapbox Directions failed, falling back to Haversine:', err.message);
    }
  }

  // --- Haversine fallback ---
  const distanceKm = haversineDistance(originLat, originLng, destLat, destLng);
  // Rough road-factor estimate: multiply straight-line by 1.3
  const roadAdjustedKm = +(distanceKm * 1.3).toFixed(2);
  const durationMin = Math.ceil((roadAdjustedKm / 30) * 60); // assume avg 30 km/h urban

  return {
    distanceKm: roadAdjustedKm,
    durationMin,
    source: 'haversine',
  };
}
