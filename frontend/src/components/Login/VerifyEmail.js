// src/components/Login/VerifyEmail.js - UPDATED
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import apiService from '../../services/api';
import './VerifyEmail.css';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [status, setStatus] = useState('checking');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState(location.state?.email || '');
  const [userName, setUserName] = useState(location.state?.name || '');
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [verificationData, setVerificationData] = useState(null);
  const [verificationAttempted, setVerificationAttempted] = useState(false);

  // FIRST: Check for token on component mount
  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      console.log('🔐 VerifyEmail: Token found in URL');
      verifyEmailToken(token);
    } else {
      // Check if we have email in state or localStorage
      const storedEmail = location.state?.email || localStorage.getItem('pendingVerificationEmail');
      const storedName = location.state?.name || localStorage.getItem('pendingVerificationName');
      
      if (storedEmail) {
        setEmail(storedEmail);
        if (storedName) setUserName(storedName);
        setStatus('needs_verification');
        setMessage(location.state?.message || 'Please verify your email to continue.');
      } else {
        // No token or email, maybe direct access
        setStatus('needs_verification');
        setMessage('Please enter your email address to resend verification.');
      }
    }
  }, [searchParams, location.state]);

  const verifyEmailToken = async (token) => {
    // Prevent multiple verification attempts
    if (verificationAttempted) {
      console.log('🔐 VerifyEmail: Verification already attempted');
      return;
    }
    
    setVerificationAttempted(true);
    setLoading(true);
    setStatus('verifying');
    
    console.log('🔐 VerifyEmail: Starting verification with token');
    
    try {
      // Try to verify without any auth headers first (since user might not be logged in)
      const response = await apiService.verifyEmail(token);
      
      console.log('🔐 VerifyEmail: API response:', response);
      
      if (response.success) {
        setStatus('success');
        setMessage(response.message || 'Email verified successfully!');
        setVerificationData(response);
        
        // Store user data and token if provided
        if (response.token) {
          localStorage.setItem('token', response.token);
          console.log('🔐 VerifyEmail: Token stored');
        }
        
        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
          console.log('🔐 VerifyEmail: User data stored');
        }
        
        // Clear pending verification data
        localStorage.removeItem('pendingVerificationEmail');
        localStorage.removeItem('pendingVerificationName');
        
        // Redirect after delay
        setTimeout(() => {
          navigate('/dashboard', {
            state: {
              message: 'Email verified successfully! Welcome to Grant Funds.',
              type: 'success'
            },
            replace: true
          });
        }, 3000);
      } else {
        // API returned success: false
        setStatus('error');
        setMessage(response.message || 'Verification failed. The link may be invalid or expired.');
      }
    } catch (error) {
      console.error('🔐 VerifyEmail error:', error);
      
      // More specific error handling
      let errorMessage = 'Failed to verify email. Please try again.';
      
      if (error.message && error.message.includes('Network Error')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message && error.message.includes('expired')) {
        errorMessage = 'Verification link has expired. Please request a new one.';
        setStatus('expired');
      } else if (error.message && error.message.includes('invalid')) {
        errorMessage = 'Invalid verification link. Please request a new one.';
        setStatus('expired');
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setStatus('error');
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email || countdown > 0) {
      setMessage('Please enter a valid email address.');
      return;
    }

    try {
      setLoading(true);
      setMessage('');
      
      // Store email for later use
      localStorage.setItem('pendingVerificationEmail', email);
      if (userName) {
        localStorage.setItem('pendingVerificationName', userName);
      }
      
      console.log('🔐 VerifyEmail: Resending verification to:', email);
      
      const response = await apiService.resendVerificationEmail({ email });
      
      if (response.success) {
        setStatus('resent');
        setMessage('✅ A new verification email has been sent. Please check your inbox.');
        
        // Start countdown (60 seconds)
        setCountdown(60);
        const interval = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setStatus('error');
        setMessage(response.message || 'Failed to resend verification email.');
      }
    } catch (error) {
      console.error('🔐 Resend error:', error);
      setStatus('error');
      
      let errorMessage = 'Failed to resend verification email.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message && error.message.includes('Network Error')) {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (message) setMessage('');
  };

  // Quick verification function for manual testing
  const testVerification = () => {
    const token = prompt('Enter verification token for testing:');
    if (token) {
      verifyEmailToken(token);
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'checking':
      case 'verifying':
        return (
          <div className="verification-status verifying">
            <div className="spinner-container">
              <div className="spinner"></div>
            </div>
            <h2>Verifying Your Email</h2>
            <p>Please wait while we verify your email address...</p>
            <div className="verification-tips">
              <p><i className="fas fa-info-circle"></i> This may take a few moments</p>
            </div>
            {/* Debug button for testing */}
            {process.env.NODE_ENV === 'development' && (
              <button 
                onClick={testVerification}
                className="btn-outline small"
                style={{ marginTop: '10px' }}
              >
                <i className="fas fa-bug"></i> Test Verification
              </button>
            )}
          </div>
        );

      case 'success':
        return (
          <div className="verification-status success">
            <div className="status-icon">
              <i className="fas fa-check-circle"></i>
            </div>
            <h2>Email Verified Successfully!</h2>
            <p className="success-message">{message}</p>
            
            {verificationData?.alreadyVerified ? (
              <p>Your email was already verified. Redirecting to dashboard...</p>
            ) : (
              <div className="welcome-section">
                <p className="welcome-text">Welcome to Grant Funds, {userName || 'there'}! 🎉</p>
                <div className="next-steps">
                  <h3>What's Next?</h3>
                  <ul>
                    <li><i className="fas fa-rocket"></i> Access your dashboard</li>
                    <li><i className="fas fa-user-check"></i> Complete your profile</li>
                    <li><i className="fas fa-file-alt"></i> Start your first grant application</li>
                  </ul>
                </div>
              </div>
            )}
            
            <div className="redirect-countdown">
              <p>Redirecting to dashboard in 3 seconds...</p>
              <div className="progress-bar">
                <div className="progress-fill"></div>
              </div>
            </div>
            
            <button 
              onClick={() => navigate('/dashboard', { replace: true })}
              className="btn-primary"
            >
              <i className="fas fa-arrow-right"></i>
              Go to Dashboard Now
            </button>
          </div>
        );

      case 'error':
      case 'expired':
        return (
          <div className="verification-status error">
            <div className="status-icon">
              <i className="fas fa-exclamation-circle"></i>
            </div>
            <h2>Verification Failed</h2>
            <p className="error-message">{message}</p>
            
            <div className="resend-section">
              <h3>Get a New Verification Link</h3>
              <p>Enter your email address to receive a new verification link:</p>
              
              <div className="email-input-group">
                <div className="input-with-icon">
                  <i className="fas fa-envelope"></i>
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={handleEmailChange}
                    className="email-input"
                    autoFocus
                  />
                </div>
                
                <button
                  onClick={handleResendVerification}
                  disabled={!email || loading || countdown > 0}
                  className="btn-secondary"
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Sending...
                    </>
                  ) : countdown > 0 ? (
                    <>
                      <i className="fas fa-clock"></i>
                      Resend in {countdown}s
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane"></i>
                      Send New Verification Email
                    </>
                  )}
                </button>
              </div>
              
              <div className="verification-tips">
                <h4><i className="fas fa-lightbulb"></i> Tips:</h4>
                <ul>
                  <li>Check your spam or junk folder</li>
                  <li>Make sure you entered the correct email</li>
                  <li>Verification links expire after 24 hours</li>
                  <li>Contact support if you continue to have issues</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case 'resent':
        return (
          <div className="verification-status info">
            <div className="status-icon">
              <i className="fas fa-paper-plane"></i>
            </div>
            <h2>Verification Email Sent</h2>
            <p>{message}</p>
            
            <div className="email-instructions">
              <div className="instruction-step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h4>Check Your Inbox</h4>
                  <p>Look for an email from Grant Funds</p>
                </div>
              </div>
              
              <div className="instruction-step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h4>Click the Link</h4>
                  <p>Click the verification link in the email</p>
                </div>
              </div>
              
              <div className="instruction-step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h4>Complete Verification</h4>
                  <p>You'll be redirected back to complete setup</p>
                </div>
              </div>
            </div>
            
            <div className="action-buttons">
              <button
                onClick={() => navigate('/login', { replace: true })}
                className="btn-outline"
              >
                <i className="fas fa-sign-in-alt"></i>
                Return to Login
              </button>
              
              {countdown === 0 && (
                <button
                  onClick={() => setStatus('needs_verification')}
                  className="btn-link"
                >
                  Need to resend again?
                </button>
              )}
            </div>
          </div>
        );

      case 'needs_verification':
      default:
        return (
          <div className="verification-status default">
            <div className="status-icon">
              <i className="fas fa-envelope-open-text"></i>
            </div>
            <h2>Email Verification Required</h2>
            <p>Please verify your email address to access your account.</p>
            
            <div className="resend-section">
              <h3>Resend Verification Email</h3>
              <p>Enter the email address you used to register:</p>
              
              <div className="email-input-group">
                <div className="input-with-icon">
                  <i className="fas fa-envelope"></i>
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={handleEmailChange}
                    className="email-input"
                    autoFocus
                  />
                </div>
                
                <button
                  onClick={handleResendVerification}
                  disabled={!email || loading || countdown > 0}
                  className="btn-primary"
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Sending...
                    </>
                  ) : countdown > 0 ? (
                    <>
                      <i className="fas fa-clock"></i>
                      Resend in {countdown}s
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane"></i>
                      Send Verification Email
                    </>
                  )}
                </button>
              </div>
              
              <div className="verification-help">
                <details>
                  <summary><i className="fas fa-question-circle"></i> Need help?</summary>
                  <div className="help-content">
                    <p><strong>Didn't receive the email?</strong></p>
                    <ul>
                      <li>Check your spam or junk folder</li>
                      <li>Make sure you entered the correct email address</li>
                      <li>Wait a few minutes - emails can sometimes be delayed</li>
                      <li>Add noreply@grantfunds.com to your safe senders list</li>
                    </ul>
                    <p><strong>Still having issues?</strong></p>
                    <p>
                      Contact our support team at{' '}
                      <a href="mailto:support@grantfunds.com">support@grantfunds.com</a>
                    </p>
                  </div>
                </details>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="verify-email-container">
      <div className="verify-email-card">
        <div className="verify-email-header">
          <div className="header-logo">
            <i className="fas fa-hand-holding-usd"></i>
            <span>Grant Funds</span>
          </div>
          <h1>Email Verification</h1>
          <p>Secure your Grant Funds account</p>
          <div className="debug-info">
            {searchParams.get('token') && (
              <small>Token detected in URL</small>
            )}
          </div>
        </div>
        
        <div className="verify-email-content">
          {renderContent()}
        </div>

        <div className="verify-email-footer">
          <div className="footer-links">
            <button
              onClick={() => navigate('/login', { replace: true })}
              className="footer-link"
            >
              <i className="fas fa-arrow-left"></i>
              Back to Login
            </button>
            
            <button
              onClick={() => navigate('/register', { replace: true })}
              className="footer-link"
            >
              <i className="fas fa-user-plus"></i>
              Create Account
            </button>
          </div>
          
          <div className="security-notice">
            <i className="fas fa-shield-alt"></i>
            <span>Your security is important to us. We never share your information.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;