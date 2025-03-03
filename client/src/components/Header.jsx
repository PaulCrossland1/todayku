import React, { useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ThemeContext } from '../contexts/ThemeContext';
import useAuth from '../hooks/useAuth';
import '../styles/Header.css';

const Header = () => {
  const { theme, toggleTheme, darkMode } = useContext(ThemeContext);
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  return (
    <header 
      className="app-header"
      style={{ 
        backgroundColor: theme.secondary,
        color: theme.text
      }}
    >
      <div className="header-container">
        <div className="logo">
          <Link to="/" className="logo-link" style={{ color: theme.primary }}>
            <span className="logo-text">todayku</span>
          </Link>
        </div>
        
        <nav className={`main-nav ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <ul className="nav-list">
            <li className={location.pathname === '/' ? 'active' : ''}>
              <Link to="/" style={{ color: theme.text }}>Play</Link>
            </li>
            <li className={location.pathname === '/leaderboard' ? 'active' : ''}>
              <Link to="/leaderboard" style={{ color: theme.text }}>Leaderboard</Link>
            </li>
            {isAuthenticated && (
              <li className={location.pathname === '/profile' ? 'active' : ''}>
                <Link to="/profile" style={{ color: theme.text }}>Profile</Link>
              </li>
            )}
          </ul>
        </nav>
        
        <div className="header-controls">
          <button 
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: theme.text }}>
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: theme.text }}>
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            )}
          </button>
          
          <div className="auth-controls">
            {isAuthenticated ? (
              <div className="user-menu">
                <span className="username">{user?.name}</span>
                <button 
                  className="logout-button"
                  onClick={logout}
                  style={{ 
                    backgroundColor: theme.primary,
                    color: '#fff'
                  }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="auth-buttons">
                <Link 
                  to="/login"
                  className="login-button"
                  style={{ 
                    backgroundColor: 'transparent',
                    color: theme.text,
                    border: `1px solid ${theme.text}`
                  }}
                >
                  Login
                </Link>
                <Link 
                  to="/register"
                  className="register-button"
                  style={{ 
                    backgroundColor: theme.primary,
                    color: '#fff'
                  }}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
          
          <button 
            className="mobile-menu-toggle"
            onClick={toggleMobileMenu}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            <span className="burger-line" style={{ backgroundColor: theme.text }}></span>
            <span className="burger-line" style={{ backgroundColor: theme.text }}></span>
            <span className="burger-line" style={{ backgroundColor: theme.text }}></span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;