import express from 'express';
import mongoose from 'mongoose';
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
    const { address, licenseNumber, licenseExpiry, bankDetails, latitude, longitude, businessHours } = req.body;

    const updateData = {
      address: typeof address === 'string' && address !== 'undefined' ? JSON.parse(address) : address,
      licenseNumber,
      bankDetails: typeof bankDetails === 'string' && bankDetails !== 'undefined' ? JSON.parse(bankDetails) : bankDetails,
      businessHours: typeof businessHours === 'string' && businessHours !== 'undefined' ? JSON.parse(businessHours) : businessHours,
    };

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
        med.medicineName?.toLowerCase().includes(query.toLowerCase())
      );
    }

    res.json(medicines);
  } catch (error) {
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
