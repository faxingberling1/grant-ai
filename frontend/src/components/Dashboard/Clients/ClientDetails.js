import React from 'react';
import './Clients.css';

const ClientDetails = ({ client, onEdit, onBack, onSendEmail, onCommunication, onViewHistory }) => {
  if (!client) {
    return (
      <div className="no-clients">
        <div className="empty-state">
          <i className="fas fa-exclamation-circle"></i>
          <h3>Client not found</h3>
          <p>The requested client could not be found.</p>
          <button className="btn btn-primary" onClick={onBack}>
            Back to Clients
          </button>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="status-badge active">Active</span>;
      case 'inactive':
        return <span className="status-badge inactive">Inactive</span>;
      case 'prospect':
        return <span className="status-badge prospect">Prospect</span>;
      default:
        return <span className="status-badge active">Active</span>;
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

  return (
    <div className="clients-list">
      <div className="clients-header">
        <div className="header-content">
          <div className="header-title">
            <button className="btn btn-outline" onClick={onBack}>
              <i className="fas fa-arrow-left"></i>
              Back to Clients
            </button>
            <h1 style={{marginTop: '16px'}}>{client.organizationName || client.name}</h1>
            <p>{client.organizationName || client.organization} • {getStatusBadge(client.status)}</p>
          </div>
          <div className="header-actions">
            <button className="btn btn-outline" onClick={onViewHistory}>
              <i className="fas fa-history"></i>
              View History
            </button>
            <button className="btn btn-outline" onClick={onCommunication}>
              <i className="fas fa-comments"></i>
              Communication
            </button>
            <button className="btn btn-primary" onClick={onSendEmail}>
              <i className="fas fa-paper-plane"></i>
              Send Email
            </button>
            <button className="btn btn-secondary" onClick={onEdit}>
              <i className="fas fa-edit"></i>
              Edit Client
            </button>
          </div>
        </div>
      </div>

      <div className="clients-content">
        <div className="content-grid" style={{gridTemplateColumns: '2fr 1fr'}}>
          {/* Client Information */}
          <div className="content-card">
            <div className="card-header">
              <h3>Client Information</h3>
            </div>
            <div className="client-details-grid">
              <div className="detail-group">
                <label>Organization Name</label>
                <div className="detail-value">{client.organizationName || client.name}</div>
              </div>
              <div className="detail-group">
                <label>Primary Contact</label>
                <div className="detail-value">
                  {client.primaryContactName} {client.titleRole && `• ${client.titleRole}`}
                </div>
              </div>
              <div className="detail-group">
                <label>Email</label>
                <div className="detail-value">
                  <a href={`mailto:${client.emailAddress || client.email}`}>
                    {client.emailAddress || client.email}
                  </a>
                </div>
              </div>
              <div className="detail-group">
                <label>Phone</label>
                <div className="detail-value">
                  <a href={`tel:${client.phoneNumbers || client.phone}`}>
                    {client.phoneNumbers || client.phone}
                  </a>
                </div>
              </div>
              {client.additionalContactName && (
                <div className="detail-group">
                  <label>Additional Contact</label>
                  <div className="detail-value">
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
              <div className="detail-group">
                <label>Status</label>
                <div className="detail-value">{getStatusBadge(client.status)}</div>
              </div>
              <div className="detail-group">
                <label>Last Contact</label>
                <div className="detail-value">
                  {client.lastContact ? new Date(client.lastContact).toLocaleDateString() : 'Never'}
                </div>
              </div>
            </div>
          </div>

          {/* Grant Statistics */}
          <div className="content-card">
            <div className="card-header">
              <h3>Grant Statistics</h3>
            </div>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-number">{client.grantsSubmitted || 0}</div>
                <div className="stat-label">Grants Submitted</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{client.grantsAwarded || 0}</div>
                <div className="stat-label">Grants Awarded</div>
              </div>
              <div className="stat-item">
                <div className="stat-number" style={{fontSize: '20px'}}>
                  {client.totalFunding ? `$${client.totalFunding.toLocaleString()}` : '$0'}
                </div>
                <div className="stat-label">Total Funding</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">
                  {client.grantsSubmitted > 0 
                    ? Math.round((client.grantsAwarded / client.grantsSubmitted) * 100) 
                    : 0
                  }%
                </div>
                <div className="stat-label">Success Rate</div>
              </div>
            </div>
          </div>

          {/* Organization Details */}
          <div className="content-card full-width">
            <div className="card-header">
              <h3>Organization Details</h3>
            </div>
            <div className="organization-details-grid">
              {client.organizationType && (
                <div className="detail-group">
                  <label>Organization Type</label>
                  <div className="detail-value">{client.organizationType}</div>
                </div>
              )}
              {client.taxIdEIN && (
                <div className="detail-group">
                  <label>Tax ID / EIN</label>
                  <div className="detail-value">{client.taxIdEIN}</div>
                </div>
              )}
              {client.annualBudget && (
                <div className="detail-group">
                  <label>Annual Budget</label>
                  <div className="detail-value">{client.annualBudget}</div>
                </div>
              )}
              {client.staffCount && (
                <div className="detail-group">
                  <label>Staff Count</label>
                  <div className="detail-value">{client.staffCount}</div>
                </div>
              )}
              {client.serviceArea && (
                <div className="detail-group">
                  <label>Service Area</label>
                  <div className="detail-value">{client.serviceArea}</div>
                </div>
              )}
              {client.website && (
                <div className="detail-group">
                  <label>Website</label>
                  <div className="detail-value">
                    <a href={client.website} target="_blank" rel="noopener noreferrer">
                      {client.website}
                    </a>
                  </div>
                </div>
              )}
              {client.mailingAddress && (
                <div className="detail-group full-width">
                  <label>Mailing Address</label>
                  <div className="detail-value" style={{whiteSpace: 'pre-wrap'}}>
                    {client.mailingAddress}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mission & Focus Areas */}
          {(client.missionStatement || safeArray(client.focusAreas).length > 0) && (
            <div className="content-card full-width">
              <div className="card-header">
                <h3>Mission & Focus Areas</h3>
              </div>
              <div className="mission-focus-section">
                {client.missionStatement && (
                  <div className="mission-statement">
                    <h4>Mission Statement</h4>
                    <p>{client.missionStatement}</p>
                  </div>
                )}
                {safeArray(client.focusAreas).length > 0 && (
                  <div className="focus-areas">
                    <h4>Focus Areas</h4>
                    <div className="focus-areas-list">
                      {safeArray(client.focusAreas).map((area, index) => (
                        <span key={index} className="focus-area-tag">
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
            <div className="content-card full-width">
              <div className="card-header">
                <h3>Social Media</h3>
              </div>
              <div className="social-media-links">
                {safeArray(client.socialMediaLinks).map((link, index) => (
                  <a 
                    key={index}
                    href={link.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="social-media-link"
                  >
                    <i className={getSocialMediaIcon(link.platform)}></i>
                    <span>{link.platform}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Notes & Tags */}
          <div className="content-card full-width">
            <div className="card-header">
              <h3>Notes & Tags</h3>
            </div>
            <div className="notes-section">
              <div className="client-notes">
                <p>{client.notes || 'No notes available.'}</p>
              </div>
              <div className="tags-section">
                {safeArray(client.tags).length > 0 ? (
                  safeArray(client.tags).map((tag, index) => (
                    <span key={index} className="tag">
                      <i className="fas fa-hashtag"></i> {tag}
                    </span>
                  ))
                ) : (
                  <p className="no-tags">No tags added.</p>
                )}
              </div>
            </div>
          </div>

          {/* Recent Communication */}
          <div className="content-card full-width">
            <div className="card-header">
              <h3>Recent Communication</h3>
              <button className="btn-link" onClick={onCommunication}>
                View All
              </button>
            </div>
            <div className="communication-preview">
              {client.communicationHistory && client.communicationHistory.length > 0 ? (
                client.communicationHistory.slice(0, 3).map(comm => (
                  <div key={comm.id} className="comm-preview-item">
                    <div className="comm-icon">
                      <i className={`fas fa-${comm.type === 'email' ? 'envelope' : comm.type === 'call' ? 'phone' : 'sticky-note'}`}></i>
                    </div>
                    <div className="comm-content">
                      <div className="comm-title">
                        {comm.type === 'email' ? comm.subject : 
                         comm.type === 'call' ? `${comm.direction} Call` : 'Note'}
                      </div>
                      <div className="comm-preview">
                        {comm.type === 'email' ? comm.preview : 
                         comm.type === 'call' ? comm.notes : comm.content}
                      </div>
                    </div>
                    <div className="comm-date">
                      {new Date(comm.date).toLocaleDateString()}
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-communications">
                  <i className="fas fa-comments"></i>
                  <p>No recent communication</p>
                  <button className="btn btn-outline" onClick={onCommunication}>
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