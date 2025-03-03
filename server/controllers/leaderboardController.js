const db = require('../config/database');

// Get today's leaderboard
async function getTodayLeaderboard(req, res) {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const result = await db.query(
      `SELECT u.name, ct.user_id, ct.completion_time, ct.completed_at
       FROM completion_times ct
       JOIN users u ON ct.user_id = u.id
       JOIN puzzles p ON ct.puzzle_id = p.id
       WHERE p.date = $1
       ORDER BY ct.completion_time ASC
       LIMIT 50`,
      [today]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error in getTodayLeaderboard:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

// Get this week's leaderboard
async function getWeekLeaderboard(req, res) {
  try {
    const result = await db.query(
      `SELECT u.name, ct.user_id, MIN(ct.completion_time) as completion_time, MAX(ct.completed_at) as completed_at
       FROM completion_times ct
       JOIN users u ON ct.user_id = u.id
       JOIN puzzles p ON ct.puzzle_id = p.id
       WHERE p.date >= DATE_TRUNC('week', CURRENT_DATE)
       GROUP BY u.name, ct.user_id
       ORDER BY completion_time ASC
       LIMIT 50`
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error in getWeekLeaderboard:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

// Get this month's leaderboard
async function getMonthLeaderboard(req, res) {
  try {
    const result = await db.query(
      `SELECT u.name, ct.user_id, MIN(ct.completion_time) as completion_time, MAX(ct.completed_at) as completed_at
       FROM completion_times ct
       JOIN users u ON ct.user_id = u.id
       JOIN puzzles p ON ct.puzzle_id = p.id
       WHERE p.date >= DATE_TRUNC('month', CURRENT_DATE)
       GROUP BY u.name, ct.user_id
       ORDER BY completion_time ASC
       LIMIT 50`
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error in getMonthLeaderboard:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

// Get all-time leaderboard
async function getAllTimeLeaderboard(req, res) {
  try {
    const result = await db.query(
      `SELECT u.name, ct.user_id, MIN(ct.completion_time) as completion_time, MAX(ct.completed_at) as completed_at
       FROM completion_times ct
       JOIN users u ON ct.user_id = u.id
       GROUP BY u.name, ct.user_id
       ORDER BY completion_time ASC
       LIMIT 50`
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error in getAllTimeLeaderboard:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = {
  getTodayLeaderboard,
  getWeekLeaderboard,
  getMonthLeaderboard,
  getAllTimeLeaderboard
};