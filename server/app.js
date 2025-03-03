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
app.use(helmet());
app.use(cors());
app.use(express.json());

// Schedule daily jobs (email sending, puzzle generation)
scheduleJobs();

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/puzzles', puzzleRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/users', userRoutes);

// Serve static files from the React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

// Error handling middleware
app.use(errorHandler);

module.exports = app;