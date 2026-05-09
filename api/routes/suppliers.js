import express from 'express';
import { verifyPharmacy } from '../middleware/auth.js';
import Supplier from '../models/Supplier.js';

const router = express.Router();

// Get all suppliers for a pharmacy
router.get('/', verifyPharmacy, async (req, res) => {
  try {
    const suppliers = await Supplier.find({ pharmacyId: req.pharmacy.id }).sort({ name: 1 });
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new supplier
router.post('/', verifyPharmacy, async (req, res) => {
  try {
    const { name, contactPerson, phone, email, address, gstNumber } = req.body;
    
    if (!name || !phone) {
      return res.status(400).json({ error: 'Name and phone are required' });
    }

    const supplier = new Supplier({
      pharmacyId: req.pharmacy.id,
      name,
      contactPerson,
      phone,
      email,
      address,
      gstNumber
    });

    await supplier.save();
    res.status(201).json(supplier);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a supplier
router.put('/:id', verifyPharmacy, async (req, res) => {
  try {
    const supplier = await Supplier.findOneAndUpdate(
      { _id: req.params.id, pharmacyId: req.pharmacy.id },
      { $set: req.body },
      { new: true }
    );
    
    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }
    
    res.json(supplier);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a supplier
router.delete('/:id', verifyPharmacy, async (req, res) => {
  try {
    const supplier = await Supplier.findOneAndDelete({
      _id: req.params.id,
      pharmacyId: req.pharmacy.id
    });
    
    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }
    
    res.json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
