import React, { useState } from 'react';

const PreferencesSettings = ({ preferences, onUpdate }) => {
  const [formData, setFormData] = useState(preferences);

  const handleToggle = (key) => {
    const updatedData = {
      ...formData,
      [key]: !formData[key]
    };
    setFormData(updatedData);
    onUpdate(updatedData);
  };

  const handleSelectChange = (key, value) => {
    const updatedData = {
      ...formData,
      [key]: value
    };
    setFormData(updatedData);
    onUpdate(updatedData);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(formData);
  };

  return (
    <div className="settings-section">
      <div className="section-header">
        <h2 className="section-title">Preferences</h2>
        <button type="submit" form="preferences-form" className="save-button">
          Save Preferences
        </button>
      </div>
      
      <form id="preferences-form" onSubmit={handleSubmit}>
        <div className="preferences-grid">
          <div className="preference-category">
            <h4>Notifications</h4>
            <div className="preference-item">
              <label className="preference-label">Email Notifications</label>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={formData.emailNotifications}
                  onChange={() => handleToggle('emailNotifications')}
                  className="toggle-input"
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
            
            <div className="preference-item">
              <label className="preference-label">Grant Deadline Alerts</label>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={formData.deadlineAlerts}
                  onChange={() => handleToggle('deadlineAlerts')}
                  className="toggle-input"
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
            
            <div className="preference-item">
              <label className="preference-label">New Grant Opportunities</label>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={formData.newGrantsAlerts}
                  onChange={() => handleToggle('newGrantsAlerts')}
                  className="toggle-input"
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
            
            <div className="preference-item">
              <label className="preference-label">Client Updates</label>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={formData.clientUpdates}
                  onChange={() => handleToggle('clientUpdates')}
                  className="toggle-input"
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
            
            <div className="preference-item">
              <label className="preference-label">Weekly Digest</label>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={formData.weeklyDigest}
                  onChange={() => handleToggle('weeklyDigest')}
                  className="toggle-input"
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
            
            <div className="preference-item">
              <label className="preference-label">Grant Matching Alerts</label>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={formData.grantMatchingAlerts}
                  onChange={() => handleToggle('grantMatchingAlerts')}
                  className="toggle-input"
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>

          <div className="preference-category">
            <h4>Display & Interface</h4>
            <div className="preference-item">
              <label className="preference-label">Default Dashboard View</label>
              <select
                value={formData.defaultView}
                onChange={(e) => handleSelectChange('defaultView', e.target.value)}
                className="select-input"
              >
                <option value="overview">Overview</option>
                <option value="grants">Grants</option>
                <option value="clients">Clients</option>
                <option value="reports">Reports</option>
              </select>
            </div>
            
            <div className="preference-item">
              <label className="preference-label">Results Per Page</label>
              <select
                value={formData.resultsPerPage}
                onChange={(e) => handleSelectChange('resultsPerPage', parseInt(e.target.value))}
                className="select-input"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
            
            <div className="preference-item">
              <label className="preference-label">Theme</label>
              <select
                value={formData.theme}
                onChange={(e) => handleSelectChange('theme', e.target.value)}
                className="select-input"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto</option>
              </select>
            </div>
            
            <div className="preference-item">
              <label className="preference-label">Language</label>
              <select
                value={formData.language}
                onChange={(e) => handleSelectChange('language', e.target.value)}
                className="select-input"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
              </select>
            </div>
          </div>

          <div className="preference-category">
            <h4>Regional Settings</h4>
            <div className="preference-item">
              <label className="preference-label">Timezone</label>
              <select
                value={formData.timezone}
                onChange={(e) => handleSelectChange('timezone', e.target.value)}
                className="select-input"
              >
                <option value="America/New_York">Eastern Time (ET)</option>
                <option value="America/Chicago">Central Time (CT)</option>
                <option value="America/Denver">Mountain Time (MT)</option>
                <option value="America/Los_Angeles">Pacific Time (PT)</option>
              </select>
            </div>
            
            <div className="preference-item">
              <label className="preference-label">Date Format</label>
              <select
                value={formData.dateFormat}
                onChange={(e) => handleSelectChange('dateFormat', e.target.value)}
                className="select-input"
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="form-group" style={{ marginTop: '20px' }}>
          <label className="form-label">Areas of Expertise</label>
          <div className="skills-tags">
            {formData.expertise.map((skill, index) => (
              <span key={index} className="skill-tag">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
};

export default PreferencesSettings;