const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { 
  register, 
  login, 
  verifyEmail, 
  getCurrentUser 
} = require('../controllers/authController');

// Register a new user
router.post('/register', register);

// Login user
router.post('/login', login);

// Verify email
router.get('/verify/:token', verifyEmail);

// Get current user (protected route)
router.get('/me', authenticate, getCurrentUser);

module.exports = router;