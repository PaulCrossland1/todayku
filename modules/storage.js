/**
 * Storage Module
 * Handles saving and retrieving data from localStorage
 */
const StorageModule = (function() {
    'use strict';
    
    // Storage keys
    const KEYS = {
      BEST_TIMES: 'todayku_best_times',
      CURRENT_STREAK: 'todayku_current_streak',
      LAST_PLAYED: 'todayku_last_played',
      STATS: 'todayku_stats',
      GAME_STATE: 'todayku_game_state'
    };
    
    /**
     * Check if localStorage is available
     */
    function isStorageAvailable() {
      try {
        const test = '__storage_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
      } catch (e) {
        return false;
      }
    }
    
    /**
     * Gets the current date in YYYY-MM-DD format
     */
    function getCurrentDate() {
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    }
    
    /**
     * Update player stats
     */
    function updateStats(timeInSeconds, rating) {
      const stats = getStats();
      
      // Add completion
      stats.totalPlayed += 1;
      
      // Update best time if applicable
      if (!stats.bestTime || timeInSeconds < stats.bestTime) {
        stats.bestTime = timeInSeconds;
      }
      
      // Update distribution
      stats.distribution[rating] = (stats.distribution[rating] || 0) + 1;
      
      // Save updated stats
      setItem(KEYS.STATS, stats);
      
      return stats;
    }
    
    /**
     * Update current streak
     */
    function updateStreak() {
      const lastPlayed = getItem(KEYS.LAST_PLAYED);
      const today = getCurrentDate();
      let currentStreak = getItem(KEYS.CURRENT_STREAK) || 0;
      
      if (!lastPlayed) {
        // First time playing
        currentStreak = 1;
      } else {
        // Get yesterday's date
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
        
        if (lastPlayed === yesterdayStr) {
          // Played yesterday, increment streak
          currentStreak += 1;
        } else if (lastPlayed !== today) {
          // Didn't play yesterday and not already played today, reset streak
          currentStreak = 1;
        }
        // If lastPlayed is today, don't change the streak (already counted)
      }
      
      // Save updated streak and last played date
      setItem(KEYS.CURRENT_STREAK, currentStreak);
      setItem(KEYS.LAST_PLAYED, today);
      
      return currentStreak;
    }
    
    /**
     * Get default stats object
     */
    function getDefaultStats() {
      return {
        totalPlayed: 0,
        bestTime: null,
        distribution: {
          1: 0, 2: 0, 3: 0, 4: 0, 5: 0
        }
      };
    }
    
    /**
     * Set an item in localStorage with proper error handling
     */
    function setItem(key, value) {
      if (!isStorageAvailable()) return false;
      
      try {
        const serializedValue = JSON.stringify(value);
        localStorage.setItem(key, serializedValue);
        return true;
      } catch (e) {
        console.error('Error saving to localStorage:', e);
        return false;
      }
    }
    
    /**
     * Get an item from localStorage with proper error handling
     */
    function getItem(key) {
      if (!isStorageAvailable()) return null;
      
      try {
        const serializedValue = localStorage.getItem(key);
        if (serializedValue === null) return null;
        return JSON.parse(serializedValue);
      } catch (e) {
        console.error('Error retrieving from localStorage:', e);
        return null;
      }
    }
    
    // Public methods
    return {
      /**
       * Save game completion statistics
       */
      saveCompletion: function(timeInSeconds, rating) {
        if (!isStorageAvailable()) return null;
        
        // Update stats
        const stats = updateStats(timeInSeconds, rating);
        
        // Update streak
        const streak = updateStreak();
        
        return {
          stats,
          streak
        };
      },
      
      /**
       * Get player statistics
       */
      getStats: function() {
        return getItem(KEYS.STATS) || getDefaultStats();
      },
      
      /**
       * Get current playing streak
       */
      getCurrentStreak: function() {
        return getItem(KEYS.CURRENT_STREAK) || 0;
      },
      
      /**
       * Check if player has already completed today's puzzle
       */
      hasPlayedToday: function() {
        const lastPlayed = getItem(KEYS.LAST_PLAYED);
        return lastPlayed === getCurrentDate();
      },
      
      /**
       * Save current game state
       */
      saveGameState: function(gameState) {
        return setItem(KEYS.GAME_STATE, {
          ...gameState,
          timestamp: Date.now()
        });
      },
      
      /**
       * Get saved game state
       */
      getGameState: function() {
        const gameState = getItem(KEYS.GAME_STATE);
        
        // Check if game state is from today
        if (gameState) {
          const savedDate = new Date(gameState.timestamp).toLocaleDateString();
          const todayDate = new Date().toLocaleDateString();
          
          if (savedDate === todayDate) {
            return gameState;
          }
        }
        
        return null;
      },
      
      /**
       * Clear saved game state
       */
      clearGameState: function() {
        if (isStorageAvailable()) {
          localStorage.removeItem(KEYS.GAME_STATE);
          return true;
        }
        return false;
      }
    };
  })();