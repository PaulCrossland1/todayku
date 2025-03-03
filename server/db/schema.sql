-- Schema for todayku database

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  email_notifications BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP
);

-- Puzzles table
CREATE TABLE IF NOT EXISTS puzzles (
  id SERIAL PRIMARY KEY,
  date DATE UNIQUE NOT NULL,
  puzzle JSONB NOT NULL,
  solution JSONB NOT NULL,
  difficulty VARCHAR(20) NOT NULL DEFAULT 'medium'
);

-- Completion times table
CREATE TABLE IF NOT EXISTS completion_times (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  puzzle_id INTEGER REFERENCES puzzles(id) ON DELETE CASCADE,
  completion_time INTEGER NOT NULL, -- store time in milliseconds
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45),
  UNIQUE(user_id, puzzle_id)
);

-- Achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  badge_image VARCHAR(255)
);

-- User achievements
CREATE TABLE IF NOT EXISTS user_achievements (
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  achievement_id INTEGER REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, achievement_id)
);

-- User verification tokens
CREATE TABLE IF NOT EXISTS verification_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL
);

-- User streaks
CREATE TABLE IF NOT EXISTS user_streaks (
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE PRIMARY KEY,
  current_streak INTEGER DEFAULT 0,
  max_streak INTEGER DEFAULT 0,
  last_puzzle_date DATE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_completion_times_puzzle_id ON completion_times(puzzle_id);
CREATE INDEX IF NOT EXISTS idx_completion_times_user_id ON completion_times(user_id);
CREATE INDEX IF NOT EXISTS idx_puzzles_date ON puzzles(date);