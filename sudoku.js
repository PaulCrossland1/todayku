/**
 * Clear the value in the selected cell
 */
function clearSelectedCell() {
    if (!gameState.selectedCell) return;
    
    const [row, col] = gameState.selectedCell;
    
    // Don't clear prefilled cells
    if (isCellPrefilled(row, col)) return;
    
    // Clear the value
    gameState.grid[row][col] = EMPTY_CELL;
    
    // Update the cell display
    updateCellDisplay(row, col);
    
    // Save game state
    saveGame();
  }
  
  /**
   * Toggle note mode
   */
  function toggleNoteMode() {
    gameState.isNoteMode = !gameState.isNoteMode;
    
    // Update UI to indicate note mode
    const noteKey = document.querySelector('.note-key');
    if (noteKey) {
      if (gameState.isNoteMode) {
        noteKey.classList.add('active');
      } else {
        noteKey.classList.remove('active');
      }
    }
  }
  
  /**
   * Check if a cell is prefilled (part of the original puzzle)
   * @param {number} row - Row index
   * @param {number} col - Column index
   * @returns {boolean} True if the cell is prefilled
   */
  function isCellPrefilled(row, col) {
    const cell = getCellElement(row, col);
    return cell.classList.contains('prefilled');
  }
  
  /**
   * Check if the puzzle is complete
   */
  function checkCompletion() {
    // Check if all cells are filled and correct
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (gameState.grid[row][col] === EMPTY_CELL || 
            gameState.grid[row][col] !== gameState.solution[row][col]) {
          return false;
        }
      }
    }
    
    // Puzzle is complete
    gameState.isComplete = true;
    gameState.isPaused = true;
    
    // Stop the timer
    stopTimer();
    
    // Mark as complete in localStorage
    saveGame();
    
    // Show success modal
    showSuccessModal();
    
    return true;
  }
  
  /**
   * Handle visibility change (pause/resume timer)
   */
  function handleVisibilityChange() {
    if (document.hidden) {
      // Pause the timer when tab is not active
      pauseTimer();
    } else {
      // Resume the timer when tab becomes active
      resumeTimer();
    }
  }
  
  /**
   * Start the game
   */
  function startGame() {
    // Hide welcome modal
    hideWelcomeModal();
    
    // Start the timer
    startTimer();
    
    // Select the first empty cell
    selectFirstEmptyCell();
  }
  
  /**
   * Select the first empty cell in the grid
   */
  function selectFirstEmptyCell() {
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (gameState.grid[row][col] === EMPTY_CELL) {
          selectCell(row, col);
          return;
        }
      }
    }
  }
  
  /**
   * Start the timer
   */
  function startTimer() {
    if (gameState.startTime === null) {
      gameState.startTime = Date.now() - gameState.elapsedTime;
    }
    
    gameState.isPaused = false;
    
    // Update timer display every 100ms
    timerInterval = setInterval(updateTimer, 100);
  }
  
  /**
   * Pause the timer
   */
  function pauseTimer() {
    if (!gameState.isPaused && gameState.startTime !== null) {
      clearInterval(timerInterval);
      gameState.elapsedTime = Date.now() - gameState.startTime;
      gameState.isPaused = true;
    }
  }
  
  /**
   * Resume the timer
   */
  function resumeTimer() {
    if (gameState.isPaused && !gameState.isComplete) {
      gameState.startTime = Date.now() - gameState.elapsedTime;
      gameState.isPaused = false;
      timerInterval = setInterval(updateTimer, 100);
    }
  }
  
  /**
   * Stop the timer
   */
  function stopTimer() {
    clearInterval(timerInterval);
    gameState.elapsedTime = Date.now() - gameState.startTime;
  }
  
  /**
   * Update the timer display
   */
  function updateTimer() {
    if (gameState.startTime === null) return;
    
    const currentTime = Date.now();
    const elapsedTime = currentTime - gameState.startTime;
    
    // Format time as MM:SS
    const minutes = Math.floor(elapsedTime / 60000);
    const seconds = Math.floor((elapsedTime % 60000) / 1000);
    
    const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Update timer display
    elements.timer.textContent = formattedTime;
  }
  
  /**
   * Show the welcome modal
   * @param {boolean} showModal - Whether to show the modal
   */
  function showWelcomeModal(showModal) {
    if (showModal) {
      elements.welcomeModal.classList.add('active');
    }
  }
  
  /**
   * Hide the welcome modal
   */
  function hideWelcomeModal() {
    elements.welcomeModal.classList.remove('active');
  }
  
  /**
   * Show the success modal
   */
  function showSuccessModal() {
    // Update completion time display
    elements.completionTime.textContent = elements.timer.textContent;
    
    // Set performance emoji based on completion time
    setPerformanceEmoji();
    
    // Generate share text
    generateShareText();
    
    // Show the modal
    elements.successModal.classList.add('active');
  }
  
  /**
   * Close the success modal
   */
  function closeSuccessModal() {
    elements.successModal.classList.remove('active');
  }
  
  /**
   * Show the how to play modal
   */
  function showHowToPlayModal() {
    elements.howToPlayModal.classList.add('active');
  }
  
  /**
   * Close the how to play modal
   */
  function closeHowToPlayModal() {
    elements.howToPlayModal.classList.remove('active');
  }
  
  /**
   * Set the performance emoji based on completion time
   */
  function setPerformanceEmoji() {
    const minutes = parseInt(elements.timer.textContent.split(':')[0]);
    const seconds = parseInt(elements.timer.textContent.split(':')[1]);
    const totalSeconds = minutes * 60 + seconds;
    
    let emoji;
    if (totalSeconds < 180) { // Under 3 minutes
      emoji = '🚀 Amazing!';
    } else if (totalSeconds < 300) { // Under 5 minutes
      emoji = '⭐ Great!';
    } else if (totalSeconds < 480) { // Under 8 minutes
      emoji = '👍 Good!';
    } else if (totalSeconds < 600) { // Under 10 minutes
      emoji = '🙂 Nice!';
    } else {
      emoji = '👏 Well done!';
    }
    
    elements.performanceEmoji.textContent = emoji;
  }
  
  /**
   * Generate share text for the result
   */
  function generateShareText() {
    const puzzleId = gameState.todaysPuzzleId.split('-')[2]; // Get day number
    const timeStr = elements.timer.textContent;
    
    const shareText = `Todayku #${puzzleId} - ${timeStr}\n\n${elements.performanceEmoji.textContent}\n\ntodayku.day`;
    
    elements.shareResult.textContent = shareText;
  }
  
  /**
   * Share the result
   */
  function shareResult() {
    const shareText = elements.shareResult.textContent;
    
    // Try to use the Web Share API if available
    if (navigator.share) {
      navigator.share({
        title: 'My Todayku Result',
        text: shareText,
      }).catch(() => {
        // Fallback to clipboard
        copyToClipboard(shareText);
      });
    } else {
      // Use clipboard API
      copyToClipboard(shareText);
    }
  }
  
  /**
   * Copy text to clipboard
   * @param {string} text - The text to copy
   */
  function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      // Show notification
      showNotification();
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  }
  
  /**
   * Show notification that text was copied
   */
  function showNotification() {
    elements.shareNotification.classList.add('show');
    
    // Hide after 2 seconds
    setTimeout(() => {
      elements.shareNotification.classList.remove('show');
    }, 2000);
  }
  
  /**
   * Confirm reset game
   */
  function confirmResetGame() {
    if (confirm('Are you sure you want to reset the game? Your progress will be lost.')) {
      resetGame();
    }
  }
  
  /**
   * Reset the game to its initial state
   */
  function resetGame() {
    // Stop the timer
    clearInterval(timerInterval);
    
    // Reset game state
    gameState.startTime = null;
    gameState.elapsedTime = 0;
    gameState.isPaused = false;
    gameState.isComplete = false;
    gameState.selectedCell = null;
    gameState.isNoteMode = false;
    
    // Clear selection and highlights
    const allCells = document.querySelectorAll('.sudoku-cell');
    allCells.forEach(cell => {
      cell.classList.remove('selected', 'related', 'error');
    });
    
    // Reset timer display
    elements.timer.textContent = '00:00';
    
    // Generate a new puzzle
    generateNewPuzzle();
    
    // Save the new state
    saveGame();
    
    // Show welcome modal
    showWelcomeModal(true);
  }
  
  /**
   * Save the current game state to localStorage
   */
  function saveGame() {
    const gameData = {
      puzzleId: gameState.todaysPuzzleId,
      grid: gameState.grid,
      solution: gameState.solution,
      notes: gameState.notes,
      elapsedTime: gameState.elapsedTime,
      isComplete: gameState.isComplete,
    };
    
    localStorage.setItem('todayku-game', JSON.stringify(gameData));
  }
  
  /**
   * Load saved game state from localStorage
   * @returns {Object|null} The saved game state or null
   */
  function loadGame() {
    const savedData = localStorage.getItem('todayku-game');
    return savedData ? JSON.parse(savedData) : null;
  }
  
  /**
   * Restore game state from saved data
   * @param {Object} savedGame - The saved game state
   */
  function restoreGameState(savedGame) {
    gameState.grid = savedGame.grid;
    gameState.solution = savedGame.solution;
    gameState.notes = savedGame.notes || Array(GRID_SIZE).fill().map(() => 
      Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE + 1).fill(false))
    );
    gameState.elapsedTime = savedGame.elapsedTime || 0;
    gameState.isComplete = savedGame.isComplete || false;
    
    // Render the restored grid
    renderGrid();
    
    // Update notes display
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        updateCellDisplay(row, col);
      }
    }
    
    // If the game is already complete, show the success modal
    if (gameState.isComplete) {
      updateTimer(); // Update timer display
      setTimeout(showSuccessModal, 500);
    }
  }
  
  // Initialize the game when the DOM is fully loaded
  document.addEventListener('DOMContentLoaded', initGame);
  
  // Variable to hold the timer interval
  let timerInterval;/**
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
  const CELLS_TO_SHOW = 55; // Number of cells to show initially (out of 81)
  
  // Include the seedrandom library
  // Simple seedable random number generator
  (function(a,b,c,d,e,f){function k(a){var b,c=a.length,e=this,f=0,g=e.i=e.j=0,h=e.S=[];for(c||(a=[c++]);d>f;)h[f]=f++;for(f=0;d>f;f++)h[f]=h[g=j&g+a[f%c]+(b=h[f])],h[g]=b;(e.g=function(a){for(var b,c=0,f=e.i,g=e.j,h=e.S;a--;)b=h[f=j&f+1],c=c*d+h[j&(h[f]=h[g=j&g+b])+(h[g]=b)];return e.i=f,e.j=g,c})(d)}function l(a,b){var c,d=[],e=typeof a;if(b&&"object"==e)for(c in a)try{d.push(l(a[c],b-1))}catch(f){}return d.length?d:a+"string"!=e?a+"\0":a}function m(a,b){for(var c,d=a+"",e=0;e<d.length;)b[j&e]=j&(c^=19*b[j&e])+d.charCodeAt(e++);return o(b)}function n(c){try{return a.crypto.getRandomValues(c=new Uint8Array(d)),o(c)}catch(e){return[+new Date,a,a.navigator&&a.navigator.plugins,a.screen,o(b)]}}function o(a){return String.fromCharCode.apply(0,a)}var g=c.pow(d,e),h=c.pow(2,f),i=2*h,j=d-1;c.seedrandom=function(a,f){var j=[],p=m(l(f?[a,o(b)]:0 in arguments?a:n(),3),j),q=new k(j);return m(o(q.S),b),c.random=function(){for(var a=q.g(e),b=g,c=0;h>a;)a=(a+c)*d,b*=d,c=q.g(1);for(;a>=i;)a/=2,b/=2,c>>>=1;return(a+c)/b},p},m(c.random(),b)})(this,[],Math,256,6,52);
  
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
    // Get today's puzzle using the pre-built generator
    const puzzleData = sudoku.get_todays_puzzle({
      difficulty: DIFFICULTY
    });
    
    // Convert flat arrays to 2D arrays
    let puzzle2D = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(EMPTY_CELL));
    let solution2D = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(EMPTY_CELL));
    
    // Ensure exactly CELLS_TO_SHOW cells are filled
    const filledCellsCount = puzzleData.puzzle.filter(cell => cell !== 0).length;
    let additionalToShow = CELLS_TO_SHOW - filledCellsCount;
    let hiddenIndices = [];
    
    // If we need to show more cells than in the generated puzzle
    if (additionalToShow > 0) {
      // Find all hidden cells
      for (let i = 0; i < puzzleData.puzzle.length; i++) {
        if (puzzleData.puzzle[i] === 0) {
          hiddenIndices.push(i);
        }
      }
      
      // Shuffle and select cells to reveal
      hiddenIndices = sudoku.util.shuffle(hiddenIndices);
      for (let i = 0; i < Math.min(additionalToShow, hiddenIndices.length); i++) {
        puzzleData.puzzle[hiddenIndices[i]] = puzzleData.solution[hiddenIndices[i]];
      }
    }
    // If we need to hide more cells than in the generated puzzle
    else if (additionalToShow < 0) {
      // Find all filled cells
      let filledIndices = [];
      for (let i = 0; i < puzzleData.puzzle.length; i++) {
        if (puzzleData.puzzle[i] !== 0) {
          filledIndices.push(i);
        }
      }
      
      // Shuffle and select cells to hide
      filledIndices = sudoku.util.shuffle(filledIndices);
      for (let i = 0; i < Math.min(Math.abs(additionalToShow), filledIndices.length); i++) {
        puzzleData.puzzle[filledIndices[i]] = 0;
      }
    }
    
    // Convert to 2D arrays
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        const index = i * GRID_SIZE + j;
        puzzle2D[i][j] = puzzleData.puzzle[index];
        solution2D[i][j] = puzzleData.solution[index];
      }
    }
    
    // Set the game state
    gameState.grid = puzzle2D;
    gameState.solution = solution2D;
    
    // Render the grid
    renderGrid();
    
    // Initialize notes for each cell
    initializeNotes();
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
   * Solve a puzzle
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
    
    // Make sure number pad is visible
    elements.numberPad.style.display = 'grid';
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
   * Enter a number in the selected cell
   * @param {number} num - The number to enter (1-9)
   */
  function enterNumber(num) {
    if (!gameState.selectedCell) return;
    
    const [row, col] = gameState.selectedCell;
    
    // Don't modify prefilled cells
    if (isCellPrefilled(row, col)) return;
    
    // If note mode is active
    if (gameState.isNoteMode) {
      toggleNote(row, col, num);
      return;
    }
    
    // Set the value in the game state
    gameState.grid[row][col] = num;
    
    // Clear notes for this cell
    gameState.notes[row][col] = Array(GRID_SIZE + 1).fill(false);
    
    // Update the cell display
    updateCellDisplay(row, col);
    
    // Check if the move is valid
    if (num !== gameState.solution[row][col]) {
      // Highlight as error
      const cell = getCellElement(row, col);
      cell.classList.add('error');
      
      // Remove error class after a delay
      setTimeout(() => {
        cell.classList.remove('error');
      }, 1000);
    }
    
    // Remove notes for this number in related cells
    clearRelatedNotes(row, col, num);
    
    // Check if the puzzle is complete
    checkCompletion();
    
    // Save game state
    saveGame();
  }
  
  /**
   * Toggle a note in a cell
   * @param {number} row - Row index
   * @param {number} col - Column index
   * @param {number} num - The number to toggle (1-9)
   */
  function toggleNote(row, col, num) {
    // If the cell already has a value, don't add notes
    if (gameState.grid[row][col] !== EMPTY_CELL) return;
    
    // Toggle the note
    gameState.notes[row][col][num] = !gameState.notes[row][col][num];
    
    // Update the cell display
    updateCellDisplay(row, col);
    
    // Save game state
    saveGame();
  }
  
  /**
   * Clear notes for a number in related cells
   * @param {number} row - Row index
   * @param {number} col - Column index
   * @param {number} num - The number to clear
   */
  function clearRelatedNotes(row, col, num) {
    // Clear notes in the same row
    for (let i = 0; i < GRID_SIZE; i++) {
      if (i !== col) {
        gameState.notes[row][i][num] = false;
        updateCellDisplay(row, i);
      }
    }
    
    // Clear notes in the same column
    for (let i = 0; i < GRID_SIZE; i++) {
      if (i !== row) {
        gameState.notes[i][col][num] = false;
        updateCellDisplay(i, col);
      }
    }
    
    // Clear notes in the same box
    const boxRow = Math.floor(row / BOX_SIZE) * BOX_SIZE;
    const boxCol = Math.floor(col / BOX_SIZE) * BOX_SIZE;
    
    for (let i = boxRow; i < boxRow + BOX_SIZE; i++) {
      for (let j = boxCol; j < boxCol + BOX_SIZE; j++) {
        if (i !== row || j !== col) {
          gameState.notes[i][j][num] = false;
          updateCellDisplay(i, j);
        }
      }
    }
  }
  
  /**
   * Update the display of a cell
   * @param {number} row - Row index
   * @param {number} col - Column index
   */
  function updateCellDisplay(row, col) {
    const cell = getCellElement(row, col);
    const value = gameState.grid[row][col];
    
    // Clear current content
    cell.textContent = '';
    cell.classList.remove('notes');
    
    if (value !== EMPTY_CELL) {
      // Display the value
      cell.textContent = value;
    } else if (gameState.notes[row][col].some(note => note)) {
      // Display notes
      cell.classList.add('notes');
      
      // Create note elements
      for (let num = 1; num <= 9; num++) {
        const noteElement = document.createElement('div');
        noteElement.className = 'note';
        
        if (gameState.notes[row][col][num]) {
          noteElement.textContent = num;
        }
        
        cell.appendChild(noteElement);
      }
    }
  }