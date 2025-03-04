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
      
      // Directly add event listener to the start button
      const startButton = document.getElementById('start-game');
      if (startButton) {
        console.log("Start button found, adding click event listener");
        startButton.addEventListener('click', function() {
          console.log("Start button clicked");
          document.getElementById('welcome-modal').classList.remove('active');
          document.getElementById('game-container').style.display = 'block';
          startGame();
        });
      } else {
        console.error("Start button not found!");
      }
      
      // Set up UI event callbacks
      UIModule.init({
        onCellSelect: handleCellSelect,
        onNumberInput: handleNumberInput,
        onGameStart: startGame,
        onCopyResults: copyResults,
        onShareResults: shareResults
      });
      
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
      // Initialize new puzzle
      const gameData = PuzzleModule.initPuzzle('easy');
      currentBoard = gameData.board;
      gameNumber = gameData.gameNumber;
      
      // Create game board UI
      UIModule.createGameBoard(currentBoard);
      
      // Start timer
      TimerModule.start(UIModule.updateTimer);
      
      // Set game started flag
      gameStarted = true;
    }
    
    /**
     * Resume a saved game
     */
    function resumeGame(savedGame) {
      // Set game data
      currentBoard = savedGame.board;
      gameNumber = savedGame.gameNumber;
      
      // Create game board UI
      UIModule.createGameBoard(currentBoard);
      
      // Resume timer with elapsed time
      TimerModule.start(UIModule.updateTimer);
      
      // Show game board
      document.getElementById('welcome-modal').classList.remove('active');
      document.getElementById('game-container').style.display = 'block';
      
      // Set game started flag
      gameStarted = true;
    }
    
    /**
     * Handle cell selection
     */
    function handleCellSelect(row, col) {
      if (!gameStarted) return;
      
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
        const result = PuzzleModule.setCellValue(value);
        
        if (result) {
          // Update cell UI
          UIModule.updateCell(result.row, result.col, result.value, result.conflict);
          
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
      // Stop timer
      const elapsedTimeInSeconds = TimerModule.stop();
      const formattedTime = TimerModule.getFormattedTime();
      
      // Get performance rating
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