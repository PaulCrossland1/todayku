/**
 * Todayku - A daily, quick Sudoku game
 * 
 * Main JavaScript file for the Todayku app.
 * Handles puzzle generation, game logic, and UI interactions.
 */

// Constants
const GRID_SIZE = 9;
const BOX_SIZE = 3;
const DIFFICULTY = 'easy'; // Puzzle difficulty level
const EMPTY_CELL = 0; // Representation of an empty cell

// Include seedrandom library for consistent puzzle generation
(function(j,i,g,m,k,n,o){function q(b){var e,f,a=this,c=b.length,d=0,h=a.i=a.j=a.m=0;a.S=[];a.c=[];for(c||(b=[c++]);d<g;)a.S[d]=d++;for(d=0;d<g;d++)e=a.S[d],h=h+e+b[d%c]&g-1,f=a.S[h],a.S[d]=f,a.S[h]=e;a.g=function(b){var c=a.S,d=a.i+1&g-1,e=c[d],f=a.j+e&g-1,h=c[f];c[d]=h;c[f]=e;for(var i=c[e+h&g-1];--b;)d=d+1&g-1,e=c[d],f=f+e&g-1,h=c[f],c[d]=h,c[f]=e,i=i*g+c[e+h&g-1];a.i=d;a.j=f;return i};a.g(g)}function p(b,e,f,a,c){f=[];c=typeof b;if(e&&c=="object")for(a in b)if(a.indexOf("S")<5)try{f.push(p(b[a],e-1))}catch(d){}return f.length?f:b+(c!="string"?"\0":"")}function l(b,e,f,a){b+="";for(a=f=0;a<b.length;a++){var c=e,d=a&g-1,h=(f^=e[d]<<8,c[d]=c[d]^b.charCodeAt(a));f+=f+(h>>2^h>>14)}b=new q(e);for(a=0;a<g;a++)e[a]=e[a]^b.g(g);return n(e,f)}m=Math;k=m.pow;n=m.abs;g=256;i=0;var r=[],s;if(i==0){for(i=0;i<g;i++)r[i]=0;for(e=47;e--;)for(i=g;i--;)r[i]=r[i]^s.g(g)}j.Math.seedrandom=function(b,e){var f=[],a;b=l(p(e?[b,j]:arguments.length?b:[(new Date).getTime(),j,window],3),f);a=new q(f);l(a.S,r);j.Math.random=function(){return a.g(1)};return b};o=j.Math.random})(this,[],[], 'undefined' !== typeof module && module.exports, 1 << 30, 7);

// Game State
let gameState = {
  grid: [], // Current state of the grid
  solution: [], // Complete solution
  notes: [], // Player's notes for each cell
  selectedCell: null, // Currently selected cell
  isNoteMode: false, // Whether we're in note-taking mode
  startTime: null, // When the timer started
  elapsedTime: 0, // Total elapsed time
  pausedTime: 0, // Time when the game was paused
  isPaused: false, // Whether the game is paused
  isComplete: false, // Whether the puzzle is complete
  todaysPuzzleId: '', // Unique ID for today's puzzle
};

// DOM Elements
const elements = {
  // Grids and containers
  sudokuGrid: document.getElementById('sudoku-grid'),
  numberPad: document.getElementById('number-pad'),
  
  // Timer
  timer: document.getElementById('timer'),
  
  // Date displays
  gameDate: document.getElementById('game-date'),
  welcomeDate: document.getElementById('welcome-date'),
  successDate: document.getElementById('success-date'),
  
  // Modals
  welcomeModal: document.getElementById('welcome-modal'),
  successModal: document.getElementById('success-modal'),
  howToPlayModal: document.getElementById('how-to-play-modal'),
  
  // Buttons
  startGameButton: document.getElementById('start-game'),
  shareButton: document.getElementById('share-button'),
  howToPlayButton: document.getElementById('how-to-play'),
  closeSuccessButton: document.getElementById('close-success'),
  closeHowToPlayButton: document.getElementById('close-how-to-play'),
  
  // Completion & Sharing
  completionTime: document.getElementById('completion-time'),
  performanceEmoji: document.getElementById('performance-emoji'),
  shareResult: document.getElementById('share-result'),
  shareNotification: document.getElementById('share-notification'),
};

/**
 * Initialize the game
 */
function initGame() {
  // Set up event listeners
  setupEventListeners();
  
  // Set today's date
  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  // Update date displays
  elements.gameDate.textContent = dateString;
  elements.welcomeDate.textContent = dateString;
  elements.successDate.textContent = dateString;
  
  // Generate today's puzzle ID (based on date)
  gameState.todaysPuzzleId = getTodaysPuzzleId();
  
  // Check if there's a saved game
  const savedGame = loadGame();
  
  if (savedGame && savedGame.puzzleId === gameState.todaysPuzzleId && !savedGame.isComplete) {
    // Resume saved game
    restoreGameState(savedGame);
    showWelcomeModal(false); // Don't show welcome if resuming
  } else {
    // Start a new game
    generateNewPuzzle();
    showWelcomeModal(true);
  }
}

/**
 * Set up all event listeners
 */
function setupEventListeners() {
  // Modal button listeners
  elements.startGameButton.addEventListener('click', startGame);
  elements.shareButton.addEventListener('click', shareResult);
  elements.howToPlayButton.addEventListener('click', showHowToPlayModal);
  elements.closeSuccessButton.addEventListener('click', closeSuccessModal);
  elements.closeHowToPlayButton.addEventListener('click', closeHowToPlayModal);
  
  // Number pad event listener (for mobile)
  elements.numberPad.addEventListener('click', handleNumberPadClick);
  
  // Keyboard event listener (for desktop)
  document.addEventListener('keydown', handleKeyPress);
  
  // Handle visibility change (to pause timer when tab is not active)
  document.addEventListener('visibilitychange', handleVisibilityChange);
}

/**
 * Generate a deterministic puzzle ID for today
 * @returns {string} Unique ID for today's puzzle
 */
function getTodaysPuzzleId() {
  const date = new Date();
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

/**
 * Generate a new Sudoku puzzle
 */
function generateNewPuzzle() {
  // Create an empty grid
  let emptyGrid = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(EMPTY_CELL));
  
  // Solve the empty grid to create a solution
  let solution = solveGrid(emptyGrid);
  
  // Create a puzzle by removing numbers from the solution
  let puzzle = createPuzzleFromSolution(solution);
  
  // Set the game state
  gameState.grid = JSON.parse(JSON.stringify(puzzle)); // Deep copy
  gameState.solution = solution;
  
  // Render the grid
  renderGrid();
  
  // Initialize notes for each cell
  initializeNotes();
}

/**
 * Create a puzzle by removing numbers from a complete solution
 * @param {Array} solution - A complete Sudoku solution
 * @returns {Array} A puzzle with some numbers removed
 */
function createPuzzleFromSolution(solution) {
  // Deep copy the solution
  let puzzle = JSON.parse(JSON.stringify(solution));
  
  // Determine how many cells to remove based on difficulty
  let cellsToRemove;
  switch (DIFFICULTY) {
    case 'easy':
      cellsToRemove = 40; // Leave ~41 clues (out of 81)
      break;
    case 'medium':
      cellsToRemove = 50;
      break;
    case 'hard':
      cellsToRemove = 55;
      break;
    default:
      cellsToRemove = 40;
  }
  
  // Create a list of all cell positions
  let positions = [];
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      positions.push([row, col]);
    }
  }
  
  // Shuffle the positions array
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }
  
  // Remove numbers from the puzzle
  let removed = 0;
  for (let i = 0; i < positions.length && removed < cellsToRemove; i++) {
    const [row, col] = positions[i];
    const temp = puzzle[row][col];
    
    // Temporarily remove the number
    puzzle[row][col] = EMPTY_CELL;
    removed++;
    
    // If removing this number results in multiple solutions, put it back
    // For 'easy' difficulty, we're not checking for uniqueness to simplify
    if (DIFFICULTY !== 'easy' && !hasUniqueSolution(puzzle)) {
      puzzle[row][col] = temp;
      removed--;
    }
  }
  
  return puzzle;
}

/**
 * Check if a puzzle has a unique solution
 * This is a simplified version that checks at most 2 solutions
 * @param {Array} puzzle - The puzzle to check
 * @returns {boolean} True if the puzzle has exactly one solution
 */
function hasUniqueSolution(puzzle) {
  // Create a copy of the puzzle to work with
  let tempPuzzle = JSON.parse(JSON.stringify(puzzle));
  
  // Find the first empty cell
  let emptyCell = null;
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (tempPuzzle[row][col] === EMPTY_CELL) {
        emptyCell = [row, col];
        break;
      }
    }
    if (emptyCell) break;
  }
  
  // If no empty cells, the puzzle is already solved
  if (!emptyCell) return true;
  
  let [row, col] = emptyCell;
  let solutions = 0;
  
  // Try each possible number in this cell
  for (let num = 1; num <= 9 && solutions < 2; num++) {
    if (isValidPlacement(tempPuzzle, row, col, num)) {
      tempPuzzle[row][col] = num;
      
      // Recursively check if this leads to a solution
      if (solvePuzzle(tempPuzzle)) {
        solutions++;
      }
      
      // Reset the cell
      tempPuzzle[row][col] = EMPTY_CELL;
    }
  }
  
  return solutions === 1;
}

/**
 * Check if placing a number in a position is valid
 * @param {Array} grid - The grid to check
 * @param {number} row - Row index
 * @param {number} col - Column index
 * @param {number} num - Number to check
 * @returns {boolean} True if the placement is valid
 */
function isValidPlacement(grid, row, col, num) {
  // Check row
  for (let x = 0; x < GRID_SIZE; x++) {
    if (grid[row][x] === num) {
      return false;
    }
  }
  
  // Check column
  for (let y = 0; y < GRID_SIZE; y++) {
    if (grid[y][col] === num) {
      return false;
    }
  }
  
  // Check 3x3 box
  let boxRow = Math.floor(row / BOX_SIZE) * BOX_SIZE;
  let boxCol = Math.floor(col / BOX_SIZE) * BOX_SIZE;
  
  for (let y = boxRow; y < boxRow + BOX_SIZE; y++) {
    for (let x = boxCol; x < boxCol + BOX_SIZE; x++) {
      if (grid[y][x] === num) {
        return false;
      }
    }
  }
  
  return true;
}

/**
 * Solve a puzzle using backtracking
 * Used to check for unique solutions
 * @param {Array} grid - The grid to solve
 * @returns {boolean} True if the puzzle has a solution
 */
function solvePuzzle(grid) {
  // Find an empty cell
  let emptyCell = null;
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (grid[row][col] === EMPTY_CELL) {
        emptyCell = [row, col];
        break;
      }
    }
    if (emptyCell) break;
  }
  
  // If no empty cells, the puzzle is solved
  if (!emptyCell) return true;
  
  let [row, col] = emptyCell;
  
  // Try each possible number
  for (let num = 1; num <= 9; num++) {
    if (isValidPlacement(grid, row, col, num)) {
      grid[row][col] = num;
      
      // Recursively try to solve the rest of the puzzle
      if (solvePuzzle(grid)) {
        return true;
      }
      
      // If we get here, the number didn't work
      grid[row][col] = EMPTY_CELL;
    }
  }
  
  // No solution found with the current configuration
  return false;
}

/**
 * Initialize notes array for each cell
 */
function initializeNotes() {
  gameState.notes = Array(GRID_SIZE).fill().map(() => 
    Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE + 1).fill(false))
  );
}

/**
 * Render the Sudoku grid
 */
function renderGrid() {
  // Clear the grid
  elements.sudokuGrid.innerHTML = '';
  
  // Create cells
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const cellValue = gameState.grid[row][col];
      const cell = document.createElement('div');
      
      // Set cell attributes
      cell.className = 'sudoku-cell';
      cell.dataset.row = row;
      cell.dataset.col = col;
      
      // Add border classes for 3x3 grid separation
      if (row % 3 === 0 && row !== 0) {
        cell.style.borderTop = '2px solid var(--color-text)';
      }
      if (col % 3 === 0 && col !== 0) {
        cell.style.borderLeft = '2px solid var(--color-text)';
      }
      
      // If the cell has a value, display it
      if (cellValue !== EMPTY_CELL) {
        cell.textContent = cellValue;
        cell.classList.add('prefilled');
      }
      
      // Add click event listener
      cell.addEventListener('click', () => selectCell(row, col));
      
      // Append the cell to the grid
      elements.sudokuGrid.appendChild(cell);
    }
  }
}

/**
 * Select a cell in the grid
 * @param {number} row - Row index
 * @param {number} col - Column index
 */
function selectCell(row, col) {
  // Deselect previously selected cell
  if (gameState.selectedCell) {
    const [prevRow, prevCol] = gameState.selectedCell;
    const prevCell = getCellElement(prevRow, prevCol);
    prevCell.classList.remove('selected');
    
    // Remove 'related' class from all cells
    const allCells = document.querySelectorAll('.sudoku-cell');
    allCells.forEach(cell => cell.classList.remove('related'));
  }
  
  // Select new cell
  const cell = getCellElement(row, col);
  cell.classList.add('selected');
  
  // Highlight related cells (same row, col, box)
  highlightRelatedCells(row, col);
  
  // Update selected cell
  gameState.selectedCell = [row, col];
}

/**
 * Highlight cells related to the selected cell
 * @param {number} row - Row index
 * @param {number} col - Column index
 */
function highlightRelatedCells(row, col) {
  // Highlight cells in the same row
  for (let i = 0; i < GRID_SIZE; i++) {
    if (i !== col) {
      const cell = getCellElement(row, i);
      cell.classList.add('related');
    }
  }
  
  // Highlight cells in the same column
  for (let i = 0; i < GRID_SIZE; i++) {
    if (i !== row) {
      const cell = getCellElement(i, col);
      cell.classList.add('related');
    }
  }
  
  // Highlight cells in the same box
  const boxRow = Math.floor(row / BOX_SIZE) * BOX_SIZE;
  const boxCol = Math.floor(col / BOX_SIZE) * BOX_SIZE;
  
  for (let i = boxRow; i < boxRow + BOX_SIZE; i++) {
    for (let j = boxCol; j < boxCol + BOX_SIZE; j++) {
      if (i !== row || j !== col) {
        const cell = getCellElement(i, j);
        cell.classList.add('related');
      }
    }
  }
}

/**
 * Get the DOM element for a cell
 * @param {number} row - Row index
 * @param {number} col - Column index
 * @returns {HTMLElement} The cell element
 */
function getCellElement(row, col) {
  return document.querySelector(`.sudoku-cell[data-row="${row}"][data-col="${col}"]`);
}

/**
 * Handle number pad clicks
 * @param {Event} event - The click event
 */
function handleNumberPadClick(event) {
  if (!event.target.classList.contains('number-key')) return;
  
  const value = event.target.dataset.value;
  
  if (!gameState.selectedCell) return;
  
  if (value === 'delete') {
    // Delete the value in the selected cell
    clearSelectedCell();
  } else if (value === 'note') {
    // Toggle note mode
    toggleNoteMode();
  } else if (value === 'clear') {
    // Clear the board (reset to initial state)
    confirmResetGame();
  } else {
    // Enter a number
    enterNumber(parseInt(value));
  }
}

/**
 * Handle keyboard input
 * @param {Event} event - The keydown event
 */
function handleKeyPress(event) {
  if (!gameState.selectedCell) return;
  
  const key = event.key;
  
  if (key >= '1' && key <= '9') {
    // Enter a number
    enterNumber(parseInt(key));
  } else if (key === 'Backspace' || key === 'Delete') {
    // Delete the value in the selected cell
    clearSelectedCell();
  } else if (key === 'n' || key === 'N') {
    // Toggle note mode
    toggleNoteMode();
  } else if (key === 'ArrowUp' || key === 'ArrowDown' || 
             key === 'ArrowLeft' || key === 'ArrowRight') {
    // Navigate with arrow keys
    navigateWithArrow(key);
    event.preventDefault();
  }
}

/**
 * Navigate the grid with arrow keys
 * @param {string} key - The arrow key pressed
 */
/**
 * Navigate the grid with arrow keys
 * @param {string} key - The arrow key pressed
 */
function navigateWithArrow(key) {
  if (!gameState.selectedCell) return;
  
  const [row, col] = gameState.selectedCell;
  let newRow = row;
  let newCol = col;
  
  switch (key) {
    case 'ArrowUp':
      newRow = Math.max(0, row - 1);
      break;
    case 'ArrowDown':
      newRow = Math.min(GRID_SIZE - 1, row + 1);
      break;
    case 'ArrowLeft':
      newCol = Math.max(0, col - 1);
      break;
    case 'ArrowRight':
      newCol = Math.min(GRID_SIZE - 1, col + 1);
      break;
  }
  
  if (newRow !== row || newCol !== col) {
    selectCell(newRow, newCol);
  }
}

/**
 * Solve a Sudoku grid using backtracking algorithm
 * @param {Array} grid - The grid to solve
 * @returns {Array} The solved grid
 */
function solveGrid(grid) {
  // Create a deep copy of the grid to avoid modifying the original
  let solvingGrid = JSON.parse(JSON.stringify(grid));
  
  // Seed the random number generator for consistent puzzle generation
  const seed = gameState.todaysPuzzleId || 'default-seed';
  Math.seedrandom(seed);
  
  // Helper function to find an empty cell
  function findEmptyCell(grid) {
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (grid[row][col] === EMPTY_CELL) {
          return [row, col];
        }
      }
    }
    return null; // No empty cells found
  }
  
  // Helper function to check if a number is valid in a position
  function isValid(grid, row, col, num) {
    // Check row
    for (let x = 0; x < GRID_SIZE; x++) {
      if (grid[row][x] === num) {
        return false;
      }
    }
    
    // Check column
    for (let y = 0; y < GRID_SIZE; y++) {
      if (grid[y][col] === num) {
        return false;
      }
    }
    
    // Check 3x3 box
    let boxRow = Math.floor(row / BOX_SIZE) * BOX_SIZE;
    let boxCol = Math.floor(col / BOX_SIZE) * BOX_SIZE;
    
    for (let y = boxRow; y < boxRow + BOX_SIZE; y++) {
      for (let x = boxCol; x < boxCol + BOX_SIZE; x++) {
        if (grid[y][x] === num) {
          return false;
        }
      }
    }
    
    return true; // Number is valid in this position
  }
  
  // Recursive backtracking function
  function solve() {
    // Find an empty cell
    let emptyCell = findEmptyCell(solvingGrid);
    
    // If no empty cells, the puzzle is solved
    if (emptyCell === null) {
      return true;
    }
    
    let [row, col] = emptyCell;
    
    // Try numbers 1-9
    for (let num = 1; num <= 9; num++) {
      // Check if number is valid in this position
      if (isValid(solvingGrid, row, col, num)) {
        // Place the number
        solvingGrid[row][col] = num;
        
        // Recursively solve the rest of the puzzle
        if (solve()) {
          return true;
        }
        
        // If we get here, the current configuration didn't work
        // Backtrack by setting the cell back to empty
        solvingGrid[row][col] = EMPTY_CELL;
      }
    }
    
    // No solution was found with the current configuration
    return false;
  }
  
  // Start the solving process
  solve();
  
  return solvingGrid;
}