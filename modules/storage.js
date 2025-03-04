/**
 * Storage Module
 * Handles local storage of game state and statistics
 */
const StorageModule = (function() {
  'use strict';
  
  // Storage keys
  const GAME_STATE_KEY = 'todayku_game_state';
  const STATS_KEY = 'todayku_stats';
  
  /**
   * Save data to local storage
   */
  function saveToStorage(key, data) {
    try {
      const serialized = JSON.stringify(data);
      localStorage.setItem(key, serialized);
      return true;
    } catch (error) {
      console.error('Error saving to storage:', error);
      return false;
    }
  }
  
  /**
   * Load data from local storage
   */
  function loadFromStorage(key) {
    try {
      const serialized = localStorage.getItem(key);
      if (serialized === null) return null;
      return JSON.parse(serialized);
    } catch (error) {
      console.error('Error loading from storage:', error);
      return null;
    }
  }
  
  /**
   * Clear data from local storage
   */
  function clearFromStorage(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return false;
    }
  }
  
  /**
   * Check if the saved game is from today
   */
  function isSameDay(savedDate) {
    if (!savedDate) return false;
    
    // Use UTC for consistency
    const today = new Date();
    const saveDay = new Date(savedDate);
    
    return (
      today.getUTCFullYear() === saveDay.getUTCFullYear() &&
      today.getUTCMonth() === saveDay.getUTCMonth() &&
      today.getUTCDate() === saveDay.getUTCDate()
    );
  }
  
  // Public methods
  return {
    /**
     * Save the current game state
     */
    saveGameState: function(gameState) {
      // Add timestamp
      const stateWithTimestamp = {
        ...gameState,
        timestamp: new Date().toISOString()
      };
      
      return saveToStorage(GAME_STATE_KEY, stateWithTimestamp);
    },
    
    /**
     * Get the saved game state
     */
    getGameState: function() {
      const savedState = loadFromStorage(GAME_STATE_KEY);
      
      // Only return if it's from today
      if (savedState && isSameDay(savedState.timestamp)) {
        return savedState;
      }
      
      // Clear old state
      if (savedState) {
        this.clearGameState();
      }
      
      return null;
    },
    
    /**
     * Clear the saved game state
     */
    clearGameState: function() {
      return clearFromStorage(GAME_STATE_KEY);
    },
    
    /**
     * Save completion stats
     */
    saveCompletion: function(timeInSeconds, rating) {
      const savedStats = this.getStats() || {
        completions: 0,
        bestTime: null,
        averageTime: 0,
        totalStars: 0,
        history: []
      };
      
      // Update stats
      const newStats = {
        completions: savedStats.completions + 1,
        bestTime: savedStats.bestTime === null ? timeInSeconds : Math.min(savedStats.bestTime, timeInSeconds),
        averageTime: Math.round(((savedStats.averageTime * savedStats.completions) + timeInSeconds) / (savedStats.completions + 1)),
        totalStars: savedStats.totalStars + rating,
        history: [
          ...savedStats.history,
          {
            date: new Date().toISOString(),
            time: timeInSeconds,
            rating: rating
          }
        ].slice(-30) // Keep only last 30 games
      };
      
      return saveToStorage(STATS_KEY, newStats);
    },
    
    /**
     * Get saved stats
     */
    getStats: function() {
      return loadFromStorage(STATS_KEY);
    },
    
    /**
     * Clear all saved data
     */
    clearAllData: function() {
      this.clearGameState();
      return clearFromStorage(STATS_KEY);
    }
  };
})();