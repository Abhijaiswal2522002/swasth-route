import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import Cart from '../models/Cart.js';

const router = express.Router();

// Get the user's cart for a specific city and pincode
router.get('/', verifyToken, async (req, res) => {
  try {
    const { city = 'default', pincode = 'default' } = req.query;
    let cart = await Cart.findOne({ userId: req.user.id, city, pincode });
    if (!cart) {
      cart = new Cart({ userId: req.user.id, items: [], city, pincode });
      await cart.save();
    }
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add logic: Add an item or increment quantity
router.post('/add', verifyToken, async (req, res) => {
  try {
    const { medicineId, pharmacyId, medicineName, price, city = 'default', pincode = 'default' } = req.body;
    
    let cart = await Cart.findOne({ userId: req.user.id, city, pincode });
    if (!cart) {
      cart = new Cart({ userId: req.user.id, items: [], city, pincode });
    }

    // Check if item already exists
    const itemIndex = cart.items.findIndex(
      (item) => item.medicineId.toString() === medicineId && item.pharmacyId.toString() === pharmacyId
    );

    if (itemIndex > -1) {
      // Item exists, just increment quantity
      cart.items[itemIndex].quantity += 1;
    } else {
      // New item
      cart.items.push({
        medicineId,
        pharmacyId,
        medicineName,
        price,
        quantity: 1,
      });
    }

    await cart.save();
    res.json(cart);
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update item quantity
router.put('/update', verifyToken, async (req, res) => {
  try {
    const { medicineId, pharmacyId, quantity, city = 'default', pincode = 'default' } = req.body;

    let cart = await Cart.findOne({ userId: req.user.id, city, pincode });
    if (!cart) return res.status(404).json({ error: 'Cart not found' });

    const itemIndex = cart.items.findIndex(
      (item) => item.medicineId.toString() === medicineId && item.pharmacyId.toString() === pharmacyId
    );

    if (itemIndex > -1) {
      if (quantity <= 0) {
        cart.items.splice(itemIndex, 1); // Remove if quantity is 0 or less
      } else {
        cart.items[itemIndex].quantity = quantity;
      }
      await cart.save();
      return res.json(cart);
    }

    res.status(404).json({ error: 'Item not found in cart' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove a specific item
router.delete('/item/:medicineId/:pharmacyId', verifyToken, async (req, res) => {
  try {
    const { medicineId, pharmacyId } = req.params;
    const { city = 'default', pincode = 'default' } = req.query;
    
    let cart = await Cart.findOne({ userId: req.user.id, city, pincode });
    if (!cart) return res.status(404).json({ error: 'Cart not found' });

    cart.items = cart.items.filter(
      (item) => !(item.medicineId.toString() === medicineId && item.pharmacyId.toString() === pharmacyId)
    );

    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Clear cart
router.delete('/clear', verifyToken, async (req, res) => {
  try {
    const { city = 'default', pincode = 'default' } = req.query;
    let cart = await Cart.findOne({ userId: req.user.id, city, pincode });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.json({ message: 'Cart cleared successfully', cart });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
