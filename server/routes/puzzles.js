const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { getTodaysPuzzle, validateSolution } = require('../controllers/puzzleController');

// Get today's puzzle
router.get('/today', getTodaysPuzzle);

// Submit solution
router.post('/submit', authenticate, validateSolution);

module.exports = router;