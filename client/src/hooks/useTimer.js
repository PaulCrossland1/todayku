import { useState, useRef, useCallback } from 'react';

export default function useTimer() {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef(null);
  const startTimeRef = useRef(0);
  
  // Start the timer
  const startTimer = useCallback(() => {
    if (isRunning) return;
    
    setIsRunning(true);
    startTimeRef.current = Date.now() - time;
    
    timerRef.current = setInterval(() => {
      setTime(Date.now() - startTimeRef.current);
    }, 10); // Update every 10ms for smooth display
  }, [isRunning, time]);
  
  // Pause the timer
  const pauseTimer = useCallback(() => {
    if (!isRunning) return;
    
    clearInterval(timerRef.current);
    setIsRunning(false);
  }, [isRunning]);
  
  // Reset the timer
  const resetTimer = useCallback(() => {
    clearInterval(timerRef.current);
    setIsRunning(false);
    setTime(0);
  }, []);
  
  // Format time for display (MM:SS.ms)
  const formatTime = useCallback(() => {
    const milliseconds = Math.floor((time % 1000) / 10);
    const seconds = Math.floor((time / 1000) % 60);
    const minutes = Math.floor((time / (1000 * 60)) % 60);
    const hours = Math.floor(time / (1000 * 60 * 60));
    
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = seconds.toString().padStart(2, '0');
    const formattedMilliseconds = milliseconds.toString().padStart(2, '0');
    
    if (hours > 0) {
      const formattedHours = hours.toString().padStart(2, '0');
      return `${formattedHours}:${formattedMinutes}:${formattedSeconds}.${formattedMilliseconds}`;
    }
    
    return `${formattedMinutes}:${formattedSeconds}.${formattedMilliseconds}`;
  }, [time]);
  
  return {
    time,
    isRunning,
    startTimer,
    pauseTimer,
    resetTimer,
    formatTime
  };
}