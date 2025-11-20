import React from 'react';
import './ClientDetails.css';

const ClientDetails = ({ client, onEdit, onBack, onSendEmail, onCommunication, onViewHistory }) => {
  if (!client) {
    return (
      <div className="client-details-empty">
        <div className="client-details-empty-content">
          <i className="fas fa-exclamation-circle client-details-empty-icon"></i>
          <h3>Client not found</h3>
          <p>The requested client could not be found.</p>
          <button className="client-details-btn client-details-btn-primary" onClick={onBack}>
            Back to Clients
          </button>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="client-details-status-badge client-details-status-active">Active</span>;
      case 'inactive':
        return <span className="client-details-status-badge client-details-status-inactive">Inactive</span>;
      case 'prospect':
        return <span className="client-details-status-badge client-details-status-prospect">Prospect</span>;
      default:
        return <span className="client-details-status-badge client-details-status-active">Active</span>;
    }
  };

  // Helper function to safely render arrays
  const safeArray = (array) => Array.isArray(array) ? array : [];

  // Helper function to get social media icon
  const getSocialMediaIcon = (platform) => {
    const icons = {
      'LinkedIn': 'fab fa-linkedin',
      'Twitter': 'fab fa-twitter',
      'Facebook': 'fab fa-facebook',
      'Instagram': 'fab fa-instagram',
      'YouTube': 'fab fa-youtube',
      'TikTok': 'fab fa-tiktok',
      'Pinterest': 'fab fa-pinterest',
      'Snapchat': 'fab fa-snapchat',
      'Reddit': 'fab fa-reddit',
      'Other': 'fas fa-share-alt'
    };
    return icons[platform] || 'fas fa-globe';
  };

  // Helper function to get category color
  const getCategoryColor = (category) => {
    const colors = {
      'Education': '#4CAF50',
      'Healthcare': '#F44336',
      'Environment': '#8BC34A',
      'Arts & Culture': '#9C27B0',
      'Social Services': '#FF9800',
      'Community Development': '#795548',
      'Technology': '#2196F3',
      'Research': '#00BCD4',
      'Animal Welfare': '#FF5722',
      'International': '#3F51B5',
      'Youth Development': '#E91E63',
      'Senior Services': '#607D8B',
      'Disability Services': '#009688',
      'Housing': '#FFC107',
      'Food & Agriculture': '#CDDC39',
      'Faith-Based': '#7B1FA2',
      'STEM': '#00ACC1',
      'Disaster Relief': '#FF6D00',
      'default': '#9E9E9E'
    };
    return colors[category] || colors['default'];
  };

  // Helper function to get priority badge
  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      low: { label: 'Low', className: 'client-details-priority-low' },
      medium: { label: 'Medium', className: 'client-details-priority-medium' },
      high: { label: 'High', className: 'client-details-priority-high' },
      critical: { label: 'Critical', className: 'client-details-priority-critical' }
    };
    
    const config = priorityConfig[priority] || priorityConfig.medium;
    return (
      <span className={`client-details-priority-badge ${config.className}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="client-details-container">
      <div className="client-details-header">
        <div className="client-details-header-content">
          <div className="client-details-title">
            <button className="client-details-btn client-details-btn-outline" onClick={onBack}>
              <i className="fas fa-arrow-left"></i>
              Back to Clients
            </button>
            <h1 style={{marginTop: '16px'}}>{client.organizationName || client.name}</h1>
            <div className="client-details-title-meta">
              <span>{client.organizationName || client.organization}</span>
              <span>•</span>
              {getStatusBadge(client.status)}
              {client.category && (
                <>
                  <span>•</span>
                  <span 
                    className="client-details-category-title"
                    style={{ color: getCategoryColor(client.category) }}
                  >
                    <i className="fas fa-tag"></i> {client.category}
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="client-details-actions">
            <button className="client-details-btn client-details-btn-outline" onClick={onViewHistory}>
              <i className="fas fa-history"></i>
              View History
            </button>
            <button className="client-details-btn client-details-btn-outline" onClick={onCommunication}>
              <i className="fas fa-comments"></i>
              Communication
            </button>
            <button className="client-details-btn client-details-btn-primary" onClick={onSendEmail}>
              <i className="fas fa-paper-plane"></i>
              Send Email
            </button>
            <button className="client-details-btn client-details-btn-secondary" onClick={onEdit}>
              <i className="fas fa-edit"></i>
              Edit Client
            </button>
          </div>
        </div>
      </div>

      <div className="client-details-content">
        <div className="client-details-grid">
          {/* Client Information */}
          <div className="client-details-card">
            <div className="client-details-card-header">
              <h3>Client Information</h3>
            </div>
            <div className="client-details-info-grid">
              <div className="client-details-detail-group">
                <label className="client-details-detail-label">Organization Name</label>
                <div className="client-details-detail-value">{client.organizationName || client.name}</div>
              </div>
              <div className="client-details-detail-group">
                <label className="client-details-detail-label">Primary Contact</label>
                <div className="client-details-detail-value">
                  {client.primaryContactName} {client.titleRole && `• ${client.titleRole}`}
                </div>
              </div>
              <div className="client-details-detail-group">
                <label className="client-details-detail-label">Email</label>
                <div className="client-details-detail-value">
                  <a href={`mailto:${client.emailAddress || client.email}`}>
                    {client.emailAddress || client.email}
                  </a>
                </div>
              </div>
              <div className="client-details-detail-group">
                <label className="client-details-detail-label">Phone</label>
                <div className="client-details-detail-value">
                  <a href={`tel:${client.phoneNumbers || client.phone}`}>
                    {client.phoneNumbers || client.phone}
                  </a>
                </div>
              </div>
              {client.additionalContactName && (
                <div className="client-details-detail-group">
                  <label className="client-details-detail-label">Additional Contact</label>
                  <div className="client-details-detail-value">
                    {client.additionalContactName} 
                    {client.additionalContactTitle && ` • ${client.additionalContactTitle}`}
                    {client.additionalContactEmail && (
                      <div>
                        <a href={`mailto:${client.additionalContactEmail}`}>
                          {client.additionalContactEmail}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div className="client-details-detail-group">
                <label className="client-details-detail-label">Status</label>
                <div className="client-details-detail-value">{getStatusBadge(client.status)}</div>
              </div>
              <div className="client-details-detail-group">
                <label className="client-details-detail-label">Last Contact</label>
                <div className="client-details-detail-value">
                  {client.lastContact ? new Date(client.lastContact).toLocaleDateString() : 'Never'}
                </div>
              </div>
            </div>
          </div>

          {/* Category & Classification */}
          <div className="client-details-card">
            <div className="client-details-card-header">
              <h3>Category & Classification</h3>
            </div>
            <div className="client-details-info-grid">
              {client.category ? (
                <div className="client-details-detail-group">
                  <label className="client-details-detail-label">Primary Category</label>
                  <div className="client-details-detail-value">
                    <span 
                      className="client-details-category-badge"
                      style={{ 
                        backgroundColor: getCategoryColor(client.category) + '20',
                        borderColor: getCategoryColor(client.category),
                        color: getCategoryColor(client.category)
                      }}
                    >
                      <i className="fas fa-tag"></i> {client.category}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="client-details-detail-group">
                  <label className="client-details-detail-label">Primary Category</label>
                  <div className="client-details-detail-value">
                    <span className="client-details-no-category">
                      <i className="fas fa-question-circle"></i> Uncategorized
                    </span>
                  </div>
                </div>
              )}
              
              {client.subcategory && (
                <div className="client-details-detail-group">
                  <label className="client-details-detail-label">Subcategory</label>
                  <div className="client-details-detail-value">{client.subcategory}</div>
                </div>
              )}
              
              {client.priority && (
                <div className="client-details-detail-group">
                  <label className="client-details-detail-label">Priority Level</label>
                  <div className="client-details-detail-value">
                    {getPriorityBadge(client.priority)}
                  </div>
                </div>
              )}
              
              {client.referralSource && (
                <div className="client-details-detail-group">
                  <label className="client-details-detail-label">Referral Source</label>
                  <div className="client-details-detail-value">{client.referralSource}</div>
                </div>
              )}
              
              {client.grantPotential && (
                <div className="client-details-detail-group">
                  <label className="client-details-detail-label">Grant Potential</label>
                  <div className="client-details-detail-value">{client.grantPotential}</div>
                </div>
              )}
              
              {client.nextFollowUp && (
                <div className="client-details-detail-group">
                  <label className="client-details-detail-label">Next Follow-up</label>
                  <div className="client-details-detail-value">
                    {new Date(client.nextFollowUp).toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Grant Statistics */}
          <div className="client-details-card">
            <div className="client-details-card-header">
              <h3>Grant Statistics</h3>
            </div>
            <div className="client-details-stats-grid">
              <div className="client-details-stat-item">
                <div className="client-details-stat-number">{client.grantsSubmitted || 0}</div>
                <div className="client-details-stat-label">Grants Submitted</div>
              </div>
              <div className="client-details-stat-item">
                <div className="client-details-stat-number">{client.grantsAwarded || 0}</div>
                <div className="client-details-stat-label">Grants Awarded</div>
              </div>
              <div className="client-details-stat-item">
                <div className="client-details-stat-number" style={{fontSize: '20px'}}>
                  {client.totalFunding ? `$${typeof client.totalFunding === 'number' ? client.totalFunding.toLocaleString() : client.totalFunding}` : '$0'}
                </div>
                <div className="client-details-stat-label">Total Funding</div>
              </div>
              <div className="client-details-stat-item">
                <div className="client-details-stat-number">
                  {client.grantsSubmitted > 0 
                    ? Math.round((client.grantsAwarded / client.grantsSubmitted) * 100) 
                    : 0
                  }%
                </div>
                <div className="client-details-stat-label">Success Rate</div>
              </div>
            </div>
          </div>

          {/* Funding & Grant Sources */}
          {(safeArray(client.fundingAreas).length > 0 || safeArray(client.grantSources).length > 0) && (
            <div className="client-details-card">
              <div className="client-details-card-header">
                <h3>Funding & Grant Sources</h3>
              </div>
              <div className="client-details-sources-section">
                {safeArray(client.fundingAreas).length > 0 && (
                  <div className="client-details-source-group">
                    <label className="client-details-detail-label">Funding Areas</label>
                    <div className="client-details-source-list">
                      {safeArray(client.fundingAreas).map((area, index) => (
                        <span key={index} className="client-details-source-tag">
                          <i className="fas fa-dollar-sign"></i> {area}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {safeArray(client.grantSources).length > 0 && (
                  <div className="client-details-source-group">
                    <label className="client-details-detail-label">Grant Sources</label>
                    <div className="client-details-source-list">
                      {safeArray(client.grantSources).map((source, index) => (
                        <span key={index} className="client-details-source-tag">
                          <i className="fas fa-graduation-cap"></i> {source}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Organization Details */}
          <div className="client-details-card client-details-card-full">
            <div className="client-details-card-header">
              <h3>Organization Details</h3>
            </div>
            <div className="client-details-org-grid">
              {client.organizationType && (
                <div className="client-details-detail-group">
                  <label className="client-details-detail-label">Organization Type</label>
                  <div className="client-details-detail-value">{client.organizationType}</div>
                </div>
              )}
              {client.taxIdEIN && (
                <div className="client-details-detail-group">
                  <label className="client-details-detail-label">Tax ID / EIN</label>
                  <div className="client-details-detail-value">{client.taxIdEIN}</div>
                </div>
              )}
              {client.annualBudget && (
                <div className="client-details-detail-group">
                  <label className="client-details-detail-label">Annual Budget</label>
                  <div className="client-details-detail-value">{client.annualBudget}</div>
                </div>
              )}
              {client.staffCount && (
                <div className="client-details-detail-group">
                  <label className="client-details-detail-label">Staff Count</label>
                  <div className="client-details-detail-value">{client.staffCount}</div>
                </div>
              )}
              {client.serviceArea && (
                <div className="client-details-detail-group">
                  <label className="client-details-detail-label">Service Area</label>
                  <div className="client-details-detail-value">{client.serviceArea}</div>
                </div>
              )}
              {client.website && (
                <div className="client-details-detail-group">
                  <label className="client-details-detail-label">Website</label>
                  <div className="client-details-detail-value">
                    <a href={client.website} target="_blank" rel="noopener noreferrer">
                      {client.website}
                    </a>
                  </div>
                </div>
              )}
              {client.mailingAddress && (
                <div className="client-details-detail-group client-details-org-full">
                  <label className="client-details-detail-label">Mailing Address</label>
                  <div className="client-details-detail-value" style={{whiteSpace: 'pre-wrap'}}>
                    {client.mailingAddress}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mission & Focus Areas */}
          {(client.missionStatement || safeArray(client.focusAreas).length > 0) && (
            <div className="client-details-card client-details-card-full">
              <div className="client-details-card-header">
                <h3>Mission & Focus Areas</h3>
              </div>
              <div className="client-details-mission-section">
                {client.missionStatement && (
                  <div className="client-details-mission-statement">
                    <h4 className="client-details-mission-title">Mission Statement</h4>
                    <p>{client.missionStatement}</p>
                  </div>
                )}
                {safeArray(client.focusAreas).length > 0 && (
                  <div className="client-details-focus-areas">
                    <h4 className="client-details-focus-title">Focus Areas</h4>
                    <div className="client-details-focus-list">
                      {safeArray(client.focusAreas).map((area, index) => (
                        <span key={index} className="client-details-focus-tag">
                          <i className="fas fa-tag"></i> {area}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Social Media Links */}
          {safeArray(client.socialMediaLinks).length > 0 && (
            <div className="client-details-card client-details-card-full">
              <div className="client-details-card-header">
                <h3>Social Media</h3>
              </div>
              <div className="client-details-social-links">
                {safeArray(client.socialMediaLinks).map((link, index) => (
                  <a 
                    key={index}
                    href={link.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="client-details-social-link"
                  >
                    <i className={`${getSocialMediaIcon(link.platform)} client-details-social-icon`}></i>
                    <span>{link.platform}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Notes & Tags */}
          <div className="client-details-card client-details-card-full">
            <div className="client-details-card-header">
              <h3>Notes & Tags</h3>
            </div>
            <div className="client-details-notes-section">
              <div className="client-details-notes-content">
                <p>{client.notes || 'No notes available.'}</p>
              </div>
              <div className="client-details-tags-section">
                {safeArray(client.tags).length > 0 ? (
                  safeArray(client.tags).map((tag, index) => (
                    <span key={index} className="client-details-tag">
                      <i className="fas fa-hashtag"></i> {tag}
                    </span>
                  ))
                ) : (
                  <p className="client-details-no-tags">No tags added.</p>
                )}
              </div>
            </div>
          </div>

          {/* Recent Communication */}
          <div className="client-details-card client-details-card-full">
            <div className="client-details-card-header">
              <h3>Recent Communication</h3>
              <button className="client-details-btn-link" onClick={onCommunication}>
                View All
              </button>
            </div>
            <div className="client-details-comm-preview">
              {client.communicationHistory && client.communicationHistory.length > 0 ? (
                client.communicationHistory.slice(0, 3).map(comm => (
                  <div key={comm.id} className="client-details-comm-item">
                    <div className="client-details-comm-icon">
                      <i className={`fas fa-${comm.type === 'email' ? 'envelope' : comm.type === 'call' ? 'phone' : 'sticky-note'}`}></i>
                    </div>
                    <div className="client-details-comm-content">
                      <div className="client-details-comm-title">
                        {comm.type === 'email' ? comm.subject : 
                         comm.type === 'call' ? `${comm.direction} Call` : 'Note'}
                      </div>
                      <div className="client-details-comm-preview">
                        {comm.type === 'email' ? comm.preview : 
                         comm.type === 'call' ? comm.notes : comm.content}
                      </div>
                    </div>
                    <div className="client-details-comm-date">
                      {new Date(comm.date).toLocaleDateString()}
                    </div>
                  </div>
                ))
              ) : (
                <div className="client-details-no-comm">
                  <i className="fas fa-comments"></i>
                  <p>No recent communication</p>
                  <button className="client-details-btn client-details-btn-outline" onClick={onCommunication}>
                    Start Conversation
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDetails;