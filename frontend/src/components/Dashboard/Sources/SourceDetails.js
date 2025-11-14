// frontend/src/components/Dashboard/Sources/SourceDetails.js
import React from 'react';
import './SourceDetails.css';

const SourceDetails = ({ source, onBack, onEdit }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'Rolling Deadline';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTypeBadgeClass = (type) => {
    switch (type) {
      case 'government': return 'type-badge type-government';
      case 'private_foundation': return 'type-badge type-foundation';
      case 'corporate': return 'type-badge type-corporate';
      case 'community': return 'type-badge type-community';
      default: return 'type-badge type-foundation';
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'active': return 'status-badge status-active';
      case 'upcoming': return 'status-badge status-upcoming';
      case 'closed': return 'status-badge status-closed';
      default: return 'status-badge status-active';
    }
  };

  const getGrantStatusClass = (status) => {
    switch (status) {
      case 'active': return 'grant-status-active';
      case 'upcoming': return 'grant-status-upcoming';
      case 'closed': return 'grant-status-closed';
      default: return 'grant-status-active';
    }
  };

  const getMatchScoreClass = (score) => {
    if (score >= 90) return 'match-score-display high';
    if (score >= 80) return 'match-score-display medium';
    return 'match-score-display low';
  };

  const getTypeText = (type) => {
    const types = {
      'government': 'Government Agency',
      'private_foundation': 'Private Foundation',
      'corporate': 'Corporate Giving',
      'community': 'Community Fund'
    };
    return types[type] || type;
  };

  const getGrantStatusText = (status) => {
    const statuses = {
      'active': 'Accepting Applications',
      'upcoming': 'Opening Soon',
      'closed': 'Closed'
    };
    return statuses[status] || status;
  };

  return (
    <div className="source-details">
      {/* Header */}
      <div className="details-header">
        <button className="btn-back" onClick={onBack}>
          <i className="fas fa-arrow-left"></i>
          Back to Sources
        </button>
        
        <div className="header-actions">
          <button className="btn btn-primary" onClick={onEdit}>
            <i className="fas fa-edit"></i>
            Edit Source
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="source-profile">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-info">
            <h1>{source.name}</h1>
            <div className="profile-meta">
              <div className="meta-item">
                <i className="fas fa-tag"></i>
                <span>{getTypeText(source.type)}</span>
              </div>
              <div className="meta-item">
                <i className="fas fa-folder"></i>
                <span>{source.category}</span>
              </div>
              <div className="meta-item">
                <i className="fas fa-gift"></i>
                <span>{source.grants?.length || 0} Available Grants</span>
              </div>
            </div>
            <div className="profile-status">
              <span className={getTypeBadgeClass(source.type)}>
                {getTypeText(source.type)}
              </span>
              <span className={getStatusBadgeClass(source.status)}>
                {source.status}
              </span>
              <div className={getMatchScoreClass(source.matchScore)}>
                <div className="score-value">{source.matchScore}% Match</div>
              </div>
            </div>
          </div>
          
          <div className="profile-stats">
            <div className="stat">
              <div className="stat-value">
                {source.grants?.filter(g => g.status === 'active').length || 0}
              </div>
              <div className="stat-label">Active Grants</div>
            </div>
            <div className="stat">
              <div className="stat-value">{formatDate(source.lastUpdated)}</div>
              <div className="stat-label">Last Updated</div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="source-tabs">
          <div className="tabs-header">
            <button className="tab-button active">
              <i className="fas fa-info-circle"></i>
              Overview
            </button>
            <button className="tab-button">
              <i className="fas fa-gift"></i>
              Available Grants ({source.grants?.length || 0})
            </button>
            <button className="tab-button">
              <i className="fas fa-file-alt"></i>
              Requirements
            </button>
          </div>

          {/* Overview Tab Content */}
          <div className="overview-tab">
            <div className="details-grid">
              {/* Source Details */}
              <div className="detail-section">
                <h3>Source Details</h3>
                <div className="detail-item">
                  <label>Source Name</label>
                  <span>{source.name}</span>
                </div>
                <div className="detail-item">
                  <label>Source Type</label>
                  <span className={getTypeBadgeClass(source.type)}>
                    {getTypeText(source.type)}
                  </span>
                </div>
                <div className="detail-item">
                  <label>Category</label>
                  <span>{source.category}</span>
                </div>
                <div className="detail-item">
                  <label>Available Grants</label>
                  <span className="source-amount">{source.grants?.length || 0} opportunities</span>
                </div>
                <div className="detail-item">
                  <label>Current Status</label>
                  <span className={getStatusBadgeClass(source.status)}>
                    {source.status}
                  </span>
                </div>
              </div>

              {/* Contact Information */}
              <div className="detail-section">
                <h3>Contact Information</h3>
                <div className="detail-item">
                  <label>Website</label>
                  <span>
                    <a href={source.website} target="_blank" rel="noopener noreferrer" className="website-link">
                      <i className="fas fa-external-link-alt"></i>
                      Visit Website
                    </a>
                  </span>
                </div>
                <div className="detail-item">
                  <label>Contact Email</label>
                  <span>
                    <a href={`mailto:${source.contactEmail}`} className="email-link">
                      <i className="fas fa-envelope"></i>
                      {source.contactEmail}
                    </a>
                  </span>
                </div>
                <div className="detail-item">
                  <label>Match Score</label>
                  <span className={getMatchScoreClass(source.matchScore)}>
                    {source.matchScore}%
                  </span>
                </div>
              </div>

              {/* Quick Grants Overview */}
              {source.grants && source.grants.length > 0 && (
                <div className="detail-section full-width">
                  <h3>Grant Opportunities Overview</h3>
                  <div className="grants-overview">
                    <div className="grants-stats">
                      <div className="grant-stat">
                        <div className="grant-stat-value">
                          {source.grants.filter(g => g.status === 'active').length}
                        </div>
                        <div className="grant-stat-label">Active</div>
                      </div>
                      <div className="grant-stat">
                        <div className="grant-stat-value">
                          {source.grants.filter(g => g.status === 'upcoming').length}
                        </div>
                        <div className="grant-stat-label">Upcoming</div>
                      </div>
                      <div className="grant-stat">
                        <div className="grant-stat-value">
                          {source.grants.length}
                        </div>
                        <div className="grant-stat-label">Total</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Focus Areas */}
              <div className="detail-section full-width">
                <h3>Focus Areas & Priorities</h3>
                <div className="focus-areas-list">
                  {source.focusAreas && source.focusAreas.length > 0 ? (
                    source.focusAreas.map((area, index) => (
                      <span key={index} className="focus-area-tag">
                        {area}
                      </span>
                    ))
                  ) : (
                    <p className="no-focus-areas">No focus areas specified.</p>
                  )}
                </div>
              </div>

              {/* Eligibility & Notes */}
              <div className="detail-section full-width">
                <h3>Eligibility Requirements</h3>
                <div className="notes-content">
                  <p>{source.eligibility || 'No specific eligibility requirements provided.'}</p>
                </div>
              </div>

              <div className="detail-section full-width">
                <h3>Additional Notes</h3>
                <div className="notes-content">
                  <p>{source.notes || 'No additional notes provided.'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Available Grants Tab Content */}
          <div className="grants-tab">
            <div className="grants-section">
              <h3>Available Grant Opportunities</h3>
              
              {!source.grants || source.grants.length === 0 ? (
                <div className="no-grants">
                  <i className="fas fa-gift"></i>
                  <h4>No Grant Opportunities Added</h4>
                  <p>This source doesn't have any specific grant opportunities listed yet.</p>
                  <button className="btn btn-primary" onClick={onEdit}>
                    <i className="fas fa-plus"></i>
                    Add Grant Opportunities
                  </button>
                </div>
              ) : (
                <div className="grants-table">
                  <div className="grants-header">
                    <div className="grant-column">Grant Title</div>
                    <div className="grant-column">Funding Amount</div>
                    <div className="grant-column">Deadline</div>
                    <div className="grant-column">Category</div>
                    <div className="grant-column">Status</div>
                  </div>
                  
                  {source.grants.map((grant, index) => (
                    <div key={grant.id} className="grant-row">
                      <div className="grant-column">
                        <div className="grant-title">{grant.title}</div>
                      </div>
                      <div className="grant-column">
                        <div className="grant-amount">{grant.amount}</div>
                      </div>
                      <div className="grant-column">
                        <div className="grant-deadline">
                          {grant.deadline ? formatDate(grant.deadline) : 'Rolling'}
                        </div>
                      </div>
                      <div className="grant-column">
                        <div className="grant-category">{grant.category}</div>
                      </div>
                      <div className="grant-column">
                        <span className={`grant-status ${getGrantStatusClass(grant.status)}`}>
                          {getGrantStatusText(grant.status)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h3>Quick Actions</h3>
          <div className="action-buttons-grid">
            <button className="btn btn-primary">
              <i className="fas fa-paper-plane"></i>
              Create Grant Application
            </button>
            <button className="btn btn-outline">
              <i className="fas fa-link"></i>
              Match with Clients
            </button>
            <button className="btn btn-outline">
              <i className="fas fa-share"></i>
              Share Source
            </button>
            {source.grants && source.grants.length > 0 && (
              <button className="btn btn-outline">
                <i className="fas fa-download"></i>
                Export Grants List
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SourceDetails;