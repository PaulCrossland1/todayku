/**
 * Puzzle Module
 * Handles Sudoku puzzle generation, validation, and game logic
 */
const PuzzleModule = (function() {
  'use strict';
  
  // Private variables
  let puzzle = []; // 9x9 grid with complete solution
  let gameBoard = []; // 9x9 grid with some cells hidden (player view)
  let selectedCell = null;
  let isComplete = false;
  
  /**
   * Generates a seed based on the current UTC date
   * Ensures the same puzzle is generated for everyone on the same day worldwide
   */
  function generateDailySeed() {
    const date = new Date();
    const utcDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    const dateString = `${utcDate.getUTCFullYear()}-${utcDate.getUTCMonth() + 1}-${utcDate.getUTCDate()}`;
    
    console.log("Generating puzzle for UTC date:", dateString);
    
    let seed = 0;
    for (let i = 0; i < dateString.length; i++) {
      seed = ((seed << 5) - seed) + dateString.charCodeAt(i);
      seed = seed & seed; // Convert to 32bit integer
    }
    return Math.abs(seed);
  }
  
  /**
   * Seeded random number generator
   */
  function seededRandom(seed) {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  }
  
  /**
   * Shuffles an array using a seeded random function
   */
  function shuffleArray(array, seed) {
    let currentSeed = seed;
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(seededRandom(currentSeed++) * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
  
  /**
   * Checks if a number can be placed in a specified position
   */
  function isValid(grid, row, col, num) {
    // Check row
    for (let x = 0; x < 9; x++) {
      if (grid[row][x] === num) {
        return false;
      }
    }
    
    // Check column
    for (let y = 0; y < 9; y++) {
      if (grid[y][col] === num) {
        return false;
      }
    }
    
    // Check 3x3 box
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 3; x++) {
        if (grid[boxRow + y][boxCol + x] === num) {
          return false;
        }
      }
    }
    
    return true;
  }
  
  /**
   * Solves the Sudoku puzzle using backtracking
   */
  function solveSudoku(grid) {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] === 0) {
          const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
          const seed = generateDailySeed() + row * 9 + col;
          const shuffledNumbers = shuffleArray(numbers, seed);
          
          for (const num of shuffledNumbers) {
            if (isValid(grid, row, col, num)) {
              grid[row][col] = num;
              
              if (solveSudoku(grid)) {
                return true;
              }
              
              grid[row][col] = 0;
            }
          }
          
          return false;
        }
      }
    }
    
    return true;
  }
  
  /**
   * Generates a complete Sudoku puzzle
   */
  function generatePuzzle() {
    // Create an empty 9x9 grid
    const grid = Array(9).fill().map(() => Array(9).fill(0));
    
    // Generate the puzzle with backtracking
    solveSudoku(grid);
    
    return grid;
  }
  
  /**
   * Creates a playable game board by removing numbers
   * from the complete puzzle solution, ensuring at least 55 numbers remain
   */
  function createGameBoard(fullPuzzle, difficulty = 'easy') {
    const board = JSON.parse(JSON.stringify(fullPuzzle));
    
    // Define max cells to remove (26 to maintain 55+ visible numbers)
    const maxToRemove = 26; // 81 - 55 = 26
    
    const seed = generateDailySeed();
    
    // Create positions array (0-80)
    const positions = Array.from({ length: 81 }, (_, i) => i);
    const shuffledPositions = shuffleArray(positions, seed);
    
    // Remove cells (limited to ensure 55+ numbers remain)
    for (let i = 0; i < maxToRemove; i++) {
      const position = shuffledPositions[i];
      const row = Math.floor(position / 9);
      const col = position % 9;
      board[row][col] = 0;
    }
    
    return board;
  }
  
  /**
   * Check if two cells are in the same row, column, or 3x3 box
   */
  function areRelated(row1, col1, row2, col2) {
    // Same row
    if (row1 === row2) return true;
    
    // Same column
    if (col1 === col2) return true;
    
    // Same 3x3 box
    const boxRow1 = Math.floor(row1 / 3);
    const boxCol1 = Math.floor(col1 / 3);
    const boxRow2 = Math.floor(row2 / 3);
    const boxCol2 = Math.floor(col2 / 3);
    
    return (boxRow1 === boxRow2 && boxCol1 === boxCol2);
  }
  
  /**
   * Check if the current value conflicts with existing values
   */
  function hasConflict(board, row, col, value) {
    if (value === 0) return false;
    
    // Check row
    for (let x = 0; x < 9; x++) {
      if (x !== col && board[row][x] === value) {
        return true;
      }
    }
    
    // Check column
    for (let y = 0; y < 9; y++) {
      if (y !== row && board[y][col] === value) {
        return true;
      }
    }
    
    // Check 3x3 box
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 3; x++) {
        const r = boxRow + y;
        const c = boxCol + x;
        if ((r !== row || c !== col) && board[r][c] === value) {
          return true;
        }
      }
    }
    
    return false;
  }
  
  /**
   * Check if the puzzle is complete and correct
   */
  function checkCompletion() {
    // Check if any cell is empty
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (gameBoard[row][col] === 0) {
          return false;
        }
      }
    }
    
    // Check if the solution matches the original puzzle
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (gameBoard[row][col] !== puzzle[row][col]) {
          return false;
        }
      }
    }
    
    return true;
  }
  
  /**
   * Count the number of filled cells in the board
   */
  function countFilledCells(board) {
    let count = 0;
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] !== 0) {
          count++;
        }
      }
    }
    return count;
  }
  
  // Public methods
  return {
    /**
     * Initialize a new puzzle
     */
    initPuzzle: function(difficulty = 'easy') {
      puzzle = generatePuzzle();
      gameBoard = createGameBoard(puzzle, difficulty);
      selectedCell = null;
      isComplete = false;
      
      // Verify that we have at least 55 numbers visible
      const filledCount = countFilledCells(gameBoard);
      console.log(`Puzzle initialized with ${filledCount} filled cells`);
      
      return {
        board: gameBoard,
        gameNumber: this.getGameNumber(),
        filledCount: filledCount
      };
    },
    
    /**
     * Get the current game board
     */
    getGameBoard: function() {
      return JSON.parse(JSON.stringify(gameBoard));
    },
    
    /**
     * Get original puzzle solution
     */
    getSolution: function() {
      return JSON.parse(JSON.stringify(puzzle));
    },
    
    /**
     * Get the game number (based on days since Jan 1, 2023)
     */
    getGameNumber: function() {
      // Use UTC time to ensure consistent game numbers worldwide
      const start = new Date(Date.UTC(2023, 0, 1));
      const today = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate()));
      const diff = today - start;
      return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
    },
    
    /**
     * Select a cell on the board
     */
    selectCell: function(row, col) {
      if (row >= 0 && row < 9 && col >= 0 && col < 9) {
        // Don't allow selection of given cells
        if (gameBoard[row][col] === 0 || !hasConflict(gameBoard, row, col, gameBoard[row][col])) {
          selectedCell = { row, col };
          return true;
        }
      }
      return false;
    },
    
    /**
     * Get the currently selected cell
     */
    getSelectedCell: function() {
      return selectedCell;
    },
    
    /**
     * Set a value in the selected cell
     */
    setCellValue: function(value) {
      if (selectedCell && value >= 0 && value <= 9) {
        const { row, col } = selectedCell;
        
        // Check if the value conflicts with other cells
        const conflict = hasConflict(gameBoard, row, col, value);
        
        if (conflict) {
          // Don't update the value if there's a conflict
          return {
            row: row,
            col: col,
            value: gameBoard[row][col],  // Keep existing value
            conflict: true,
            isComplete: false,
            isError: true  // Flag to trigger error animation
          };
        }
        
        // Set the value if no conflict
        gameBoard[row][col] = value;
        
        // Check if puzzle is complete
        isComplete = checkCompletion();
        
        return {
          row: row,
          col: col,
          value: value,
          conflict: false,
          isComplete: isComplete,
          isError: false
        };
      }
      return null;
    },
    
    /**
     * Check if a cell has a conflict with other cells
     */
    checkConflict: function(row, col) {
      const value = gameBoard[row][col];
      return hasConflict(gameBoard, row, col, value);
    },
    
    /**
     * Get cells with the same value as the specified cell
     */
    getSameValueCells: function(row, col) {
      const value = gameBoard[row][col];
      if (value === 0) return [];
      
      const sameValue = [];
      
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (gameBoard[r][c] === value && !(r === row && c === col)) {
            sameValue.push({ row: r, col: c });
          }
        }
      }
      
      return sameValue;
    },
    
    /**
     * Check if the puzzle is complete
     */
    isComplete: function() {
      return isComplete;
    }
  };
})();