// frontend/src/components/Login/PendingApproval.js
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './PendingApproval.css';

const PendingApproval = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { email, name } = location.state || {};

  return (
    <div className="pending-approval-container">
      <div className="pending-approval-card">
        <div className="pending-header">
          <div className="status-icon">
            <i className="fas fa-clock"></i>
          </div>
          <h1>Account Pending Approval</h1>
          <p>Your account is being reviewed by our team</p>
        </div>
        
        <div className="pending-content">
          <p>Hello {name || 'there'},</p>
          <p>Thank you for registering with Grant Funds! Your account is currently pending approval.</p>
          
          <div className="approval-info">
            <h3><i className="fas fa-info-circle"></i> What happens next?</h3>
            <ul>
              <li>Our team will review your account (typically within 24 hours)</li>
              <li>You'll receive an email when your account is approved</li>
              <li>Once approved, you can log in and access all features</li>
            </ul>
          </div>
          
          <div className="contact-info">
            <p><strong>Need help?</strong></p>
            <p>Contact our support team at <a href="mailto:support@grantfunds.com">support@grantfunds.com</a></p>
          </div>
        </div>
        
        <div className="pending-footer">
          <button onClick={() => navigate('/login')} className="btn-primary">
            Return to Login
          </button>
          <p className="footer-note">
            <i className="fas fa-envelope"></i>
            Check {email || 'your email'} for updates
          </p>
        </div>
      </div>
    </div>
  );
};

export default PendingApproval;