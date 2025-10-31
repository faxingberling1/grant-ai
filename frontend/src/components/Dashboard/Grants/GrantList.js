import React from 'react';

const GrantList = ({
  grants,
  loading,
  onAddGrant,
  onEditGrant,
  onViewGrant,
  onDeleteGrant,
  onStatusUpdate,
  searchTerm,
  onSearchChange,
  filter,
  onFilterChange
}) => {
  if (loading) {
    return (
      <div className="grants-loading">
        <i className="fas fa-spinner fa-spin"></i>
        <p>Loading grants...</p>
      </div>
    );
  }

  const getStatusColor = (status) => {
    const statusColors = {
      draft: '#6b7280',
      in_review: '#f59e0b',
      submitted: '#3b82f6',
      approved: '#10b981',
      rejected: '#ef4444',
      funded: '#1a472a'
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

  const getStageText = (stage) => {
    const stageTexts = {
      planning: 'Planning',
      writing: 'Writing',
      review: 'Review',
      submitted: 'Submitted',
      under_review: 'Under Review',
      awarded: 'Awarded',
      rejected: 'Rejected'
    };
    return stageTexts[stage] || stage;
  };

  return (
    <div className="grants-list">
      <div className="grants-header">
        <div className="header-content">
          <div className="header-title">
            <h1>Grant Management</h1>
            <p>Track and manage all your grant applications</p>
          </div>
          <div className="header-actions">
            <button className="btn btn-primary" onClick={onAddGrant}>
              <i className="fas fa-plus"></i>
              New Grant
            </button>
          </div>
        </div>
      </div>

      <div className="grants-content">
        {/* Stats Overview */}
        <div className="grants-stats">
          <div className="stat-card">
            <div className="stat-icon primary">
              <i className="fas fa-file-alt"></i>
            </div>
            <div className="stat-content">
              <h3>{grants.length}</h3>
              <p>Total Grants</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon warning">
              <i className="fas fa-edit"></i>
            </div>
            <div className="stat-content">
              <h3>{grants.filter(g => g.status === 'draft').length}</h3>
              <p>In Draft</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon info">
              <i className="fas fa-paper-plane"></i>
            </div>
            <div className="stat-content">
              <h3>{grants.filter(g => g.status === 'submitted').length}</h3>
              <p>Submitted</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon success">
              <i className="fas fa-award"></i>
            </div>
            <div className="stat-content">
              <h3>{grants.filter(g => g.status === 'approved').length}</h3>
              <p>Approved</p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="grants-toolbar">
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search grants by title, client, or funder..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          <div className="filters">
            <select 
              className="filter-select"
              value={filter}
              onChange={(e) => onFilterChange(e.target.value)}
            >
              <option value="all">All Grants</option>
              <option value="draft">Draft</option>
              <option value="in_review">In Review</option>
              <option value="submitted">Submitted</option>
              <option value="approved">Approved</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
            <button className="btn btn-outline">
              <i className="fas fa-filter"></i>
              More Filters
            </button>
          </div>
        </div>

        {/* Grants Table */}
        <div className="grants-table-container">
          <table className="grants-table">
            <thead>
              <tr>
                <th>Grant Title</th>
                <th>Client</th>
                <th>Funder</th>
                <th>Amount</th>
                <th>Deadline</th>
                <th>Status</th>
                <th>Stage</th>
                <th>Priority</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {grants.length === 0 ? (
                <tr>
                  <td colSpan="9" className="no-grants">
                    <div className="empty-state">
                      <i className="fas fa-file-alt"></i>
                      <h3>No grants found</h3>
                      <p>Get started by creating your first grant application</p>
                      <button className="btn btn-primary" onClick={onAddGrant}>
                        Create Grant
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                grants.map(grant => (
                  <tr key={grant.id} className="grant-row">
                    <td>
                      <div className="grant-info">
                        <div 
                          className="grant-title"
                          onClick={() => onViewGrant(grant)}
                        >
                          {grant.title}
                        </div>
                        <div className="grant-category">
                          {grant.category}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="client-name">
                        {grant.client}
                      </div>
                    </td>
                    <td>
                      <div className="funder-name">
                        {grant.funder}
                      </div>
                    </td>
                    <td>
                      <div className="grant-amount">
                        {grant.amount}
                      </div>
                    </td>
                    <td>
                      <div className="grant-deadline">
                        {new Date(grant.deadline).toLocaleDateString()}
                        {new Date(grant.deadline) < new Date() && grant.status !== 'approved' && (
                          <span className="deadline-overdue">Overdue</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(grant.status) }}
                      >
                        {grant.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <div className="grant-stage">
                        {getStageText(grant.stage)}
                      </div>
                    </td>
                    <td>
                      <span 
                        className="priority-badge"
                        style={{ backgroundColor: getPriorityColor(grant.priority) }}
                      >
                        {grant.priority}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn-icon" 
                          title="View Details"
                          onClick={() => onViewGrant(grant)}
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button 
                          className="btn-icon" 
                          title="Edit Grant"
                          onClick={() => onEditGrant(grant)}
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button 
                          className="btn-icon danger" 
                          title="Delete Grant"
                          onClick={() => onDeleteGrant(grant.id)}
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

        {/* Quick Status Update */}
        <div className="quick-actions">
          <h3>Quick Actions</h3>
          <div className="action-buttons-grid">
            <button className="btn btn-outline">
              <i className="fas fa-download"></i>
              Export Report
            </button>
            <button className="btn btn-outline">
              <i className="fas fa-robot"></i>
              AI Grant Analysis
            </button>
            <button className="btn btn-outline">
              <i className="fas fa-calendar"></i>
              View Calendar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GrantList;