import express from 'express';
import Medicine from '../models/Medicine.js';
import { verifyToken, verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all medicines (public/pharmacy use)
router.get('/', async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = { status: 'active' };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { manufacturer: { $regex: search, $options: 'i' } },
        { composition: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) {
      query.category = category;
    }

    const medicines = await Medicine.find(query).limit(50);
    res.json(medicines);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search medicine by name (exact match)
router.get('/search', async (req, res) => {
    try {
        const { name } = req.query;
        if (!name) return res.status(400).json({ error: 'Name query required' });
        
        const medicine = await Medicine.findOne({ name: new RegExp('^' + name + '$', 'i') });
        if (!medicine) return res.status(404).json({ error: 'Medicine not found' });
        
        res.json(medicine);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create medicine (Admin or Pharmacy can add if not found)
// For now, let's allow pharmacies too but we could restrict this later
router.post('/', async (req, res) => {
  try {
    const { name, manufacturer, category, composition, description, image } = req.body;
    
    // Check if medicine already exists
    const existingMedicine = await Medicine.findOne({ name: new RegExp('^' + name + '$', 'i') });
    if (existingMedicine) {
      return res.status(400).json({ error: 'Medicine already exists in catalog' });
    }

    const medicine = new Medicine({
      name,
      manufacturer,
      category,
      composition,
      description,
      image,
    });

    await medicine.save();
    res.status(201).json({ message: 'Medicine added to catalog', medicine });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update medicine (Admin only)
router.put('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!medicine) {
      return res.status(404).json({ error: 'Medicine not found' });
    }
    res.json({ message: 'Medicine updated', medicine });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
