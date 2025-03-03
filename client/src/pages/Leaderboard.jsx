import React, { useState, useEffect, useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import useAuth from '../hooks/useAuth';
import axios from 'axios';
import '../styles/Leaderboard.css';

const Leaderboard = () => {
  const { theme } = useContext(ThemeContext);
  const { isAuthenticated, user } = useAuth();
  
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState('today'); // today, week, month, all-time
  
  useEffect(() => {
    fetchLeaderboard();
  }, [timeframe]);
  
  const fetchLeaderboard = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const res = await axios.get(`/api/leaderboard/${timeframe}`);
      setLeaderboardData(res.data);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError('Failed to load leaderboard data');
    } finally {
      setIsLoading(false);
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
  
  return (
    <div className="leaderboard-container">
      <h1 className="leaderboard-title" style={{ color: theme.text }}>
        Leaderboard
      </h1>
      
      <div className="timeframe-selector">
        <button
          className={`timeframe-button ${timeframe === 'today' ? 'active' : ''}`}
          onClick={() => setTimeframe('today')}
          style={{ 
            backgroundColor: timeframe === 'today' ? theme.primary : theme.secondary,
            color: timeframe === 'today' ? '#fff' : theme.text
          }}
        >
          Today
        </button>
        <button
          className={`timeframe-button ${timeframe === 'week' ? 'active' : ''}`}
          onClick={() => setTimeframe('week')}
          style={{ 
            backgroundColor: timeframe === 'week' ? theme.primary : theme.secondary,
            color: timeframe === 'week' ? '#fff' : theme.text
          }}
        >
          This Week
        </button>
        <button
          className={`timeframe-button ${timeframe === 'month' ? 'active' : ''}`}
          onClick={() => setTimeframe('month')}
          style={{ 
            backgroundColor: timeframe === 'month' ? theme.primary : theme.secondary,
            color: timeframe === 'month' ? '#fff' : theme.text
          }}
        >
          This Month
        </button>
        <button
          className={`timeframe-button ${timeframe === 'all-time' ? 'active' : ''}`}
          onClick={() => setTimeframe('all-time')}
          style={{ 
            backgroundColor: timeframe === 'all-time' ? theme.primary : theme.secondary,
            color: timeframe === 'all-time' ? '#fff' : theme.text
          }}
        >
          All Time
        </button>
      </div>
      
      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p style={{ color: theme.text }}>Loading leaderboard...</p>
        </div>
      ) : error ? (
        <div className="error-message" style={{ color: theme.text }}>
          {error}
        </div>
      ) : (
        <div 
          className="leaderboard-table-container"
          style={{ 
            backgroundColor: theme.secondaryBackground,
            color: theme.text,
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}
        >
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Player</th>
                <th>Time</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {leaderboardData.length === 0 ? (
                <tr>
                  <td colSpan="4" className="no-data">No entries yet</td>
                </tr>
              ) : (
                leaderboardData.map((entry, index) => (
                  <tr 
                    key={index}
                    className={
                      isAuthenticated && entry.user_id === user?.id 
                        ? 'current-user-row' 
                        : index < 3 ? `top-${index + 1}` : ''
                    }
                  >
                    <td>
                      {index === 0 && <span className="medal gold">🥇</span>}
                      {index === 1 && <span className="medal silver">🥈</span>}
                      {index === 2 && <span className="medal bronze">🥉</span>}
                      {index > 2 && index + 1}
                    </td>
                    <td>{entry.name}</td>
                    <td>{formatTimeForDisplay(entry.completion_time)}</td>
                    <td>{new Date(entry.completed_at).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      
      {!isAuthenticated && (
        <div 
          className="auth-prompt"
          style={{ 
            backgroundColor: theme.secondaryBackground,
            color: theme.text
          }}
        >
          <p>Sign in to appear on the leaderboard!</p>
          <div className="auth-buttons">
            <a 
              href="/login"
              className="login-button"
              style={{ 
                backgroundColor: theme.primary,
                color: '#fff'
              }}
            >
              Login
            </a>
            <a 
              href="/register"
              className="register-button"
              style={{ 
                backgroundColor: theme.secondary,
                color: theme.text
              }}
            >
              Register
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;