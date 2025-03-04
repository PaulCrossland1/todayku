/**
 * Todayku - Main Application
 * A daily, lightweight Sudoku game designed for quick play, virality, and social sharing
 */
(function() {
  'use strict';
  
  // Game state
  let currentBoard = null;
  let gameNumber = null;
  let gameStarted = false;
  
  /**
   * Initialize the game
   */
  function init() {
    console.log("Initializing Todayku app...");
    
    // Set up UI event callbacks
    UIModule.init({
      onCellSelect: handleCellSelect,
      onNumberInput: handleNumberInput,
      onGameStart: startGame,
      onCopyResults: copyResults,
      onShareResults: shareResults,
      onGameOver: handleGameOver
    });
    
    // Directly add event listener to the start button as a backup
    const startButton = document.getElementById('start-game');
    if (startButton) {
      console.log("Start button found, adding click event listener");
      startButton.addEventListener('click', function() {
        console.log("Start button clicked");
        document.getElementById('welcome-modal').classList.remove('active');
        document.getElementById('game-container').style.display = 'flex';
        startGame();
      });
    } else {
      console.error("Start button not found!");
    }
    
    // Check if there's a saved game
    const savedGame = StorageModule.getGameState();
    if (savedGame) {
      // Resume saved game
      resumeGame(savedGame);
    } else {
      // Show welcome screen
      UIModule.showWelcomeModal();
    }
  }
  
  /**
   * Start a new game
   */
  function startGame() {
    console.log("Starting new game");
    
    // Get current UTC date for display
    const now = new Date();
    const utcDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    console.log("Today's UTC date for puzzle generation:", utcDate.toISOString().split('T')[0]);
    
    // Initialize new puzzle
    const gameData = PuzzleModule.initPuzzle('easy');
    currentBoard = gameData.board;
    gameNumber = gameData.gameNumber;
    
    // Create game board UI
    UIModule.createGameBoard(currentBoard);
    
    // Start timer with callbacks
    TimerModule.start(
      // Timer tick callback
      (timeStr, timerClass, forceUpdate) => {
        UIModule.updateTimer(timeStr, timerClass, forceUpdate);
      },
      // Time's up callback
      handleTimeUp
    );
    
    // Set game started flag
    gameStarted = true;
    
    console.log("Game started with", gameData.filledCount, "filled cells");
  }
  
  /**
   * Handle time's up event
   */
  function handleTimeUp() {
    console.log("Time's up!");
    
    // Clear saved game state
    StorageModule.clearGameState();
    
    // Show game over modal
    UIModule.showGameOver(gameNumber);
    
    // Reset game started flag
    gameStarted = false;
  }
  
  /**
   * Resume a saved game
   */
  function resumeGame(savedGame) {
    console.log("Resuming saved game");
    
    // Set game data
    currentBoard = savedGame.board;
    gameNumber = savedGame.gameNumber;
    
    // Create game board UI
    UIModule.createGameBoard(currentBoard);
    
    // Resume timer with callbacks
    TimerModule.start(
      // Timer tick callback
      (timeStr, timerClass, forceUpdate) => {
        UIModule.updateTimer(timeStr, timerClass, forceUpdate);
      },
      // Time's up callback
      handleTimeUp
    );
    
    // Show game board
    document.getElementById('welcome-modal').classList.remove('active');
    document.getElementById('game-container').style.display = 'flex';
    
    // Set game started flag
    gameStarted = true;
  }
  
  /**
   * Handle cell selection
   */
  function handleCellSelect(row, col) {
    if (!gameStarted) return;
    
    console.log("Cell selected:", row, col);
    
    const selected = PuzzleModule.selectCell(row, col);
    
    if (selected) {
      // Highlight selected cell
      UIModule.selectCell(row, col);
      
      // Get the current value in the cell
      const cellValue = currentBoard[row][col];
      
      // Highlight cells with the same value if value is not 0
      if (cellValue !== 0) {
        const sameValueCells = PuzzleModule.getSameValueCells(row, col);
        UIModule.highlightSameValueCells(sameValueCells);
      }
    }
  }
  
  /**
   * Handle number input
   */
  function handleNumberInput(value) {
    if (!gameStarted) return;
    
    const selectedCell = PuzzleModule.getSelectedCell();
    
    if (selectedCell) {
      console.log("Input value:", value, "at cell:", selectedCell.row, selectedCell.col);
      
      const result = PuzzleModule.setCellValue(value);
      
      if (result) {
        // Update cell UI with error animation if needed
        UIModule.updateCell(result.row, result.col, result.value, result.conflict, result.isError);
        
        // Only update the board if there was no error
        if (!result.isError) {
          // Update current board
          currentBoard[result.row][result.col] = result.value;
          
          // Highlight cells with the same value
          if (result.value !== 0) {
            const sameValueCells = PuzzleModule.getSameValueCells(result.row, result.col);
            UIModule.highlightSameValueCells(sameValueCells);
          }
          
          // Save game state
          saveGameState();
          
          // Check if puzzle is complete
          if (result.isComplete) {
            handleGameComplete();
          }
        }
      }
    }
  }
  
  /**
   * Save current game state
   */
  function saveGameState() {
    StorageModule.saveGameState({
      board: currentBoard,
      gameNumber: gameNumber,
      elapsedTime: TimerModule.getElapsedTimeInSeconds()
    });
  }
  
  /**
   * Handle game completion
   */
  function handleGameComplete() {
    console.log("Game complete!");
    
    // Stop timer
    const elapsedTimeInSeconds = TimerModule.stop();
    const formattedTime = TimerModule.getFormattedTime();
    
    // Flash timer and play confetti before showing completion modal
    TimerModule.flashComplete(() => {
      // Get performance rating after timer flash
      const performanceRating = TimerModule.getPerformanceRating();
      const performanceVisualization = TimerModule.getPerformanceVisualization();
      
      // Generate share text
      const shareText = ShareModule.generateShareText(gameNumber, formattedTime, performanceRating);
      
      // Save stats
      StorageModule.saveCompletion(elapsedTimeInSeconds, performanceRating);
      
      // Clear saved game state
      StorageModule.clearGameState();
      
      // Show completion modal
      UIModule.showCompletionResults(gameNumber, formattedTime, performanceVisualization, shareText);
      
      // Reset game started flag
      gameStarted = false;
    });
  }
  
  /**
   * Handle game over
   */
  function handleGameOver() {
    // Already handled in handleTimeUp function
  }
  
  /**
   * Copy results to clipboard
   */
  function copyResults() {
    const shareTextElem = document.getElementById('share-text');
    if (shareTextElem) {
      ShareModule.copyToClipboard(shareTextElem.textContent)
        .then(success => {
          if (success) {
            UIModule.showNotification('Results copied to clipboard!', 'success');
          } else {
            UIModule.showNotification('Failed to copy results', 'error');
          }
        });
    }
  }
  
  /**
   * Share results using Web Share API
   */
  function shareResults() {
    const shareTextElem = document.getElementById('share-text');
    if (shareTextElem) {
      ShareModule.shareResults(shareTextElem.textContent)
        .then(success => {
          if (success && !ShareModule.isShareAvailable()) {
            UIModule.showNotification('Results copied to clipboard!', 'success');
          }
        });
    }
  }
  
  // Initialize when DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // DOM already loaded, run init directly
    init();
  }
  
  console.log("Todayku script loaded");
})();