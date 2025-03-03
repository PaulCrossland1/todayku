const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const { errorHandler } = require('./middleware/errorHandler');
const authRoutes = require('./routes/auth');
const puzzleRoutes = require('./routes/puzzles');
const leaderboardRoutes = require('./routes/leaderboards');
const userRoutes = require('./routes/users');
const { scheduleJobs } = require('./services/emailService');

const app = express();

// Middleware
app.use(helmet({
  contentSecurityPolicy: false // Disable CSP for development
}));
app.use(cors());
app.use(express.json());

// Schedule daily jobs (email sending, puzzle generation)
scheduleJobs();

// API routes - these must come before the catch-all route
app.use('/api/auth', authRoutes);
app.use('/api/puzzles', puzzleRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/users', userRoutes);

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/build')));

// Catch-all route - must come after API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

// Error handling middleware
app.use(errorHandler);

module.exports = app;