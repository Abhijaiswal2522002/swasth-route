import express from 'express';
import Invoice from '../models/Invoice.js';
import Pharmacy from '../models/Pharmacy.js';
import Medicine from '../models/Medicine.js';
import { verifyToken, verifyPharmacy } from '../middleware/auth.js';

const router = express.Router();

// Get all invoices for the logged-in pharmacy
router.get('/', verifyToken, verifyPharmacy, async (req, res) => {
  try {
    const invoices = await Invoice.find({ pharmacyId: req.user.id }).sort({ createdAt: -1 });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a single invoice
router.get('/:id', verifyToken, verifyPharmacy, async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, pharmacyId: req.user.id });
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new invoice
router.post('/', verifyToken, verifyPharmacy, async (req, res) => {
  try {
    const {
      customerName,
      customerPhone,
      items,
      subTotal,
      tax,
      discount,
      totalAmount,
      paymentMethod,
      paymentStatus,
      notes
    } = req.body;

    const pharmacyId = req.user.id;

    // Generate invoice number (SWASTH-PHARMACY_ID-TIMESTAMP)
    const invoiceNumber = `INV-${pharmacyId.toString().slice(-4).toUpperCase()}-${Date.now()}`;

    const invoice = new Invoice({
      invoiceNumber,
      pharmacyId,
      customerName,
      customerPhone,
      items,
      subTotal,
      tax,
      discount,
      totalAmount,
      paymentMethod,
      paymentStatus,
      notes
    });

    await invoice.save();

    // Update Pharmacy Inventory
    const pharmacy = await Pharmacy.findById(pharmacyId);
    if (pharmacy) {
      for (const item of items) {
        const inventoryItem = pharmacy.inventory.find(
          (inv) => inv.medicineId.toString() === item.medicineId.toString()
        );
        if (inventoryItem) {
          inventoryItem.quantity -= item.quantity;
          if (inventoryItem.quantity < 0) inventoryItem.quantity = 0;
        }
      }
      pharmacy.totalRevenue += totalAmount;
      await pharmacy.save();
    }

    res.status(201).json({ message: 'Invoice created successfully', invoice });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search medicine by barcode (specifically for pharmacy billing)
router.get('/barcode/:barcode', verifyToken, verifyPharmacy, async (req, res) => {
  try {
    const { barcode } = req.params;
    const medicine = await Medicine.findOne({ barcode, status: 'active' });
    
    if (!medicine) {
      return res.status(404).json({ error: 'Medicine not found with this barcode' });
    }

    // Also check if the pharmacy has it in stock
    const pharmacy = await Pharmacy.findById(req.user.id);
    const inventoryItem = pharmacy?.inventory.find(
      (inv) => inv.medicineId.toString() === medicine._id.toString()
    );

    res.json({
      medicine,
      inventory: inventoryItem || null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
