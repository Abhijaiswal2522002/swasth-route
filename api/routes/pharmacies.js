import express from 'express';
import { verifyToken, verifyPharmacy } from '../middleware/auth.js';
import Pharmacy from '../models/Pharmacy.js';
import Order from '../models/Order.js';

const router = express.Router();

// Get nearby pharmacies (geospatial query)
router.get('/nearby', async (req, res) => {
  try {
    const { latitude, longitude, maxDistance = 5000 } = req.query; // maxDistance in meters

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude required' });
    }

    const pharmacies = await Pharmacy.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: parseInt(maxDistance),
        },
      },
      status: 'active',
    }).limit(50);

    res.json(pharmacies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get pharmacy details
router.get('/:id', async (req, res) => {
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

// Search medicines in pharmacy
router.get('/:id/medicines', async (req, res) => {
  try {
    const { query } = req.query;
    const pharmacy = await Pharmacy.findById(req.params.id);

    if (!pharmacy) {
      return res.status(404).json({ error: 'Pharmacy not found' });
    }

    let medicines = pharmacy.inventory;

    if (query) {
      medicines = medicines.filter(med =>
        med.medicineName.toLowerCase().includes(query.toLowerCase())
      );
    }

    res.json(medicines);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get pharmacy profile (authenticated)
router.get('/profile', verifyPharmacy, async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findById(req.pharmacy.id).select('-password');
    if (!pharmacy) {
      return res.status(404).json({ error: 'Pharmacy not found' });
    }
    res.json(pharmacy);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update pharmacy profile
router.put('/profile', verifyPharmacy, async (req, res) => {
  try {
    const { businessHours, address, licenseNumber, licenseExpiry, bankDetails } = req.body;

    const pharmacy = await Pharmacy.findByIdAndUpdate(
      req.pharmacy.id,
      {
        businessHours,
        address,
        licenseNumber,
        licenseExpiry,
        bankDetails,
      },
      { new: true }
    ).select('-password');

    res.json({ message: 'Profile updated', pharmacy });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update inventory
router.post('/inventory/add', verifyPharmacy, async (req, res) => {
  try {
    const { medicineName, quantity, price, reorderLevel } = req.body;

    const pharmacy = await Pharmacy.findById(req.pharmacy.id);
    if (!pharmacy) {
      return res.status(404).json({ error: 'Pharmacy not found' });
    }

    const existingMedicine = pharmacy.inventory.find(
      med => med.medicineName === medicineName
    );

    if (existingMedicine) {
      existingMedicine.quantity += quantity;
      existingMedicine.price = price;
    } else {
      pharmacy.inventory.push({
        medicineName,
        quantity,
        price,
        reorderLevel,
      });
    }

    await pharmacy.save();
    res.json({ message: 'Inventory updated', inventory: pharmacy.inventory });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update inventory quantity
router.put('/inventory/:medicineId', verifyPharmacy, async (req, res) => {
  try {
    const { medicineId } = req.params;
    const { quantity, price } = req.body;

    const pharmacy = await Pharmacy.findById(req.pharmacy.id);
    const medicine = pharmacy.inventory.find(med => med._id.toString() === medicineId);

    if (!medicine) {
      return res.status(404).json({ error: 'Medicine not found' });
    }

    medicine.quantity = quantity;
    if (price) medicine.price = price;

    await pharmacy.save();
    res.json({ message: 'Inventory updated', inventory: pharmacy.inventory });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get pharmacy orders
router.get('/orders/list', verifyPharmacy, async (req, res) => {
  try {
    const { status } = req.query;

    const query = { pharmacyId: req.pharmacy.id };
    if (status) query.status = status;

    const orders = await Order.find(query).sort({ createdAt: -1 }).populate('userId', 'name phone');

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get pharmacy analytics
router.get('/analytics', verifyPharmacy, async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findById(req.pharmacy.id);

    const orders = await Order.find({ pharmacyId: req.pharmacy.id });
    const deliveredOrders = orders.filter(o => o.status === 'delivered');
    const totalRevenue = deliveredOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const averageRating = orders.length > 0 ? orders.reduce((sum, o) => sum + (o.rating?.score || 5), 0) / orders.length : 5;

    res.json({
      totalOrders: orders.length,
      deliveredOrders: deliveredOrders.length,
      pendingOrders: orders.filter(o => o.status === 'pending').length,
      totalRevenue,
      averageRating,
      commissionRate: pharmacy.commissionRate,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
