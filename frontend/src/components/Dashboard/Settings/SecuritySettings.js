import React, { useState } from 'react';

const SecuritySettings = ({ security, onUpdate }) => {
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);

  const handleTwoFactorToggle = () => {
    if (!security.twoFactorEnabled) {
      setShowTwoFactorSetup(true);
    } else {
      onUpdate({ twoFactorEnabled: false });
    }
  };

  const handleTwoFactorSetup = () => {
    if (twoFactorCode) {
      onUpdate({ twoFactorEnabled: true });
      setShowTwoFactorSetup(false);
      setTwoFactorCode('');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="settings-section">
      <div className="section-header">
        <h2 className="section-title">Security Settings</h2>
      </div>

      {/* Two-Factor Authentication */}
      <div className="security-section">
        <div className="security-item">
          <div className="security-info">
            <h4>Two-Factor Authentication</h4>
            <p>Add an extra layer of security to your account</p>
          </div>
          <div className="security-action">
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={security.twoFactorEnabled}
                onChange={handleTwoFactorToggle}
                className="toggle-input"
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        {showTwoFactorSetup && (
          <div className="two-factor-setup">
            <h5>Set up Two-Factor Authentication</h5>
            <p>Scan the QR code with your authenticator app and enter the code below:</p>
            <div className="qr-placeholder">
              <div className="qr-code">
                <i className="fas fa-qrcode"></i>
                <span>QR Code Placeholder</span>
              </div>
            </div>
            <div className="verification-code">
              <input
                type="text"
                placeholder="Enter 6-digit code"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value)}
                className="form-input"
                maxLength={6}
              />
              <button 
                className="btn btn-primary"
                onClick={handleTwoFactorSetup}
                disabled={twoFactorCode.length !== 6}
              >
                Verify & Enable
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Login History */}
      <div className="security-section">
        <h4>Recent Login Activity</h4>
        <div className="login-history">
          {security.loginHistory.map((login, index) => (
            <div key={index} className="login-item">
              <div className="login-info">
                <div className="login-device">{login.device}</div>
                <div className="login-location">{login.location}</div>
                <div className="login-time">{formatDate(login.date)}</div>
              </div>
              <div className="login-status">
                <span className="status-success">Successful</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trusted Devices */}
      <div className="security-section">
        <h4>Trusted Devices</h4>
        <div className="trusted-devices">
          {security.trustedDevices.map((device, index) => (
            <div key={index} className="device-item">
              <div className="device-info">
                <div className="device-name">{device.name}</div>
                <div className="device-last-used">
                  Last used: {formatDate(device.lastUsed)}
                </div>
              </div>
              <button className="btn btn-outline btn-sm">
                Revoke
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Password Change */}
      <div className="security-section">
        <h4>Change Password</h4>
        <div className="password-change">
          <div className="form-group">
            <label className="form-label">Current Password</label>
            <input type="password" className="form-input" />
          </div>
          <div className="form-group">
            <label className="form-label">New Password</label>
            <input type="password" className="form-input" />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <input type="password" className="form-input" />
          </div>
          <button className="btn btn-primary">Update Password</button>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;