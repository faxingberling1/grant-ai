// frontend/src/components/Dashboard/Sources/SourceList.js
import React from 'react';

const SourceList = ({
  sources,
  onViewSource,
  onEditSource,
  onCreateSource,
  onDeleteSource,
  filter,
  onFilterChange
}) => {
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

  const getMatchScoreClass = (score) => {
    if (score >= 90) return 'match-score high';
    if (score >= 80) return 'match-score medium';
    return 'match-score low';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Rolling';
    return new Date(dateString).toLocaleDateString();
  };

  const getTypeText = (type) => {
    const types = {
      'government': 'Government',
      'private_foundation': 'Private Foundation',
      'corporate': 'Corporate',
      'community': 'Community Fund'
    };
    return types[type] || type;
  };

  return (
    <div className="sources-list">
      {/* Header Section */}
      <div className="sources-header">
        <div className="header-content">
          <div className="header-title">
            <h1>Grant Sources</h1>
            <p>Discover and manage funding opportunities</p>
          </div>
          <div className="header-actions">
            <button 
              className="btn btn-primary"
              onClick={onCreateSource}
            >
              <i className="fas fa-plus"></i>
              Add Source
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="sources-content">
        <div className="sources-stats">
          <div className="stat-card">
            <div className="stat-icon primary">
              <i className="fas fa-database"></i>
            </div>
            <div className="stat-content">
              <h3>{sources.length}</h3>
              <p>Total Sources</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon success">
              <i className="fas fa-check-circle"></i>
            </div>
            <div className="stat-content">
              <h3>{sources.filter(s => s.status === 'active').length}</h3>
              <p>Active</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon warning">
              <i className="fas fa-clock"></i>
            </div>
            <div className="stat-content">
              <h3>{sources.filter(s => s.status === 'upcoming').length}</h3>
              <p>Upcoming</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon info">
              <i className="fas fa-chart-line"></i>
            </div>
            <div className="stat-content">
              <h3>
                {sources.filter(s => s.matchScore >= 80).length}
              </h3>
              <p>High Match</p>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="sources-toolbar">
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input 
              type="text" 
              placeholder="Search grant sources..." 
            />
          </div>
          
          <div className="filters">
            <select 
              className="filter-select"
              value={filter} 
              onChange={(e) => onFilterChange(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="upcoming">Upcoming</option>
              <option value="closed">Closed</option>
            </select>
            
            <select className="filter-select">
              <option value="">All Types</option>
              <option value="government">Government</option>
              <option value="private_foundation">Private Foundation</option>
              <option value="corporate">Corporate</option>
              <option value="community">Community</option>
            </select>

            <select className="filter-select">
              <option value="">All Categories</option>
              <option value="education">Education</option>
              <option value="health">Health</option>
              <option value="environment">Environment</option>
              <option value="arts">Arts & Culture</option>
              <option value="social">Social Justice</option>
            </select>
          </div>
        </div>

        {/* Sources Table */}
        <div className="sources-table-container">
          <table className="sources-table">
            <thead>
              <tr>
                <th>Source Name</th>
                <th>Type</th>
                <th>Category</th>
                <th>Funding Range</th>
                <th>Deadline</th>
                <th>Match Score</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sources.length === 0 ? (
                <tr>
                  <td colSpan="8" className="no-sources">
                    <div className="empty-state">
                      <i className="fas fa-inbox"></i>
                      <h3>No Grant Sources Found</h3>
                      <p>Get started by adding your first grant source.</p>
                      <button 
                        className="btn btn-primary"
                        onClick={onCreateSource}
                      >
                        <i className="fas fa-plus"></i>
                        Add Source
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                sources.map(source => (
                  <tr key={source.id} className="source-row">
                    <td>
                      <div className="source-info">
                        <button 
                          className="source-name-link"
                          onClick={() => onViewSource(source)}
                        >
                          {source.name}
                        </button>
                        <div className="source-website">
                          <a href={source.website} target="_blank" rel="noopener noreferrer">
                            <i className="fas fa-external-link-alt"></i>
                            Visit Website
                          </a>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={getTypeBadgeClass(source.type)}>
                        {getTypeText(source.type)}
                      </span>
                    </td>
                    <td>
                      <div className="source-category">{source.category}</div>
                    </td>
                    <td>
                      <div className="source-amount">
                        {source.amount}
                      </div>
                    </td>
                    <td>
                      <div className="source-deadline">
                        {formatDate(source.deadline)}
                      </div>
                    </td>
                    <td>
                      <div className="match-score-container">
                        <div className={getMatchScoreClass(source.matchScore)}>
                          <div className="score-value">{source.matchScore}%</div>
                          <div className="score-bar">
                            <div 
                              className="score-fill" 
                              style={{ width: `${source.matchScore}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={getStatusBadgeClass(source.status)}>
                        {source.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn-icon"
                          onClick={() => onViewSource(source)}
                          title="View Details"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button 
                          className="btn-icon"
                          onClick={() => onEditSource(source)}
                          title="Edit Source"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button 
                          className="btn-icon danger"
                          onClick={() => onDeleteSource(source.id)}
                          title="Delete Source"
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
              Export Sources
            </button>
            <button className="btn btn-outline">
              <i className="fas fa-sync"></i>
              Refresh Data
            </button>
            <button className="btn btn-outline">
              <i className="fas fa-filter"></i>
              Advanced Filters
            </button>
            <button className="btn btn-outline">
              <i className="fas fa-robot"></i>
              AI Matching
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SourceList;