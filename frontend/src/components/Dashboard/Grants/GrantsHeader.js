// GrantsHeader.js
import React from 'react';
import './GrantsHeader.css';

// Icons (replace with your actual icon components)
const Icon = {
  Matching: () => <span>🎯</span>,
  GrantSource: () => <span>💰</span>,
  NewGrant: () => <span>📄</span>
};

const GrantsHeader = ({ 
  onClientMatching,
  onNewGrantSource, 
  onNewGrantApplication
}) => {
  return (
    <div className="grants-header">
      {/* Main Header Row */}
      <div className="grants-header-main">
        <div className="grants-header-title-section">
          <h1 className="grants-title">Grants Management</h1>
          <div className="grants-subtitle">
            Manage and track all grant applications
          </div>
        </div>
        
        <div className="grants-header-actions">
          <div className="header-action-group">
            {/* Client Matching Button */}
            <button 
              className="btn-secondary btn-icon-text"
              onClick={onClientMatching}
            >
              <Icon.Matching />
              Client Matching
            </button>
            
            {/* Add New Grant Source Button */}
            <button 
              className="btn-secondary btn-icon-text"
              onClick={onNewGrantSource}
            >
              <Icon.GrantSource />
              Add New Grant Source
            </button>
            
            {/* Create New Grant Application Button */}
            <button 
              className="btn-primary btn-icon-text"
              onClick={onNewGrantApplication}
            >
              <Icon.NewGrant />
              Create New Grant Application
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GrantsHeader;