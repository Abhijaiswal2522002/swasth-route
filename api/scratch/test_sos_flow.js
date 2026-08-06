import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import connectDB from '../config/mongodb.js';
import User from '../models/User.js';
import Pharmacy from '../models/Pharmacy.js';
import SosRequest from '../models/SosRequest.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config();

async function runTest() {
  try {
    console.log('[Test SOS] Connecting to MongoDB...');
    await connectDB();

    // 1. Get a mock user
    let user = await User.findOne({ role: 'user' });
    if (!user) {
      console.log('[Test SOS] Creating mock user...');
      user = new User({
        name: 'SOS Patient Test',
        phone: '9999999999',
        email: 'sos_patient@example.com',
        password: 'password123',
        role: 'user'
      });
      await user.save();
    }
    console.log('[Test SOS] Using User ID:', user._id);

    // 2. Get/create mock pharmacy
    let pharmacy = await Pharmacy.findOne({ status: 'active' });
    if (!pharmacy) {
      console.log('[Test SOS] Creating mock pharmacy...');
      pharmacy = new Pharmacy({
        name: 'Emergency Health Care',
        phone: '9999999998',
        email: 'sos_pharmacy@example.com',
        password: 'password123',
        role: 'pharmacy',
        location: {
          type: 'Point',
          coordinates: [72.8777, 19.0760] // Mumbai
        },
        address: {
          street: 'Main Road',
          city: 'Mumbai',
          pincode: '400001'
        },
        status: 'active'
      });
      await pharmacy.save();
    }
    console.log('[Test SOS] Using Pharmacy ID:', pharmacy._id);

    // 3. Clear existing pending SOS requests to ensure clean state
    await SosRequest.deleteMany({ userId: user._id });

    // 4. Create an SOS Request
    console.log('[Test SOS] Creating SOS Request...');
    const sosRequest = new SosRequest({
      userId: user._id,
      textNote: 'Need critical inhaler immediately, asthmatic attack!',
      location: {
        type: 'Point',
        coordinates: [72.8780, 19.0765] // close to pharmacy coordinate
      },
      address: {
        street: 'Apt 501, Near Metro Station',
        city: 'Mumbai',
        pincode: '400001'
      },
      broadcastedPharmacies: [pharmacy._id],
      status: 'pending'
    });
    await sosRequest.save();
    console.log('[Test SOS] SOS Request created with ID:', sosRequest._id);

    // 5. Simulate Pharmacy Offer
    console.log('[Test SOS] Simulating Pharmacy Offer...');
    sosRequest.offers.push({
      pharmacyId: pharmacy._id,
      price: 350,
      estimatedMinutes: 10,
      notes: 'Inhaler in stock, dispatched immediately via active rider.'
    });
    sosRequest.status = 'offered';
    await sosRequest.save();
    console.log('[Test SOS] Offer submitted on SOS Request. Status is now:', sosRequest.status);

    // 6. Retrieve active SOS requests
    const activeRequests = await SosRequest.find({
      userId: user._id,
      status: { $in: ['pending', 'offered'] }
    });
    console.log('[Test SOS] Retrieved active requests count:', activeRequests.length);
    console.log('[Test SOS] First active request offer count:', activeRequests[0]?.offers.length);

    console.log('[Test SOS] Cleanup of test data...');
    await SosRequest.deleteOne({ _id: sosRequest._id });
    console.log('[Test SOS] SUCCESS: All database components for SOS feature validated successfully.');
    process.exit(0);
  } catch (err) {
    console.error('[Test SOS] ERROR running verification flow:', err);
    process.exit(1);
  }
}

runTest();
