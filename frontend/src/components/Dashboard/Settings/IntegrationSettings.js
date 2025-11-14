import React, { useState, useEffect } from 'react';
import DisableConfirmationModal from './DisableConfirmationModal';

const IntegrationSettings = ({ integrations = {}, onUpdate }) => {
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [localIntegrations, setLocalIntegrations] = useState({});
  const [cooldownTimers, setCooldownTimers] = useState({});

  // Initialize local state with current integrations - FIXED for proper persistence
  useEffect(() => {
    console.log('🔄 IntegrationSettings - Initializing with:', integrations);
    
    // Load integrations from localStorage on component mount
    const savedIntegrations = JSON.parse(localStorage.getItem('grantFlowIntegrations') || '{}');
    console.log('📥 Loaded integrations from storage:', savedIntegrations);
    
    // Ensure Grants.gov and GrantWatch are properly loaded from storage
    const defaultIntegrations = {
      grantsGov: true,  // Default enabled
      grantWatch: true, // Default enabled  
      googleDrive: false,
      dropbox: false,
      slack: false,
      calendar: false,
      zapier: false,
      ...savedIntegrations // Override with saved values
    };
    
    console.log('✅ Final integration state after load:', defaultIntegrations);
    setLocalIntegrations(defaultIntegrations);
    
    // Immediately update parent with the correct state
    if (onUpdate) {
      console.log('📤 Notifying parent of loaded integration state');
      onUpdate(defaultIntegrations);
    }
    
    // Load cooldown timers
    const savedTimers = JSON.parse(localStorage.getItem('grantFlowCooldownTimers') || '{}');
    console.log('⏰ Loaded cooldown timers:', savedTimers);
    setCooldownTimers(savedTimers);
    
    // Save to localStorage for persistence
    localStorage.setItem('grantFlowIntegrations', JSON.stringify(defaultIntegrations));
  }, []); // Empty dependency array - run once on mount

  // Cooldown timer effect
  useEffect(() => {
    const activeTimers = Object.keys(cooldownTimers).filter(
      integrationId => cooldownTimers[integrationId] > 0
    );

    if (activeTimers.length === 0) return;

    const timer = setInterval(() => {
      setCooldownTimers(prev => {
        const updated = { ...prev };
        let changed = false;

        activeTimers.forEach(integrationId => {
          if (updated[integrationId] > 0) {
            updated[integrationId] -= 1;
            changed = true;
            
            if (updated[integrationId] === 0) {
              console.log('✅ Cooldown completed for:', integrationId);
              delete updated[integrationId];
            }
          }
        });

        if (changed) {
          localStorage.setItem('grantFlowCooldownTimers', JSON.stringify(updated));
        }

        return updated;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldownTimers]);

  // Helper functions
  const isIntegrationInCooldown = (integrationId) => {
    return cooldownTimers[integrationId] > 0;
  };

  const getCooldownTime = (integrationId) => {
    return cooldownTimers[integrationId] || 0;
  };

  const getCooldownProgress = (integrationId, cooldownMinutes = 5) => {
    const totalSeconds = cooldownMinutes * 60;
    const remainingSeconds = getCooldownTime(integrationId);
    return ((totalSeconds - remainingSeconds) / totalSeconds) * 100;
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getIntegrationStatus = (integrationId, isEnabled) => {
    if (isEnabled && !isIntegrationInCooldown(integrationId)) {
      return 'Connected';
    } else if (isEnabled && isIntegrationInCooldown(integrationId)) {
      return 'Disconnected (Cooldown)';
    } else {
      return 'Disconnected';
    }
  };

  const isEffectivelyEnabled = (integrationId, isEnabled) => {
    return isEnabled && !isIntegrationInCooldown(integrationId);
  };

  // Integration definitions
  const availableIntegrations = [
    {
      id: 'grantsGov',
      name: 'Grants.gov',
      description: 'Access federal grant opportunities from the official U.S. government source',
      icon: 'fas fa-landmark',
      enabled: localIntegrations.grantsGov || false,
      category: 'Grant Sources',
      status: getIntegrationStatus('grantsGov', localIntegrations.grantsGov),
      helpText: 'Automatically sync with Grants.gov to discover federal funding opportunities',
      requiresConfirmation: true,
      cooldownMinutes: 5
    },
    {
      id: 'grantWatch',
      name: 'GrantWatch',
      description: 'Discover foundation and corporate grant opportunities',
      icon: 'fas fa-eye',
      enabled: localIntegrations.grantWatch || false,
      category: 'Grant Sources',
      status: getIntegrationStatus('grantWatch', localIntegrations.grantWatch),
      helpText: 'Access a comprehensive database of private foundation grants',
      requiresConfirmation: true,
      cooldownMinutes: 5
    },
    {
      id: 'googleDrive',
      name: 'Google Drive',
      description: 'Store and sync grant documents securely',
      icon: 'fab fa-google-drive',
      enabled: localIntegrations.googleDrive || false,
      category: 'Storage',
      status: localIntegrations.googleDrive ? 'Connected' : 'Disconnected',
      helpText: 'Automatically backup your grant proposals and documents',
      requiresConfirmation: false
    },
    {
      id: 'dropbox',
      name: 'Dropbox',
      description: 'Backup your grant files and collaborate with team',
      icon: 'fab fa-dropbox',
      enabled: localIntegrations.dropbox || false,
      category: 'Storage',
      status: localIntegrations.dropbox ? 'Connected' : 'Disconnected',
      helpText: 'Secure cloud storage for all your grant-related files',
      requiresConfirmation: false
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Get grant deadline notifications in your workspace',
      icon: 'fab fa-slack',
      enabled: localIntegrations.slack || false,
      category: 'Communication',
      status: localIntegrations.slack ? 'Connected' : 'Disconnected',
      helpText: 'Receive instant notifications about grant deadlines and updates',
      requiresConfirmation: false
    },
    {
      id: 'calendar',
      name: 'Google Calendar',
      description: 'Sync grant deadlines with your calendar',
      icon: 'fas fa-calendar',
      enabled: localIntegrations.calendar || false,
      category: 'Productivity',
      status: localIntegrations.calendar ? 'Connected' : 'Disconnected',
      helpText: 'Automatically add grant deadlines to your calendar',
      requiresConfirmation: false
    },
    {
      id: 'zapier',
      name: 'Zapier',
      description: 'Connect with 5000+ apps and automate workflows',
      icon: 'fas fa-bolt',
      enabled: localIntegrations.zapier || false,
      category: 'Automation',
      status: localIntegrations.zapier ? 'Connected' : 'Disconnected',
      helpText: 'Create custom automation between GrantFlow and other tools',
      requiresConfirmation: false
    }
  ];

  const handleIntegrationToggle = (integrationId) => {
    const integration = availableIntegrations.find(i => i.id === integrationId);
    const currentState = localIntegrations[integrationId];
    
    console.log('🔄 Toggling integration:', integrationId, 'Current state:', currentState);
    
    if (!currentState && isIntegrationInCooldown(integrationId)) {
      console.log('⏸️ Integration is in cooldown, cannot enable yet');
      return;
    }
    
    if (currentState && integration.requiresConfirmation) {
      setSelectedIntegration(integration);
      setShowDisableModal(true);
    } else {
      const newState = !currentState;
      console.log('💾 Setting new state for', integrationId, 'to:', newState);
      updateIntegrationState(integrationId, newState);
    }
  };

  const updateIntegrationState = (integrationId, newState) => {
    const updatedIntegrations = {
      ...localIntegrations,
      [integrationId]: newState
    };
    
    console.log('📤 Updating integration:', integrationId, 'to:', newState);
    
    setLocalIntegrations(updatedIntegrations);
    
    if (onUpdate) {
      console.log('📢 Broadcasting integration update to parent');
      onUpdate(updatedIntegrations);
    }
    
    localStorage.setItem('grantFlowIntegrations', JSON.stringify(updatedIntegrations));
    
    // Dispatch custom event for other components to listen to
    window.dispatchEvent(new CustomEvent('grantFlowIntegrationUpdate', {
      detail: {
        integrationId,
        enabled: newState,
        allIntegrations: updatedIntegrations
      }
    }));
    
    console.log('✅ Integration state updated, saved, and broadcasted');
  };

  const handleDisableConfirm = () => {
    if (selectedIntegration) {
      console.log('🛑 Confirming disable for:', selectedIntegration.id);
      
      const cooldownSeconds = selectedIntegration.cooldownMinutes * 60;
      const updatedTimers = {
        ...cooldownTimers,
        [selectedIntegration.id]: cooldownSeconds
      };
      
      updateIntegrationState(selectedIntegration.id, false);
      
      setCooldownTimers(updatedTimers);
      localStorage.setItem('grantFlowCooldownTimers', JSON.stringify(updatedTimers));
      
      window.dispatchEvent(new CustomEvent('integrationDisabled', {
        detail: { 
          integrationId: selectedIntegration.id,
          integrationName: selectedIntegration.name
        }
      }));

      console.log('✅ Integration disabled with cooldown');
      
      setShowDisableModal(false);
      setSelectedIntegration(null);
    }
  };

  const handleDisableCancel = () => {
    console.log('❌ Disable cancelled');
    setShowDisableModal(false);
    setSelectedIntegration(null);
  };

  // Emergency fix functions
  const handleForceEnableAll = () => {
    console.log('🚀 Force enabling all integrations');
    const enabledIntegrations = {
      grantsGov: true,
      grantWatch: true,
      googleDrive: true,
      dropbox: true,
      slack: true,
      calendar: true,
      zapier: true
    };
    
    setLocalIntegrations(enabledIntegrations);
    
    if (onUpdate) {
      onUpdate(enabledIntegrations);
    }
    
    localStorage.setItem('grantFlowIntegrations', JSON.stringify(enabledIntegrations));
    
    // Clear all cooldowns
    setCooldownTimers({});
    localStorage.setItem('grantFlowCooldownTimers', JSON.stringify({}));
    
    // Broadcast the update
    window.dispatchEvent(new CustomEvent('grantFlowIntegrationUpdate', {
      detail: {
        integrationId: 'all',
        enabled: true,
        allIntegrations: enabledIntegrations
      }
    }));
    
    alert('All integrations have been enabled!');
  };

  const handleResetAll = () => {
    console.log('🔄 Resetting all integrations');
    localStorage.removeItem('grantFlowIntegrations');
    localStorage.removeItem('grantFlowCooldownTimers');
    window.location.reload();
  };

  const groupedIntegrations = availableIntegrations.reduce((groups, integration) => {
    const category = integration.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(integration);
    return groups;
  }, {});

  // Calculate statistics
  const activeIntegrationsCount = availableIntegrations.filter(
    integration => isEffectivelyEnabled(integration.id, integration.enabled)
  ).length;
  
  const grantSourcesCount = availableIntegrations.filter(
    integration => integration.category === 'Grant Sources' && 
                  isEffectivelyEnabled(integration.id, integration.enabled)
  ).length;
  
  const totalIntegrations = availableIntegrations.length;

  // Debug logging
  useEffect(() => {
    console.log('📊 Current integrations:', localIntegrations);
    console.log('🔍 Grants.gov enabled:', localIntegrations.grantsGov);
    console.log('🔍 GrantWatch enabled:', localIntegrations.grantWatch);
  }, [localIntegrations]);

  return (
    <div className="settings-section">
      {/* Debug Panel - Keep this for now */}
      <div className="debug-panel">
        <div className="debug-header">
          <i className="fas fa-bug"></i>
          <h4>Integration Status Debug</h4>
        </div>
        <div className="debug-content">
          <div className="integration-status-list">
            <div className="status-item">
              <span className="status-label">Grants.gov:</span>
              <span className={`status-value ${localIntegrations.grantsGov ? 'enabled' : 'disabled'}`}>
                {localIntegrations.grantsGov ? '✅ Enabled' : '❌ Disabled'}
              </span>
            </div>
            <div className="status-item">
              <span className="status-label">GrantWatch:</span>
              <span className={`status-value ${localIntegrations.grantWatch ? 'enabled' : 'disabled'}`}>
                {localIntegrations.grantWatch ? '✅ Enabled' : '❌ Disabled'}
              </span>
            </div>
          </div>
          <div className="debug-actions">
            <button 
              className="btn btn-success btn-sm"
              onClick={handleForceEnableAll}
            >
              <i className="fas fa-bolt"></i>
              Enable All Integrations
            </button>
            <button 
              className="btn btn-warning btn-sm"
              onClick={handleResetAll}
            >
              <i className="fas fa-redo"></i>
              Reset All
            </button>
          </div>
        </div>
      </div>

      <div className="section-header">
        <div className="section-title-content">
          <h2 className="section-title">Integration Settings</h2>
          <p className="section-subtitle">
            Connect GrantFlow with external services and data sources. All integrations are managed automatically.
          </p>
        </div>
        <div className="integration-stats-header">
          <div className="stat-badge">
            <i className="fas fa-plug"></i>
            {activeIntegrationsCount} / {totalIntegrations} Active
          </div>
        </div>
      </div>

      {/* Integration Info Banner */}
      <div className="integrations-info-banner">
        <div className="info-icon">
          <i className="fas fa-shield-alt"></i>
        </div>
        <div className="info-content">
          <h4>Managed Integrations</h4>
          <p>
            All integrations are managed by the GrantFlow team. When enabled, we automatically handle 
            API connections and data syncing. You can toggle integrations on/off based on your needs.
            <strong> Grant sources require confirmation before disabling and have a 5-minute cooldown period.</strong>
          </p>
        </div>
      </div>

      {/* Integration Categories */}
      {Object.entries(groupedIntegrations).map(([category, categoryIntegrations]) => (
        <div key={category} className="integration-category">
          <div className="category-header">
            <h4>{category}</h4>
            <span className="category-count">
              {categoryIntegrations.filter(i => isEffectivelyEnabled(i.id, i.enabled)).length} / {categoryIntegrations.length} Enabled
            </span>
          </div>
          <div className="integrations-grid">
            {categoryIntegrations.map((integration) => {
              const isInCooldown = isIntegrationInCooldown(integration.id);
              const cooldownTime = getCooldownTime(integration.id);
              const effectivelyEnabled = isEffectivelyEnabled(integration.id, integration.enabled);
              const progress = getCooldownProgress(integration.id, integration.cooldownMinutes);
              
              return (
                <div key={integration.id} className={`integration-card ${effectivelyEnabled ? 'enabled' : 'disabled'}`}>
                  <div className="integration-header">
                    <div className="integration-icon">
                      <i className={integration.icon}></i>
                    </div>
                    <div className="integration-info">
                      <h5>{integration.name}</h5>
                      <p>{integration.description}</p>
                      <div className="integration-meta">
                        <span className={`integration-status ${effectivelyEnabled ? 'connected' : 'disconnected'}`}>
                          <i className={`fas fa-${effectivelyEnabled ? 'check' : 'times'}-circle`}></i>
                          {getIntegrationStatus(integration.id, integration.enabled)}
                        </span>
                        {effectivelyEnabled && (
                          <span className="integration-badge">
                            <i className="fas fa-sync"></i>
                            Auto-sync
                          </span>
                        )}
                        {integration.requiresConfirmation && (
                          <span className="integration-badge warning">
                            <i className="fas fa-exclamation-triangle"></i>
                            Confirmation Required
                          </span>
                        )}
                        {isInCooldown && (
                          <span className="integration-badge cooldown">
                            <i className="fas fa-clock"></i>
                            Cooldown: {formatTime(cooldownTime)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="integration-control">
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={effectivelyEnabled}
                          onChange={() => handleIntegrationToggle(integration.id)}
                          disabled={isInCooldown && !integration.enabled}
                          className="toggle-input"
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="integration-help">
                    <p>{integration.helpText}</p>
                  </div>

                  {effectivelyEnabled && (
                    <div className="integration-stats">
                      <div className="stat">
                        <i className="fas fa-database"></i>
                        <span>Data syncing automatically</span>
                      </div>
                      <div className="stat">
                        <i className="fas fa-shield-alt"></i>
                        <span>Secure connection</span>
                      </div>
                      {integration.requiresConfirmation && (
                        <div className="stat">
                          <i className="fas fa-clock"></i>
                          <span>{integration.cooldownMinutes}-min cooldown if disabled</span>
                        </div>
                      )}
                    </div>
                  )}

                  {!effectivelyEnabled && integration.requiresConfirmation && isInCooldown && (
                    <div className="cooldown-progress-section">
                      <div className="cooldown-info">
                        <i className="fas fa-clock"></i>
                        <span>Available in {formatTime(cooldownTime)}</span>
                      </div>
                      <div className="cooldown-progress-bar">
                        <div 
                          className="cooldown-progress-fill"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {!effectivelyEnabled && integration.requiresConfirmation && !isInCooldown && (
                    <div className="integration-disabled-notice">
                      <i className="fas fa-info-circle"></i>
                      <span>This integration can be re-enabled after confirmation</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Disable Confirmation Modal */}
      <DisableConfirmationModal
        isOpen={showDisableModal}
        onClose={handleDisableCancel}
        onConfirm={handleDisableConfirm}
        integrationName={selectedIntegration?.name}
        cooldownMinutes={selectedIntegration?.cooldownMinutes || 5}
      />
    </div>
  );
};

export default IntegrationSettings;