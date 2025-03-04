/**
 * UI Module
 * Handles user interface interactions and DOM manipulation
 */
const UIModule = (function() {
    'use strict';
    
    // DOM Elements
    let elements = {
      welcomeModal: null,
      completionModal: null,
      gameContainer: null,
      gameBoard: null,
      numberPad: null,
      timerDisplay: null,
      startButton: null,
      currentDateElem: null,
      completionDateElem: null,
      gameNumberElem: null,
      finalTimeElem: null,
      performanceRatingElem: null,
      shareTextElem: null,
      copyResultsButton: null,
      shareResultsButton: null,
      playAgainButton: null
    };
    
    // Event callbacks
    let callbacks = {
      onCellSelect: null,
      onNumberInput: null,
      onGameStart: null,
      onCopyResults: null,
      onShareResults: null
    };
    
    /**
     * Initialize DOM element references
     */
    function cacheElements() {
      elements.welcomeModal = document.getElementById('welcome-modal');
      elements.completionModal = document.getElementById('completion-modal');
      elements.gameContainer = document.getElementById('game-container');
      elements.gameBoard = document.getElementById('game-board');
      elements.numberPad = document.getElementById('number-pad');
      elements.timerDisplay = document.getElementById('timer');
      elements.startButton = document.getElementById('start-game');
      elements.currentDateElem = document.getElementById('current-date');
      elements.completionDateElem = document.getElementById('completion-date');
      elements.gameNumberElem = document.getElementById('game-number');
      elements.finalTimeElem = document.getElementById('final-time');
      elements.performanceRatingElem = document.getElementById('performance-rating');
      elements.shareTextElem = document.getElementById('share-text');
      elements.copyResultsButton = document.getElementById('copy-results');
      elements.shareResultsButton = document.getElementById('share-results');
      elements.playAgainButton = document.getElementById('play-again');
    }
    
    /**
     * Set up event listeners
     */
    function setupEventListeners() {
      // Start button
      if (elements.startButton) {
        elements.startButton.addEventListener('click', function() {
          hideModal(elements.welcomeModal);
          showGameBoard();
          
          if (callbacks.onGameStart && typeof callbacks.onGameStart === 'function') {
            callbacks.onGameStart();
          }
        });
      }
      
      // Number pad buttons
      if (elements.numberPad) {
        elements.numberPad.addEventListener('click', function(e) {
          if (e.target.classList.contains('number-btn')) {
            const value = parseInt(e.target.dataset.value, 10);
            
            if (callbacks.onNumberInput && typeof callbacks.onNumberInput === 'function') {
              callbacks.onNumberInput(value);
            }
          }
        });
      }
      
      // Copy results button
      if (elements.copyResultsButton) {
        elements.copyResultsButton.addEventListener('click', function() {
          if (callbacks.onCopyResults && typeof callbacks.onCopyResults === 'function') {
            callbacks.onCopyResults();
          }
        });
      }
      
      // Share results button
      if (elements.shareResultsButton) {
        elements.shareResultsButton.addEventListener('click', function() {
          if (callbacks.onShareResults && typeof callbacks.onShareResults === 'function') {
            callbacks.onShareResults();
          }
        });
      }
      
      // Play again button
      if (elements.playAgainButton) {
        elements.playAgainButton.addEventListener('click', function() {
          hideModal(elements.completionModal);
        });
      }
      
      // Keyboard support
      document.addEventListener('keydown', function(e) {
        // Number keys 1-9
        if (e.key >= '1' && e.key <= '9') {
          if (callbacks.onNumberInput && typeof callbacks.onNumberInput === 'function') {
            callbacks.onNumberInput(parseInt(e.key, 10));
          }
        }
        
        // Delete or Backspace for clearing
        if (e.key === 'Delete' || e.key === 'Backspace') {
          if (callbacks.onNumberInput && typeof callbacks.onNumberInput === 'function') {
            callbacks.onNumberInput(0);
          }
        }
      });
    }
    
    /**
     * Show a modal
     */
    function showModal(modal) {
      if (modal) {
        modal.classList.add('active');
      }
    }
    
    /**
     * Hide a modal
     */
    function hideModal(modal) {
      if (modal) {
        modal.classList.remove('active');
      }
    }
    
    /**
     * Show the game board
     */
    function showGameBoard() {
      if (elements.gameContainer) {
        elements.gameContainer.style.display = 'block';
      }
    }
    
    /**
     * Set the current date in welcome modal
     */
    function setCurrentDate() {
      if (elements.currentDateElem && elements.completionDateElem) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const dateStr = new Date().toLocaleDateString(undefined, options);
        
        elements.currentDateElem.textContent = dateStr;
        elements.completionDateElem.textContent = dateStr;
      }
    }
    
    /**
     * Create the game board cells
     */
    function createGameBoard(gameBoard) {
      if (!elements.gameBoard) return;
      
      // Clear existing cells
      elements.gameBoard.innerHTML = '';
      
      // Create cells
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          const cell = document.createElement('div');
          cell.className = 'cell';
          cell.dataset.row = row;
          cell.dataset.col = col;
          
          // Add value if provided
          const value = gameBoard[row][col];
          if (value !== 0) {
            cell.textContent = value;
            cell.classList.add('given');
          }
          
          // Add cell selection event
          cell.addEventListener('click', function() {
            if (!cell.classList.contains('given')) {
              if (callbacks.onCellSelect && typeof callbacks.onCellSelect === 'function') {
                callbacks.onCellSelect(row, col);
              }
            }
          });
          
          elements.gameBoard.appendChild(cell);
        }
      }
    }
    
    /**
     * Update a cell's value
     */
    function updateCell(row, col, value, conflict = false) {
      const cell = elements.gameBoard.querySelector(`[data-row="${row}"][data-col="${col}"]`);
      
      if (cell) {
        cell.textContent = value === 0 ? '' : value;
        
        // Add/remove conflict class
        if (conflict) {
          cell.classList.add('conflict');
        } else {
          cell.classList.remove('conflict');
        }
      }
    }
    
    /**
     * Select a cell (highlight)
     */
    function selectCell(row, col) {
      // Clear previous selection
      const cells = elements.gameBoard.querySelectorAll('.cell');
      cells.forEach(cell => {
        cell.classList.remove('selected');
        cell.classList.remove('same-number');
      });
      
      // Add selected class to new cell
      const cell = elements.gameBoard.querySelector(`[data-row="${row}"][data-col="${col}"]`);
      if (cell) {
        cell.classList.add('selected');
      }
    }
    
    /**
     * Highlight cells with the same value
     */
    function highlightSameValueCells(cells) {
      cells.forEach(cellInfo => {
        const cell = elements.gameBoard.querySelector(`[data-row="${cellInfo.row}"][data-col="${cellInfo.col}"]`);
        if (cell) {
          cell.classList.add('same-number');
        }
      });
    }
    
    /**
     * Update the timer display
     */
    function updateTimer(timeStr) {
      if (elements.timerDisplay) {
        elements.timerDisplay.textContent = timeStr;
      }
    }
    
    /**
     * Display completion results
     */
    function showCompletionResults(gameNumber, timeStr, performanceRating, shareText) {
      if (elements.gameNumberElem) {
        elements.gameNumberElem.textContent = gameNumber;
      }
      
      if (elements.finalTimeElem) {
        elements.finalTimeElem.textContent = timeStr;
      }
      
      if (elements.performanceRatingElem) {
        elements.performanceRatingElem.textContent = performanceRating;
      }
      
      if (elements.shareTextElem) {
        elements.shareTextElem.textContent = shareText;
      }
      
      // Show modal
      showModal(elements.completionModal);
    }
    
    /**
     * Show a notification/toast message
     */
    function showNotification(message, type = 'info', duration = 3000) {
      // Create notification element
      const notification = document.createElement('div');
      notification.className = `notification ${type}`;
      notification.textContent = message;
      
      // Add to document
      document.body.appendChild(notification);
      
      // Show notification
      setTimeout(() => {
        notification.classList.add('show');
      }, 10);
      
      // Remove after duration
      setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
          document.body.removeChild(notification);
        }, 300);
      }, duration);
    }
    
    // Public methods
    return {
      /**
       * Initialize the UI
       */
      init: function(config = {}) {
        cacheElements();
        setupEventListeners();
        setCurrentDate();
        
        // Set event callbacks
        callbacks = { ...callbacks, ...config };
        
        // Check if Web Share API is available
        if (!ShareModule.isShareAvailable() && elements.shareResultsButton) {
          elements.shareResultsButton.style.display = 'none';
        }
      },
      
      /**
       * Create the game board UI
       */
      createGameBoard: function(gameBoard) {
        createGameBoard(gameBoard);
      },
      
      /**
       * Show the welcome modal
       */
      showWelcomeModal: function() {
        showModal(elements.welcomeModal);
      },
      
      /**
       * Update the timer display
       */
      updateTimer: function(timeStr) {
        updateTimer(timeStr);
      },
      
      /**
       * Update a cell's value
       */
      updateCell: function(row, col, value, conflict = false) {
        updateCell(row, col, value, conflict);
      },
      
      /**
       * Select a cell (highlight)
       */
      selectCell: function(row, col) {
        selectCell(row, col);
      },
      
      /**
       * Highlight cells with the same value
       */
      highlightSameValueCells: function(cells) {
        highlightSameValueCells(cells);
      },
      
      /**
       * Show completion results modal
       */
      showCompletionResults: function(gameNumber, timeStr, performanceRating, shareText) {
        showCompletionResults(gameNumber, timeStr, performanceRating, shareText);
      },
      
      /**
       * Show a notification/toast message
       */
      showNotification: function(message, type = 'info', duration = 3000) {
        showNotification(message, type, duration);
      }
    };
  })();