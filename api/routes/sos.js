import express from 'express';
import multer from 'multer';
import os from 'os';
import fs from 'fs';
import path from 'path';
import { verifyToken, verifyPharmacy } from '../middleware/auth.js';
import SosRequest from '../models/SosRequest.js';
import Order from '../models/Order.js';
import Pharmacy from '../models/Pharmacy.js';
import User from '../models/User.js';
import cloudinary from '../middleware/upload.js';
import { calculateDeliveryFee } from '../utils/pricingEngine.js';
import { getIO } from '../socket.js';
import { smartAssignRider } from '../services/orderLifecycle.js';

const router = express.Router();

// Multer disk storage for local temp storage before Cloudinary upload
const localDiskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, os.tmpdir());
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `sos-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  }
});

const uploadSosFiles = multer({ storage: localDiskStorage }).fields([
  { name: 'prescription', maxCount: 1 },
  { name: 'voiceNote', maxCount: 1 }
]);

// Create SOS Request (Patient)
router.post('/', verifyToken, uploadSosFiles, async (req, res) => {
  try {
    const { latitude, longitude, textNote, address } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'GPS Coordinates (latitude and longitude) are required' });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    let prescriptionUrl = '';
    let voiceNoteUrl = '';

    // Upload prescription image to Cloudinary if provided
    if (req.files?.prescription?.[0]) {
      const filePath = req.files.prescription[0].path;
      try {
        const uploadRes = await cloudinary.uploader.upload(filePath, {
          folder: 'swasth/sos_prescriptions',
          allowed_formats: ['jpg', 'png', 'jpeg']
        });
        prescriptionUrl = uploadRes.secure_url;
        fs.unlinkSync(filePath); // delete temp file
      } catch (err) {
        console.error('[SOS Upload] Prescription upload failed:', err);
        return res.status(500).json({ error: 'Failed to upload prescription image' });
      }
    }

    // Upload voice note audio to Cloudinary if provided
    if (req.files?.voiceNote?.[0]) {
      const filePath = req.files.voiceNote[0].path;
      try {
        const uploadRes = await cloudinary.uploader.upload(filePath, {
          folder: 'swasth/sos_audio',
          resource_type: 'video', // audio uploaded as video in Cloudinary
        });
        voiceNoteUrl = uploadRes.secure_url;
        fs.unlinkSync(filePath); // delete temp file
      } catch (err) {
        console.error('[SOS Upload] Voice note upload failed:', err);
        return res.status(500).json({ error: 'Failed to upload audio voice note' });
      }
    }

    // Query 3 nearest active pharmacies within 15km
    const nearbyPharmacies = await Pharmacy.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [lng, lat],
          },
          distanceField: 'distance',
          maxDistance: 15000, // 15km
          spherical: true,
          query: { status: 'active' },
        },
      },
      { $limit: 3 },
    ]);

    if (nearbyPharmacies.length === 0) {
      return res.status(404).json({ error: 'No active pharmacies found within emergency radius (15km)' });
    }

    const parsedAddress = address ? JSON.parse(address) : {};

    // Create SOS Request
    const sosRequest = new SosRequest({
      userId: req.user.id,
      prescriptionUrl,
      voiceNoteUrl,
      textNote: textNote || '',
      location: {
        type: 'Point',
        coordinates: [lng, lat],
      },
      address: parsedAddress,
      broadcastedPharmacies: nearbyPharmacies.map(p => p._id),
      status: 'pending'
    });

    await sosRequest.save();

    // Broadcast real-time Socket notifications to the 3 pharmacies
    const io = getIO();
    nearbyPharmacies.forEach(pharmacy => {
      io.emit(`new-sos-broadcast-${pharmacy._id}`, {
        sosId: sosRequest._id,
        userId: req.user.id,
        textNote: sosRequest.textNote,
        prescriptionUrl: sosRequest.prescriptionUrl,
        voiceNoteUrl: sosRequest.voiceNoteUrl,
        distance: parseFloat((pharmacy.distance / 1000).toFixed(2)), // in km
        location: { lat, lng }
      });
    });

    res.status(201).json({
      message: 'SOS emergency broadcasted successfully',
      sosRequest,
      pharmaciesNotified: nearbyPharmacies.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get User's Active SOS Request
router.get('/active', verifyToken, async (req, res) => {
  try {
    const activeSos = await SosRequest.findOne({
      userId: req.user.id,
      status: { $in: ['pending', 'offered'] }
    })
    .populate('broadcastedPharmacies', 'name phone address location rating')
    .populate('offers.pharmacyId', 'name phone address location rating');

    res.json(activeSos || null);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Pharmacy's Nearby Broadcasted SOS Requests
router.get('/pharmacy/nearby', verifyPharmacy, async (req, res) => {
  try {
    const requests = await SosRequest.find({
      status: { $in: ['pending', 'offered'] },
      broadcastedPharmacies: req.pharmacy.id
    }).populate('userId', 'name phone');

    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Submit Pharmacy Offer on SOS Request
router.post('/:id/offer', verifyPharmacy, async (req, res) => {
  try {
    const { price, estimatedMinutes, notes } = req.body;
    const sosId = req.params.id;

    if (!price || isNaN(price) || parseFloat(price) <= 0) {
      return res.status(400).json({ error: 'A valid price quote is required' });
    }
    if (!estimatedMinutes || isNaN(estimatedMinutes) || parseInt(estimatedMinutes) <= 0) {
      return res.status(400).json({ error: 'Estimated delivery duration in minutes is required' });
    }

    const sos = await SosRequest.findById(sosId);
    if (!sos) {
      return res.status(404).json({ error: 'SOS Request not found' });
    }

    if (sos.status !== 'pending' && sos.status !== 'offered') {
      return res.status(400).json({ error: 'This emergency SOS request is no longer active' });
    }

    // Verify pharmacy is in broadcast list
    if (!sos.broadcastedPharmacies.includes(req.pharmacy.id)) {
      return res.status(403).json({ error: 'Your pharmacy was not selected for this broadcast' });
    }

    // Check if offer already made
    const existingOffer = sos.offers.find(o => o.pharmacyId.toString() === req.pharmacy.id);
    if (existingOffer) {
      return res.status(400).json({ error: 'You have already submitted a quote for this emergency' });
    }

    sos.offers.push({
      pharmacyId: req.pharmacy.id,
      price: parseFloat(price),
      estimatedMinutes: parseInt(estimatedMinutes),
      notes: notes || ''
    });

    sos.status = 'offered';
    await sos.save();

    // Notify patient in real-time
    getIO().emit(`sos-offer-received-${sos.userId}`, {
      sosId: sos._id,
      offer: {
        _id: sos.offers[sos.offers.length - 1]._id,
        pharmacyId: req.pharmacy.id,
        pharmacyName: req.pharmacy.name,
        price: parseFloat(price),
        estimatedMinutes: parseInt(estimatedMinutes),
        notes: notes || '',
        createdAt: new Date()
      }
    });

    res.json({ message: 'Emergency offer submitted successfully', sos });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Patient Accepts specific SOS Offer
router.post('/:id/accept-offer', verifyToken, async (req, res) => {
  try {
    const { offerId } = req.body;
    const sosId = req.params.id;

    if (!offerId) {
      return res.status(400).json({ error: 'offerId is required' });
    }

    const sos = await SosRequest.findById(sosId);
    if (!sos) {
      return res.status(404).json({ error: 'SOS Request not found' });
    }

    if (sos.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to accept this request' });
    }

    if (sos.status !== 'offered') {
      return res.status(400).json({ error: 'Request is not in offered state' });
    }

    const offer = sos.offers.id(offerId);
    if (!offer) {
      return res.status(404).json({ error: 'Quote/offer not found' });
    }

    const pharmacy = await Pharmacy.findById(offer.pharmacyId);
    if (!pharmacy) {
      return res.status(404).json({ error: 'Pharmacy no longer exists' });
    }

    // Dynamic emergency fee calculations
    const pricing = await calculateDeliveryFee({
      pharmacyCoords: {
        lat: pharmacy.location.coordinates[1],
        lng: pharmacy.location.coordinates[0]
      },
      deliveryCoords: {
        lat: sos.location.coordinates[1],
        lng: sos.location.coordinates[0]
      },
      isEmergency: true
    });

    const subtotal = offer.price;
    const tax = Math.round(subtotal * 0.05); // 5% tax
    const total = subtotal + tax + pricing.deliveryFee;

    // Create official Order with maximum emergency surge flags
    const order = new Order({
      orderId: 'SRSOS' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase(),
      userId: req.user.id,
      pharmacyId: offer.pharmacyId,
      items: [{
        medicineName: sos.textNote || 'SOS Emergency Request',
        quantity: 1,
        price: offer.price,
        subtotal: subtotal
      }],
      deliveryAddress: {
        street: sos.address?.street || 'SOS Live Location',
        city: sos.address?.city || 'Emergency Zone',
        state: sos.address?.state || '',
        pincode: sos.address?.pincode || '',
        latitude: sos.location.coordinates[1],
        longitude: sos.location.coordinates[0]
      },
      isEmergency: true,
      subtotal,
      tax,
      deliveryFee: pricing.deliveryFee,
      emergencyFee: pricing.surgeFactors.isEmergency ? (pricing.deliveryFee * 0.33) : 0,
      total,
      riderPayout: pricing.riderPayout,
      deliveryDistance: pricing.distanceKm,
      pricingBreakdown: {
        baseFee: pricing.baseFee,
        distanceCharge: pricing.distanceCharge,
        fuelCharge: pricing.fuelCharge,
        surgeMultiplier: pricing.surgeMultiplier,
        surgeFactors: pricing.surgeFactors,
        platformFee: pricing.platformFee
      },
      paymentMethod: 'cod', // COD bypass
      paymentStatus: 'pending',
      notes: `🚨 [EMERGENCY SOS] Urgent fulfillment required. Coordinates: ${sos.location.coordinates[1]}, ${sos.location.coordinates[0]}`,
      estimatedDeliveryTime: offer.estimatedMinutes,
    });

    await order.save();

    // Update SOS request with acceptance details
    sos.status = 'accepted';
    sos.acceptedOfferId = offerId;
    sos.acceptedPharmacyId = offer.pharmacyId;
    sos.orderId = order._id;
    await sos.save();

    // Increment user orders
    const user = await User.findById(req.user.id);
    if (user) {
      user.totalOrders += 1;
      user.orders.push({ orderId: order._id, status: 'pending' });
      await user.save();
    }

    const io = getIO();
    // Notify accepted pharmacy
    io.emit(`sos-request-accepted-${offer.pharmacyId}`, {
      sosId: sos._id,
      orderId: order._id
    });

    // Notify other broadcasted pharmacies that request is closed
    sos.broadcastedPharmacies.forEach(pId => {
      if (pId.toString() !== offer.pharmacyId.toString()) {
        io.emit(`sos-request-closed-${pId}`, { sosId: sos._id });
      }
    });

    // Dispatch a rider using SmartAssign
    try {
      smartAssignRider(order._id);
    } catch (err) {
      console.error('[SOS Assign] Smart dispatch error:', err);
    }

    res.json({
      message: 'SOS Offer accepted and emergency order created',
      sos,
      orderId: order._id
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel active SOS Request
router.post('/:id/cancel', verifyToken, async (req, res) => {
  try {
    const sos = await SosRequest.findById(req.params.id);
    if (!sos) {
      return res.status(404).json({ error: 'SOS Request not found' });
    }

    if (sos.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to cancel this SOS request' });
    }

    sos.status = 'cancelled';
    await sos.save();

    // Notify all broadcasted pharmacies that SOS has been revoked
    const io = getIO();
    sos.broadcastedPharmacies.forEach(pId => {
      io.emit(`sos-request-closed-${pId}`, { sosId: sos._id });
    });

    res.json({ message: 'Emergency SOS request successfully cancelled', sos });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
