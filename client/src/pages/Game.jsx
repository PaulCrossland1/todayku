import React, { useState, useEffect, useContext } from 'react';
import SudokuBoard from '../components/SudokuBoard';
import Timer from '../components/Timer';
import NextPuzzleCountdown from '../components/NextPuzzleCountdown';
import { ThemeContext } from '../contexts/ThemeContext';
import useAuth from '../hooks/useAuth';
import useTimer from '../hooks/useTimer';
import useSudoku from '../hooks/useSudoku';
import axios from 'axios';
import '../styles/Game.css';

const Game = () => {
  const { theme } = useContext(ThemeContext);
  const { isAuthenticated, user } = useAuth();
  const { 
    time, 
    isRunning, 
    startTimer, 
    pauseTimer, 
    resetTimer, 
    formatTime 
  } = useTimer();
  
  const {
    originalPuzzle,
    currentPuzzle,
    notes,
    isLoading,
    isComplete,
    error,
    updateCell,
    toggleNote,
    submitSolution
  } = useSudoku();
  
  const [gameStarted, setGameStarted] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  
  // Start game when user clicks start
  const handleStartGame = () => {
    setGameStarted(true);
    startTimer();
  };
  
  // Handle game completion
  useEffect(() => {
    if (isComplete && gameStarted && !gameFinished) {
      pauseTimer();
      setGameFinished(true);
      
      // If user is authenticated, submit their time
      if (isAuthenticated) {
        submitSolution(time);
        fetchLeaderboard();
      }
    }
  }, [isComplete, gameStarted, gameFinished, isAuthenticated, time, submitSolution]);
  
  // Fetch leaderboard data
  const fetchLeaderboard = async () => {
    setLeaderboardLoading(true);
    
    try {
      const res = await axios.get('/api/leaderboard/today');
      setLeaderboardData(res.data);
      setShowLeaderboard(true);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
    } finally {
      setLeaderboardLoading(false);
    }
  };
  
  // Format time for display
  const formatTimeForDisplay = (milliseconds) => {
    const seconds = Math.floor((milliseconds / 1000) % 60);
    const minutes = Math.floor((milliseconds / (1000 * 60)) % 60);
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    }
    
    return `${minutes}m ${seconds}s`;
  };
  
  // Share puzzle completion
  const handleShare = () => {
    const shareText = `I completed today's Todayku puzzle in ${formatTimeForDisplay(time)}! Can you beat my time? https://todayku.com`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Todayku Puzzle',
        text: shareText,
        url: 'https://todayku.com'
      })
      .catch(err => console.error('Error sharing:', err));
    } else {
      // Fallback to copy to clipboard
      navigator.clipboard.writeText(shareText)
        .then(() => alert('Share text copied to clipboard!'))
        .catch(err => console.error('Could not copy text:', err));
    }
  };
  
  if (isLoading) {
    return (
      <div className="loading-container" style={{ color: theme.text }}>
        <div className="loading-spinner"></div>
        <p>Loading today's puzzle...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="error-container" style={{ color: theme.text }}>
        <p>Error: {error}</p>
        <button 
          onClick={() => window.location.reload()}
          style={{ 
            backgroundColor: theme.primary,
            color: '#fff'
          }}
        >
          Try Again
        </button>
      </div>
    );
  }
  
  return (
    <div className="game-container">
      <div className="game-header">
        <NextPuzzleCountdown />
        <div className="puzzle-info" style={{ color: theme.text }}>
          <div className="difficulty">
            Difficulty: 
            <span className={`difficulty-${currentPuzzle && currentPuzzle.difficulty}`}>
            </span>
          </div>
          {gameStarted && <Timer time={time} isRunning={isRunning} />}
        </div>
      </div>
      
      <div className="game-content">
        {!gameStarted && !gameFinished ? (
          <div className="game-start-container" style={{ backgroundColor: theme.secondaryBackground }}>
            <h2 style={{ color: theme.text }}>Today's Sudoku Challenge</h2>
            <p style={{ color: theme.textSecondary }}>
              Ready to test your skills? The timer will start as soon as you click the button below.
            </p>
            <button 
              className="start-button"
              onClick={handleStartGame}
              style={{ 
                backgroundColor: theme.primary,
                color: '#fff'
              }}
            >
              Start Puzzle
            </button>
          </div>
        ) : (
          <SudokuBoard 
            originalPuzzle={originalPuzzle}
            currentPuzzle={currentPuzzle}
            notes={notes}
            updateCell={updateCell}
            toggleNote={toggleNote}
            isComplete={isComplete}
            isGameActive={gameStarted && !gameFinished}
          />
        )}
      </div>
      
      {gameFinished && (
        <div className="game-completed">
          <div 
            className="completion-modal"
            style={{ 
              backgroundColor: theme.secondaryBackground,
              color: theme.text
            }}
          >
            <h2>Puzzle Completed!</h2>
            <p className="completion-time">
              Your Time: <span>{formatTimeForDisplay(time)}</span>
            </p>
            
            {!isAuthenticated && (
              <div className="auth-prompt">
                <p>Sign in to record your time on the leaderboard</p>
                <a 
                  href="/login"
                  className="login-button"
                  style={{ 
                    backgroundColor: theme.primary,
                    color: '#fff'
                  }}
                >
                  Sign In
                </a>
              </div>
            )}
            
            <div className="action-buttons">
              <button 
                className="share-button"
                onClick={handleShare}
                style={{ 
                  backgroundColor: theme.primary,
                  color: '#fff'
                }}
              >
                Share Result
              </button>
              
              {!showLeaderboard && isAuthenticated && (
                <button 
                  className="leaderboard-button"
                  onClick={fetchLeaderboard}
                  style={{ 
                    backgroundColor: theme.secondary,
                    color: theme.text
                  }}
                >
                  View Leaderboard
                </button>
              )}
            </div>
            
            {showLeaderboard && (
              <div className="mini-leaderboard">
                <h3>Today's Top Players</h3>
                {leaderboardLoading ? (
                  <p>Loading leaderboard...</p>
                ) : (
                  <table className="leaderboard-table">
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>Player</th>
                        <th>Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboardData.map((entry, index) => (
                        <tr 
                          key={index}
                          className={entry.user_id === user?.id ? 'current-user' : ''}
                        >
                          <td>{index + 1}</td>
                          <td>{entry.name}</td>
                          <td>{formatTimeForDisplay(entry.completion_time)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Game;