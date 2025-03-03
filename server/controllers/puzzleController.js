const db = require('../config/database');
const { validateSudoku } = require('../utils/sudoku');
const { getTodaysPuzzle: fetchTodaysPuzzle } = require('../services/puzzleGenerator');

// Get today's puzzle
async function getTodaysPuzzle(req, res) {
  try {
    const puzzle = await fetchTodaysPuzzle();
    res.json(puzzle);
  } catch (error) {
    console.error('Error in getTodaysPuzzle:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

// Validate user's solution
async function validateSolution(req, res) {
  const { puzzleId, solution, completionTime } = req.body;
  const userId = req.user.id;
  const ipAddress = req.ip;
  
  try {
    // Get puzzle and solution from database
    const puzzleResult = await db.query(
      'SELECT solution FROM puzzles WHERE id = $1',
      [puzzleId]
    );
    
    if (puzzleResult.rows.length === 0) {
      return res.status(404).json({ message: 'Puzzle not found' });
    }
    
    const correctSolution = JSON.parse(puzzleResult.rows[0].solution);
    
    // Validate solution
    const isCorrect = validateSudoku(solution, correctSolution);
    
    if (!isCorrect) {
      return res.status(400).json({ message: 'Solution is incorrect' });
    }
    
    // Check if user already submitted a solution for this puzzle
    const existingResult = await db.query(
      'SELECT * FROM completion_times WHERE user_id = $1 AND puzzle_id = $2',
      [userId, puzzleId]
    );
    
    if (existingResult.rows.length > 0) {
      // Update if new time is better
      const existingTime = existingResult.rows[0].completion_time;
      
      if (completionTime < existingTime) {
        await db.query(
          'UPDATE completion_times SET completion_time = $1, completed_at = CURRENT_TIMESTAMP WHERE user_id = $2 AND puzzle_id = $3',
          [completionTime, userId, puzzleId]
        );
      }
      
      return res.json({ 
        message: 'Solution validated and time updated if improved',
        previousTime: existingTime
      });
    }
    
    // Record new completion time
    await db.query(
      'INSERT INTO completion_times (user_id, puzzle_id, completion_time, ip_address) VALUES ($1, $2, $3, $4)',
      [userId, puzzleId, completionTime, ipAddress]
    );
    
    // Update user streak
    await updateUserStreak(userId, puzzleId);
    
    res.json({ message: 'Solution validated and time recorded' });
  } catch (error) {
    console.error('Error in validateSolution:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

// Helper function to update user streak
async function updateUserStreak(userId, puzzleId) {
  try {
    // Get puzzle date
    const puzzleResult = await db.query(
      'SELECT date FROM puzzles WHERE id = $1',
      [puzzleId]
    );
    
    if (puzzleResult.rows.length === 0) return;
    
    const puzzleDate = puzzleResult.rows[0].date;
    
    // Get current streak info
    const streakResult = await db.query(
      'SELECT * FROM user_streaks WHERE user_id = $1',
      [userId]
    );
    
    if (streakResult.rows.length === 0) {
      // First puzzle completed, initialize streak
      await db.query(
        'INSERT INTO user_streaks (user_id, current_streak, max_streak, last_puzzle_date) VALUES ($1, 1, 1, $2)',
        [userId, puzzleDate]
      );
      return;
    }
    
    const streak = streakResult.rows[0];
    const lastDate = new Date(streak.last_puzzle_date);
    const currentDate = new Date(puzzleDate);
    
    // Calculate day difference
    const diffTime = Math.abs(currentDate - lastDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      // Consecutive day, increase streak
      const newStreak = streak.current_streak + 1;
      const newMax = Math.max(newStreak, streak.max_streak);
      
      await db.query(
        'UPDATE user_streaks SET current_streak = $1, max_streak = $2, last_puzzle_date = $3 WHERE user_id = $4',
        [newStreak, newMax, puzzleDate, userId]
      );
    } else if (diffDays > 1) {
      // Streak broken, reset to 1
      await db.query(
        'UPDATE user_streaks SET current_streak = 1, last_puzzle_date = $1 WHERE user_id = $2',
        [puzzleDate, userId]
      );
    }
    // If same day, no streak update needed
  } catch (error) {
    console.error('Error updating streak:', error);
  }
}

module.exports = {
  getTodaysPuzzle,
  validateSolution
};