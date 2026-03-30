import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// Get user profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

import { uploadUser } from '../middleware/upload.js';

// Update user profile
router.put('/profile', verifyToken, uploadUser.single('avatar'), async (req, res) => {
  try {
    const { name, email } = req.body;
    
    const updateData = { name, email };
    
    if (req.file) {
      updateData.avatar = req.file.path;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true }
    ).select('-password');

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add address
router.post('/addresses', verifyToken, async (req, res) => {
  try {
    const { label, street, city, state, pincode, latitude, longitude, isDefault } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.addresses.push({
      label,
      street,
      city,
      state,
      pincode,
      latitude,
      longitude,
      isDefault: isDefault || false,
    });

    await user.save();
    res.status(201).json({ message: 'Address added', addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get addresses
router.get('/addresses', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user.addresses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update address
router.put('/addresses/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { label, street, city, state, pincode, latitude, longitude, isDefault } = req.body;

    const user = await User.findById(req.user.id);
    const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === id);

    if (addressIndex === -1) {
      return res.status(404).json({ error: 'Address not found' });
    }

    user.addresses[addressIndex] = {
      ...user.addresses[addressIndex],
      label,
      street,
      city,
      state,
      pincode,
      latitude,
      longitude,
      isDefault,
    };

    await user.save();
    res.json({ message: 'Address updated', addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete address
router.delete('/addresses/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.user.id);

    user.addresses = user.addresses.filter(addr => addr._id.toString() !== id);
    await user.save();

    res.json({ message: 'Address deleted', addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add favorite
router.post('/favorites', verifyToken, async (req, res) => {
  try {
    const { pharmacyId, medicineId } = req.body;
    const user = await User.findById(req.user.id);

    const isFavorited = user.favorites.some(
      fav => fav.pharmacyId.toString() === pharmacyId && fav.medicineId.toString() === medicineId
    );

    if (!isFavorited) {
      user.favorites.push({ pharmacyId, medicineId });
      await user.save();
    }

    res.json({ message: 'Added to favorites', favorites: user.favorites });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get favorites
router.get('/favorites', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user.favorites);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove favorite
router.delete('/favorites/:pharmacyId/:medicineId', verifyToken, async (req, res) => {
  try {
    const { pharmacyId, medicineId } = req.params;
    const user = await User.findById(req.user.id);

    user.favorites = user.favorites.filter(
      fav => !(fav.pharmacyId.toString() === pharmacyId && fav.medicineId.toString() === medicineId)
    );

    await user.save();
    res.json({ message: 'Removed from favorites', favorites: user.favorites });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
