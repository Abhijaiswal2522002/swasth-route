import express from 'express';
import mongoose from 'mongoose';
import { verifyToken, verifyPharmacy } from '../middleware/auth.js';
import Pharmacy from '../models/Pharmacy.js';
import Order from '../models/Order.js';
import Earning from '../models/Earning.js';
import Invoice from '../models/Invoice.js';

const router = express.Router();

// Get nearby pharmacies (geospatial query)
router.get('/nearby', async (req, res) => {
  try {
    const { latitude, longitude, maxDistance = 5000 } = req.query; // maxDistance in meters

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude required' });
    }

    const pharmacies = await Pharmacy.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          distanceField: 'distance',
          maxDistance: parseInt(maxDistance),
          spherical: true,
          query: { status: 'active' },
        },
      },
      { $limit: 50 },
    ]);

    res.json(pharmacies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Get pharmacy profile (authenticated)
router.get('/profile', verifyPharmacy, async (req, res) => {
  try {
    if (!req.pharmacy || !req.pharmacy.id) {
      console.error('No pharmacy ID in request', req.pharmacy);
      return res.status(401).json({ error: 'Authentication data missing' });
    }
    const pharmacy = await Pharmacy.findById(req.pharmacy.id).select('-password');
    if (!pharmacy) {
      console.log('Pharmacy not found for ID:', req.pharmacy.id);
      return res.status(404).json({ error: 'Pharmacy not found' });
    }
    res.json(pharmacy);
  } catch (error) {
    console.error('Error fetching pharmacy profile:', error);
    res.status(500).json({ error: error.message });
  }
});

import { uploadPharmacy } from '../middleware/upload.js';

// Update pharmacy profile
router.put('/profile', verifyPharmacy, uploadPharmacy.fields([
  { name: 'image', maxCount: 1 },
  { name: 'licenseImage', maxCount: 1 }
]), async (req, res) => {
  try {
    const { name, phone, address, licenseNumber, licenseExpiry, bankDetails, latitude, longitude, businessHours, isOpen } = req.body;

    const updateData = {
      name,
      phone,
      address: typeof address === 'string' && address !== 'undefined' ? JSON.parse(address) : address,
      licenseNumber,
      bankDetails: typeof bankDetails === 'string' && bankDetails !== 'undefined' ? JSON.parse(bankDetails) : bankDetails,
      businessHours: typeof businessHours === 'string' && businessHours !== 'undefined' ? JSON.parse(businessHours) : businessHours,
    };

    if (isOpen !== undefined) {
      const currentPharmacy = await Pharmacy.findById(req.pharmacy.id);
      if (currentPharmacy && (currentPharmacy.status === 'active' || currentPharmacy.status === 'inactive')) {
        updateData.status = isOpen === 'true' || isOpen === true ? 'active' : 'inactive';
      }
    }

    if (licenseExpiry && licenseExpiry.trim() !== '') {
      updateData.licenseExpiry = licenseExpiry;
    }

    // Handle Cloudinary Uploads
    if (req.files) {
      if (req.files.image) {
        updateData.image = req.files.image[0].path;
      }
      if (req.files.licenseImage) {
        updateData.licenseImage = req.files.licenseImage[0].path;
      }
    }

    // Update GeoJSON location if coordinates are provided
    if (latitude !== undefined && longitude !== undefined) {
      updateData.location = {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      };
    }

    const pharmacy = await Pharmacy.findByIdAndUpdate(
      req.pharmacy.id,
      {
        $set: updateData
      },
      { new: true }
    ).select('-password');

    res.json({ message: 'Profile updated successfully', pharmacy });
  } catch (error) {
    console.error('Profile Update Error:', error);
    res.status(500).json({ error: error.message });
  }
});


// Update inventory
router.post('/inventory/add', verifyPharmacy, async (req, res) => {
  try {
    const { medicineId, medicineName, quantity, price, reorderLevel } = req.body;
    console.log('Adding medicine to inventory:', { medicineId, medicineName, quantity, price, reorderLevel });

    const pharmacy = await Pharmacy.findById(req.pharmacy.id);
    if (!pharmacy) {
      console.error('Pharmacy not found for ID:', req.pharmacy.id);
      return res.status(404).json({ error: 'Pharmacy not found' });
    }

    // Try to find by medicineId first, then by name
    let existingMedicine = null;
    if (medicineId) {
      existingMedicine = pharmacy.inventory.find(
        med => med.medicineId?.toString() === medicineId
      );
    }

    if (!existingMedicine) {
      existingMedicine = pharmacy.inventory.find(
        med => med.medicineName?.toLowerCase() === medicineName?.toLowerCase()
      );
    }

    const numQuantity = Number(quantity) || 0;
    const numPrice = Number(price) || 0;
    const numReorderLevel = Number(reorderLevel) || 10;

    if (existingMedicine) {
      existingMedicine.quantity += numQuantity;
      existingMedicine.price = numPrice;
      if (medicineId) existingMedicine.medicineId = medicineId;
    } else {
      pharmacy.inventory.push({
        medicineId,
        medicineName,
        quantity: numQuantity,
        price: numPrice,
        reorderLevel: numReorderLevel,
      });
    }

    if (medicineId && !mongoose.Types.ObjectId.isValid(medicineId)) {
      console.warn('Invalid medicineId provided:', medicineId);
      // Optional: handle as error or just ignore the ID
    }

    await pharmacy.save();
    console.log('Pharmacy inventory saved successfully. New inventory size:', pharmacy.inventory.length);
    res.json({ message: 'Inventory updated', inventory: pharmacy.inventory });
  } catch (error) {
    console.error('CRITICAL ERROR in /inventory/add:', error);
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
    const pharmacyId = req.pharmacy.id;
    const pharmacy = await Pharmacy.findById(pharmacyId);

    const [orders, invoices, earnings] = await Promise.all([
      Order.find({ pharmacyId }),
      Invoice.find({ pharmacyId }),
      Earning.find({ pharmacyId, type: 'order', status: 'completed' })
    ]);

    const deliveredOrders = orders.filter(o => o.status === 'delivered');
    
    // Calculate Online Revenue (Net Payouts)
    const onlineNetRevenue = earnings.reduce((sum, e) => sum + e.amount, 0);
    
    // Calculate Offline Revenue (POS)
    const offlineRevenue = invoices.reduce((sum, i) => sum + i.totalAmount, 0);
    
    // Total Liquidity is the sum of both
    const totalRevenue = onlineNetRevenue + offlineRevenue;

    // Average rating only applies to online orders with ratings
    const ordersWithRatings = orders.filter(o => o.rating && o.rating.score);
    const averageRating = ordersWithRatings.length > 0 
      ? ordersWithRatings.reduce((sum, o) => sum + o.rating.score, 0) / ordersWithRatings.length 
      : 5;

    res.json({
      totalOrders: orders.length + invoices.length,
      deliveredOrders: deliveredOrders.length + invoices.length,
      pendingOrders: orders.filter(o => o.status === 'pending').length,
      totalRevenue,
      onlineNetRevenue,
      offlineRevenue,
      averageRating,
      commissionRate: pharmacy.commissionRate || 10,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get pharmacy earnings history
router.get('/earnings', verifyPharmacy, async (req, res) => {
  try {
    const earnings = await Earning.find({ pharmacyId: req.pharmacy.id }).sort({ createdAt: -1 });
    res.json(earnings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Get pharmacy details
router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid pharmacy ID format' });
    }
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
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid pharmacy ID format' });
    }
    const { query } = req.query;
    const pharmacy = await Pharmacy.findById(req.params.id);

    if (!pharmacy) {
      return res.status(404).json({ error: 'Pharmacy not found' });
    }

    let medicines = pharmacy.inventory;

    if (query) {
      medicines = medicines.filter(med =>
        med.medicineName?.toLowerCase().includes(query.toLowerCase())
      );
    }

    res.json(medicines);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

