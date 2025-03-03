import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);
  
  // Check if user prefers dark mode or has set it previously
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark-theme');
    }
  }, []);
  
  // Toggle theme
  const toggleTheme = () => {
    setDarkMode(!darkMode);
    
    if (!darkMode) {
      document.documentElement.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
    }
  };
  
  // Updated theme colors with deeper purple and softer sand
  const theme = {
    primary: darkMode ? '#5D4C46' : '#91818A', // Deeper purple
    secondary: darkMode ? '#8B6D9C' : '#C3BAAA', // Softer secondary color
    background: darkMode ? '#2C2C2C' : '#F5E6D3', // Warmer sand background
    secondaryBackground: darkMode ? '#3D3D3D' : '#F0DCC7', // Lighter sand secondary background
    text: darkMode ? '#EBDCCB' : '#2C2C2C', // Soft text colors
    textSecondary: darkMode ? '#C3BAAA' : '#5D4C46' // Complementary text color
  };
  
  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};