import express from 'express';
import { verifyPharmacy } from '../middleware/auth.js';
import Purchase from '../models/Purchase.js';
import Supplier from '../models/Supplier.js';
import Pharmacy from '../models/Pharmacy.js';
import mongoose from 'mongoose';

const router = express.Router();

// Get purchase history
router.get('/', verifyPharmacy, async (req, res) => {
  try {
    const { status, supplierId } = req.query;
    const query = { pharmacyId: req.pharmacy.id };
    
    if (status) query.status = status;
    if (supplierId) query.supplierId = supplierId;

    const purchases = await Purchase.find(query)
      .populate('supplierId', 'name phone')
      .sort({ orderDate: -1 });
      
    res.json(purchases);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create purchase order
router.post('/', verifyPharmacy, async (req, res) => {
  try {
    const { supplierId, items, tax, amountPaid, notes } = req.body;
    
    if (!supplierId || !items || items.length === 0) {
      return res.status(400).json({ error: 'Supplier and items are required' });
    }

    const subTotal = items.reduce((sum, item) => sum + (item.quantity * item.purchasePrice), 0);
    const totalAmount = subTotal + (Number(tax) || 0);
    const balanceAmount = totalAmount - (Number(amountPaid) || 0);
    
    let paymentStatus = 'pending';
    if (balanceAmount <= 0) paymentStatus = 'paid';
    else if (amountPaid > 0) paymentStatus = 'partial';

    const purchaseId = `PO-${Date.now()}`;

    const purchase = new Purchase({
      purchaseId,
      pharmacyId: req.pharmacy.id,
      supplierId,
      items: items.map(item => ({
        ...item,
        totalAmount: item.quantity * item.purchasePrice
      })),
      subTotal,
      tax: Number(tax) || 0,
      totalAmount,
      amountPaid: Number(amountPaid) || 0,
      balanceAmount,
      paymentStatus,
      notes
    });

    await purchase.save();

    // Update supplier balance
    if (balanceAmount > 0) {
      await Supplier.findByIdAndUpdate(supplierId, {
        $inc: { balanceDue: balanceAmount, totalPurchases: totalAmount }
      });
    } else {
        await Supplier.findByIdAndUpdate(supplierId, {
            $inc: { totalPurchases: totalAmount }
          });
    }

    res.status(201).json(purchase);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark as received (Restocking logic)
router.post('/:id/receive', verifyPharmacy, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const purchase = await Purchase.findOne({ 
      _id: req.params.id, 
      pharmacyId: req.pharmacy.id 
    }).session(session);

    if (!purchase) {
      throw new Error('Purchase order not found');
    }

    if (purchase.status === 'received') {
      throw new Error('Purchase order already marked as received');
    }

    const pharmacy = await Pharmacy.findById(req.pharmacy.id).session(session);
    
    // Update inventory for each item
    for (const item of purchase.items) {
      // Find exact batch in inventory
      let existingBatch = pharmacy.inventory.find(
        inv => 
          inv.medicineName.toLowerCase() === item.medicineName.toLowerCase() && 
          inv.batchNumber === item.batchNumber
      );

      if (existingBatch) {
        existingBatch.quantity += item.quantity;
        // Update expiry just in case it was missing
        if (!existingBatch.expiryDate && item.expiryDate) {
          existingBatch.expiryDate = item.expiryDate;
        }
      } else {
        pharmacy.inventory.push({
          medicineName: item.medicineName,
          batchNumber: item.batchNumber,
          expiryDate: item.expiryDate,
          quantity: item.quantity,
          price: item.purchasePrice * 1.2, // Default markup
          reorderLevel: 10
        });
      }
    }

    purchase.status = 'received';
    purchase.receivedDate = new Date();
    
    await pharmacy.save({ session });
    await purchase.save({ session });

    await session.commitTransaction();
    res.json({ message: 'Purchase received and inventory updated', purchase });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ error: error.message });
  } finally {
    session.endSession();
  }
});

// Update payment
router.post('/:id/payment', verifyPharmacy, async (req, res) => {
  try {
    const { amount } = req.body;
    const purchase = await Purchase.findOne({ 
      _id: req.params.id, 
      pharmacyId: req.pharmacy.id 
    });

    if (!purchase) {
      return res.status(404).json({ error: 'Purchase not found' });
    }

    const paymentAmount = Number(amount);
    purchase.amountPaid += paymentAmount;
    purchase.balanceAmount -= paymentAmount;

    if (purchase.balanceAmount <= 0) {
      purchase.paymentStatus = 'paid';
    } else {
      purchase.paymentStatus = 'partial';
    }

    await purchase.save();

    // Update supplier balance
    await Supplier.findByIdAndUpdate(purchase.supplierId, {
      $inc: { balanceDue: -paymentAmount }
    });

    res.json(purchase);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
