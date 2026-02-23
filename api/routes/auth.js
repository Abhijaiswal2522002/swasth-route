import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Pharmacy from '../models/Pharmacy.js';

const router = express.Router();

const generateToken = (id, role, expiresIn = '7d') => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn });
};

// User Sign Up
router.post('/user/signup', async (req, res) => {
  try {
    const { phone, name, email, password } = req.body;

    // Validate input
    if (!phone || !name || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(409).json({ error: 'Phone number already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      phone,
      name,
      email,
      password: hashedPassword,
    });

    await user.save();

    const token = generateToken(user._id, 'user');

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        phone: user.phone,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User Login
router.post('/user/login', async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ error: 'Phone and password required' });
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id, 'user');

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        phone: user.phone,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Pharmacy Sign Up
router.post('/pharmacy/signup', async (req, res) => {
  try {
    const { name, phone, email, password, city, pincode, latitude, longitude } = req.body;

    if (!name || !phone || !email || !password || !latitude || !longitude) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const existingPharmacy = await Pharmacy.findOne({ phone });
    if (existingPharmacy) {
      return res.status(409).json({ error: 'Phone number already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const pharmacy = new Pharmacy({
      name,
      phone,
      email,
      password: hashedPassword,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude],
      },
      address: { city, pincode },
    });

    await pharmacy.save();

    const token = generateToken(pharmacy._id, 'pharmacy');

    res.status(201).json({
      message: 'Pharmacy registered successfully',
      token,
      pharmacy: {
        id: pharmacy._id,
        name: pharmacy.name,
        phone: pharmacy.phone,
        status: pharmacy.status,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Pharmacy Login
router.post('/pharmacy/login', async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ error: 'Phone and password required' });
    }

    const pharmacy = await Pharmacy.findOne({ phone });
    if (!pharmacy) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, pharmacy.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(pharmacy._id, 'pharmacy');

    res.json({
      message: 'Login successful',
      token,
      pharmacy: {
        id: pharmacy._id,
        name: pharmacy.name,
        phone: pharmacy.phone,
        status: pharmacy.status,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Login
router.post('/admin/login', async (req, res) => {
  try {
    const { adminId, password } = req.body;

    if (!adminId || !password) {
      return res.status(400).json({ error: 'Admin credentials required' });
    }

    // Simple admin authentication - in production, store admin credentials separately
    if (adminId === 'admin' && password === process.env.ADMIN_SECRET) {
      const token = generateToken('admin', 'admin');

      res.json({
        message: 'Admin login successful',
        token,
        admin: { id: 'admin', role: 'admin' },
      });
    } else {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
