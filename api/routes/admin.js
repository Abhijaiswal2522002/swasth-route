import express from 'express';
import { verifyAdmin } from '../middleware/auth.js';
import Pharmacy from '../models/Pharmacy.js';
import Order from '../models/Order.js';
import User from '../models/User.js';

const router = express.Router();

// Get all pharmacies
router.get('/pharmacies', verifyAdmin, async (req, res) => {
  try {
    const { status, city } = req.query;
    const query = {};

    if (status) query.status = status;
    if (city) query['address.city'] = city;

    const pharmacies = await Pharmacy.find(query)
      .select('-password')
      .sort({ createdAt: -1 });

    res.json(pharmacies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get pharmacy details
router.get('/pharmacies/:id', verifyAdmin, async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findById(req.params.id).select('-password');

    if (!pharmacy) {
      return res.status(404).json({ error: 'Pharmacy not found' });
    }

    res.json(pharmacy);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Approve pharmacy
router.put('/pharmacies/:id/approve', verifyAdmin, async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findByIdAndUpdate(
      req.params.id,
      {
        status: 'active',
        isVerified: true,
      },
      { new: true }
    ).select('-password');

    res.json({ message: 'Pharmacy approved', pharmacy });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reject pharmacy
router.put('/pharmacies/:id/reject', verifyAdmin, async (req, res) => {
  try {
    const { reason } = req.body;

    const pharmacy = await Pharmacy.findByIdAndUpdate(
      req.params.id,
      {
        status: 'inactive',
        isVerified: false,
      },
      { new: true }
    ).select('-password');

    res.json({
      message: 'Pharmacy rejected',
      pharmacy,
      reason,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Suspend pharmacy
router.put('/pharmacies/:id/suspend', verifyAdmin, async (req, res) => {
  try {
    const { reason } = req.body;

    const pharmacy = await Pharmacy.findByIdAndUpdate(
      req.params.id,
      { status: 'suspended' },
      { new: true }
    ).select('-password');

    res.json({
      message: 'Pharmacy suspended',
      pharmacy,
      reason,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update commission rate
router.put('/pharmacies/:id/commission', verifyAdmin, async (req, res) => {
  try {
    const { commissionRate } = req.body;

    if (commissionRate < 0 || commissionRate > 100) {
      return res.status(400).json({ error: 'Commission rate must be between 0 and 100' });
    }

    const pharmacy = await Pharmacy.findByIdAndUpdate(
      req.params.id,
      { commissionRate },
      { new: true }
    ).select('-password');

    res.json({ message: 'Commission rate updated', pharmacy });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all orders
router.get('/orders', verifyAdmin, async (req, res) => {
  try {
    const { status, pharmacyId } = req.query;
    const query = {};

    if (status) query.status = status;
    if (pharmacyId) query.pharmacyId = pharmacyId;

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .populate('userId', 'name phone')
      .populate('pharmacyId', 'name phone');

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all users
router.get('/users', verifyAdmin, async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user details
router.get('/users/:id', verifyAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get platform analytics
router.get('/analytics/dashboard', verifyAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPharmacies = await Pharmacy.countDocuments({ status: 'active' });
    const totalRiders = await User.countDocuments({ role: 'rider' });
    const activeRiders = await User.countDocuments({ role: 'rider', isActive: true });
    
    const totalOrders = await Order.countDocuments();
    const deliveredOrders = await Order.countDocuments({ status: 'delivered' });

    const orders = await Order.find();
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);

    const pendingPharmacies = await Pharmacy.countDocuments({ status: 'pending' });

    res.json({
      totalUsers,
      totalPharmacies,
      totalRiders,
      activeRiders,
      totalOrders,
      deliveredOrders,
      totalRevenue,
      pendingPharmacies,
      orderFulfillmentRate: (deliveredOrders / (totalOrders || 1) * 100).toFixed(2) + '%',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get revenue analytics
router.get('/analytics/revenue', verifyAdmin, async (req, res) => {
  try {
    const orders = await Order.find({ status: 'delivered' });

    const revenueByPharmacy = {};
    orders.forEach(order => {
      const pharmacyId = order.pharmacyId.toString();
      if (!revenueByPharmacy[pharmacyId]) {
        revenueByPharmacy[pharmacyId] = { total: 0, count: 0 };
      }
      revenueByPharmacy[pharmacyId].total += order.total;
      revenueByPharmacy[pharmacyId].count += 1;
    });

    const pharmacyRevenue = await Promise.all(
      Object.entries(revenueByPharmacy).map(async ([pharmacyId, data]) => {
        const pharmacy = await Pharmacy.findById(pharmacyId);
        return {
          pharmacyId,
          pharmacyName: pharmacy?.name,
          revenue: data.total,
          orders: data.count,
          commission: (data.total * (pharmacy?.commissionRate || 10)) / 100,
        };
      })
    );

    res.json({
      totalRevenue: orders.reduce((sum, o) => sum + o.total, 0),
      pharmacyRevenue: pharmacyRevenue.sort((a, b) => b.revenue - a.revenue),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Deactivate user
router.put('/users/:id/deactivate', verifyAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    ).select('-password');

    res.json({ message: 'User deactivated', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user role (e.g., promote to admin)
router.put('/users/:id/role', verifyAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    res.json({ message: `User role updated to ${role}`, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reactivate user
router.put('/users/:id/reactivate', verifyAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: true },
      { new: true }
    ).select('-password');

    res.json({ message: 'User reactivated', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
