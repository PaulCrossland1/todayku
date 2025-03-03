const rateLimit = require('express-rate-limit');

// Create rate limiters for different routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per IP
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});

const puzzleLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per IP
  message: 'Too many puzzle requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});

const submissionLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 submissions per IP
  message: 'Too many puzzle submissions, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  authLimiter,
  puzzleLimiter,
  submissionLimiter
};