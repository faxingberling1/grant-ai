import React, { useState, useEffect } from 'react';
import emailService from '../../../services/emailService';
import './SMTPSettings.css';

const SMTPSettings = ({ smtpSettings, onUpdate }) => {
  const [smtpConfig, setSmtpConfig] = useState({
    host: '',
    port: 587,
    secure: false,
    user: '',
    pass: '',
    from: '',
    enabled: false
  });
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [saving, setSaving] = useState(false);

  // Load settings when component mounts or when props change
  useEffect(() => {
    if (smtpSettings) {
      setSmtpConfig(prev => ({
        ...prev,
        ...smtpSettings
      }));
    }
  }, [smtpSettings]);

  const handleInputChange = (field, value) => {
    setSmtpConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const testSMTP = async () => {
    setTesting(true);
    setTestResult(null);
    
    try {
      // Try real API first, fall back to mock if it fails
      let result;
      try {
        result = await emailService.testSMTP(smtpConfig);
      } catch (apiError) {
        console.log('API test failed, using mock:', apiError.message);
        result = await emailService.mockTestSMTP(smtpConfig);
      }
      
      setTestResult({
        success: true,
        message: result.message
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: error.message
      });
    } finally {
      setTesting(false);
    }
  };

  const saveSMTP = async () => {
    setSaving(true);
    
    try {
      // Call parent update function
      await onUpdate(smtpConfig);
      
      setTestResult({
        success: true,
        message: 'SMTP configuration saved successfully!'
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Failed to save SMTP configuration: ' + error.message
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleSMTP = () => {
    const updatedConfig = {
      ...smtpConfig,
      enabled: !smtpConfig.enabled
    };
    setSmtpConfig(updatedConfig);
    onUpdate(updatedConfig);
  };

  const loadPreset = (preset) => {
    const presets = {
      gmail: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
      },
      outlook: {
        host: 'smtp.office365.com',
        port: 587,
        secure: false,
      },
      sendgrid: {
        host: 'smtp.sendgrid.net',
        port: 587,
        secure: false,
      },
      mailgun: {
        host: 'smtp.mailgun.org',
        port: 587,
        secure: false,
      }
    };
    
    setSmtpConfig(prev => ({
      ...prev,
      ...presets[preset]
    }));
  };

  return (
    <div className="smtp-settings">
      <div className="smtp-header">
        <div className="smtp-header-main">
          <h2>Email Settings</h2>
          <p>Configure SMTP settings to enable email functionality</p>
          <div className="smtp-demo-notice">
            <i className="fas fa-info-circle"></i>
            <span>Demo Mode: Using mock email service. Configure real SMTP when backend is ready.</span>
          </div>
        </div>
        <div className="smtp-toggle">
          <label className="smtp-toggle-switch">
            <input
              type="checkbox"
              checked={smtpConfig.enabled}
              onChange={toggleSMTP}
              className="smtp-toggle-input"
            />
            <span className="smtp-toggle-slider"></span>
          </label>
          <span className="smtp-toggle-label">
            {smtpConfig.enabled ? 'Email Enabled' : 'Email Disabled'}
          </span>
        </div>
      </div>

      {smtpConfig.enabled && (
        <>
          <div className="smtp-presets">
            <h4>Quick Setup Presets</h4>
            <div className="smtp-preset-buttons">
              <button onClick={() => loadPreset('gmail')} className="smtp-preset-btn smtp-preset-gmail">
                <i className="fab fa-google"></i>
                Gmail
              </button>
              <button onClick={() => loadPreset('outlook')} className="smtp-preset-btn smtp-preset-outlook">
                <i className="fab fa-microsoft"></i>
                Outlook
              </button>
              <button onClick={() => loadPreset('sendgrid')} className="smtp-preset-btn smtp-preset-sendgrid">
                <i className="fas fa-cloud"></i>
                SendGrid
              </button>
              <button onClick={() => loadPreset('mailgun')} className="smtp-preset-btn smtp-preset-mailgun">
                <i className="fas fa-envelope"></i>
                Mailgun
              </button>
            </div>
          </div>

          <div className="smtp-form">
            <div className="smtp-form-grid">
              <div className="smtp-form-group">
                <label className="smtp-form-label">SMTP Host *</label>
                <input
                  type="text"
                  value={smtpConfig.host}
                  onChange={(e) => handleInputChange('host', e.target.value)}
                  placeholder="smtp.gmail.com"
                  className="smtp-form-input"
                />
              </div>

              <div className="smtp-form-group">
                <label className="smtp-form-label">Port *</label>
                <input
                  type="number"
                  value={smtpConfig.port}
                  onChange={(e) => handleInputChange('port', parseInt(e.target.value) || 587)}
                  placeholder="587"
                  className="smtp-form-input"
                />
              </div>

              <div className="smtp-form-group">
                <label className="smtp-form-label">Email/Username *</label>
                <input
                  type="email"
                  value={smtpConfig.user}
                  onChange={(e) => handleInputChange('user', e.target.value)}
                  placeholder="your-email@gmail.com"
                  className="smtp-form-input"
                />
              </div>

              <div className="smtp-form-group">
                <label className="smtp-form-label">Password/App Password *</label>
                <input
                  type="password"
                  value={smtpConfig.pass}
                  onChange={(e) => handleInputChange('pass', e.target.value)}
                  placeholder="Your email password or app password"
                  className="smtp-form-input"
                />
              </div>

              <div className="smtp-form-group smtp-form-full-width">
                <label className="smtp-form-label">From Address</label>
                <input
                  type="text"
                  value={smtpConfig.from}
                  onChange={(e) => handleInputChange('from', e.target.value)}
                  placeholder="GrantFlow CRM <noreply@yourdomain.com>"
                  className="smtp-form-input"
                />
                <small className="smtp-form-small">Leave empty to use your email address as the sender</small>
              </div>

              <div className="smtp-form-group">
                <label className="smtp-checkbox-label">
                  <input
                    type="checkbox"
                    checked={smtpConfig.secure}
                    onChange={(e) => handleInputChange('secure', e.target.checked)}
                    className="smtp-checkbox-input"
                  />
                  <span className="smtp-checkmark"></span>
                  Use SSL/TLS
                </label>
              </div>
            </div>

            {testResult && (
              <div className={`smtp-test-result ${testResult.success ? 'smtp-test-success' : 'smtp-test-error'}`}>
                <i className={`fas ${testResult.success ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
                {testResult.message}
                {testResult.success && (
                  <div className="smtp-demo-indicator">
                    <small>(Demo Mode - Mock Test)</small>
                  </div>
                )}
              </div>
            )}

            <div className="smtp-actions">
              <button 
                onClick={testSMTP} 
                disabled={testing || !smtpConfig.host || !smtpConfig.user || !smtpConfig.pass}
                className="smtp-btn-test"
              >
                {testing ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Testing Connection...
                  </>
                ) : (
                  <>
                    <i className="fas fa-bolt"></i>
                    Test SMTP Connection
                  </>
                )}
              </button>

              <button 
                onClick={saveSMTP} 
                disabled={saving || !smtpConfig.host || !smtpConfig.user || !smtpConfig.pass}
                className="smtp-btn-save"
              >
                {saving ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save"></i>
                    Save Configuration
                  </>
                )}
              </button>

              <button 
                onClick={() => setSmtpConfig({
                  host: '',
                  port: 587,
                  secure: false,
                  user: '',
                  pass: '',
                  from: '',
                  enabled: true
                })}
                className="smtp-btn-reset"
              >
                <i className="fas fa-undo"></i>
                Reset
              </button>
            </div>
          </div>

          <div className="smtp-help">
            <h4>Setup Instructions</h4>
            <div className="smtp-help-content">
              <div className="smtp-help-item">
                <strong>Gmail:</strong>
                <ul>
                  <li>Use "smtp.gmail.com" as host</li>
                  <li>Port: 587</li>
                  <li>Enable 2-factor authentication</li>
                  <li>Generate an App Password instead of using your regular password</li>
                </ul>
              </div>
              
              <div className="smtp-help-item">
                <strong>Outlook/Office 365:</strong>
                <ul>
                  <li>Use "smtp.office365.com" as host</li>
                  <li>Port: 587</li>
                  <li>Use your email password</li>
                </ul>
              </div>
              
              <div className="smtp-help-item">
                <strong>SendGrid:</strong>
                <ul>
                  <li>Use "smtp.sendgrid.net" as host</li>
                  <li>Port: 587</li>
                  <li>Username: "apikey"</li>
                  <li>Password: Your SendGrid API Key</li>
                </ul>
              </div>

              <div className="smtp-help-item">
                <strong>Mailgun:</strong>
                <ul>
                  <li>Use "smtp.mailgun.org" as host</li>
                  <li>Port: 587</li>
                  <li>Username: Your Mailgun domain username</li>
                  <li>Password: Your Mailgun API Key</li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}

      {!smtpConfig.enabled && (
        <div className="smtp-disabled">
          <div className="smtp-disabled-icon">
            <i className="fas fa-envelope"></i>
          </div>
          <h3>Email Functionality Disabled</h3>
          <p>Enable email settings to send emails directly from GrantFlow CRM and track communications with your clients.</p>
        </div>
      )}
    </div>
  );
};

export default SMTPSettings;