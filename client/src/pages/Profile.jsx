import React, { useState, useEffect, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { ThemeContext } from '../contexts/ThemeContext';
import useAuth from '../hooks/useAuth';
import axios from 'axios';
import '../styles/Profile.css';

const Profile = () => {
  const { theme } = useContext(ThemeContext);
  const { isAuthenticated, user, isLoading } = useAuth();
  
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(null);
  
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  
  // Fetch user stats
  useEffect(() => {
    if (!isAuthenticated || !user) return;
    
    const fetchUserStats = async () => {
      setStatsLoading(true);
      setStatsError(null);
      
      try {
        const res = await axios.get(`/api/users/${user.id}/stats`);
        setStats(res.data);
        setEmailNotifications(user.email_notifications);
      } catch (err) {
        console.error('Error fetching user stats:', err);
        setStatsError('Failed to load user statistics');
      } finally {
        setStatsLoading(false);
      }
    };
    
    fetchUserStats();
  }, [isAuthenticated, user]);
  
  // If not authenticated, redirect to login
  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  // Handle email notification toggle
  const handleNotificationToggle = async () => {
    try {
      setUpdateError(null);
      
      const newValue = !emailNotifications;
      await axios.patch('/api/users/preferences', {
        email_notifications: newValue
      });
      
      setEmailNotifications(newValue);
      setUpdateSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setUpdateSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error updating preferences:', err);
      setUpdateError('Failed to update preferences');
    }
  };
  
  // Format time for display
  const formatTimeForDisplay = (milliseconds) => {
    if (!milliseconds) return 'N/A';
    
    const seconds = Math.floor((milliseconds / 1000) % 60);
    const minutes = Math.floor((milliseconds / (1000 * 60)) % 60);
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    }
    
    return `${minutes}m ${seconds}s`;
  };
  
  if (isLoading || statsLoading) {
    return (
      <div className="loading-container" style={{ color: theme.text }}>
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }
  
  return (
    <div className="profile-container">
      <h1 className="profile-title" style={{ color: theme.text }}>
        Your Profile
      </h1>
      
      <div className="profile-content">
        <div 
          className="profile-card"
          style={{ 
            backgroundColor: theme.secondaryBackground,
            color: theme.text,
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}
        >
          <div className="profile-header">
            <h2>{user?.name}</h2>
            <p className="profile-email">{user?.email}</p>
            {!user?.email_verified && (
              <p className="verification-warning">
                Email not verified. Please check your inbox for a verification link.
              </p>
            )}
          </div>
          
          <div className="profile-section">
            <h3>Account Preferences</h3>
            
            {updateSuccess && (
              <div className="update-success">
                Preferences updated successfully!
              </div>
            )}
            
            {updateError && (
              <div className="update-error">
                {updateError}
              </div>
            )}
            
            <div className="preference-option">
              <label className="toggle-label">
                <span>Receive Daily Leaderboard Emails</span>
                <div 
                  className={`toggle-switch ${emailNotifications ? 'active' : ''}`}
                  onClick={handleNotificationToggle}
                  style={{ 
                    backgroundColor: emailNotifications ? theme.primary : '#ccc',
                  }}
                >
                  <div className="toggle-knob"></div>
                </div>
              </label>
            </div>
          </div>
          
          {statsError ? (
            <div className="stats-error">
              {statsError}
            </div>
          ) : stats ? (
            <div className="profile-section">
              <h3>Your Statistics</h3>
              
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-value">{stats.puzzles_completed}</div>
                  <div className="stat-label">Puzzles Completed</div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-value">{stats.current_streak || 0}</div>
                  <div className="stat-label">Current Streak</div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-value">{stats.max_streak || 0}</div>
                  <div className="stat-label">Longest Streak</div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-value">{formatTimeForDisplay(stats.best_time)}</div>
                  <div className="stat-label">Best Time</div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-value">{formatTimeForDisplay(stats.average_time)}</div>
                  <div className="stat-label">Average Time</div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-value">{stats.leaderboard_wins || 0}</div>
                  <div className="stat-label">Times in 1st Place</div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
        
        <div 
          className="recent-activity"
          style={{ 
            backgroundColor: theme.secondaryBackground,
            color: theme.text,
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}
        >
          <h3>Recent Activity</h3>
          
          {stats && stats.recent_completions && stats.recent_completions.length > 0 ? (
            <table className="activity-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Rank</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent_completions.map((completion, index) => (
                  <tr key={index}>
                    <td>{new Date(completion.date).toLocaleDateString()}</td>
                    <td>{formatTimeForDisplay(completion.completion_time)}</td>
                    <td>{completion.rank || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="no-activity">No recent activity. Complete a puzzle to see your activity here!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;