const express = require('express');
const router = express.Router();
const { 
  getTodayLeaderboard, 
  getWeekLeaderboard, 
  getMonthLeaderboard,
  getAllTimeLeaderboard
} = require('../controllers/leaderboardController');

// Get today's leaderboard
router.get('/today', getTodayLeaderboard);

// Get this week's leaderboard
router.get('/week', getWeekLeaderboard);

// Get this month's leaderboard
router.get('/month', getMonthLeaderboard);

// Get all-time leaderboard
router.get('/all-time', getAllTimeLeaderboard);

module.exports = router;