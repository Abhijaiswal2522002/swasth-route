import express from 'express';
import { verifyToken, verifyPharmacy } from '../middleware/auth.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Pharmacy from '../models/Pharmacy.js';

const router = express.Router();

// Generate order ID
const generateOrderId = () => {
  return 'SR' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
};

// Create order
router.post('/create', verifyToken, async (req, res) => {
  try {
    const {
      pharmacyId,
      items,
      deliveryAddress,
      isEmergency = false,
      paymentMethod = 'cod',
      notes,
    } = req.body;

    const user = await User.findById(req.user.id);
    const pharmacy = await Pharmacy.findById(pharmacyId);

    if (!user || !pharmacy) {
      return res.status(404).json({ error: 'User or pharmacy not found' });
    }

    // Calculate totals
    let subtotal = 0;
    items.forEach(item => {
      subtotal += item.subtotal;
    });

    const tax = Math.round(subtotal * 0.05); // 5% tax
    const emergencyFee = isEmergency ? 100 : 0;
    const deliveryFee = 50;
    const total = subtotal + tax + emergencyFee + deliveryFee;

    const order = new Order({
      orderId: generateOrderId(),
      userId: req.user.id,
      pharmacyId,
      items,
      deliveryAddress,
      isEmergency,
      subtotal,
      tax,
      emergencyFee,
      deliveryFee,
      total,
      paymentMethod,
      notes,
      estimatedDeliveryTime: isEmergency ? 30 : 60,
    });

    await order.save();

    // Update user orders count
    user.totalOrders += 1;
    user.orders.push({ orderId: order._id, status: 'pending' });
    await user.save();

    res.status(201).json({
      message: 'Order created successfully',
      order,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user orders
router.get('/user/list', verifyToken, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .populate('pharmacyId', 'name phone address');

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get order details
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('userId', 'name phone')
      .populate('pharmacyId', 'name phone address businessHours');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update order status (pharmacy)
router.put('/:id/status', verifyPharmacy, async (req, res) => {
  try {
    const { status, notes } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order || order.pharmacyId.toString() !== req.pharmacy.id) {
      return res.status(403).json({ error: 'Not authorized to update this order' });
    }

    // Add tracking update
    order.tracking.updates.push({
      status,
      timestamp: new Date(),
    });

    order.status = status;
    if (notes) order.notes = notes;

    if (status === 'delivered') {
      order.actualDeliveryTime = new Date();
    }

    await order.save();

    res.json({ message: 'Order status updated', order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Accept order (pharmacy)
router.put('/:id/accept', verifyPharmacy, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order || order.pharmacyId.toString() !== req.pharmacy.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ error: 'Order cannot be accepted in current status' });
    }

    order.status = 'accepted';
    order.tracking.updates.push({
      status: 'accepted',
      timestamp: new Date(),
    });

    await order.save();

    res.json({ message: 'Order accepted', order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reject order (pharmacy)
router.put('/:id/reject', verifyPharmacy, async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order || order.pharmacyId.toString() !== req.pharmacy.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ error: 'Order cannot be rejected in current status' });
    }

    order.status = 'cancelled';
    order.cancellationReason = reason;

    await order.save();

    res.json({ message: 'Order rejected', order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel order (user)
router.put('/:id/cancel', verifyToken, async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order || order.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (['delivered', 'cancelled'].includes(order.status)) {
      return res.status(400).json({ error: 'Order cannot be cancelled in current status' });
    }

    order.status = 'cancelled';
    order.cancellationReason = reason;

    await order.save();

    res.json({ message: 'Order cancelled', order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rate order
router.put('/:id/rate', verifyToken, async (req, res) => {
  try {
    const { score, comment } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order || order.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    order.rating = {
      score,
      comment,
      ratedAt: new Date(),
    };

    await order.save();

    res.json({ message: 'Order rated', order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update tracking location
router.put('/:id/tracking', verifyPharmacy, async (req, res) => {
  try {
    const { latitude, longitude, deliveryAgent } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order || order.pharmacyId.toString() !== req.pharmacy.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    order.tracking.currentLocation = { latitude, longitude };

    if (deliveryAgent) {
      order.tracking.deliveryAgent = deliveryAgent;
    }

    order.tracking.updates.push({
      status: order.status,
      timestamp: new Date(),
      location: { latitude, longitude },
    });

    await order.save();

    res.json({ message: 'Tracking updated', order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
