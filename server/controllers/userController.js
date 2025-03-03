const db = require('../config/database');

// Get user statistics
async function getUserStats(req, res) {
  // Ensure users can only see their own stats
  if (req.params.userId != req.user.id) {
    return res.status(403).json({ message: 'Unauthorized' });
  }
  
  try {
    // Get basic completion stats
    const completionsResult = await db.query(
      `SELECT COUNT(*) as puzzles_completed
       FROM completion_times
       WHERE user_id = $1`,
      [req.user.id]
    );
    
    // Get streak information
    const streakResult = await db.query(
      `SELECT current_streak, max_streak
       FROM user_streaks
       WHERE user_id = $1`,
      [req.user.id]
    );
    
    // Get best and average times
    const timesResult = await db.query(
      `SELECT MIN(completion_time) as best_time, AVG(completion_time) as average_time
       FROM completion_times
       WHERE user_id = $1`,
      [req.user.id]
    );
    
    // Get number of times the user was in first place
    const winsResult = await db.query(
      `SELECT COUNT(*) as leaderboard_wins
       FROM (
         SELECT puzzle_id, MIN(completion_time) as min_time
         FROM completion_times
         GROUP BY puzzle_id
       ) as fastest_times
       JOIN completion_times ct ON fastest_times.puzzle_id = ct.puzzle_id 
                                AND fastest_times.min_time = ct.completion_time
       WHERE ct.user_id = $1`,
      [req.user.id]
    );
    
    // Get recent completions
    const recentResult = await db.query(
      `SELECT p.date, ct.completion_time, ct.completed_at,
         (SELECT COUNT(*) + 1 
          FROM completion_times 
          WHERE puzzle_id = ct.puzzle_id AND completion_time < ct.completion_time) as rank
       FROM completion_times ct
       JOIN puzzles p ON ct.puzzle_id = p.id
       WHERE ct.user_id = $1
       ORDER BY ct.completed_at DESC
       LIMIT 10`,
      [req.user.id]
    );
    
    // Compile stats
    const stats = {
      puzzles_completed: parseInt(completionsResult.rows[0]?.puzzles_completed || 0),
      current_streak: streakResult.rows[0]?.current_streak || 0,
      max_streak: streakResult.rows[0]?.max_streak || 0,
      best_time: timesResult.rows[0]?.best_time || null,
      average_time: Math.round(timesResult.rows[0]?.average_time) || null,
      leaderboard_wins: parseInt(winsResult.rows[0]?.leaderboard_wins || 0),
      recent_completions: recentResult.rows || []
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error in getUserStats:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

// Update user preferences
async function updateUserPreferences(req, res) {
  const { email_notifications } = req.body;
  
  try {
    if (email_notifications !== undefined) {
      await db.query(
        'UPDATE users SET email_notifications = $1 WHERE id = $2',
        [email_notifications, req.user.id]
      );
    }
    
    res.json({ message: 'Preferences updated' });
  } catch (error) {
    console.error('Error in updateUserPreferences:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = {
  getUserStats,
  updateUserPreferences
};