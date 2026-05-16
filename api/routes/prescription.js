import express from 'express';
import { verifyToken, verifyPharmacy } from '../middleware/auth.js';
import Medicine from '../models/Medicine.js';
import Pharmacy from '../models/Pharmacy.js';
import { uploadPharmacy } from '../middleware/upload.js';

const router = express.Router();

/**
 * OCR / Prescription Analysis Endpoint
 * In a real-world app, you would integrate with Google Vision AI, Amazon Textract, or Gemini 1.5 Flash
 * For this implementation, we simulate the OCR process.
 */
router.post('/analyze', verifyToken, uploadPharmacy.single('prescription'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No prescription image provided' });
    }

    // SIMULATED OCR LOGIC
    const mockMedicines = [
      'Paracetamol 500mg',
      'Amoxicillin 250mg',
      'Cetirizine 10mg',
      'Metformin 500mg'
    ];

    console.log(`[Prescription] Image uploaded by ${req.user.role}: ${req.file.path}`);

    // Fetch detailed info
    const results = await Promise.all(mockMedicines.map(async (name) => {
      const catalogItem = await Medicine.findOne({ 
        name: { $regex: name.split(' ')[0], $options: 'i' } 
      });

      if (!catalogItem) return { name, status: 'Not found in catalog' };

      // If it's a pharmacy user, check their own inventory
      let inventoryItem = null;
      let status = 'Found in catalog';

      if (req.user.role === 'pharmacy' && req.user.id) {
        const pharmacy = await Pharmacy.findById(req.user.id);
        if (pharmacy) {
          inventoryItem = pharmacy.inventory.find(
            inv => inv.medicineId?.toString() === catalogItem._id.toString() || 
                   inv.medicineName?.toLowerCase().includes(name.toLowerCase())
          );
          status = inventoryItem ? 'In Stock' : 'Out of Stock';
        }
      }

      return {
        medicine: catalogItem,
        inventory: inventoryItem || null,
        status: status
      };
    }));

    res.json({
      message: 'Prescription analyzed successfully',
      imageUrl: req.file.path,
      extractedMedicines: results
    });

  } catch (error) {
    console.error('Prescription Analysis Error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
