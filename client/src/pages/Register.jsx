import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ThemeContext } from '../contexts/ThemeContext';
import useAuth from '../hooks/useAuth';
import '../styles/Auth.css';

const Register = () => {
  const { theme } = useContext(ThemeContext);
  const { register, isAuthenticated, error } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
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
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setFormError('All fields are required');
      setLoading(false);
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match');
      setLoading(false);
      return;
    }
    
    if (formData.password.length < 6) {
      setFormError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }
    
    const success = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password
    });
    
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
        <h1 className="auth-title">Register</h1>
        
        {formError && (
          <div className="auth-error" style={{ color: 'red' }}>
            {formError}
          </div>
        )}
        
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your name"
              style={{ 
                backgroundColor: theme.background,
                color: theme.text,
                borderColor: theme.text + '40'
              }}
            />
          </div>
          
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
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
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
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link 
              to="/login"
              style={{ color: theme.primary }}
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;