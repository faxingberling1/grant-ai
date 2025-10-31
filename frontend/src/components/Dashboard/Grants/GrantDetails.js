import React, { useState } from 'react';
import GrantTimeline from './GrantTimeline';

const GrantDetails = ({ grant, onEdit, onBack, onStatusUpdate }) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!grant) return null;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'fas fa-info-circle' },
    { id: 'timeline', label: 'Timeline', icon: 'fas fa-history' },
    { id: 'documents', label: 'Documents', icon: 'fas fa-file' },
    { id: 'budget', label: 'Budget', icon: 'fas fa-dollar-sign' }
  ];

  const getStatusColor = (status) => {
    const statusColors = {
      draft: '#6b7280',
      in_review: '#f59e0b',
      submitted: '#3b82f6',
      approved: '#10b981',
      rejected: '#ef4444'
    };
    return statusColors[status] || '#6b7280';
  };

  const getPriorityColor = (priority) => {
    const priorityColors = {
      high: '#ef4444',
      medium: '#f59e0b',
      low: '#10b981'
    };
    return priorityColors[priority] || '#6b7280';
  };

  const handleStatusChange = (newStatus) => {
    onStatusUpdate(grant.id, newStatus);
  };

  return (
    <div className="grant-details">
      <div className="details-header">
        <button className="btn-back" onClick={onBack}>
          <i className="fas fa-arrow-left"></i>
          Back to Grants
        </button>
        <div className="header-actions">
          <button className="btn btn-outline" onClick={onEdit}>
            <i className="fas fa-edit"></i>
            Edit Grant
          </button>
          <button className="btn btn-primary">
            <i className="fas fa-robot"></i>
            AI Analysis
          </button>
        </div>
      </div>

      <div className="grant-profile">
        <div className="profile-header">
          <div className="profile-info">
            <h1>{grant.title}</h1>
            <div className="profile-meta">
              <div className="meta-item">
                <i className="fas fa-building"></i>
                <span>{grant.funder}</span>
              </div>
              <div className="meta-item">
                <i className="fas fa-user"></i>
                <span>{grant.client}</span>
              </div>
              <div className="meta-item">
                <i className="fas fa-tag"></i>
                <span>{grant.category}</span>
              </div>
            </div>
            <div className="profile-status">
              <span 
                className="status-badge"
                style={{ backgroundColor: getStatusColor(grant.status) }}
              >
                {grant.status.replace('_', ' ')}
              </span>
              <span 
                className="priority-badge"
                style={{ backgroundColor: getPriorityColor(grant.priority) }}
              >
                {grant.priority} Priority
              </span>
            </div>
          </div>
          <div className="profile-stats">
            <div className="stat">
              <div className="stat-value">{grant.amount}</div>
              <div className="stat-label">Funding Amount</div>
            </div>
            <div className="stat">
              <div className="stat-value">
                {new Date(grant.deadline).toLocaleDateString()}
              </div>
              <div className="stat-label">Deadline</div>
            </div>
            <div className="stat">
              <div className="stat-value">
                {grant.submissionDate ? new Date(grant.submissionDate).toLocaleDateString() : 'Not Submitted'}
              </div>
              <div className="stat-label">Submitted</div>
            </div>
          </div>
        </div>

        {/* Quick Status Update */}
        <div className="status-update">
          <h3>Update Status</h3>
          <div className="status-buttons">
            <button 
              className={`btn ${grant.status === 'draft' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => handleStatusChange('draft')}
            >
              Draft
            </button>
            <button 
              className={`btn ${grant.status === 'in_review' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => handleStatusChange('in_review')}
            >
              In Review
            </button>
            <button 
              className={`btn ${grant.status === 'submitted' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => handleStatusChange('submitted')}
            >
              Submit
            </button>
            <button 
              className={`btn ${grant.status === 'approved' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => handleStatusChange('approved')}
            >
              Approve
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="grant-tabs">
          <div className="tabs-header">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <i className={tab.icon}></i>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="tab-content">
            {activeTab === 'overview' && (
              <div className="overview-tab">
                <div className="details-grid">
                  <div className="detail-section">
                    <h3>Grant Information</h3>
                    <div className="detail-item">
                      <label>Created</label>
                      <span>{new Date(grant.created).toLocaleDateString()}</span>
                    </div>
                    <div className="detail-item">
                      <label>Last Updated</label>
                      <span>{new Date(grant.updated).toLocaleDateString()}</span>
                    </div>
                    <div className="detail-item">
                      <label>Category</label>
                      <span>{grant.category}</span>
                    </div>
                    <div className="detail-item">
                      <label>Stage</label>
                      <span className="stage-badge">{grant.stage}</span>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h3>Tags</h3>
                    <div className="tags-list">
                      {grant.tags.map((tag, index) => (
                        <span key={index} className="tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="detail-section full-width">
                    <h3>Notes & Requirements</h3>
                    <div className="notes-content">
                      {grant.notes || 'No notes added for this grant.'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'timeline' && (
              <GrantTimeline grant={grant} />
            )}

            {activeTab === 'documents' && (
              <div className="documents-tab">
                <h3>Grant Documents</h3>
                <div className="documents-list">
                  <div className="document-item">
                    <i className="fas fa-file-pdf"></i>
                    <div className="document-info">
                      <h4>Grant Proposal</h4>
                      <p>PDF Document • 2.4 MB</p>
                    </div>
                    <div className="document-actions">
                      <button className="btn-icon">
                        <i className="fas fa-download"></i>
                      </button>
                      <button className="btn-icon">
                        <i className="fas fa-edit"></i>
                      </button>
                    </div>
                  </div>
                  <div className="document-item">
                    <i className="fas fa-file-excel"></i>
                    <div className="document-info">
                      <h4>Budget Spreadsheet</h4>
                      <p>Excel File • 1.2 MB</p>
                    </div>
                    <div className="document-actions">
                      <button className="btn-icon">
                        <i className="fas fa-download"></i>
                      </button>
                      <button className="btn-icon">
                        <i className="fas fa-edit"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'budget' && (
              <div className="budget-tab">
                <h3>Budget Overview</h3>
                <div className="budget-summary">
                  <div className="budget-total">
                    <h4>Total Requested: {grant.amount}</h4>
                  </div>
                  <div className="budget-breakdown">
                    <h4>Budget Breakdown</h4>
                    <p>Budget details will be displayed here once added.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GrantDetails;