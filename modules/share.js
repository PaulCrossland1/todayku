/**
 * Share Module
 * Handles social sharing functionality
 */
const ShareModule = (function() {
    'use strict';
    
    /**
     * Generate share text based on game results
     */
    function generateShareText(gameNumber, time, rating) {
      const starsText = generateStars(rating);
      
      return `Todayku #${gameNumber} ⏱️ ${time}\n${starsText}\nplay: https://todayku.github.io`;
    }
    
    /**
     * Generate star rating visualization
     */
    function generateStars(rating) {
      const fullStar = '⭐';
      const emptyStar = '☆';
      
      let stars = '';
      
      for (let i = 0; i < 5; i++) {
        stars += (i < rating) ? fullStar : emptyStar;
      }
      
      return stars;
    }
    
    /**
     * Copy text to clipboard
     */
    async function copyToClipboard(text) {
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(text);
          return true;
        } else {
          // Fallback for older browsers
          const textArea = document.createElement('textarea');
          textArea.value = text;
          textArea.style.position = 'fixed';
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          
          const successful = document.execCommand('copy');
          document.body.removeChild(textArea);
          
          return successful;
        }
      } catch (err) {
        console.error('Failed to copy text: ', err);
        return false;
      }
    }
    
    /**
     * Share results using Web Share API if available
     */
    async function shareResults(text) {
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'My Todayku result',
            text: text
          });
          return true;
        } catch (err) {
          console.error('Error sharing: ', err);
          return false;
        }
      } else {
        // Fallback to copying to clipboard
        return copyToClipboard(text);
      }
    }
    
    // Public methods
    return {
      /**
       * Generate share text
       */
      generateShareText: function(gameNumber, time, rating) {
        return generateShareText(gameNumber, time, rating);
      },
      
      /**
       * Copy results to clipboard
       */
      copyToClipboard: async function(text) {
        return await copyToClipboard(text);
      },
      
      /**
       * Share results using native sharing when available
       */
      shareResults: async function(text) {
        return await shareResults(text);
      },
      
      /**
       * Check if Web Share API is available
       */
      isShareAvailable: function() {
        return !!navigator.share;
      }
    };
  })();