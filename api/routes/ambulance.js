import express from 'express';
import { verifyToken, verifyRider } from '../middleware/auth.js';
import Rider from '../models/Rider.js';
import User from '../models/User.js';
import AmbulanceBooking from '../models/AmbulanceBooking.js';
import { getIO } from '../socket.js';
import axios from 'axios';

const router = express.Router();

// Helper: Haversine distance formula to calculate distance in km
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function getDefaultGuidelines(ambulanceType) {
  if (ambulanceType === 'icu') {
    return [
      "Keep the patient flat on their back unless breathing is labored.",
      "Monitor pulse and check if the patient is responsive.",
      "Clear a path for the ICU stretcher team.",
      "Do not give the patient anything to eat or drink."
    ];
  } else if (ambulanceType === 'advanced') {
    return [
      "Keep the patient calm and encourage slow, deep breaths.",
      "Loosen tight clothing around their neck or chest.",
      "Gather any medical history or active prescriptions.",
      "Stay with the patient and monitor their consciousness."
    ];
  }
  return [
    "Ensure the patient is in a safe, quiet location.",
    "Stay by their side and reassure them.",
    "Be ready to guide the ambulance crew to the patient.",
    "Do not move the patient if a spinal injury is suspected."
  ];
}

async function generateFirstAidGuidelines(ambulanceType, description) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.log('[Gemini First Aid] API key is missing. Using default guidelines.');
    return getDefaultGuidelines(ambulanceType);
  }

  try {
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const prompt = `You are an emergency medical response assistant. The patient is waiting for an ambulance of type "${ambulanceType}". Emergency description: "${description || 'unknown medical crisis'}". Provide a JSON list of exactly 4 clear, short, actionable first-aid instructions (maximum 15 words per instruction) for bystanders to perform right now. Focus on immediate safety, positioning, and vitals check. Do not write introductory or explanatory text. Output must be a valid JSON array of strings. Example: ["Keep the patient in a sitting position to aid breathing", "Loosen tight clothing around neck", "Gather all active medications", "Do not give any food or liquids"].`;

    const response = await axios.post(geminiUrl, {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    });

    const rawText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (rawText) {
      return JSON.parse(rawText.trim());
    }
  } catch (err) {
    console.error('[Gemini First Aid] Failed to generate, falling back:', err.message);
  }
  return getDefaultGuidelines(ambulanceType);
}

// Create Ambulance Booking (Patient)
router.post('/booking/create', verifyToken, async (req, res) => {
  try {
    const { latitude, longitude, pickupAddress, ambulanceType, hospital, emergencyDescription } = req.body;

    if (!latitude || !longitude || !ambulanceType || !hospital) {
      return res.status(400).json({ error: 'Pickup location coordinates, ambulance type, and destination hospital are required' });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    // Calculate distance to hospital
    const distanceKm = calculateDistance(lat, lng, hospital.latitude, hospital.longitude);

    // Base rates: Basic = 500, Advanced = 1500, ICU = 2500. Surcharge = 50/km
    let basePrice = 500;
    if (ambulanceType === 'advanced') basePrice = 1500;
    else if (ambulanceType === 'icu') basePrice = 2500;

    const price = Math.round(basePrice + distanceKm * 50);

    // Query nearest available ambulance driver of the correct type
    const vehicleTypeStr = `ambulance_${ambulanceType}`;
    const nearestDrivers = await Rider.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [lng, lat],
          },
          distanceField: 'distance',
          maxDistance: 15000, // 15km search radius
          spherical: true,
          query: { status: 'available', vehicleType: vehicleTypeStr },
        },
      },
      { $limit: 1 }
    ]);

    if (nearestDrivers.length === 0) {
      return res.status(404).json({ error: `No active available ${ambulanceType} ambulances found within 15km` });
    }

    const matchedDriver = nearestDrivers[0];

    // Generate First-Aid Instructions via Gemini
    const firstAidInstructions = await generateFirstAidGuidelines(ambulanceType, emergencyDescription);

    // Create the booking
    const booking = new AmbulanceBooking({
      userId: req.user.id,
      driverId: matchedDriver._id,
      ambulanceType,
      pickupLocation: {
        type: 'Point',
        coordinates: [lng, lat],
      },
      pickupAddress: pickupAddress || 'Emergency Live GPS Location',
      destinationHospital: {
        name: hospital.name,
        latitude: hospital.latitude,
        longitude: hospital.longitude,
      },
      price,
      status: 'pending',
      emergencyDescription: emergencyDescription || '',
      firstAidInstructions
    });

    await booking.save();

    // Notify assigned driver in real-time
    getIO().emit(`new-ambulance-broadcast-${matchedDriver.userId}`, {
      bookingId: booking._id,
      userId: req.user.id,
      ambulanceType,
      price,
      hospitalName: hospital.name,
      pickupAddress: booking.pickupAddress,
      distanceKm: parseFloat(distanceKm.toFixed(2)),
      location: { lat, lng }
    });

    res.status(201).json({
      message: 'Ambulance requested successfully and dispatched to nearest available driver',
      booking
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get User's Active Ambulance Booking (Patient)
router.get('/booking/active', verifyToken, async (req, res) => {
  try {
    const booking = await AmbulanceBooking.findOne({
      userId: req.user.id,
      status: { $in: ['pending', 'accepted', 'en_route', 'picked_up'] }
    }).populate({
      path: 'driverId',
      populate: { path: 'userId', select: 'name phone' }
    });

    res.json(booking || null);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Driver's Active Ambulance Trip (Rider)
router.get('/driver/active', verifyRider, async (req, res) => {
  try {
    const rider = await Rider.findOne({ userId: req.rider.id });
    if (!rider) {
      return res.status(404).json({ error: 'Rider profile not found' });
    }

    const booking = await AmbulanceBooking.findOne({
      driverId: rider._id,
      status: { $in: ['pending', 'accepted', 'en_route', 'picked_up'] }
    }).populate('userId', 'name phone');

    res.json(booking || null);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Driver Accepts Booking (Rider)
router.post('/booking/:id/accept', verifyRider, async (req, res) => {
  try {
    const bookingId = req.params.id;
    const rider = await Rider.findOne({ userId: req.rider.id });
    if (!rider) {
      return res.status(404).json({ error: 'Rider profile not found' });
    }

    const booking = await AmbulanceBooking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({ error: 'Trip is no longer pending' });
    }

    // Assign driver and update status
    booking.status = 'accepted';
    booking.driverId = rider._id;
    await booking.save();

    // Toggle rider to busy
    rider.status = 'busy';
    await rider.save();

    // Notify patient via Socket.io
    getIO().emit(`ambulance-booking-updated-${booking.userId}`, {
      bookingId: booking._id,
      status: 'accepted',
      driver: {
        name: req.rider.name || 'Emergency Responder',
        phone: rider.vehicleNumber || 'Plate Verified',
        vehicleNumber: rider.vehicleNumber
      }
    });

    res.json({ message: 'Emergency dispatch accepted successfully', booking });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Driver Updates Booking Trip Status (Rider)
router.post('/booking/:id/status', verifyRider, async (req, res) => {
  try {
    const { status } = req.body;
    const bookingId = req.params.id;

    if (!['en_route', 'picked_up', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid trip status transition' });
    }

    const booking = await AmbulanceBooking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    booking.status = status;
    if (status === 'completed') {
      booking.paymentStatus = 'completed'; // COD complete
    }
    await booking.save();

    // If completed, free up rider status
    if (status === 'completed') {
      await Rider.findByIdAndUpdate(booking.driverId, { status: 'available' });
    }

    // Notify patient
    getIO().emit(`ambulance-booking-updated-${booking.userId}`, {
      bookingId: booking._id,
      status
    });

    res.json({ message: `Trip status updated to ${status}`, booking });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel Booking
router.post('/booking/:id/cancel', verifyToken, async (req, res) => {
  try {
    const booking = await AmbulanceBooking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    booking.status = 'cancelled';
    await booking.save();

    // Free up driver status
    if (booking.driverId) {
      await Rider.findByIdAndUpdate(booking.driverId, { status: 'available' });
      
      const rider = await Rider.findById(booking.driverId).populate('userId');
      if (rider && rider.userId) {
        // Notify driver
        getIO().emit(`ambulance-booking-cancelled-${rider.userId._id}`, {
          bookingId: booking._id
        });
      }
    }

    // Notify patient
    getIO().emit(`ambulance-booking-updated-${booking.userId}`, {
      bookingId: booking._id,
      status: 'cancelled'
    });

    res.json({ message: 'Emergency dispatch cancelled successfully', booking });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
