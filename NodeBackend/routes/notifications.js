const express = require('express');
const { Notification } = require('../models');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

// Get unread notifications for the current user
router.get('/', authenticate, async (req, res) => {
  try {
    const notifications = await Notification.getUnreadForUser(req.user.id);
    res.json(notifications);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Mark all notifications as read
router.post('/read-all', authenticate, async (req, res) => {
  try {
    await Notification.markAllAsRead(req.user.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Mark read all error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
