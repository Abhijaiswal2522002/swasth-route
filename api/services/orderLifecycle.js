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

  // 1. Notify the User tracking the order
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

    // Check if already assigned
    if (order.riderId) return;

    const pharmacyLat = order.pharmacyId.location.coordinates[1];
    const pharmacyLng = order.pharmacyId.location.coordinates[0];

    // Find nearby available riders (within 10km)
    const nearbyRiders = await Rider.find({
      status: 'available',
      currentLocation: {
        $near: {
          $geometry: { type: "Point", coordinates: [pharmacyLng, pharmacyLat] },
          $maxDistance: 10000 // 10km
        }
      }
    }).populate('userId', 'name phone');

    if (nearbyRiders.length === 0) {
      console.log(`[OrderLifecycle] No available riders found for order ${order.orderId}`);
      // Maybe notify pharmacy that no riders are available
      io.to(`pharmacy-${order.pharmacyId._id}`).emit('assignment-failed', {
        orderId: order.orderId,
        message: 'No riders available nearby. Please wait or try later.'
      });
      return;
    }

    // Auto-assign the first (nearest) rider
    const rider = nearbyRiders[0];
    const riderUser = rider.userId;

    order.riderId = rider._id;
    order.status = 'assigned';
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

    // Update Rider status
    rider.status = 'busy';
    rider.activeOrder = order._id;
    await rider.save();

    // Notify Rider
    io.to(`rider-${riderUser._id}`).emit('new-order-assignment', {
      orderId: order.orderId,
      dbId: order._id,
      pharmacyName: order.pharmacyId.name,
      pharmacyAddress: order.pharmacyId.address,
      deliveryAddress: order.deliveryAddress,
      total: order.total,
      payout: order.riderPayout
    });

    // Broadcast update to User and Pharmacy
    await broadcastOrderStatus(order, io);

    console.log(`[OrderLifecycle] Order ${order.orderId} auto-assigned to rider ${riderUser.name}`);
    
    return rider;
  } catch (error) {
    console.error('[OrderLifecycle] Error in smartAssignRider:', error);
  }
};
