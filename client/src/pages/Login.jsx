import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ThemeContext } from '../contexts/ThemeContext';
import useAuth from '../hooks/useAuth';
import '../styles/Auth.css';

const Login = () => {
  const { theme } = useContext(ThemeContext);
  const { login, isAuthenticated, error } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);
  
  // Update form error when auth error changes
  useEffect(() => {
    setFormError(error);
  }, [error]);
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setLoading(true);
    
    // Validate form
    if (!formData.email || !formData.password) {
      setFormError('All fields are required');
      setLoading(false);
      return;
    }
    
    const success = await login(formData);
    
    if (success) {
      navigate('/');
    }
    
    setLoading(false);
  };
  
  return (
    <div className="auth-container">
      <div 
        className="auth-form-container"
        style={{ 
          backgroundColor: theme.secondaryBackground,
          color: theme.text,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}
      >
        <h1 className="auth-title">Login</h1>
        
        {formError && (
          <div className="auth-error" style={{ color: 'red' }}>
            {formError}
          </div>
        )}
        
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your.email@example.com"
              style={{ 
                backgroundColor: theme.background,
                color: theme.text,
                borderColor: theme.text + '40'
              }}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Your password"
              style={{ 
                backgroundColor: theme.background,
                color: theme.text,
                borderColor: theme.text + '40'
              }}
            />
          </div>
          
          <button 
            type="submit"
            className="auth-submit-button"
            disabled={loading}
            style={{ 
              backgroundColor: theme.primary,
              color: '#fff'
            }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <Link 
              to="/register"
              style={{ color: theme.primary }}
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;