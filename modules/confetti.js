/**
 * Confetti Module
 * Handles confetti animation for puzzle completion
 */
const ConfettiModule = (function() {
    'use strict';
    
    // Private variables
    let canvas = null;
    let ctx = null;
    let particles = [];
    let animationId = null;
    
    // Confetti settings
    const PARTICLE_COUNT = 150;
    const COLORS = [
      '#3B82F6', // Blue
      '#10B981', // Green
      '#F59E0B', // Yellow
      '#EF4444', // Red
      '#8B5CF6'  // Purple
    ];
    
    /**
     * Initialize the canvas for confetti
     */
    function initCanvas() {
      canvas = document.getElementById('confetti-canvas');
      if (!canvas) {
        console.error('Confetti canvas not found');
        return false;
      }
      
      // Set canvas to fill the screen
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      ctx = canvas.getContext('2d');
      
      // Handle window resize
      window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      });
      
      return true;
    }
    
    /**
     * Create confetti particles
     */
    function createParticles() {
      particles = [];
      
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
          x: Math.random() * canvas.width,  // Random x position
          y: Math.random() * -canvas.height, // Start above canvas
          size: Math.random() * 8 + 4,       // Random size between 4-12
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          speed: Math.random() * 3 + 2,      // Random speed
          angle: Math.random() * 2,          // Random angle for swaying
          rotation: Math.random() * 360,     // Random rotation
          rotationSpeed: (Math.random() - 0.5) * 2 // Random rotation speed
        });
      }
    }
    
    /**
     * Animate the confetti particles
     */
    function animate() {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      let stillActive = false;
      
      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        
        // Update position
        p.y += p.speed;
        p.x += Math.sin(p.angle) * 2;
        p.angle += 0.01;
        p.rotation += p.rotationSpeed;
        
        // Draw particle (rectangle with rotation)
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
        
        // Check if particle is still on screen
        if (p.y < canvas.height + p.size) {
          stillActive = true;
        }
      }
      
      // Continue animation if particles are still visible
      if (stillActive) {
        animationId = requestAnimationFrame(animate);
      } else {
        // All particles off screen, stop animation
        stopAnimation();
      }
    }
    
    /**
     * Stop the animation
     */
    function stopAnimation() {
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
      
      // Clear the canvas
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    
    // Public methods
    return {
      /**
       * Initialize the confetti module
       */
      init: function() {
        return initCanvas();
      },
      
      /**
       * Start the confetti animation
       */
      start: function() {
        if (!canvas && !this.init()) {
          return false;
        }
        
        // Stop any existing animation
        stopAnimation();
        
        // Create new particles
        createParticles();
        
        // Start animation
        animate();
        
        return true;
      },
      
      /**
       * Stop the confetti animation
       */
      stop: function() {
        stopAnimation();
      }
    };
  })();