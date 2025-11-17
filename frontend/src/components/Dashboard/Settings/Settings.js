import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import './Settings.css';
import PreferencesSettings from './PreferencesSettings';
import SecuritySettings from './SecuritySettings';
import IntegrationSettings from './IntegrationSettings';
import SMTPSettings from './SMTPSettings';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('preferences');
  const { currentUser } = useAuth();

  const [settings, setSettings] = useState({
    preferences: {
      emailNotifications: true,
      deadlineAlerts: true,
      newGrantsAlerts: false,
      clientUpdates: true,
      weeklyDigest: true,
      grantMatchingAlerts: true,
      defaultView: 'overview',
      resultsPerPage: 25,
      theme: 'light',
      language: 'en',
      timezone: 'America/New_York',
      dateFormat: 'MM/DD/YYYY',
      expertise: ['Federal Grants', 'Foundation Proposals', 'Nonprofit Funding', 'Research Grants', 'Education Grants', 'Healthcare Funding']
    },
    security: {
      twoFactorEnabled: false,
      lastLogin: '2024-11-10T14:30:00Z',
      loginHistory: [
        { date: '2024-11-10T14:30:00Z', device: 'Chrome on Windows', location: 'New York, NY' },
        { date: '2024-11-09T09:15:00Z', device: 'Safari on iPhone', location: 'New York, NY' },
        { date: '2024-11-08T16:45:00Z', device: 'Chrome on Mac', location: 'Boston, MA' }
      ],
      trustedDevices: [
        { name: 'Office Desktop', lastUsed: '2024-11-10T14:30:00Z' },
        { name: 'Personal MacBook', lastUsed: '2024-11-08T16:45:00Z' }
      ]
    },
    integrations: {
      grantsGov: false,
      grantWatch: false,
      googleDrive: false,
      dropbox: false,
      slack: false,
      calendar: false,
      zapier: false
    },
    smtp: {
      enabled: false,
      host: '',
      port: 587,
      secure: false,
      username: '',
      password: '',
      fromEmail: '',
      fromName: '',
      testEmail: ''
    }
  });

  // Load settings from localStorage on component mount
  useEffect(() => {
    const loadSettings = () => {
      try {
        // Load integrations
        const savedIntegrations = localStorage.getItem('grantFlowIntegrations');
        if (savedIntegrations) {
          const integrations = JSON.parse(savedIntegrations);
          console.log('Loaded integrations from storage:', integrations);
          setSettings(prev => ({
            ...prev,
            integrations: { ...prev.integrations, ...integrations }
          }));
        }

        // Load preferences
        const savedPreferences = localStorage.getItem('grantFlowPreferences');
        if (savedPreferences) {
          const preferences = JSON.parse(savedPreferences);
          setSettings(prev => ({
            ...prev,
            preferences: { ...prev.preferences, ...preferences }
          }));
        }

        // Load security settings
        const savedSecurity = localStorage.getItem('grantFlowSecurity');
        if (savedSecurity) {
          const security = JSON.parse(savedSecurity);
          setSettings(prev => ({
            ...prev,
            security: { ...prev.security, ...security }
          }));
        }

        // Load SMTP settings
        const savedSmtp = localStorage.getItem('grantFlowSmtp');
        if (savedSmtp) {
          const smtp = JSON.parse(savedSmtp);
          setSettings(prev => ({
            ...prev,
            smtp: { ...prev.smtp, ...smtp }
          }));
        }
      } catch (error) {
        console.error('Error loading settings from localStorage:', error);
      }
    };

    loadSettings();
  }, []);

  // Listen for integration changes from other components
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === 'grantFlowIntegrations') {
        try {
          const integrations = JSON.parse(event.newValue || '{}');
          console.log('Storage change detected, updating integrations:', integrations);
          setSettings(prev => ({
            ...prev,
            integrations: { ...prev.integrations, ...integrations }
          }));
        } catch (error) {
          console.error('Error parsing integration updates:', error);
        }
      }
    };

    const handleIntegrationEvent = (event) => {
      console.log('Integration event received:', event.detail);
      // Handle custom integration events if needed
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('integrationDisabled', handleIntegrationEvent);
    window.addEventListener('integrationEnabled', handleIntegrationEvent);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('integrationDisabled', handleIntegrationEvent);
      window.removeEventListener('integrationEnabled', handleIntegrationEvent);
    };
  }, []);

  const handlePreferencesUpdate = (updatedPreferences) => {
    console.log('Updating preferences:', updatedPreferences);
    
    setSettings(prev => ({
      ...prev,
      preferences: updatedPreferences
    }));

    // Save to localStorage
    try {
      localStorage.setItem('grantFlowPreferences', JSON.stringify(updatedPreferences));
    } catch (error) {
      console.error('Error saving preferences to localStorage:', error);
    }
  };

  const handleSecurityUpdate = (securityUpdates) => {
    console.log('Updating security settings:', securityUpdates);
    
    setSettings(prev => ({
      ...prev,
      security: { ...prev.security, ...securityUpdates }
    }));

    // Save to localStorage
    try {
      const currentSecurity = JSON.parse(localStorage.getItem('grantFlowSecurity') || '{}');
      localStorage.setItem('grantFlowSecurity', JSON.stringify({
        ...currentSecurity,
        ...securityUpdates
      }));
    } catch (error) {
      console.error('Error saving security settings to localStorage:', error);
    }
  };

  const handleIntegrationUpdate = (integrationUpdates) => {
    console.log('Updating integrations:', integrationUpdates);
    
    // Update state
    setSettings(prev => ({
      ...prev,
      integrations: { 
        ...prev.integrations, 
        ...integrationUpdates 
      }
    }));

    // Update localStorage
    try {
      const currentStorage = JSON.parse(localStorage.getItem('grantFlowIntegrations') || '{}');
      const updatedStorage = {
        ...currentStorage,
        ...integrationUpdates
      };
      
      localStorage.setItem('grantFlowIntegrations', JSON.stringify(updatedStorage));
      console.log('Saved integrations to storage:', updatedStorage);

      // Dispatch storage event to sync across tabs
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'grantFlowIntegrations',
        newValue: JSON.stringify(updatedStorage)
      }));

      // Dispatch custom event for other components
      const integrationId = Object.keys(integrationUpdates)[0];
      const integrationName = integrationId === 'grantsGov' ? 'Grants.gov' : 
                             integrationId === 'grantWatch' ? 'GrantWatch' : integrationId;
      
      if (integrationUpdates[integrationId] === false) {
        window.dispatchEvent(new CustomEvent('integrationDisabled', {
          detail: { 
            integrationId,
            integrationName,
            timestamp: new Date().toISOString()
          }
        }));
      } else {
        window.dispatchEvent(new CustomEvent('integrationEnabled', {
          detail: { 
            integrationId,
            integrationName,
            timestamp: new Date().toISOString()
          }
        }));
      }

    } catch (error) {
      console.error('Error saving integrations to localStorage:', error);
    }
  };

  const handleSmtpUpdate = (smtpUpdates) => {
    console.log('Updating SMTP settings:', smtpUpdates);
    
    setSettings(prev => ({
      ...prev,
      smtp: { ...prev.smtp, ...smtpUpdates }
    }));

    // Save to localStorage
    try {
      const currentSmtp = JSON.parse(localStorage.getItem('grantFlowSmtp') || '{}');
      localStorage.setItem('grantFlowSmtp', JSON.stringify({
        ...currentSmtp,
        ...smtpUpdates
      }));
    } catch (error) {
      console.error('Error saving SMTP settings to localStorage:', error);
    }
  };

  const handleExportSettings = () => {
    const settingsData = {
      preferences: settings.preferences,
      integrations: settings.integrations,
      security: {
        twoFactorEnabled: settings.security.twoFactorEnabled,
        lastLogin: settings.security.lastLogin
      },
      smtp: settings.smtp,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };

    const dataStr = JSON.stringify(settingsData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `grantflow-settings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportSettings = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedSettings = JSON.parse(e.target.result);
        console.log('Importing settings:', importedSettings);

        // Update state with imported settings
        setSettings(prev => ({
          ...prev,
          preferences: { ...prev.preferences, ...importedSettings.preferences },
          integrations: { ...prev.integrations, ...importedSettings.integrations },
          security: { ...prev.security, ...importedSettings.security },
          smtp: { ...prev.smtp, ...importedSettings.smtp }
        }));

        // Save to localStorage
        if (importedSettings.preferences) {
          localStorage.setItem('grantFlowPreferences', JSON.stringify(importedSettings.preferences));
        }
        if (importedSettings.integrations) {
          localStorage.setItem('grantFlowIntegrations', JSON.stringify(importedSettings.integrations));
        }
        if (importedSettings.security) {
          localStorage.setItem('grantFlowSecurity', JSON.stringify(importedSettings.security));
        }
        if (importedSettings.smtp) {
          localStorage.setItem('grantFlowSmtp', JSON.stringify(importedSettings.smtp));
        }

        alert('Settings imported successfully!');
      } catch (error) {
        console.error('Error importing settings:', error);
        alert('Error importing settings. Please check the file format.');
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    event.target.value = '';
  };

  const handleResetSettings = () => {
    if (window.confirm('Are you sure you want to reset all settings to defaults? This action cannot be undone.')) {
      const defaultSettings = {
        preferences: {
          emailNotifications: true,
          deadlineAlerts: true,
          newGrantsAlerts: false,
          clientUpdates: true,
          weeklyDigest: true,
          grantMatchingAlerts: true,
          defaultView: 'overview',
          resultsPerPage: 25,
          theme: 'light',
          language: 'en',
          timezone: 'America/New_York',
          dateFormat: 'MM/DD/YYYY',
          expertise: ['Federal Grants', 'Foundation Proposals', 'Nonprofit Funding']
        },
        integrations: {
          grantsGov: false,
          grantWatch: false,
          googleDrive: false,
          dropbox: false,
          slack: false,
          calendar: false,
          zapier: false
        },
        security: {
          twoFactorEnabled: false,
          lastLogin: new Date().toISOString(),
          loginHistory: [],
          trustedDevices: []
        },
        smtp: {
          enabled: false,
          host: '',
          port: 587,
          secure: false,
          username: '',
          password: '',
          fromEmail: '',
          fromName: '',
          testEmail: ''
        }
      };

      setSettings(defaultSettings);

      // Clear localStorage
      localStorage.setItem('grantFlowPreferences', JSON.stringify(defaultSettings.preferences));
      localStorage.setItem('grantFlowIntegrations', JSON.stringify(defaultSettings.integrations));
      localStorage.setItem('grantFlowSecurity', JSON.stringify(defaultSettings.security));
      localStorage.setItem('grantFlowSmtp', JSON.stringify(defaultSettings.smtp));

      alert('Settings have been reset to defaults.');
    }
  };

  const renderActiveSection = () => {
    switch (activeTab) {
      case 'preferences':
        return (
          <PreferencesSettings 
            preferences={settings.preferences}
            onUpdate={handlePreferencesUpdate}
          />
        );
      case 'security':
        return (
          <SecuritySettings 
            security={settings.security}
            onUpdate={handleSecurityUpdate}
          />
        );
      case 'integrations':
        return (
          <IntegrationSettings 
            integrations={settings.integrations}
            onUpdate={handleIntegrationUpdate}
          />
        );
      case 'smtp':
        return (
          <SMTPSettings 
            smtpSettings={settings.smtp}
            onUpdate={handleSmtpUpdate}
          />
        );
      default:
        return (
          <PreferencesSettings 
            preferences={settings.preferences}
            onUpdate={handlePreferencesUpdate}
          />
        );
    }
  };

  // Calculate active integrations count for the sidebar
  const activeIntegrationsCount = Object.values(settings.integrations).filter(Boolean).length;

  return (
    <div className="settings-container">
      <div className="settings-header">
        <div className="header-content">
          <h1>Settings</h1>
          <p>Manage your application preferences, security, and integrations</p>
          <div className="header-actions">
            <button 
              className="btn btn-outline btn-sm"
              onClick={handleExportSettings}
            >
              <i className="fas fa-download"></i>
              Export Settings
            </button>
            <label className="btn btn-outline btn-sm">
              <i className="fas fa-upload"></i>
              Import Settings
              <input
                type="file"
                accept=".json"
                onChange={handleImportSettings}
                style={{ display: 'none' }}
              />
            </label>
            <button 
              className="btn btn-outline btn-sm"
              onClick={handleResetSettings}
            >
              <i className="fas fa-refresh"></i>
              Reset to Defaults
            </button>
          </div>
        </div>
      </div>
      
      <div className="settings-content">
        <div className="settings-sidebar">
          <div className="settings-nav">
            <div 
              className={`settings-nav-item ${activeTab === 'preferences' ? 'active' : ''}`}
              onClick={() => setActiveTab('preferences')}
            >
              <svg className="nav-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/>
              </svg>
              Preferences
            </div>
            <div 
              className={`settings-nav-item ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              <svg className="nav-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
              </svg>
              Security
            </div>
            <div 
              className={`settings-nav-item ${activeTab === 'integrations' ? 'active' : ''}`}
              onClick={() => setActiveTab('integrations')}
            >
              <svg className="nav-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/>
              </svg>
              Integrations
              {activeIntegrationsCount > 0 && (
                <span className="nav-badge">{activeIntegrationsCount}</span>
              )}
            </div>
            <div 
              className={`settings-nav-item ${activeTab === 'smtp' ? 'active' : ''}`}
              onClick={() => setActiveTab('smtp')}
            >
              <svg className="nav-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
              Email Settings
            </div>
          </div>

          {/* Quick Stats Sidebar */}
          <div className="settings-quick-stats">
            <h4>Settings Overview</h4>
            <div className="quick-stat">
              <div className="quick-stat-icon">
                <i className="fas fa-plug"></i>
              </div>
              <div className="quick-stat-content">
                <span className="quick-stat-value">{activeIntegrationsCount}</span>
                <span className="quick-stat-label">Active Integrations</span>
              </div>
            </div>
            <div className="quick-stat">
              <div className="quick-stat-icon">
                <i className="fas fa-bell"></i>
              </div>
              <div className="quick-stat-content">
                <span className="quick-stat-value">
                  {Object.values(settings.preferences).filter(val => val === true).length}
                </span>
                <span className="quick-stat-label">Enabled Notifications</span>
              </div>
            </div>
            <div className="quick-stat">
              <div className="quick-stat-icon">
                <i className="fas fa-shield-alt"></i>
              </div>
              <div className="quick-stat-content">
                <span className="quick-stat-value">
                  {settings.security.twoFactorEnabled ? 'On' : 'Off'}
                </span>
                <span className="quick-stat-label">2FA Status</span>
              </div>
            </div>
            <div className="quick-stat">
              <div className="quick-stat-icon">
                <i className="fas fa-envelope"></i>
              </div>
              <div className="quick-stat-content">
                <span className="quick-stat-value">
                  {settings.smtp.enabled ? 'Configured' : 'Not Set'}
                </span>
                <span className="quick-stat-label">SMTP Status</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="settings-main">
          {renderActiveSection()}
        </div>
      </div>
    </div>
  );
};

export default Settings;