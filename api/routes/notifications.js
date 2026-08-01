import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import Notification from '../models/Notification.js';

const router = express.Router();

// Get all notifications for logged-in user / pharmacy / rider
router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await Notification.find({ recipientId: userId }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark a single notification as read
router.put('/:id/read', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipientId: userId },
      { isRead: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark all notifications for the recipient as read
router.put('/read-all', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await Notification.updateMany(
      { recipientId: userId, isRead: false },
      { isRead: true }
    );
    res.json({ message: 'All notifications marked as read', modifiedCount: result.modifiedCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a single notification
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const notification = await Notification.findOneAndDelete({ _id: req.params.id, recipientId: userId });
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
