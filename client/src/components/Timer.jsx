import React, { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import '../styles/Timer.css';

const Timer = ({ time, isRunning }) => {
  const { theme } = useContext(ThemeContext);
  
  // Format time (MM:SS.ms)
  const formatTime = () => {
    const milliseconds = Math.floor((time % 1000) / 10);
    const seconds = Math.floor((time / 1000) % 60);
    const minutes = Math.floor((time / (1000 * 60)) % 60);
    const hours = Math.floor(time / (1000 * 60 * 60));
    
    const formattedSeconds = seconds.toString().padStart(2, '0');
    const formattedMilliseconds = milliseconds.toString().padStart(2, '0');
    
    if (hours > 0) {
      const formattedHours = hours.toString().padStart(2, '0');
      const formattedMinutes = minutes.toString().padStart(2, '0');
      return `${formattedHours}:${formattedMinutes}:${formattedSeconds}.${formattedMilliseconds}`;
    }
    
    const formattedMinutes = minutes.toString().padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}.${formattedMilliseconds}`;
  };
  
  return (
    <div 
      className={`timer ${isRunning ? 'running' : ''}`}
      style={{ 
        backgroundColor: theme.secondary,
        color: theme.text,
        boxShadow: `0 4px 6px rgba(0, 0, 0, 0.1)`
      }}
    >
      <div className="timer-display">
        {formatTime()}
      </div>
      <div className="timer-status">
        {isRunning ? 'Running' : 'Paused'}
      </div>
    </div>
  );
};

export default Timer;