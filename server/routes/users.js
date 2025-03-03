const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  getUserStats,
  updateUserPreferences
} = require('../controllers/userController');

// Get user statistics
router.get('/:userId/stats', authenticate, getUserStats);

// Update user preferences
router.patch('/preferences', authenticate, updateUserPreferences);

module.exports = router;