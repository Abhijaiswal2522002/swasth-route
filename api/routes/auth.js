import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Pharmacy from '../models/Pharmacy.js';
import { sendAdminNotification, sendPasswordResetEmail, sendWelcomeEmail } from '../utils/email.js';

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
    if (!phone || !name || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ phone }, { email }] });
    if (existingUser) {
      const field = existingUser.phone === phone ? 'Phone number' : 'Email';
      return res.status(409).json({ error: `${field} already registered` });
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

    // Send welcome email (don't await to avoid delaying response)
    sendWelcomeEmail(user.email, user.name, 'user');

    const token = generateToken(user._id, 'user');

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        phone: user.phone,
        name: user.name,
        email: user.email,
        role: 'user',
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Unified Login (User & Pharmacy)
router.post('/user/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // 1. Try to find in User collection
    let account = await User.findOne({ email });
    let role = 'user';

    // 2. If not found, try to find in Pharmacy collection
    if (!account) {
      account = await Pharmacy.findOne({ email });
      role = 'pharmacy';
    }

    if (!account) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, account.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    account.lastLogin = new Date();
    await account.save();

    const token = generateToken(account._id, role);

    const responseData = {
      message: 'Login successful',
      token,
      user: {
        id: account._id,
        phone: account.phone,
        name: account.name,
        email: account.email,
        role: role,
      },
    };

    res.json(responseData);
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

    // Send welcome email (don't await to avoid delaying response)
    sendWelcomeEmail(pharmacy.email, pharmacy.name, 'pharmacy');

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
        role: 'pharmacy',
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
        role: 'pharmacy',
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

    // Console logs for debugging (remove in production)
    console.log('Login attempt for admin:', adminId);
    console.log('Env ADMIN_EMAIL:', process.env.ADMIN_EMAIL);
    const envSecretMatch = password === process.env.ADMIN_SECRET;
    console.log('Password match:', envSecretMatch);

    // Allow login with either 'admin' or the designated admin email
    if ((adminId === process.env.ADMIN_EMAIL) && envSecretMatch) {
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
    console.error('Admin Login Error:', error);
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

// Logout
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

export default router;
