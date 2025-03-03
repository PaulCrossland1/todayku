const db = require('../config/database');
const { generateSudoku, validateSudoku } = require('../utils/sudoku');

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
      console.log(`Puzzle for ${today} already exists`);
      return existingResult.rows[0];
    }
    
    console.log(`Generating new puzzle for ${today}`);
    
    // Generate new puzzle with random difficulty
    // Weighted to have more medium difficulty puzzles
    const difficulties = ['easy', 'medium', 'medium', 'hard'];
    const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
    
    // Generate the puzzle using our improved algorithm
    const { puzzle, solution } = generateSudoku(difficulty);
    
    // Store in database
    const result = await db.query(
      'INSERT INTO puzzles (date, puzzle, solution, difficulty) VALUES ($1, $2, $3, $4) RETURNING *',
      [today, JSON.stringify(puzzle), JSON.stringify(solution), difficulty]
    );
    
    console.log(`Successfully created puzzle for ${today} with difficulty: ${difficulty}`);
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
    console.log(`Getting puzzle for ${today}`);
    
    // First check if puzzle exists
    let result = await db.query(
      'SELECT id, date, puzzle, difficulty FROM puzzles WHERE date = $1',
      [today]
    );
    
    // If not, create a new one
    if (result.rows.length === 0) {
      console.log(`No puzzle found for ${today}, creating a new one`);
      try {
        const newPuzzle = await createDailyPuzzle();
        return {
          id: newPuzzle.id,
          date: newPuzzle.date,
          puzzle: JSON.parse(newPuzzle.puzzle),
          difficulty: newPuzzle.difficulty
        };
      } catch (createError) {
        console.error('Error creating puzzle in database:', createError);
        // Fallback: generate puzzle directly without storing
        console.log('Using fallback: generating puzzle without database storage');
        const { puzzle, solution } = generateSudoku('medium');
        return {
          id: 0,
          date: today,
          puzzle: puzzle,
          difficulty: 'medium'
        };
      }
    }
    
    // Return puzzle data (but not solution)
    const puzzleData = result.rows[0];
    console.log(`Retrieved puzzle id: ${puzzleData.id} for ${puzzleData.date}`);
    
    return {
      id: puzzleData.id,
      date: puzzleData.date,
      puzzle: JSON.parse(puzzleData.puzzle),
      difficulty: puzzleData.difficulty
    };
  } catch (error) {
    console.error('Error getting daily puzzle:', error);
    // Last resort fallback
    console.log('Using emergency fallback: generating puzzle on the fly');
    const { puzzle, solution } = generateSudoku('medium');
    return {
      id: 0,
      date: today,
      puzzle: puzzle,
      difficulty: 'medium'
    };
  }
}

module.exports = {
  createDailyPuzzle,
  getTodaysPuzzle
};