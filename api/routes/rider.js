import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { verifyToken, verifyRider } from '../middleware/auth.js';
import Rider from '../models/Rider.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import Earning from '../models/Earning.js';
import { sendEmailVerification } from '../utils/email.js';
import { recordOrderEarnings } from '../services/earningService.js';
import { getIO } from '../socket.js';
import { broadcastOrderStatus } from '../services/orderLifecycle.js';

const router = express.Router();

const generateToken = (id, role, expiresIn = '7d') => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn });
};

// --- AUTH APIs ---

// POST /api/rider/signup
router.post('/signup', async (req, res) => {
  try {
    const {
      name, phone, email, password, vehicleType, vehicleNumber, latitude, longitude
    } = req.body;

    if (!name || !phone || !email || !password || !vehicleType || !vehicleNumber) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const existingUser = await User.findOne({ $or: [{ phone }, { email }] });
    if (existingUser) {
      const field = existingUser.phone === phone ? 'Phone number' : 'Email';
      return res.status(409).json({ error: `${field} already registered` });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate Verification Token
    const verificationToken = jwt.sign(
      {
        name, phone, email, password: hashedPassword,
        vehicleType, vehicleNumber,
        location: { type: 'Point', coordinates: [longitude || 0, latitude || 0] },
        role: 'rider'
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Send verification email
    await sendEmailVerification(email, name, 'rider', verificationToken);

    res.status(200).json({
      message: 'Verification email sent. Please check your inbox.',
      redirect: '/auth/login'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/rider/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = await User.findOne({ email });
    if (!user || user.role !== 'rider') {
      return res.status(401).json({ error: 'Invalid credentials or not a rider account' });
    }

    if (user.isVerified === false) {
      return res.status(403).json({ error: 'Please verify your email address before logging in.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id, 'rider');

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        phone: user.phone,
        name: user.name,
        email: user.email,
        role: 'rider',
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// --- PROFILE APIs ---

// GET /api/rider/profile
router.get('/profile', verifyRider, async (req, res) => {
  try {
    const rider = await Rider.findOne({ userId: req.rider.id }).populate('userId', 'name email phone avatar');
    if (!rider) return res.status(404).json({ error: 'Rider profile not found' });
    res.json(rider);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/rider/profile
router.put('/profile', verifyRider, async (req, res) => {
  try {
    const { vehicleType, vehicleNumber, name, phone } = req.body;
    
    // Update Rider details
    const rider = await Rider.findOneAndUpdate(
      { userId: req.rider.id },
      { vehicleType, vehicleNumber },
      { new: true }
    );

    // Update User details if name/phone provided
    if (name || phone) {
      await User.findByIdAndUpdate(req.rider.id, { name, phone });
    }

    res.json({ message: 'Profile updated successfully', rider });
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

// --- LOCATION APIs ---

// POST /api/rider/location/update
router.post('/location/update', verifyRider, async (req, res) => {
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

// --- ORDERS APIs ---

// GET /api/rider/orders/available
router.get('/orders/available', verifyRider, async (req, res) => {
  try {
    const rider = await Rider.findOne({ userId: req.rider.id });
    if (!rider) return res.status(404).json({ error: 'Rider not found' });

    // Find orders where status is 'accepted' or 'processing' (ready for pickup)
    // and no rider is currently assigned
    const orders = await Order.find({
      status: { $in: ['accepted', 'processing'] },
      $or: [
        { riderId: { $exists: false } },
        { riderId: null }
      ]
    }).populate('pharmacyId', 'name address location phone');
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/rider/orders/:id/accept
router.post('/orders/:id/accept', verifyRider, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (order.riderId) return res.status(400).json({ error: 'Order already assigned' });

    const rider = await Rider.findOne({ userId: req.rider.id });
    if (rider.status === 'busy') return res.status(400).json({ error: 'Rider already has an active order' });

    const user = await User.findById(req.rider.id);
    
    order.riderId = rider._id;
    order.status = 'assigned';
    order.tracking.deliveryAgent = {
      id: req.rider.id,
      name: user.name,
      phone: user.phone
    };

    await order.save();

    rider.status = 'busy';
    rider.activeOrder = order._id;
    await rider.save();

    // Broadcast status update
    broadcastOrderStatus(order, getIO());

    res.json({ message: 'Order accepted', order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/rider/orders/:id/pickup
router.post('/orders/:id/pickup', verifyRider, async (req, res) => {
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
    
    // Broadcast status update
    broadcastOrderStatus(order, getIO());

    res.json({ message: 'Order picked up', order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/rider/orders/:id/deliver
router.post('/orders/:id/deliver', verifyRider, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order || order.status !== 'picked_up') {
      return res.status(400).json({ error: 'Order cannot be delivered yet' });
    }

    order.status = 'delivered';
    order.actualDeliveryTime = new Date();
    order.paymentStatus = 'completed';
    order.tracking.updates.push({
      status: 'delivered',
      timestamp: new Date()
    });

    await order.save();

    const rider = await Rider.findOne({ userId: req.rider.id });
    
    // Record earnings via service
    await recordOrderEarnings(order._id);

    rider.status = 'available';
    rider.activeOrder = null;
    await rider.save();

    // Broadcast status update
    broadcastOrderStatus(order, getIO());

    res.json({ message: 'Order delivered', order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- EARNINGS APIs ---

// GET /api/rider/earnings
router.get('/earnings', verifyRider, async (req, res) => {
  try {
    const rider = await Rider.findOne({ userId: req.rider.id });
    if (!rider) return res.status(404).json({ error: 'Rider not found' });

    const earningsHistory = await Earning.find({ riderId: rider._id }).sort({ createdAt: -1 });
    
    res.json({
      totalEarnings: rider.totalEarnings,
      history: earningsHistory
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- ADVANCED APIs ---

// POST /api/rider/orders/smart-assign (Find nearest rider)
router.post('/orders/smart-assign', async (req, res) => {
  try {
    const { latitude, longitude, maxDistance = 5000 } = req.body;

    const nearbyRiders = await Rider.find({
      currentLocation: {
        $near: {
          $geometry: { type: "Point", coordinates: [longitude, latitude] },
          $maxDistance: maxDistance
        }
      },
      status: 'available'
    }).populate('userId', 'name phone');

    res.json(nearbyRiders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


export default router;
