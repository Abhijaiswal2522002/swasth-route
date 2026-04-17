import Rider from '../models/Rider.js';
import Order from '../models/Order.js';
import User from '../models/User.js';

/**
 * Broadcasts order status updates to all relevant rooms.
 */
export const broadcastOrderStatus = async (order, io) => {
  if (!order || !io) return;

  const orderId = order._id.toString();
  const userId = order.userId.toString();
  const pharmacyId = order.pharmacyId.toString();
  const riderId = order.riderId?.toString();

  const payload = {
    orderId: order.orderId,
    dbId: orderId,
    status: order.status,
    tracking: order.tracking,
    estimatedDeliveryTime: order.estimatedDeliveryTime,
    updatedAt: order.updatedAt
  };


  io.to(`order-${orderId}`).emit('order-updated', payload);
  io.to(`user-${userId}`).emit('order-updated', payload);

  // 2. Notify the Pharmacy
  io.to(`pharmacy-${pharmacyId}`).emit('order-updated', payload);

  // 3. Notify the Rider (if assigned)
  if (riderId) {
    io.to(`rider-${riderId}`).emit('order-updated', payload);
  }

  // 4. If status is pending/accepted/processing and NOT assigned, notify nearby riders
  if (['pending', 'accepted', 'processing'].includes(order.status) && !order.riderId) {
    io.emit('new-order-available', {
      orderId: order.orderId,
      dbId: orderId,
      pharmacyId: order.pharmacyId,
      deliveryDistance: order.deliveryDistance,
      total: order.total
    });
  }

  console.log(`[OrderLifecycle] Broadcasted status '${order.status}' for order ${order.orderId}`);
};

/**
 * Smart Rider Assignment Logic
 * Finds the nearest available rider and assigns the order.
 */
export const smartAssignRider = async (orderId, io) => {
  try {
    const order = await Order.findById(orderId).populate('pharmacyId');
    if (!order) return;

    // 1. Check if already completed or cancelled
    if (['delivered', 'cancelled', 'picked_up'].includes(order.status)) return;

    // 2. SAFETY CHECK: If already has a confirmed rider, don't reassign
    if (order.riderId && !order.assignmentExpiresAt) {
      console.log(`[OrderLifecycle] Order ${order.orderId} already has a confirmed rider. Skipping.`);
      return;
    }

    // 3. If already has a PENDING offer, don't re-offer until it expires
    if (order.riderId && order.assignmentExpiresAt && order.assignmentExpiresAt > new Date()) {
      console.log(`[OrderLifecycle] Order ${order.orderId} has a pending offer to rider ${order.riderId}. Waiting for timeout.`);
      return;
    }

    const pharmacyLat = order.pharmacyId.location.coordinates[1];
    const pharmacyLng = order.pharmacyId.location.coordinates[0];

    // 4. Find nearby available riders NOT in excluded list
    const nearbyRiders = await Rider.find({
      status: 'available',
      _id: { $nin: order.excludedRiders || [] },
      currentLocation: {
        $near: {
          $geometry: { type: "Point", coordinates: [pharmacyLng, pharmacyLat] },
          $maxDistance: 10000 // 10km
        }
      }
    }).populate('userId', 'name phone');

    if (nearbyRiders.length === 0) {
      console.log(`[OrderLifecycle] No available riders found for order ${order.orderId}. Cancelling order.`);
      order.status = 'cancelled';
      order.cancellationReason = 'No rider assigned';

      await order.save();
      await broadcastOrderStatus(order, io);

      // Notify pharmacy specifically as well
      io.to(`pharmacy-${order.pharmacyId._id}`).emit('assignment-failed', {
        orderId: order.orderId,
        message: 'Order cancelled: No riders available in your area.'
      });
      return;
    }

    // 5. Select the nearest rider
    const rider = nearbyRiders[0];
    const riderUser = rider.userId;

    order.riderId = rider._id;
    order.status = 'assigned';
    order.assignmentExpiresAt = new Date(Date.now() + 180000); // 3 minutes for response window

    order.tracking.deliveryAgent = {
      id: riderUser._id.toString(),
      name: riderUser.name,
      phone: riderUser.phone
    };
    order.tracking.updates.push({
      status: 'assigned',
      timestamp: new Date(),
      location: {
        latitude: rider.currentLocation.coordinates[1],
        longitude: rider.currentLocation.coordinates[0]
      }
    });

    await order.save();

    // 6. Mark rider as busy temporarily while offer is pending
    rider.status = 'busy';
    rider.activeOrder = order._id;
    await rider.save();

    // 7. Notify Rider via Socket
    io.to(`rider-${riderUser._id}`).emit('new-order-assignment', {
      orderId: order.orderId,
      dbId: order._id,
      pharmacyName: order.pharmacyId.name,
      pharmacyAddress: order.pharmacyId.address,
      deliveryAddress: order.deliveryAddress,
      total: order.total,
      payout: order.riderPayout,
      expiresAt: order.assignmentExpiresAt
    });

    // 8. Broadcast update to User and Pharmacy
    await broadcastOrderStatus(order, io);

    console.log(`[OrderLifecycle] Order ${order.orderId} offered to rider ${riderUser.name}. Expires in 3m.`);

    // 9. Schedule timeout check
    setTimeout(async () => {
      await checkAssignmentOrReassign(order._id, rider._id, io);
    }, 185000); // 180s + 5s buffer

    return rider;
  } catch (error) {
    console.error('[OrderLifecycle] Error in smartAssignRider:', error);
  }
};

/**
 * Checks if a rider accepted the order, otherwise reassigns.
 */
const checkAssignmentOrReassign = async (orderId, riderId, io) => {
  try {
    const order = await Order.findById(orderId);
    if (!order) return;

    // If still 'assigned' and expiresAt still exists and is old, they didn't accept
    if (order.status === 'assigned' && order.riderId?.toString() === riderId.toString() && order.assignmentExpiresAt) {
      console.log(`[OrderLifecycle] Assignment timeout for order ${order.orderId}. Reassigning...`);
      await reassignRider(orderId, io);
    }
  } catch (err) {
    console.error('[OrderLifecycle] Error in checkAssignmentOrReassign:', err);
  }
};

/**
 * Reassigns an order after rejection or timeout.
 */
export const reassignRider = async (orderId, io) => {
  try {
    const order = await Order.findById(orderId);
    if (!order) return;

    if (['delivered', 'cancelled', 'picked_up'].includes(order.status)) return;

    const previousRiderId = order.riderId;

    // 1. Release the previous rider
    if (previousRiderId) {
      const rider = await Rider.findById(previousRiderId).populate('userId');
      if (rider) {
        rider.status = 'available';
        rider.activeOrder = null;
        await rider.save();

        io.to(`rider-${rider.userId._id}`).emit('order-revoked', { orderId: order.orderId });
      }

      // 2. Add to excluded list
      if (!order.excludedRiders.includes(previousRiderId)) {
        order.excludedRiders.push(previousRiderId);
      }
    }

    // 3. Clear existing assignment
    order.riderId = null;
    order.assignmentExpiresAt = null;
    order.tracking.deliveryAgent = null;

    // If we've excluded everyone, maybe reset status to 'processing' to restart broadcast
    await order.save();

    // 4. Try to find a new rider
    console.log(`[OrderLifecycle] Searching for next rider for order ${order.orderId}`);
    const nextRider = await smartAssignRider(orderId, io);

    // 5. If NO new rider found, cancel the order automatically
    if (!nextRider) {
      console.log(`[OrderLifecycle] FATAL: No more riders available for order ${order.orderId}. Cancelling order.`);
      order.status = 'cancelled';
      order.cancellationReason = 'No rider assigned';
      await order.save();
      await broadcastOrderStatus(order, io);
    }

    return nextRider;
  } catch (error) {
    console.error('[OrderLifecycle] Error in reassignRider:', error);
  }
};
