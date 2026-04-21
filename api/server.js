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
import riderRoutes from './routes/rider.js';
import medicineRequestRoutes from './routes/medicineRequests.js';
import { Server } from 'socket.io';
import { createServer } from 'http';

import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/mongodb.js';

import { initSocket } from './socket.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config();

const app = express();
const httpServer = createServer(app);

// CORS configuration shared between Express and Socket.io
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  process.env.FRONTEND_URL
].filter(Boolean).map(url => url.replace(/\/$/, ''));

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const normalizedOrigin = origin.replace(/\/$/, '');
    const isVercel = normalizedOrigin.endsWith('.vercel.app');
    const isRender = normalizedOrigin.endsWith('.onrender.com');

    if (allowedOrigins.includes(normalizedOrigin) || isVercel || isRender) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Initialize Socket.io via the new socket manager with identical CORS
const io = initSocket(httpServer, corsOptions);

// Middleware
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/pharmacies', pharmacyRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/medicine-requests', medicineRequestRoutes);
app.use('/api/rider', riderRoutes);

// Health check
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({
    status: 'ok',
    timestamp: new Date(),
    database: dbStatus
  });
});

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'Route not found' });
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

const startServer = async () => {
  await connectDB();
  httpServer.listen(PORT, () => {
    console.log(`SwasthRoute API running on port ${PORT}`);
  });
};

startServer();
