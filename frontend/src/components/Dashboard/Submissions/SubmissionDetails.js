// frontend/src/components/Dashboard/Submissions/SubmissionDetails.js
import React from 'react';
import SubmissionTimeline from './SubmissionTimeline';

const SubmissionDetails = ({ submission, onBack, onEdit }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'draft': return 'status-badge status-draft';
      case 'submitted': return 'status-badge status-submitted';
      case 'approved': return 'status-badge status-approved';
      case 'rejected': return 'status-badge status-rejected';
      default: return 'status-badge status-draft';
    }
  };

  const getStageText = (stage) => {
    const stages = {
      'draft': 'Draft',
      'submitted': 'Submitted',
      'under_review': 'Under Review',
      'approved': 'Approved',
      'rejected': 'Rejected',
      'completed': 'Completed'
    };
    return stages[stage] || 'Draft';
  };

  return (
    <div className="submission-details">
      {/* Header */}
      <div className="details-header">
        <button className="btn-back" onClick={onBack}>
          <i className="fas fa-arrow-left"></i>
          Back to Submissions
        </button>
        
        <div className="header-actions">
          <button className="btn btn-primary" onClick={onEdit}>
            <i className="fas fa-edit"></i>
            Edit Submission
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="submission-profile">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-info">
            <h1>{submission.grantTitle}</h1>
            <div className="profile-meta">
              <div className="meta-item">
                <i className="fas fa-building"></i>
                <span>{submission.clientName}</span>
              </div>
              <div className="meta-item">
                <i className="fas fa-hand-holding-usd"></i>
                <span>{submission.funder}</span>
              </div>
              <div className="meta-item">
                <i className="fas fa-calendar"></i>
                <span>Submitted: {formatDate(submission.submittedDate)}</span>
              </div>
            </div>
            <div className="profile-status">
              <span className={getStatusBadgeClass(submission.status)}>
                {submission.status}
              </span>
              <span className="stage-badge">
                {getStageText(submission.stage)}
              </span>
            </div>
          </div>
          
          <div className="profile-stats">
            <div className="stat">
              <div className="stat-value">{formatCurrency(submission.amount)}</div>
              <div className="stat-label">Amount</div>
            </div>
            <div className="stat">
              <div className="stat-value">{formatDate(submission.decisionDate)}</div>
              <div className="stat-label">Decision Date</div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="submission-tabs">
          <div className="tabs-header">
            <button className="tab-button active">
              <i className="fas fa-info-circle"></i>
              Overview
            </button>
            <button className="tab-button">
              <i className="fas fa-history"></i>
              Timeline
            </button>
            <button className="tab-button">
              <i className="fas fa-file"></i>
              Documents
            </button>
          </div>

          {/* Overview Tab Content */}
          <div className="overview-tab">
            <div className="details-grid">
              {/* Submission Details */}
              <div className="detail-section">
                <h3>Submission Details</h3>
                <div className="detail-item">
                  <label>Grant Title</label>
                  <span>{submission.grantTitle}</span>
                </div>
                <div className="detail-item">
                  <label>Client Organization</label>
                  <span>{submission.clientName}</span>
                </div>
                <div className="detail-item">
                  <label>Funding Organization</label>
                  <span>{submission.funder}</span>
                </div>
                <div className="detail-item">
                  <label>Requested Amount</label>
                  <span className="submission-amount">{formatCurrency(submission.amount)}</span>
                </div>
              </div>

              {/* Status Information */}
              <div className="detail-section">
                <h3>Status Information</h3>
                <div className="detail-item">
                  <label>Submission Status</label>
                  <span className={getStatusBadgeClass(submission.status)}>
                    {submission.status}
                  </span>
                </div>
                <div className="detail-item">
                  <label>Current Stage</label>
                  <span>{getStageText(submission.stage)}</span>
                </div>
                <div className="detail-item">
                  <label>Submitted Date</label>
                  <span>{formatDate(submission.submittedDate)}</span>
                </div>
                <div className="detail-item">
                  <label>Decision Date</label>
                  <span>{formatDate(submission.decisionDate)}</span>
                </div>
              </div>

              {/* Notes Section */}
              <div className="detail-section full-width">
                <h3>Notes & Additional Information</h3>
                <div className="notes-content">
                  <p>{submission.notes || 'No additional notes provided.'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline Section */}
          <div className="submission-timeline">
            <SubmissionTimeline submission={submission} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmissionDetails;