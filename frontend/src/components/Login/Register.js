// src/components/Login/Register.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    // Client-side validation
    if (!formData.name.trim()) {
      setMessage('Please enter your full name.');
      return;
    }
    if (formData.password.length < 6) {
      setMessage('Password must be at least 6 characters.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password
      });

      if (response.data.success) {
        setMessage('✅ Registration successful! Please check your email for next steps.');
        // Clear form
        setFormData({ name: '', email: '', password: '', confirmPassword: '' });
        // Redirect to login after 2.5 seconds
        setTimeout(() => navigate('/login'), 2500);
      } else {
        setMessage(response.data.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setMessage(
        error.response?.data?.message ||
        'An unexpected error occurred. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setFormData({
      name: 'Demo User',
      email: 'demo+' + Date.now() + '@grantfunds.com',
      password: 'demo123',
      confirmPassword: 'demo123'
    });
  };

  return (
    <div className="register-container">
      {/* Left Side - Registration Form */}
      <div className="register-form-section">
        <div className="register-form-container">
          <div className="register-header">
            <div className="logo">
              <i className="fas fa-hand-holding-usd"></i>
              <span className="logo-text">Grant Funds</span>
            </div>
            <h1>Create Your Account</h1>
            <p>Start your journey to secure grant funding</p>
          </div>

          {/* Demo Access */}
          <div className="demo-credentials">
            <div className="demo-header">
              <i className="fas fa-key"></i>
              <span>Demo Registration</span>
            </div>
            <div className="demo-buttons">
              <button 
                type="button" 
                className="demo-btn"
                onClick={fillDemoCredentials}
              >
                <i className="fas fa-user-plus"></i>
                Generate Demo Account
              </button>
            </div>
          </div>

          <form className="register-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">
                <i className="fas fa-user"></i>
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="form-control"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">
                <i className="fas fa-envelope"></i>
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-control"
                placeholder="you@organization.org"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">
                <i className="fas fa-lock"></i>
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className="form-control"
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">
                <i className="fas fa-lock"></i>
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                className="form-control"
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            {message && (
              <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
                <i className={`fas ${message.includes('✅') ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
                {message}
              </div>
            )}

            <button 
              type="submit" 
              className="register-btn" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Creating Account...
                </>
              ) : (
                <>
                  <i className="fas fa-user-plus"></i>
                  Create Account
                </>
              )}
            </button>

            <div className="register-footer">
              <p>
                Already have an account?{' '}
                <button 
                  type="button" 
                  className="link-btn"
                  onClick={() => navigate('/login')}
                >
                  Sign in here
                </button>
              </p>
            </div>
          </form>
        </div>

        <div className="watermark">
          Tool Made with <span className="heart">❤️</span> by NeonByteAI
        </div>
      </div>

      {/* Right Side - Value Proposition */}
      <div className="value-section">
        <div className="value-content">
          <h2>Why Register?</h2>
          <div className="accent-line"></div>
          
          <div className="benefits">
            <div className="benefit-item">
              <div className="benefit-icon">
                <i className="fas fa-robot"></i>
              </div>
              <div className="benefit-text">
                <h3>AI Grant Writer</h3>
                <p>Generate compelling proposals in minutes</p>
              </div>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">
                <i className="fas fa-bolt"></i>
              </div>
              <div className="benefit-text">
                <h3>Smart Matching</h3>
                <p>Find grants aligned with your mission</p>
              </div>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">
                <i className="fas fa-users"></i>
              </div>
              <div className="benefit-text">
                <h3>Secure & Private</h3>
                <p>Your data belongs only to you</p>
              </div>
            </div>
          </div>

          <div className="approval-note">
            <i className="fas fa-shield-alt"></i>
            <p>All accounts are manually reviewed for security and quality.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;