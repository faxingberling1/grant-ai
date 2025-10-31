// frontend/src/components/Dashboard/Submissions/SubmissionList.js
import React from 'react';

const SubmissionList = ({
  submissions,
  onViewSubmission,
  onEditSubmission,
  onCreateSubmission,
  onDeleteSubmission,
  filter,
  onFilterChange
}) => {
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'draft': return 'status-badge status-draft';
      case 'submitted': return 'status-badge status-submitted';
      case 'approved': return 'status-badge status-approved';
      case 'rejected': return 'status-badge status-rejected';
      default: return 'status-badge status-draft';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not submitted';
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
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
    <div className="submissions-list">
      {/* Header Section */}
      <div className="submissions-header">
        <div className="header-content">
          <div className="header-title">
            <h1>Grant Submissions</h1>
            <p>Track and manage your grant submission status</p>
          </div>
          <div className="header-actions">
            <button 
              className="btn btn-primary"
              onClick={onCreateSubmission}
            >
              <i className="fas fa-plus"></i>
              New Submission
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="submissions-content">
        <div className="submissions-stats">
          <div className="stat-card">
            <div className="stat-icon primary">
              <i className="fas fa-paper-plane"></i>
            </div>
            <div className="stat-content">
              <h3>{submissions.filter(s => s.status === 'submitted').length}</h3>
              <p>Submitted</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon success">
              <i className="fas fa-check-circle"></i>
            </div>
            <div className="stat-content">
              <h3>{submissions.filter(s => s.status === 'approved').length}</h3>
              <p>Approved</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon warning">
              <i className="fas fa-clock"></i>
            </div>
            <div className="stat-content">
              <h3>{submissions.filter(s => s.status === 'draft').length}</h3>
              <p>Drafts</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon info">
              <i className="fas fa-chart-line"></i>
            </div>
            <div className="stat-content">
              <h3>
                {formatCurrency(submissions.reduce((total, sub) => total + (sub.amount || 0), 0))}
              </h3>
              <p>Total Requested</p>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="submissions-toolbar">
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input 
              type="text" 
              placeholder="Search submissions..." 
            />
          </div>
          
          <div className="filters">
            <select 
              className="filter-select"
              value={filter} 
              onChange={(e) => onFilterChange(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            
            <select className="filter-select">
              <option value="">All Clients</option>
              <option value="tech4kids">Tech4Kids Foundation</option>
              <option value="healthy">Healthy Communities Inc.</option>
              <option value="green">Green Earth Alliance</option>
            </select>
          </div>
        </div>

        {/* Submissions Table */}
        <div className="submissions-table-container">
          <table className="submissions-table">
            <thead>
              <tr>
                <th>Grant Title</th>
                <th>Client</th>
                <th>Funder</th>
                <th>Amount</th>
                <th>Submitted Date</th>
                <th>Status</th>
                <th>Stage</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan="8" className="no-submissions">
                    <div className="empty-state">
                      <i className="fas fa-inbox"></i>
                      <h3>No Submissions Found</h3>
                      <p>Get started by creating your first grant submission.</p>
                      <button 
                        className="btn btn-primary"
                        onClick={onCreateSubmission}
                      >
                        <i className="fas fa-plus"></i>
                        Create Submission
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                submissions.map(submission => (
                  <tr key={submission.id} className="submission-row">
                    <td>
                      <div className="submission-info">
                        <button 
                          className="grant-title-link"
                          onClick={() => onViewSubmission(submission)}
                        >
                          {submission.grantTitle}
                        </button>
                        <div className="grant-category">
                          {submission.stage && getStageText(submission.stage)}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="client-name">{submission.clientName}</div>
                    </td>
                    <td>
                      <div className="funder-name">{submission.funder}</div>
                    </td>
                    <td>
                      <div className="submission-amount">
                        {formatCurrency(submission.amount)}
                      </div>
                    </td>
                    <td>
                      <div className="submission-date">
                        {formatDate(submission.submittedDate)}
                        {!submission.submittedDate && (
                          <span className="date-overdue">Not submitted</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={getStatusBadgeClass(submission.status)}>
                        {submission.status}
                      </span>
                    </td>
                    <td>
                      <div className="grant-stage">
                        {getStageText(submission.stage)}
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn-icon"
                          onClick={() => onViewSubmission(submission)}
                          title="View Details"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button 
                          className="btn-icon"
                          onClick={() => onEditSubmission(submission)}
                          title="Edit Submission"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button 
                          className="btn-icon danger"
                          onClick={() => onDeleteSubmission(submission.id)}
                          title="Delete Submission"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h3>Quick Actions</h3>
          <div className="action-buttons-grid">
            <button className="btn btn-outline">
              <i className="fas fa-download"></i>
              Export Submissions
            </button>
            <button className="btn btn-outline">
              <i className="fas fa-sync"></i>
              Refresh Data
            </button>
            <button className="btn btn-outline">
              <i className="fas fa-filter"></i>
              Advanced Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmissionList;