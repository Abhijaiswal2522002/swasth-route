import express from 'express';
import { verifyToken, verifyRider } from '../middleware/auth.js';
import Rider from '../models/Rider.js';
import User from '../models/User.js';
import Order from '../models/Order.js';

const router = express.Router();

// Register as a rider
router.post('/register', verifyToken, async (req, res) => {
  try {
    const { vehicleType, vehicleNumber, latitude, longitude } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Check if already a rider
    const existingRider = await Rider.findOne({ userId: req.user.id });
    if (existingRider) return res.status(400).json({ error: 'Already registered as a rider' });

    const rider = new Rider({
      userId: req.user.id,
      vehicleType,
      vehicleNumber,
      currentLocation: {
        type: 'Point',
        coordinates: [longitude, latitude],
      },
      status: 'offline', // Start as offline
    });

    await rider.save();

    // Update user role to rider
    user.role = 'rider';
    await user.save();

    res.status(201).json({ message: 'Rider registration successful', rider });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get rider profile
router.get('/profile', verifyRider, async (req, res) => {
  try {
    const rider = await Rider.findOne({ userId: req.rider.id }).populate('userId', 'name email phone avatar');
    if (!rider) return res.status(404).json({ error: 'Rider profile not found' });
    res.json(rider);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update rider status (online/offline)
router.put('/status', verifyRider, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['offline', 'available', 'busy'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const rider = await Rider.findOneAndUpdate(
      { userId: req.rider.id },
      { status },
      { new: true }
    );

    res.json({ message: `Status updated to ${status}`, rider });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update live location
router.put('/location', verifyRider, async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    const rider = await Rider.findOneAndUpdate(
      { userId: req.rider.id },
      { 
        currentLocation: {
          type: 'Point',
          coordinates: [longitude, latitude],
        },
        lastLocationUpdate: new Date()
      },
      { new: true }
    );

    // If rider has an active order, update the order's tracking too
    if (rider.activeOrder) {
      await Order.findByIdAndUpdate(rider.activeOrder, {
        'tracking.currentLocation': { latitude, longitude },
        $push: {
          'tracking.updates': {
            status: 'moving',
            timestamp: new Date(),
            location: { latitude, longitude }
          }
        }
      });
    }

    res.json({ message: 'Location updated', rider });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get nearby available orders
router.get('/nearby-orders', verifyRider, async (req, res) => {
  try {
    const rider = await Rider.findOne({ userId: req.rider.id });
    if (!rider) return res.status(404).json({ error: 'Rider not found' });

    const [longitude, latitude] = rider.currentLocation.coordinates;

    // Find orders where status is 'accepted' or 'processing' (ready for pickup)
    // and pharmacy is within 10km of rider
    // Note: This requires pharmacies to havegeo-spatial index on their location
    
    const orders = await Order.find({
      status: { $in: ['accepted', 'processing'] },
      riderId: { $exists: false }
    }).populate('pharmacyId', 'name address location phone');

    // Simple proximity filtering if pharmacy has location
    // In a real app, use $near on Pharmacy collection then filter orders
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Accept an order
router.put('/orders/:id/accept', verifyRider, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (order.riderId) return res.status(400).json({ error: 'Order already assigned' });

    const rider = await Rider.findOne({ userId: req.rider.id });
    if (rider.status === 'busy') return res.status(400).json({ error: 'Rider already has an active order' });

    order.riderId = rider._id;
    order.status = 'assigned';
    order.tracking.deliveryAgent = {
      id: req.rider.id,
      name: req.rider.name, // Will need to get this from User
      phone: '' // Will need to get this from User
    };
    
    // Get user details for deliveryAgent
    const user = await User.findById(req.rider.id);
    order.tracking.deliveryAgent.name = user.name;
    order.tracking.deliveryAgent.phone = user.phone;

    await order.save();

    rider.status = 'busy';
    rider.activeOrder = order._id;
    await rider.save();

    res.json({ message: 'Order accepted', order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark order as picked up
router.put('/orders/:id/pickup', verifyRider, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order || order.status !== 'assigned') {
      return res.status(400).json({ error: 'Order cannot be picked up' });
    }

    order.status = 'picked_up';
    order.tracking.updates.push({
      status: 'picked_up',
      timestamp: new Date()
    });

    await order.save();
    res.json({ message: 'Order picked up', order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark order as delivered
router.put('/orders/:id/deliver', verifyRider, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order || order.status !== 'picked_up') {
      return res.status(400).json({ error: 'Order cannot be delivered yet' });
    }

    order.status = 'delivered';
    order.actualDeliveryTime = new Date();
    order.paymentStatus = 'completed'; // Assuming COD or already paid
    order.tracking.updates.push({
      status: 'delivered',
      timestamp: new Date()
    });

    await order.save();

    const rider = await Rider.findOne({ userId: req.rider.id });
    rider.status = 'available';
    rider.activeOrder = null;
    rider.totalEarnings += (order.deliveryFee || 50); // Add delivery fee to earnings
    await rider.save();

    res.json({ message: 'Order delivered', order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
