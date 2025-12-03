// src/components/Login/Register.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
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
  const [messageType, setMessageType] = useState(''); // 'success', 'error', 'info'
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
    setMessageType('');

    // Client-side validation
    if (!formData.name.trim()) {
      setMessage('Please enter your full name.');
      setMessageType('error');
      return;
    }
    
    if (!formData.email.trim()) {
      setMessage('Please enter your email address.');
      setMessageType('error');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setMessage('Please enter a valid email address.');
      setMessageType('error');
      return;
    }
    
    if (formData.password.length < 6) {
      setMessage('Password must be at least 6 characters.');
      setMessageType('error');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setMessage('Passwords do not match.');
      setMessageType('error');
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password
      });

      if (response.success) {
        setMessage(response.message || '✅ Registration successful! Please check your email to verify your account.');
        setMessageType('success');
        
        // Store the user data temporarily for verification page
        const tempUserData = {
          email: formData.email.trim(),
          name: formData.name.trim()
        };
        
        // Clear form
        setFormData({ 
          name: '', 
          email: '', 
          password: '', 
          confirmPassword: '' 
        });

        // Navigate to verification page with user data
        setTimeout(() => {
          navigate('/verify-email', { 
            state: { 
              email: formData.email.trim(),
              name: formData.name.trim(),
              message: response.message || 'Registration successful! Please verify your email.',
              fromRegister: true
            }
          });
        }, 2000);
        
      } else {
        setMessage(response.message || 'Registration failed. Please try again.');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      let errorMessage = 'An unexpected error occurred. Please try again later.';
      
      if (error.response) {
        // Handle specific error cases
        if (error.response.status === 400) {
          if (error.response.data.message?.includes('already exists')) {
            const email = formData.email.trim();
            errorMessage = `An account with ${email} already exists.`;
            
            // Check if the email is verified
            try {
              const statusResponse = await apiService.checkRegistrationStatus(email);
              if (statusResponse.exists && !statusResponse.emailVerified) {
                errorMessage = `An account with ${email} exists but is not verified. Would you like to resend the verification email?`;
                setMessageType('warning');
              }
            } catch (statusError) {
              // Ignore status check error
            }
          } else {
            errorMessage = error.response.data.message || 'Invalid registration data. Please check your information.';
          }
        } else if (error.response.status === 409) {
          errorMessage = 'An account with this email already exists. Please use a different email or login.';
        } else if (error.response.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        }
      } else if (error.message.includes('Network Error') || error.message.includes('Failed to fetch')) {
        errorMessage = 'Unable to connect to the server. Please check your internet connection.';
      }
      
      setMessage(errorMessage);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setFormData({
      name: 'Demo User',
      email: 'demo@grantfunds.com',
      password: 'demo123',
      confirmPassword: 'demo123'
    });
    setMessage('Demo credentials loaded. Demo accounts are auto-approved and ready to use!');
    setMessageType('info');
  };

  const handleResendVerification = async () => {
    if (!formData.email.trim()) {
      setMessage('Please enter your email address first.');
      setMessageType('error');
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.resendVerificationEmail({ email: formData.email.trim() });
      
      if (response.success) {
        setMessage('✅ A new verification email has been sent to your inbox. Please check your email.');
        setMessageType('success');
      } else {
        setMessage(response.message || 'Failed to resend verification email.');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      setMessage(error.message || 'Failed to resend verification email. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    navigate('/login', { state: { email: formData.email.trim() } });
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
              <span>Quick Demo Access</span>
            </div>
            <div className="demo-info">
              <p>Try our platform instantly with a demo account:</p>
              <ul>
                <li>✅ No email verification required</li>
                <li>✅ Auto-approved access</li>
                <li>✅ Sample data included</li>
                <li>✅ Full platform features</li>
              </ul>
            </div>
            <div className="demo-buttons">
              <button 
                type="button" 
                className="demo-btn"
                onClick={fillDemoCredentials}
              >
                <i className="fas fa-user-plus"></i>
                Load Demo Credentials
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
                disabled={loading}
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
                disabled={loading}
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
                disabled={loading}
              />
              <div className="password-hint">
                Must be at least 6 characters long
              </div>
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
                disabled={loading}
              />
            </div>

            {/* Message Display */}
            {message && (
              <div className={`message ${messageType}`}>
                <div className="message-content">
                  <i className={`fas ${
                    messageType === 'success' ? 'fa-check-circle' :
                    messageType === 'error' ? 'fa-exclamation-circle' :
                    messageType === 'warning' ? 'fa-exclamation-triangle' :
                    'fa-info-circle'
                  }`}></i>
                  <span>{message}</span>
                </div>
                
                {/* Show resend verification button for unverified accounts */}
                {messageType === 'warning' && message.includes('resend') && (
                  <button
                    type="button"
                    className="resend-verification-btn"
                    onClick={handleResendVerification}
                    disabled={loading}
                  >
                    <i className="fas fa-paper-plane"></i>
                    Resend Verification Email
                  </button>
                )}
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
              <p className="verification-info">
                <i className="fas fa-envelope-open-text"></i>
                You'll receive a verification email after registration
              </p>
              
              <div className="login-redirect">
                <p>
                  Already have an account?{' '}
                  <button 
                    type="button" 
                    className="link-btn"
                    onClick={handleLoginRedirect}
                    disabled={loading}
                  >
                    <i className="fas fa-sign-in-alt"></i>
                    Sign in here
                  </button>
                </p>
              </div>
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
          <h2>Start Your Grant Journey Today</h2>
          <div className="accent-line"></div>
          
          <div className="benefits">
            <div className="benefit-item">
              <div className="benefit-icon">
                <i className="fas fa-robot"></i>
              </div>
              <div className="benefit-text">
                <h3>AI-Powered Writing</h3>
                <p>Generate professional grant proposals with AI assistance</p>
              </div>
            </div>
            
            <div className="benefit-item">
              <div className="benefit-icon">
                <i className="fas fa-search-dollar"></i>
              </div>
              <div className="benefit-text">
                <h3>Smart Grant Matching</h3>
                <p>Find funding opportunities that match your organization</p>
              </div>
            </div>
            
            <div className="benefit-item">
              <div className="benefit-icon">
                <i className="fas fa-file-contract"></i>
              </div>
              <div className="benefit-text">
                <h3>Document Management</h3>
                <p>Store and organize all your grant documents securely</p>
              </div>
            </div>
            
            <div className="benefit-item">
              <div className="benefit-icon">
                <i className="fas fa-chart-line"></i>
              </div>
              <div className="benefit-text">
                <h3>Progress Tracking</h3>
                <p>Monitor your grant applications and submissions</p>
              </div>
            </div>
          </div>

          <div className="verification-process">
            <h3><i className="fas fa-shield-alt"></i> Account Security</h3>
            <div className="process-steps">
              <div className="step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h4>Register</h4>
                  <p>Create your account with basic information</p>
                </div>
              </div>
              
              <div className="step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h4>Verify Email</h4>
                  <p>Check your inbox and click the verification link</p>
                </div>
              </div>
              
              <div className="step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h4>Account Review</h4>
                  <p>Your account will be reviewed for approval (typically within 24 hours)</p>
                </div>
              </div>
            </div>
          </div>

          <div className="approval-note">
            <i className="fas fa-clock"></i>
            <p>
              <strong>Note:</strong> Regular accounts require email verification and admin approval. 
              Demo accounts are instantly available.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;