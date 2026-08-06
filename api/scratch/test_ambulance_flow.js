import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import connectDB from '../config/mongodb.js';
import User from '../models/User.js';
import Rider from '../models/Rider.js';
import AmbulanceBooking from '../models/AmbulanceBooking.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config();

async function runTest() {
  try {
    console.log('[Test Ambulance] Connecting to MongoDB...');
    await connectDB();

    // 1. Get/create mock patient user
    let user = await User.findOne({ role: 'user' });
    if (!user) {
      console.log('[Test Ambulance] Creating mock user...');
      user = new User({
        name: 'Ambulance Patient Test',
        phone: '8888888888',
        email: 'ambulance_patient@example.com',
        password: 'password123',
        role: 'user'
      });
      await user.save();
    }
    console.log('[Test Ambulance] Using User ID:', user._id);

    // 2. Get/create mock ambulance driver user
    let driverUser = await User.findOne({ email: 'ambulance_driver@example.com' });
    if (!driverUser) {
      console.log('[Test Ambulance] Creating driver user account...');
      driverUser = new User({
        name: 'Ambulance Driver Test',
        phone: '8888888887',
        email: 'ambulance_driver@example.com',
        password: 'password123',
        role: 'rider'
      });
      await driverUser.save();
    }

    // 3. Get/create Rider profile representing basic ambulance
    let ambulanceDriver = await Rider.findOne({ userId: driverUser._id });
    if (!ambulanceDriver) {
      console.log('[Test Ambulance] Creating basic ambulance Rider profile...');
      ambulanceDriver = new Rider({
        userId: driverUser._id,
        vehicleType: 'ambulance_basic',
        vehicleNumber: 'MH-02-AM-1008',
        status: 'available',
        currentLocation: {
          type: 'Point',
          coordinates: [72.8777, 19.0760] // Mumbai Coordinate
        },
        isApproved: true
      });
      await ambulanceDriver.save();
    } else {
      // Ensure available
      ambulanceDriver.status = 'available';
      ambulanceDriver.vehicleType = 'ambulance_basic';
      await ambulanceDriver.save();
    }
    console.log('[Test Ambulance] Using Ambulance Driver ID:', ambulanceDriver._id);

    // 4. Clear existing active bookings for user
    await AmbulanceBooking.deleteMany({ userId: user._id });

    // 5. Simulate Booking Dispatch / Match (Geospatial query)
    console.log('[Test Ambulance] Simulating geospatial matching...');
    const patientLng = 72.8780;
    const patientLat = 19.0765; // close to driver coordinates [72.8777, 19.0760]

    const matchedDrivers = await Rider.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [patientLng, patientLat],
          },
          distanceField: 'distance',
          maxDistance: 15000,
          spherical: true,
          query: { status: 'available', vehicleType: 'ambulance_basic' },
        },
      },
      { $limit: 1 }
    ]);

    if (matchedDrivers.length === 0) {
      throw new Error('Geospatial query failed to find the mock ambulance driver.');
    }
    console.log('[Test Ambulance] Geospatial Match Success! Distance:', matchedDrivers[0].distance, 'meters');

    // 6. Create booking
    console.log('[Test Ambulance] Creating Ambulance booking...');
    const booking = new AmbulanceBooking({
      userId: user._id,
      driverId: matchedDrivers[0]._id,
      ambulanceType: 'basic',
      pickupLocation: {
        type: 'Point',
        coordinates: [patientLng, patientLat]
      },
      pickupAddress: 'SOS Coordinates Lock',
      destinationHospital: {
        name: 'Metro Trauma Center',
        latitude: 19.0760,
        longitude: 72.8777
      },
      price: 520, // ₹500 base + flat distance
      status: 'pending'
    });
    await booking.save();
    console.log('[Test Ambulance] Booking Saved. ID:', booking._id);

    // 7. Accept trip
    console.log('[Test Ambulance] Simulating Driver acceptance...');
    booking.status = 'accepted';
    await booking.save();

    ambulanceDriver.status = 'busy';
    await ambulanceDriver.save();

    // Verify trip update
    const activeBooking = await AmbulanceBooking.findById(booking._id).populate({
      path: 'driverId',
      populate: { path: 'userId', select: 'name phone' }
    });
    console.log('[Test Ambulance] Driver name:', activeBooking.driverId.userId.name);
    console.log('[Test Ambulance] Plate:', activeBooking.driverId.vehicleNumber);
    console.log('[Test Ambulance] Current Booking Status:', activeBooking.status);

    // Cleanup
    console.log('[Test Ambulance] Cleaning up test data...');
    await AmbulanceBooking.deleteOne({ _id: booking._id });
    
    console.log('[Test Ambulance] SUCCESS: All database components for Ambulance Booking verified successfully.');
    process.exit(0);
  } catch (err) {
    console.error('[Test Ambulance] ERROR running verification flow:', err);
    process.exit(1);
  }
}

runTest();
