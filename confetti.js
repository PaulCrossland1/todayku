// Confetti animation
// Based on https://www.kirilv.com/canvas-confetti/

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.confetti = factory());
})(this, (function () {
  'use strict';

  // Create canvas element for the confetti animation
  var canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '999999';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);

  var context = canvas.getContext('2d');
  var particles = [];
  var animationId = null;

  // Handle window resize
  window.addEventListener('resize', function() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });

  // Particle constructor
  function Particle(x, y, color, velocity, life, size) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.velocity = velocity;
    this.life = life;
    this.size = size;
    this.rotation = Math.random() * 2 * Math.PI;
    this.rotationSpeed = Math.random() * 0.2 - 0.1;
  }

  // Particle update method
  Particle.prototype.update = function() {
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.velocity.y += 0.1; // Gravity
    this.life--;
    this.rotation += this.rotationSpeed;
  };

  // Particle draw method
  Particle.prototype.draw = function() {
    context.save();
    context.translate(this.x, this.y);
    context.rotate(this.rotation);
    context.fillStyle = this.color;
    context.beginPath();
    context.rect(-this.size / 2, -this.size / 2, this.size, this.size);
    context.fill();
    context.restore();
  };

  // Animation loop
  function animate() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Update and draw particles
    for (var i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();

      // Remove particles that are no longer visible or have expired
      if (particles[i].life <= 0 || 
          particles[i].y > canvas.height || 
          particles[i].x < 0 || 
          particles[i].x > canvas.width) {
        particles.splice(i, 1);
        i--;
      }
    }

    // Continue animation if there are particles left
    if (particles.length > 0) {
      animationId = requestAnimationFrame(animate);
    } else {
      animationId = null;
      document.body.removeChild(canvas);
    }
  }

  // Confetti function
  function confetti(options) {
    options = options || {};
    
    var particleCount = options.particleCount || 50;
    var angle = options.angle || 90;
    var spread = options.spread || 45;
    var startVelocity = options.startVelocity || 45;
    var decay = options.decay || 0.9;
    var gravity = options.gravity || 1;
    // Use Todayku brand colors for confetti
    var colors = options.colors || ['#4F46E5', '#818CF8', '#10B981', '#F59E0B', '#F3F4F6'];
    var ticks = options.ticks || 200;
    var origin = options.origin || { x: 0.5, y: 0.5 };
    var zIndex = options.zIndex || 100;
    
    // If canvas doesn't exist, recreate it
    if (!document.body.contains(canvas)) {
      canvas = document.createElement('canvas');
      canvas.style.position = 'fixed';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.pointerEvents = 'none';
      canvas.style.zIndex = zIndex;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      document.body.appendChild(canvas);
      context = canvas.getContext('2d');
    }

    // Create particles
    var angleInRadians = angle * (Math.PI / 180);
    var originX = origin.x * canvas.width;
    var originY = origin.y * canvas.height;

    for (var i = 0; i < particleCount; i++) {
      var color = colors[Math.floor(Math.random() * colors.length)];
      var size = Math.random() * 10 + 5;
      var life = Math.random() * ticks;
      
      // Calculate velocity
      var spreadAngle = (Math.random() - 0.5) * spread * (Math.PI / 180);
      var finalAngle = angleInRadians + spreadAngle;
      var velocity = {
        x: Math.cos(finalAngle) * startVelocity,
        y: Math.sin(finalAngle) * startVelocity
      };

      // Create particle
      particles.push(new Particle(originX, originY, color, velocity, life, size));
    }

    // Start animation if not already running
    if (!animationId) {
      animate();
    }

    return {
      canvas: canvas,
      particleCount: particleCount
    };
  }

  return confetti;
}));