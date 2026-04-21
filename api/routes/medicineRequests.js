import express from 'express';
import { verifyToken, verifyPharmacy } from '../middleware/auth.js';
import MedicineRequest from '../models/MedicineRequest.js';
import Order from '../models/Order.js';
import Pharmacy from '../models/Pharmacy.js';
import User from '../models/User.js';
import { calculateDeliveryFee } from '../utils/pricingEngine.js';
import { getIO } from '../socket.js';

const router = express.Router();

// Generate order ID (copied from orders.js)
const generateOrderId = () => {
  return 'SR' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
};

// Create a new request (User)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { medicineName, quantity, deliveryAddress, paymentMethod } = req.body;

    const medicineRequest = new MedicineRequest({
      userId: req.user.id,
      medicineName,
      quantity,
      deliveryAddress,
      paymentMethod: paymentMethod || 'COD',
      status: 'Pending'
    });

    await medicineRequest.save();

    // Broadcast to pharmacies nearby (simple emit to all for now, or could use geolocation filter)
    // For MVP, we'll just emit to a 'pharmacy-requests' room
    getIO().emit('new-medicine-request', {
      requestId: medicineRequest._id,
      medicineName,
      quantity,
      location: {
          lat: deliveryAddress.latitude,
          lng: deliveryAddress.longitude
      }
    });

    res.status(201).json({
      message: 'Medicine request raised successfully',
      request: medicineRequest
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's own requests
router.get('/user', verifyToken, async (req, res) => {
    try {
        const requests = await MedicineRequest.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .populate('acceptedBy', 'name phone address');
            
        res.json(requests);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get nearby pending requests (Pharmacy)
router.get('/nearby', verifyPharmacy, async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const radius = parseFloat(req.query.radius || '25'); // Increased default to 25km

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ error: 'Valid Latitude and Longitude are required' });
    }

    // Rough bounding box for nearby requests (approx 1 degree lat = 111km)
    const latDelta = radius / 111;
    const lngDelta = radius / (111 * Math.cos(lat * (Math.PI / 180)));

    const requests = await MedicineRequest.find({
      status: 'Pending',
      'deliveryAddress.latitude': { $gte: lat - latDelta, $lte: lat + latDelta },
      'deliveryAddress.longitude': { $gte: lng - lngDelta, $lte: lng + lngDelta }
    }).populate('userId', 'name');

    // Filter by actual distance
    const filteredRequests = requests.filter(req => {
        const dLat = (req.deliveryAddress.latitude - lat) * (Math.PI / 180);
        const dLng = (req.deliveryAddress.longitude - lng) * (Math.PI / 180);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(lat * (Math.PI / 180)) * Math.cos(req.deliveryAddress.latitude * (Math.PI / 180)) *
                  Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = 6371 * c; // Earth radius in km
        return distance <= radius;
    });

    res.json(filteredRequests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Accept request (Pharmacy)
router.post('/:id/accept', verifyPharmacy, async (req, res) => {
  try {
    const { price } = req.body;
    const requestId = req.params.id;

    if (!price) {
      return res.status(400).json({ error: 'Price is required to accept a request' });
    }

    const medicineRequest = await MedicineRequest.findById(requestId);
    if (!medicineRequest) {
      return res.status(404).json({ error: 'Medicine request not found' });
    }

    if (medicineRequest.status !== 'Pending') {
      return res.status(400).json({ error: 'Request is already accepted or completed' });
    }

    const pharmacy = await Pharmacy.findById(req.pharmacy.id);
    if (!pharmacy) {
      return res.status(404).json({ error: 'Pharmacy not found' });
    }

    // 1. Calculate Fees
    const pricing = await calculateDeliveryFee({
      pharmacyCoords: {
        lat: pharmacy.location.coordinates[1],
        lng: pharmacy.location.coordinates[0]
      },
      deliveryCoords: {
        lat: medicineRequest.deliveryAddress.latitude,
        lng: medicineRequest.deliveryAddress.longitude
      },
      isEmergency: false
    });

    const subtotal = price * medicineRequest.quantity;
    const tax = Math.round(subtotal * 0.05); // 5% tax
    const total = subtotal + tax + pricing.deliveryFee;

    // 2. Create Order
    const order = new Order({
      orderId: generateOrderId(),
      userId: medicineRequest.userId,
      pharmacyId: req.pharmacy.id,
      items: [{
        medicineName: medicineRequest.medicineName,
        quantity: medicineRequest.quantity,
        price: price,
        subtotal: subtotal
      }],
      deliveryAddress: medicineRequest.deliveryAddress,
      isEmergency: false,
      subtotal,
      tax,
      deliveryFee: pricing.deliveryFee,
      emergencyFee: 0,
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
      paymentMethod: medicineRequest.paymentMethod.toLowerCase() === 'prepaid' ? 'card' : 'cod',
      notes: `Fulfillment for Request #${requestId}`,
      estimatedDeliveryTime: pricing.estimatedMinutes,
    });

    await order.save();

    // 3. Update Medicine Request
    medicineRequest.status = 'Accepted';
    medicineRequest.acceptedBy = req.pharmacy.id;
    medicineRequest.price = price;
    medicineRequest.orderId = order._id;
    await medicineRequest.save();

    // 4. Update user orders count
    const user = await User.findById(medicineRequest.userId);
    if (user) {
        user.totalOrders += 1;
        user.orders.push({ orderId: order._id, status: 'pending' });
        await user.save();
    }

    res.json({
      message: 'Request accepted and order created',
      request: medicineRequest,
      order
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
