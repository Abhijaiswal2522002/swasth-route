import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import pharmacyRoutes from './routes/pharmacies.js';
import orderRoutes from './routes/orders.js';
import adminRoutes from './routes/admin.js';
import medicineRoutes from './routes/medicines.js';
import cartRoutes from './routes/cart.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config(); // Also try default path for production (Render env vars)

const app = express();

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  process.env.FRONTEND_URL
].filter(Boolean).map(url => url.replace(/\/$/, ''));

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const normalizedOrigin = origin.replace(/\/$/, '');

    // Automatically allow any Vercel deployment or the production onrender URL
    const isVercel = normalizedOrigin.endsWith('.vercel.app');
    const isRender = normalizedOrigin.endsWith('.onrender.com');

    if (allowedOrigins.includes(normalizedOrigin) || isVercel || isRender) {
      callback(null, true);
    } else {
      console.error(`CORS Error: Origin ${origin} is not allowed. Allowed list:`, allowedOrigins);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// MongoDB Connection
// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/pharmacies', pharmacyRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/medicines', medicineRoutes);

// Health check
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  const envVars = {
    MONGODB_URI: process.env.MONGODB_URI ? 'Present' : 'Missing',
    JWT_SECRET: process.env.JWT_SECRET ? 'Present' : 'Missing',
    FRONTEND_URL: process.env.FRONTEND_URL ? process.env.FRONTEND_URL : 'Missing',
    NODE_ENV: process.env.NODE_ENV || 'not set',
    PORT: process.env.PORT || 'not set'
  };

  res.json({
    status: 'ok',
    timestamp: new Date(),
    database: dbStatus,
    environment: envVars,
    allowedOrigins
  });
});

// 404 Handler
app.use((req, res, next) => {
  const message = `404 - Not Found: ${req.method} ${req.url}`;
  console.warn(message);
  res.status(404).json({
    error: 'Route not found',
    path: req.url,
    method: req.method
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`SwasthRoute API running on port ${PORT}`);
});
