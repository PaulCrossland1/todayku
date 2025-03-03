// Sudoku generator and solver

// Generate a new sudoku puzzle
function generateSudoku() {
    // Create an empty 9x9 grid
    const emptyGrid = Array(9).fill().map(() => Array(9).fill(0));
    
    // First solve to get a complete valid solution
    const solution = [...emptyGrid.map(row => [...row])];
    solveSudoku(solution);
    
    // Create the puzzle by removing numbers from the solution
    const puzzle = [...solution.map(row => [...row])];
    const cellsToRemove = 45; // Adjust difficulty by changing number of removed cells
    
    let removed = 0;
    while (removed < cellsToRemove) {
      const row = Math.floor(Math.random() * 9);
      const col = Math.floor(Math.random() * 9);
      
      // Only remove if not already removed
      if (puzzle[row][col] !== 0) {
        const backup = puzzle[row][col];
        puzzle[row][col] = 0;
        
        // Check if puzzle still has a unique solution
        const copy = [...puzzle.map(row => [...row])];
        const solutions = countSolutions(copy);
        
        if (solutions === 1) {
          removed++;
        } else {
          // If not unique, restore the number
          puzzle[row][col] = backup;
        }
      }
    }
    
    return { puzzle, solution };
  }
  
  // Solve the sudoku puzzle using backtracking
  function solveSudoku(grid) {
    const emptyCell = findEmptyCell(grid);
    if (!emptyCell) return true; // Puzzle is solved
    
    const [row, col] = emptyCell;
    
    // Try digits 1-9
    for (let num = 1; num <= 9; num++) {
      if (isValidPlacement(grid, row, col, num)) {
        grid[row][col] = num;
        
        if (solveSudoku(grid)) {
          return true;
        }
        
        grid[row][col] = 0; // Backtrack
      }
    }
    
    return false; // Trigger backtracking
  }
  
  // Count the number of solutions a puzzle has
  function countSolutions(grid) {
    let count = 0;
    
    function search() {
      const emptyCell = findEmptyCell(grid);
      if (!emptyCell) {
        count++; // Found a solution
        return;
      }
      
      if (count > 1) return; // Early exit if we've found multiple solutions
      
      const [row, col] = emptyCell;
      
      for (let num = 1; num <= 9; num++) {
        if (isValidPlacement(grid, row, col, num)) {
          grid[row][col] = num;
          search();
          grid[row][col] = 0; // Backtrack
        }
      }
    }
    
    search();
    return count;
  }
  
  // Find an empty cell in the grid
  function findEmptyCell(grid) {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] === 0) {
          return [row, col];
        }
      }
    }
    return null; // No empty cells
  }
  
  // Check if placing a number is valid
  function isValidPlacement(grid, row, col, num) {
    // Check row
    for (let x = 0; x < 9; x++) {
      if (grid[row][x] === num) return false;
    }
    
    // Check column
    for (let x = 0; x < 9; x++) {
      if (grid[x][col] === num) return false;
    }
    
    // Check 3x3 box
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (grid[boxRow + i][boxCol + j] === num) return false;
      }
    }
    
    return true;
  }
  
  // Validate a completed sudoku puzzle
  function validateSudoku(grid, solution) {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] !== solution[row][col]) {
          return false;
        }
      }
    }
    return true;
  }
  
  module.exports = {
    generateSudoku,
    solveSudoku,
    validateSudoku
  };