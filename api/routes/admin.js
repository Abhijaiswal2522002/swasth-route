import express from 'express';
import { verifyAdmin } from '../middleware/auth.js';
import Pharmacy from '../models/Pharmacy.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Rider from '../models/Rider.js';

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

    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const totalOrders = await Order.countDocuments({ userId: user._id });
        return {
          ...user.toObject(),
          totalOrders,
        };
      })
    );

    res.json(usersWithStats);
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
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);
    const fourteenDaysAgo = new Date(now);
    fourteenDaysAgo.setDate(now.getDate() - 14);

    // --- KPI counts ---
    const totalUsers = await User.countDocuments();
    const totalPharmacies = await Pharmacy.countDocuments({ status: 'active' });
    const pendingPharmacies = await Pharmacy.countDocuments({ status: 'pending' });

    // Riders live in their own collection
    const totalRiders = await Rider.countDocuments();
    const activeRiders = await Rider.countDocuments({ status: { $in: ['available', 'busy'] } });

    const totalOrders = await Order.countDocuments();
    const deliveredOrders = await Order.countDocuments({ status: 'delivered' });

    const allOrders = await Order.find({}, 'total createdAt');
    const totalRevenue = allOrders.reduce((sum, o) => sum + (o.total || 0), 0);

    // --- Trend: compare last 7 days vs previous 7 days ---
    const ordersThisWeek = allOrders.filter(o => new Date(o.createdAt) >= sevenDaysAgo);
    const ordersPrevWeek = allOrders.filter(
      o => new Date(o.createdAt) >= fourteenDaysAgo && new Date(o.createdAt) < sevenDaysAgo
    );

    const revenueThisWeek = ordersThisWeek.reduce((s, o) => s + (o.total || 0), 0);
    const revenuePrevWeek = ordersPrevWeek.reduce((s, o) => s + (o.total || 0), 0);

    const calcTrend = (current, previous) => {
      if (previous === 0) return current > 0 ? '+100.0' : '0.0';
      return ((current - previous) / previous * 100).toFixed(1);
    };

    const revenueTrend = calcTrend(revenueThisWeek, revenuePrevWeek);
    const ordersTrend = calcTrend(ordersThisWeek.length, ordersPrevWeek.length);

    // --- 7-Day Revenue & Orders Chart ---
    const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const revenueChart = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(now);
      dayStart.setDate(now.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const dayOrders = allOrders.filter(o => {
        const d = new Date(o.createdAt);
        return d >= dayStart && d <= dayEnd;
      });

      revenueChart.push({
        name: DAY_NAMES[dayStart.getDay()],
        revenue: Math.round(dayOrders.reduce((s, o) => s + (o.total || 0), 0)),
        orders: dayOrders.length,
      });
    }

    // --- Recent Riders ---
    const recentRiders = await Rider.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId', 'name phone');

    const recentRidersList = recentRiders.map(r => ({
      _id: r._id,
      name: r.userId?.name || 'Unknown',
      phone: r.userId?.phone || '',
      vehicleType: r.vehicleType,
      status: r.status,
      rating: r.rating,
      totalEarnings: r.totalEarnings,
    }));

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
      revenueTrend,
      ordersTrend,
      revenueChart,
      recentRiders: recentRidersList,
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
