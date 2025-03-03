import React, { useState, useEffect, useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import '../styles/NextPuzzleCountdown.css';

const NextPuzzleCountdown = () => {
  const { theme } = useContext(ThemeContext);
  const [timeRemaining, setTimeRemaining] = useState('');
  
  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const diff = tomorrow - now;
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      return {
        hours: hours.toString().padStart(2, '0'),
        minutes: minutes.toString().padStart(2, '0'),
        seconds: seconds.toString().padStart(2, '0')
      };
    };
    
    const updateCountdown = () => {
      const { hours, minutes, seconds } = calculateTimeRemaining();
      setTimeRemaining(`${hours}:${minutes}:${seconds}`);
    };
    
    // Update immediately and then every second
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div 
      className="next-puzzle-countdown"
      style={{ 
        backgroundColor: theme.secondary,
        color: theme.text
      }}
    >
      <div className="countdown-label">
        Next Puzzle In
      </div>
      <div className="countdown-time">
        {timeRemaining}
      </div>
    </div>
  );
};

export default NextPuzzleCountdown;