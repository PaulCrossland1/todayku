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
  
  // Theme colors based on mode
  const theme = {
    primary: darkMode ? '#EBDCCB' : '#91818A',
    secondary: darkMode ? '#B2A3B5' : '#C3BAAA',
    background: darkMode ? '#2C2C2C' : '#EBDCCB',
    secondaryBackground: darkMode ? '#3D3D3D' : '#F5F5F5',
    text: darkMode ? '#EBDCCB' : '#91818A',
    textSecondary: darkMode ? '#C3BAAA' : '#B2A3B5'
  };
  
  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};