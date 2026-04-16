import Earning from '../models/Earning.js';
import Pharmacy from '../models/Pharmacy.js';
import Rider from '../models/Rider.js';
import Order from '../models/Order.js';

/**
 * earningService.js
 * Handles recording of earnings for pharmacies and riders when an order is completed.
 */

export const recordOrderEarnings = async (orderId) => {
  try {
    const order = await Order.findById(orderId);
    if (!order || order.status !== 'delivered') {
      throw new Error('Order not found or not in delivered state');
    }

    // Check if earnings already recorded to prevent double recording
    const existingEarnings = await Earning.findOne({ orderId, type: 'order' });
    if (existingEarnings) {
      console.warn(`Earnings already recorded for order ${orderId}`);
      return;
    }

    const pharmacyEarningsRecords = [];
    const riderEarningsRecords = [];

    // 1. Pharmacy Earnings
    // Pharmacy gets the subtotal minus commission (e.g. 10%)
    // But for simplicity, we'll use a 90/10 split on the subtotal.
    const commissionRate = 10; // 10%
    const pharmacyAmount = +(order.subtotal * (1 - commissionRate / 100)).toFixed(2);
    
    const pharmacyEarning = new Earning({
      pharmacyId: order.pharmacyId,
      orderId: order._id,
      amount: pharmacyAmount,
      type: 'order',
      status: 'completed',
      description: `Revenue from order ${order.orderId} (after ${commissionRate}% commission)`
    });

    // 2. Rider Earnings
    // Rider gets their calculated riderPayout (which includes fuel etc.)
    if (order.riderId) {
      const riderEarning = new Earning({
        riderId: order.riderId,
        orderId: order._id,
        amount: order.riderPayout || 50, // Fallback if missing
        type: 'order',
        status: 'completed',
        description: `Delivery payout for order ${order.orderId}`
      });
      riderEarningsRecords.push(riderEarning);
    }

    // Save all records
    await pharmacyEarning.save();
    if (riderEarningsRecords.length > 0) {
      await Promise.all(riderEarningsRecords.map(r => r.save()));
    }

    // Update aggregated totals
    await Pharmacy.findByIdAndUpdate(order.pharmacyId, {
      $inc: { totalRevenue: pharmacyAmount }
    });

    if (order.riderId) {
      await Rider.findByIdAndUpdate(order.riderId, {
        $inc: { totalEarnings: order.riderPayout || 50 }
      });
    }

    console.log(`Earnings recorded for order ${order.orderId}`);
    return { pharmacyAmount, riderAmount: order.riderPayout };
  } catch (error) {
    console.error('Error recording earnings:', error.message);
    throw error;
  }
};
