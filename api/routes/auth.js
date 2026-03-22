import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Pharmacy from '../models/Pharmacy.js';
import { sendAdminNotification, sendPasswordResetEmail } from '../utils/email.js';

const router = express.Router();

// Temporary in-memory store for CAPTCHAs (in production, use Redis or sessions)
const captchaStore = new Map();

const generateToken = (id, role, expiresIn = '7d') => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn });
};

// Get CAPTCHA
router.get('/captcha', (req, res) => {
  const num1 = Math.floor(Math.random() * 10);
  const num2 = Math.floor(Math.random() * 10);
  const id = Date.now().toString();
  const answer = num1 + num2;

  captchaStore.set(id, answer);

  // Auto-expire CAPTCHA after 5 minutes
  setTimeout(() => captchaStore.delete(id), 5 * 60 * 1000);

  res.json({
    id,
    question: `What is ${num1} + ${num2}?`,
  });
});

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
    const {
      name, phone, email, password, address, city, pincode,
      licenseNumber, latitude, longitude,
      captchaId, captchaAnswer
    } = req.body;

    // Verify CAPTCHA
    if (!captchaId || !captchaAnswer) {
      return res.status(400).json({ error: 'CAPTCHA is required' });
    }

    const storedAnswer = captchaStore.get(captchaId);
    if (storedAnswer === undefined || parseInt(captchaAnswer) !== storedAnswer) {
      return res.status(400).json({ error: 'Invalid CAPTCHA answer' });
    }

    // Clear CAPTCHA after use
    captchaStore.delete(captchaId);

    if (!name || !phone || !email || !password || typeof latitude !== 'number' || typeof longitude !== 'number') {
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
      address: {
        street: address, // Map incoming 'address' string to 'street'
        city,
        pincode
      },
      licenseNumber,
    });

    await pharmacy.save();

    // Send notification to admin (don't await to avoid delaying response)
    sendAdminNotification(pharmacy);

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

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  try {
    const { contact } = req.body; // email or phone

    if (!contact) {
      return res.status(400).json({ error: 'Email or phone is required' });
    }

    // Search in both User and Pharmacy
    let user = await User.findOne({ $or: [{ email: contact }, { phone: contact }] });
    let role = 'user';

    if (!user) {
      user = await Pharmacy.findOne({ $or: [{ email: contact }, { phone: contact }] });
      role = 'pharmacy';
    }

    if (!user) {
      // For security reasons, don't reveal if user exists or not
      return res.json({ message: 'If an account exists, a reset link has been sent.' });
    }

    if (!user.email) {
      return res.status(400).json({ error: 'No email associated with this account. Please contact support.' });
    }

    // Generate reset token (valid for 1 hour)
    const resetToken = jwt.sign({ id: user._id, role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Send email
    await sendPasswordResetEmail(user.email, resetToken, user.name);

    res.json({ message: 'If an account exists, a reset link has been sent.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired reset token' });
    }

    const { id, role } = decoded;

    // Find user/pharmacy
    let user;
    if (role === 'user') {
      user = await User.findById(id);
    } else if (role === 'pharmacy') {
      user = await Pharmacy.findById(id);
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
