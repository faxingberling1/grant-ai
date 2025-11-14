import React, { useState } from 'react';

const ProfilePreferences = ({ preferences, onSave }) => {
  const [formData, setFormData] = useState(preferences);

  const handleToggle = (key) => {
    setFormData({
      ...formData,
      [key]: !formData[key]
    });
  };

  const handleSelectChange = (key, value) => {
    setFormData({
      ...formData,
      [key]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="profile-section">
      <div className="section-header">
        <h2 className="section-title">Preferences & Settings</h2>
        <button type="submit" form="preferences-form" className="edit-button">
          Save Preferences
        </button>
      </div>
      
      <form id="preferences-form" onSubmit={handleSubmit}>
        <div className="preferences-grid">
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

export default ProfilePreferences;