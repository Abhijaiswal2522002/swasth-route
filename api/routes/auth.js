import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Pharmacy from '../models/Pharmacy.js';
import Rider from '../models/Rider.js';
import { sendAdminNotification, sendPasswordResetEmail, sendWelcomeEmail, sendEmailVerification } from '../utils/email.js';

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

    // Generate Verification Token (expires in 24h)
    const verificationToken = jwt.sign(
      { phone, name, email, password: hashedPassword, role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Send verification email
    await sendEmailVerification(email, name, 'user', verificationToken);

    res.status(200).json({
      message: 'Verification email sent. Please check your inbox.',
      redirect: '/auth/login'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify Email Endpoint
router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ error: 'Verification token is missing' });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ error: 'Invalid or expired verification token' });
    }

    const { role, email, phone, name, password, ...rest } = decoded;

    // Check if user already exists (final check)
    if (role === 'user') {
      const existingUser = await User.findOne({ $or: [{ phone }, { email }] });
      if (existingUser) return res.status(409).json({ error: 'User already verified and registered' });

      const user = new User({ phone, name, email, password, isVerified: true });
      await user.save();
      sendWelcomeEmail(user.email, user.name, 'user');
    } else if (role === 'pharmacy') {
      const existingPharmacy = await Pharmacy.findOne({ $or: [{ phone }, { email }] });
      if (existingPharmacy) return res.status(409).json({ error: 'Pharmacy already verified and registered' });

      const pharmacy = new Pharmacy({
        name, phone, email, password,
        location: rest.location,
        address: rest.address,
        licenseNumber: rest.licenseNumber,
        isVerified: true,
        status: 'pending' // Still requires admin approval
      });
      await pharmacy.save();
      sendWelcomeEmail(pharmacy.email, pharmacy.name, 'pharmacy');
      sendAdminNotification(pharmacy);
    } else if (role === 'rider') {
      const existingUser = await User.findOne({ $or: [{ phone }, { email }] });
      if (existingUser) return res.status(409).json({ error: 'User already verified and registered' });

      const user = new User({ phone, name, email, password, role: 'rider', isVerified: true });
      await user.save();

      const rider = new Rider({
        userId: user._id,
        vehicleType: rest.vehicleType,
        vehicleNumber: rest.vehicleNumber,
        currentLocation: rest.location || { type: 'Point', coordinates: [0, 0] },
        status: 'offline'
      });
      await rider.save();
      sendWelcomeEmail(user.email, user.name, 'rider');
    }

    // Return JSON so the frontend fetch() call can parse the result.
    // The frontend page handles the redirect to /auth/login after success.
    res.json({ message: 'Email verified successfully. You can now log in.', role });
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
    let role = account ? (account.role || 'user') : null;

    // 2. If not found, try to find in Pharmacy collection
    if (!account) {
      account = await Pharmacy.findOne({ email });
      role = 'pharmacy';
    }

    if (!account) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (account.isVerified === false) {
      return res.status(403).json({ error: 'Please verify your email address before logging in.' });
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

    const existingPharmacy = await Pharmacy.findOne({ $or: [{ phone }, { email }] });
    if (existingPharmacy) {
      const field = existingPharmacy.phone === phone ? 'Phone number' : 'Email';
      return res.status(409).json({ error: `${field} already registered` });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate Verification Token
    const verificationToken = jwt.sign(
      {
        name, phone, email, password: hashedPassword,
        location: { type: 'Point', coordinates: [longitude, latitude] },
        address: { street: address, city, pincode },
        licenseNumber,
        role: 'pharmacy'
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Send verification email
    await sendEmailVerification(email, name, 'pharmacy', verificationToken);

    res.status(200).json({
      message: 'Verification email sent. Please check your inbox.',
      redirect: '/auth/login'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rider Sign Up
router.post('/rider/signup', async (req, res) => {
  try {
    const {
      name, phone, email, password, vehicleType, vehicleNumber, latitude, longitude
    } = req.body;

    if (!name || !phone || !email || !password || !vehicleType || !vehicleNumber) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const existingUser = await User.findOne({ $or: [{ phone }, { email }] });
    if (existingUser) {
      const field = existingUser.phone === phone ? 'Phone number' : 'Email';
      return res.status(409).json({ error: `${field} already registered` });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate Verification Token
    const verificationToken = jwt.sign(
      {
        name, phone, email, password: hashedPassword,
        vehicleType, vehicleNumber,
        location: { type: 'Point', coordinates: [longitude || 0, latitude || 0] },
        role: 'rider'
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Send verification email
    await sendEmailVerification(email, name, 'rider', verificationToken);

    res.status(200).json({
      message: 'Verification email sent. Please check your inbox.',
      redirect: '/auth/login'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Pharmacy Login
router.post('/pharmacy/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const pharmacy = await Pharmacy.findOne({ email });
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

    // 1. Try to find in User collection first (DB-backed admin)
    let admin = await User.findOne({
      $or: [{ email: adminId }, { phone: adminId }],
      role: 'admin'
    });

    if (admin) {
      const isPasswordValid = await bcrypt.compare(password, admin.password);
      if (isPasswordValid) {
        const token = generateToken(admin._id, 'admin');
        return res.json({
          message: 'Admin login successful',
          token,
          admin: { id: admin._id, name: admin.name, role: 'admin' },
        });
      }
    }

    // 2. Fallback to Environment Variables (for initial setup/recovery)
    const isEnvEmailMatch = adminId === process.env.ADMIN_EMAIL;
    const isEnvSecretMatch = password === process.env.ADMIN_SECRET;

    if (isEnvEmailMatch && isEnvSecretMatch) {
      const token = generateToken('admin_env', 'admin');
      return res.json({
        message: 'Admin login successful (Env Profile)',
        token,
        admin: { id: 'admin_env', name: 'System Admin', role: 'admin' },
      });
    }

    return res.status(401).json({ error: 'Invalid admin credentials' });
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
