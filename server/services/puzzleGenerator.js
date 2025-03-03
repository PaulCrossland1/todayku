const db = require('../config/database');
const { generateSudoku } = require('../utils/sudoku');

// Create a new daily puzzle
async function createDailyPuzzle() {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  
  try {
    // Check if puzzle already exists for today
    const existingResult = await db.query(
      'SELECT * FROM puzzles WHERE date = $1',
      [today]
    );
    
    if (existingResult.rows.length > 0) {
      return existingResult.rows[0];
    }
    
    // Generate new puzzle
    const { puzzle, solution } = generateSudoku();
    
    // Determine difficulty (could be based on number of givens or other metrics)
    const difficulty = determineDifficulty(puzzle);
    
    // Store in database
    const result = await db.query(
      'INSERT INTO puzzles (date, puzzle, solution, difficulty) VALUES ($1, $2, $3, $4) RETURNING *',
      [today, JSON.stringify(puzzle), JSON.stringify(solution), difficulty]
    );
    
    return result.rows[0];
  } catch (error) {
    console.error('Error creating daily puzzle:', error);
    throw error;
  }
}

// Get today's puzzle
async function getTodaysPuzzle() {
  const today = new Date().toISOString().split('T')[0];
  
  try {
    // First check if puzzle exists
    let result = await db.query(
      'SELECT id, date, puzzle, difficulty FROM puzzles WHERE date = $1',
      [today]
    );
    
    // If not, create a new one
    if (result.rows.length === 0) {
      const newPuzzle = await createDailyPuzzle();
      return {
        id: newPuzzle.id,
        date: newPuzzle.date,
        puzzle: JSON.parse(newPuzzle.puzzle),
        difficulty: newPuzzle.difficulty
      };
    }
    
    // Return puzzle data (but not solution)
    const puzzleData = result.rows[0];
    return {
      id: puzzleData.id,
      date: puzzleData.date,
      puzzle: JSON.parse(puzzleData.puzzle),
      difficulty: puzzleData.difficulty
    };
  } catch (error) {
    console.error('Error getting daily puzzle:', error);
    throw error;
  }
}

// Helper function to determine puzzle difficulty
function determineDifficulty(puzzle) {
  // Count non-zero cells (givens)
  let givenCount = 0;
  
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (puzzle[row][col] !== 0) {
        givenCount++;
      }
    }
  }
  
  // Determine difficulty based on number of givens
  if (givenCount >= 40) return 'easy';
  if (givenCount >= 30) return 'medium';
  return 'hard';
}

module.exports = {
  createDailyPuzzle,
  getTodaysPuzzle
};