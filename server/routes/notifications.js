const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Notification = require('../models/Notification');

// @route   GET api/notifications
// @desc    Get all unread notifications for a user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({
      user: req.user.id,
      read: false,
    }).sort({ date: -1 }); // Show newest first
    
    res.json(notifications);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/notifications/mark-read
// @desc    Mark all user's notifications as read
// @access  Private
router.post('/mark-read', auth, async (req, res) => {
  try {
    // Find all unread notifications for this user and set them to 'read: true'
    await Notification.updateMany(
      { user: req.user.id, read: false },
      { $set: { read: true } }
    );
    
    res.json({ msg: 'Notifications marked as read' });
  } catch (err) {
    console.error(err.message);
    res.status(5.00).send('Server Error');
  }
});

module.exports = router;