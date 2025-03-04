/**
 * Timer Module
 * Handles the game timer functionality
 */
const TimerModule = (function() {
    'use strict';
    
    // Private variables
    let startTime = 0;
    let elapsedTime = 0;
    let timerInterval = null;
    let isRunning = false;
    let onTickCallback = null;
    
    /**
     * Formats time in seconds to MM:SS format
     */
    function formatTime(seconds) {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    /**
     * Calculate performance rating based on completion time
     * Returns a rating from 1-5
     */
    function calculatePerformance(seconds) {
      // Performance tiers in seconds
      const tiers = [
        { max: 90, rating: 5 },  // Under 1:30 = 5 stars
        { max: 120, rating: 4 }, // Under 2:00 = 4 stars
        { max: 180, rating: 3 }, // Under 3:00 = 3 stars
        { max: 300, rating: 2 }, // Under 5:00 = 2 stars
        { max: Infinity, rating: 1 } // Over 5:00 = 1 star
      ];
      
      for (const tier of tiers) {
        if (seconds <= tier.max) {
          return tier.rating;
        }
      }
      
      return 1; // Default to 1 star
    }
    
    /**
     * Updates the timer display
     */
    function updateTimer() {
      const currentTime = Math.floor((Date.now() - startTime + elapsedTime) / 1000);
      
      if (onTickCallback && typeof onTickCallback === 'function') {
        onTickCallback(formatTime(currentTime));
      }
    }
    
    /**
     * Generate performance visualization (stars/emojis)
     */
    function generatePerformanceVisualization(rating) {
      // Using star emojis
      const fullStar = '⭐';
      const emptyStar = '☆';
      
      let visualization = '';
      
      for (let i = 0; i < 5; i++) {
        visualization += (i < rating) ? fullStar : emptyStar;
      }
      
      return visualization;
    }
    
    // Public methods
    return {
      /**
       * Start the timer
       */
      start: function(callback) {
        if (!isRunning) {
          onTickCallback = callback;
          startTime = Date.now();
          isRunning = true;
          timerInterval = setInterval(updateTimer, 1000);
          updateTimer(); // Initial update
        }
      },
      
      /**
       * Stop the timer
       */
      stop: function() {
        if (isRunning) {
          clearInterval(timerInterval);
          elapsedTime += Date.now() - startTime;
          isRunning = false;
        }
        return this.getElapsedTimeInSeconds();
      },
      
      /**
       * Reset the timer
       */
      reset: function() {
        clearInterval(timerInterval);
        startTime = 0;
        elapsedTime = 0;
        isRunning = false;
      },
      
      /**
       * Get the current elapsed time in seconds
       */
      getElapsedTimeInSeconds: function() {
        let totalTime = elapsedTime;
        if (isRunning) {
          totalTime += Date.now() - startTime;
        }
        return Math.floor(totalTime / 1000);
      },
      
      /**
       * Get formatted time string (MM:SS)
       */
      getFormattedTime: function() {
        return formatTime(this.getElapsedTimeInSeconds());
      },
      
      /**
       * Get performance rating (1-5)
       */
      getPerformanceRating: function() {
        const seconds = this.getElapsedTimeInSeconds();
        return calculatePerformance(seconds);
      },
      
      /**
       * Get performance visualization (stars/emojis)
       */
      getPerformanceVisualization: function() {
        const rating = this.getPerformanceRating();
        return generatePerformanceVisualization(rating);
      },
      
      /**
       * Check if timer is currently running
       */
      isRunning: function() {
        return isRunning;
      }
    };