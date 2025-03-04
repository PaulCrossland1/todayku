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
  let onTimeUpCallback = null;
  
  // Constants
  const MAX_TIME_SECONDS = 150; // 2:30 time limit
  const COLOR_CHANGE_INTERVAL = 5; // Change color every 5 seconds
  
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
      { max: 60, rating: 5 },   // Under 1:00 = 5 stars
      { max: 90, rating: 4 },   // Under 1:30 = 4 stars
      { max: 120, rating: 3 },  // Under 2:00 = 3 stars
      { max: 135, rating: 2 },  // Under 2:15 = 2 stars
      { max: MAX_TIME_SECONDS, rating: 1 } // Under 2:30 = 1 star
    ];
    
    for (const tier of tiers) {
      if (seconds <= tier.max) {
        return tier.rating;
      }
    }
    
    return 1; // Default to 1 star
  }
  
  /**
   * Determine what class the timer should have based on elapsed time
   */
  function getTimerClass(seconds) {
    if (seconds >= MAX_TIME_SECONDS - 30) {
      return 'danger'; // Last 30 seconds - red
    } else if (seconds >= MAX_TIME_SECONDS - 60) {
      return 'warning'; // 60-30 seconds left - yellow
    }
    return ''; // More than 60 seconds left - default blue
  }
  
  /**
   * Updates the timer display
   */
  function updateTimer() {
    const currentTime = Math.floor((Date.now() - startTime + elapsedTime) / 1000);
    
    // Check if time's up
    if (currentTime >= MAX_TIME_SECONDS) {
      stop();
      if (onTimeUpCallback && typeof onTimeUpCallback === 'function') {
        onTimeUpCallback();
      }
    }
    
    // Update the display with formatted time and class
    if (onTickCallback && typeof onTickCallback === 'function') {
      onTickCallback(formatTime(currentTime), getTimerClass(currentTime), currentTime % COLOR_CHANGE_INTERVAL === 0);
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
    start: function(tickCallback, timeUpCallback) {
      if (!isRunning) {
        onTickCallback = tickCallback;
        onTimeUpCallback = timeUpCallback;
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
     * Flash the timer to indicate completion 
     */
    flashComplete: function(completionCallback) {
      // Add the 'complete' class to flash green
      if (onTickCallback) {
        onTickCallback(this.getFormattedTime(), 'complete', true);
      }
      
      // Wait for a moment before showing the completion modal
      setTimeout(() => {
        if (completionCallback && typeof completionCallback === 'function') {
          completionCallback();
        }
      }, 1500); // Flash for 1.5 seconds before showing modal
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
    },
    
    /**
     * Get maximum time limit in seconds
     */
    getMaxTime: function() {
      return MAX_TIME_SECONDS;
    }
  };
})();