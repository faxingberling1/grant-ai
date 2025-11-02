import React from 'react';

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

  return (
    <div className="clients-list">
      <div className="clients-header">
        <div className="header-content">
          <div className="header-title">
            <button className="btn btn-outline" onClick={onBack}>
              <i className="fas fa-arrow-left"></i>
              Back to Clients
            </button>
            <h1 style={{marginTop: '16px'}}>{client.name}</h1>
            <p>{client.organization} • {getStatusBadge(client.status)}</p>
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
          <div className="content-card">
            <div className="card-header">
              <h3>Client Information</h3>
            </div>
            <div className="client-details-grid">
              <div className="detail-group">
                <label>Full Name</label>
                <div className="detail-value">{client.name}</div>
              </div>
              <div className="detail-group">
                <label>Organization</label>
                <div className="detail-value">{client.organization}</div>
              </div>
              <div className="detail-group">
                <label>Email</label>
                <div className="detail-value">
                  <a href={`mailto:${client.email}`}>{client.email}</a>
                </div>
              </div>
              <div className="detail-group">
                <label>Phone</label>
                <div className="detail-value">
                  <a href={`tel:${client.phone}`}>{client.phone}</a>
                </div>
              </div>
              <div className="detail-group">
                <label>Status</label>
                <div className="detail-value">{getStatusBadge(client.status)}</div>
              </div>
              <div className="detail-group">
                <label>Last Contact</label>
                <div className="detail-value">{new Date(client.lastContact).toLocaleDateString()}</div>
              </div>
            </div>
          </div>

          <div className="content-card">
            <div className="card-header">
              <h3>Grant Statistics</h3>
            </div>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-number">{client.grantsSubmitted}</div>
                <div className="stat-label">Grants Submitted</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{client.grantsAwarded}</div>
                <div className="stat-label">Grants Awarded</div>
              </div>
              <div className="stat-item">
                <div className="stat-number" style={{fontSize: '20px'}}>{client.totalFunding}</div>
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

          <div className="content-card full-width">
            <div className="card-header">
              <h3>Notes & Tags</h3>
            </div>
            <div className="notes-section">
              <div className="client-notes">
                <p>{client.notes}</p>
              </div>
              <div className="tags-section">
                {client.tags.map((tag, index) => (
                  <span key={index} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

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