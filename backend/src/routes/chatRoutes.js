import express from 'express';
import Message from '../models/Message.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/groups/:id/messages
// @desc    Get message history for group
router.get('/:id/messages', protect, async (req, res) => {
  try {
    const messages = await Message.find({ group: req.params.id })
      .populate('sender', 'name email')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching message history' });
  }
});

export default router;
