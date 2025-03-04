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
    gameOverModal: null,
    gameContainer: null,
    gameBoard: null,
    numberPad: null,
    timerDisplay: null,
    startButton: null,
    currentDateElem: null,
    completionDateElem: null,
    gameOverDateElem: null,
    gameNumberElem: null,
    gameOverNumberElem: null,
    finalTimeElem: null,
    performanceRatingElem: null,
    shareTextElem: null,
    copyResultsButton: null,
    shareResultsButton: null,
    playAgainButton: null,
    tryAgainButton: null,
    confettiCanvas: null
  };
  
  // Event callbacks
  let callbacks = {
    onCellSelect: null,
    onNumberInput: null,
    onGameStart: null,
    onCopyResults: null,
    onShareResults: null,
    onGameOver: null
  };
  
  /**
   * Initialize DOM element references
   */
  function cacheElements() {
    elements.welcomeModal = document.getElementById('welcome-modal');
    elements.completionModal = document.getElementById('completion-modal');
    elements.gameOverModal = document.getElementById('game-over-modal');
    elements.gameContainer = document.getElementById('game-container');
    elements.gameBoard = document.getElementById('game-board');
    elements.numberPad = document.getElementById('number-pad');
    elements.timerDisplay = document.getElementById('timer');
    elements.startButton = document.getElementById('start-game');
    elements.currentDateElem = document.getElementById('current-date');
    elements.completionDateElem = document.getElementById('completion-date');
    elements.gameOverDateElem = document.getElementById('game-over-date');
    elements.gameNumberElem = document.getElementById('game-number');
    elements.gameOverNumberElem = document.getElementById('game-over-number');
    elements.finalTimeElem = document.getElementById('final-time');
    elements.performanceRatingElem = document.getElementById('performance-rating');
    elements.shareTextElem = document.getElementById('share-text');
    elements.copyResultsButton = document.getElementById('copy-results');
    elements.shareResultsButton = document.getElementById('share-results');
    elements.playAgainButton = document.getElementById('play-again');
    elements.tryAgainButton = document.getElementById('try-again');
    elements.confettiCanvas = document.getElementById('confetti-canvas');
  }
  
  /**
   * Set up event listeners
   */
  function setupEventListeners() {
    console.log("Setting up UI event listeners");
    
    // CRITICAL FIX: Start button - Use onclick property instead of addEventListener
    if (elements.startButton) {
      console.log("Adding click event to start button in UI module");
      elements.startButton.onclick = function(e) {
        if (e) e.preventDefault(); // Prevent any default behavior
        console.log("Start button clicked in UI module");
        hideModal(elements.welcomeModal);
        showGameBoard();
        
        if (callbacks.onGameStart && typeof callbacks.onGameStart === 'function') {
          console.log("Calling onGameStart callback");
          callbacks.onGameStart();
        } else {
          console.error("onGameStart callback not defined or not a function");
        }
        
        // Return false to prevent any other handlers
        return false;
      };
    } else {
      console.error("Start button element not found in UI module");
    }
    
    // CRITICAL FIX: Number pad buttons - Use direct onclick for better compatibility
    if (elements.numberPad) {
      const numberButtons = elements.numberPad.querySelectorAll('.number-btn');
      numberButtons.forEach(button => {
        button.onclick = function() {
          const value = parseInt(this.dataset.value, 10);
          console.log("Number button clicked:", value);
          
          if (callbacks.onNumberInput && typeof callbacks.onNumberInput === 'function') {
            callbacks.onNumberInput(value);
          }
          
          return false;
        };
      });
    }
    
    // Copy results button
    if (elements.copyResultsButton) {
      elements.copyResultsButton.onclick = function() {
        if (callbacks.onCopyResults && typeof callbacks.onCopyResults === 'function') {
          callbacks.onCopyResults();
        }
        return false;
      };
    }
    
    // Share results button
    if (elements.shareResultsButton) {
      elements.shareResultsButton.onclick = function() {
        if (callbacks.onShareResults && typeof callbacks.onShareResults === 'function') {
          callbacks.onShareResults();
        }
        return false;
      };
    }
    
    // Play again button
    if (elements.playAgainButton) {
      elements.playAgainButton.onclick = function() {
        hideModal(elements.completionModal);
        return false;
      };
    }
    
    // Try again button for game over
    if (elements.tryAgainButton) {
      elements.tryAgainButton.onclick = function() {
        hideModal(elements.gameOverModal);
        return false;
      };
    }
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
      elements.gameContainer.style.display = 'flex'; // Changed to flex for better layout
    }
  }
  
  /**
   * Set the current date in all modals
   */
  function setCurrentDate() {
    // Use local date format for display but ensure it's consistent with UTC date for puzzles
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateStr = new Date().toLocaleDateString(undefined, options);
    
    // Also get UTC date for logging
    const utcDate = new Date();
    const utcDateStr = `${utcDate.getUTCFullYear()}-${utcDate.getUTCMonth() + 1}-${utcDate.getUTCDate()}`;
    console.log("Setting date display. UTC date for puzzles:", utcDateStr);
    
    if (elements.currentDateElem) {
      elements.currentDateElem.textContent = dateStr;
    }
    
    if (elements.completionDateElem) {
      elements.completionDateElem.textContent = dateStr;
    }
    
    if (elements.gameOverDateElem) {
      elements.gameOverDateElem.textContent = dateStr;
    }
  }
  
  /**
   * Create the game board cells
   */
  function createGameBoard(gameBoard) {
    if (!elements.gameBoard) {
      console.error("Game board element not found!");
      return;
    }
    
    console.log("Creating game board with", gameBoard.length, "rows");
    
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
        
        // Add cell selection event - Use onclick for more reliable handling
        cell.onclick = function() {
          if (!this.classList.contains('given')) {
            if (callbacks.onCellSelect && typeof callbacks.onCellSelect === 'function') {
              callbacks.onCellSelect(row, col);
            }
          }
          return false;
        };
        
        elements.gameBoard.appendChild(cell);
      }
    }
    
    console.log("Game board created with", elements.gameBoard.children.length, "cells");
  }
  
  /**
   * Update a cell's value and handle error animation
   */
  function updateCell(row, col, value, conflict = false, isError = false) {
    const cell = elements.gameBoard.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    
    if (cell) {
      // Remove any existing error class
      cell.classList.remove('error');
      
      // Update the cell value
      cell.textContent = value === 0 ? '' : value;
      
      if (isError) {
        // Trigger error animation
        cell.classList.add('error');
        
        // Remove error class after animation completes
        setTimeout(() => {
          cell.classList.remove('error');
        }, 500);
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
   * Update the timer display and handle color changes
   */
  function updateTimer(timeStr, timerClass, forceUpdate = false) {
    if (elements.timerDisplay) {
      elements.timerDisplay.textContent = timeStr;
      
      // Only update classes if needed
      if (forceUpdate || !elements.timerDisplay.classList.contains(timerClass)) {
        // Remove all timer classes
        elements.timerDisplay.classList.remove('warning', 'danger', 'complete');
        
        // Add new class if provided
        if (timerClass) {
          elements.timerDisplay.classList.add(timerClass);
        }
      }
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
   * Display game over modal
   */
  function showGameOver(gameNumber) {
    if (elements.gameOverNumberElem) {
      elements.gameOverNumberElem.textContent = gameNumber;
    }
    
    // Show modal
    showModal(elements.gameOverModal);
  }
  
  /**
   * Show a notification/toast message
   */
  function showNotification(message, type = 'info', duration = 3000) {
    // Remove any existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
      document.body.removeChild(existingNotification);
    }
    
    // Create new notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Add to body
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);
    
    // Auto-hide after duration
    setTimeout(() => {
      notification.classList.remove('show');
      
      // Remove from DOM after animation completes
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, duration);
    
    return notification;
  }
  
  // Public methods
  return {
    /**
     * Initialize the UI
     */
    init: function(config = {}) {
      console.log("Initializing UI Module");
      cacheElements();
      
      // Debug check for elements
      console.log("UI Elements found:", {
        welcomeModal: !!elements.welcomeModal,
        startButton: !!elements.startButton,
        gameContainer: !!elements.gameContainer
      });
      
      // Set event callbacks first, before setting up listeners
      callbacks = { ...callbacks, ...config };
      console.log("Callbacks set:", Object.keys(callbacks).filter(key => !!callbacks[key]));
      
      setupEventListeners();
      setCurrentDate();
      
      // Initialize confetti
      if (typeof ConfettiModule !== 'undefined') {
        ConfettiModule.init();
      }
      
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
    updateTimer: function(timeStr, timerClass, forceUpdate = false) {
      updateTimer(timeStr, timerClass, forceUpdate);
    },
    
    /**
     * Update a cell's value
     */
    updateCell: function(row, col, value, conflict = false, isError = false) {
      updateCell(row, col, value, conflict, isError);
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
     * Show completion results modal with confetti
     */
    showCompletionResults: function(gameNumber, timeStr, performanceRating, shareText) {
      // Start confetti animation
      if (typeof ConfettiModule !== 'undefined') {
        ConfettiModule.start();
      }
      
      showCompletionResults(gameNumber, timeStr, performanceRating, shareText);
    },
    
    /**
     * Show game over modal
     */
    showGameOver: function(gameNumber) {
      showGameOver(gameNumber);
    },
    
    /**
     * Show a notification/toast message
     */
    showNotification: function(message, type = 'info', duration = 3000) {
      return showNotification(message, type, duration);
    }
  };
})();