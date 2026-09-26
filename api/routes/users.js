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

// Safe multer middleware wrapper
const handleAvatarUpload = (req, res, next) => {
  const upload = uploadUser.single('avatar');
  upload(req, res, (err) => {
    if (err) {
      console.warn('Avatar upload warning/error:', err.message);
      return res.status(400).json({ error: `Avatar upload failed: ${err.message}` });
    }
    next();
  });
};

// Update user profile
router.put('/profile', verifyToken, handleAvatarUpload, async (req, res) => {
  try {
    const { name, email, phone, avatar, healthPreferences } = req.body;
    
    const updateData = {};
    if (name !== undefined && name.trim()) updateData.name = name.trim();
    if (email !== undefined && email.trim()) updateData.email = email.trim().toLowerCase();
    if (phone !== undefined && phone.trim()) updateData.phone = phone.trim();

    if (req.file && req.file.path) {
      updateData.avatar = req.file.path;
    } else if (avatar !== undefined) {
      updateData.avatar = avatar;
    }

    if (healthPreferences !== undefined) {
      let hp = healthPreferences;
      if (typeof hp === 'string') {
        try {
          hp = JSON.parse(hp);
        } catch (e) {
          hp = {};
        }
      }
      updateData.healthPreferences = {
        frequentlyUsedMedicines: Array.isArray(hp.frequentlyUsedMedicines) ? hp.frequentlyUsedMedicines : [],
        chronicConditions: hp.chronicConditions || '',
        allergies: hp.allergies || ''
      };
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add address
router.post('/addresses', verifyToken, async (req, res) => {
  try {
    const { label, street, city, state, pincode, latitude, longitude, isDefault } = req.body;

    if (!street || !city || !state || !pincode) {
      return res.status(400).json({ error: 'Street, city, state, and pincode are required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const willBeDefault = Boolean(isDefault) || user.addresses.length === 0;

    if (willBeDefault) {
      user.addresses.forEach(addr => {
        addr.isDefault = false;
      });
    }

    user.addresses.push({
      label: label || 'Home',
      street,
      city,
      state,
      pincode,
      latitude: latitude ? Number(latitude) : undefined,
      longitude: longitude ? Number(longitude) : undefined,
      isDefault: willBeDefault,
    });

    await user.save();
    res.status(201).json({ message: 'Address added successfully', addresses: user.addresses });
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
    res.json(user.addresses || []);
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
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const address = user.addresses.id(id);
    if (!address) {
      return res.status(404).json({ error: 'Address not found' });
    }

    if (isDefault) {
      user.addresses.forEach(addr => {
        addr.isDefault = false;
      });
    }

    if (label !== undefined) address.label = label;
    if (street !== undefined) address.street = street;
    if (city !== undefined) address.city = city;
    if (state !== undefined) address.state = state;
    if (pincode !== undefined) address.pincode = pincode;
    if (latitude !== undefined) address.latitude = Number(latitude);
    if (longitude !== undefined) address.longitude = Number(longitude);
    if (isDefault !== undefined) address.isDefault = Boolean(isDefault);

    await user.save();
    res.json({ message: 'Address updated successfully', addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Set default address
router.put('/addresses/:id/default', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const address = user.addresses.id(id);
    if (!address) {
      return res.status(404).json({ error: 'Address not found' });
    }

    user.addresses.forEach(addr => {
      addr.isDefault = addr._id.toString() === id;
    });

    await user.save();
    res.json({ message: 'Default address updated successfully', addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete address
router.delete('/addresses/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const targetAddr = user.addresses.id(id);
    if (!targetAddr) {
      return res.status(404).json({ error: 'Address not found' });
    }

    const wasDefault = targetAddr.isDefault;
    user.addresses.pull({ _id: id });

    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();
    res.json({ message: 'Address deleted successfully', addresses: user.addresses });
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
