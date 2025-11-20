import React from 'react';
import './SourceList.css';

const SourceList = ({
  sources,
  onViewSource,
  onEditSource,
  onCreateSource,
  onDeleteSource,
  onImportFromGrantsGov,
  onImportFromGrantWatch,
  onRefreshGrantsGov,
  onRefreshGrantWatch,
  onLoadMoreGrantsGov,
  onLoadMoreGrantWatch,
  onSyncAllSources,
  filter,
  onFilterChange,
  lastUpdated,
  loading,
  loadingMore,
  grantsGovCount,
  grantWatchCount,
  hasMoreGrantsGov,
  hasMoreGrantWatch,
  integrations = {}
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

  const getSourceBadge = (source) => {
    if (source.source === 'grants.gov') {
      return <span className="source-badge grants-gov-badge">Grants.gov</span>;
    }
    if (source.source === 'grantwatch') {
      return <span className="source-badge grantwatch-badge">GrantWatch</span>;
    }
    if (source.imported) {
      return <span className="source-badge imported-badge">Imported</span>;
    }
    return null;
  };

  // Check if integrations are enabled
  const isIntegrationEnabled = (integrationId) => {
    return integrations[integrationId] !== false;
  };

  // Calculate stats for display
  const totalSources = sources.length;
  const activeSources = sources.filter(s => s.status === 'active').length;
  const upcomingSources = sources.filter(s => s.status === 'upcoming').length;
  const highMatchSources = sources.filter(s => s.matchScore >= 80).length;
  const grantsGovSources = sources.filter(s => s.source === 'grants.gov').length;
  const grantwatchSources = sources.filter(s => s.source === 'grantwatch').length;
  const manualSources = sources.filter(s => !s.source || s.source === 'manual').length;

  return (
    <div className="sources-list">
      {/* Header Section */}
      <div className="sources-header">
        <div className="header-content">
          <div className="header-title">
            <h1>Grant Sources</h1>
            <p>Discover and manage funding opportunities from multiple platforms</p>
            {lastUpdated && (
              <div className="last-updated">
                Last updated: {new Date(lastUpdated).toLocaleString()}
              </div>
            )}
          </div>
          <div className="header-actions">
            <div className="integration-buttons">
              <button 
                className="btn btn-secondary integration-btn grants-gov"
                onClick={onImportFromGrantsGov}
                title="Import from Grants.gov"
                disabled={!isIntegrationEnabled('grantsGov')}
              >
                <i className="fas fa-government-flag"></i>
                Grants.gov
              </button>
              <button 
                className="btn btn-secondary integration-btn grantwatch"
                onClick={onImportFromGrantWatch}
                title="Import from GrantWatch"
                disabled={!isIntegrationEnabled('grantWatch')}
              >
                <i className="fas fa-database"></i>
                GrantWatch
              </button>
            </div>
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
              <h3>{totalSources}</h3>
              <p>Total Sources</p>
              <div className="stat-breakdown">
                <span className="breakdown-item">
                  <span className="dot manual"></span>
                  {manualSources} Manual
                </span>
                <span className="breakdown-item">
                  <span className="dot grants-gov"></span>
                  {grantsGovSources} Grants.gov
                </span>
                <span className="breakdown-item">
                  <span className="dot grantwatch"></span>
                  {grantwatchSources} GrantWatch
                </span>
              </div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon success">
              <i className="fas fa-check-circle"></i>
            </div>
            <div className="stat-content">
              <h3>{activeSources}</h3>
              <p>Active</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon warning">
              <i className="fas fa-clock"></i>
            </div>
            <div className="stat-content">
              <h3>{upcomingSources}</h3>
              <p>Upcoming</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon info">
              <i className="fas fa-chart-line"></i>
            </div>
            <div className="stat-content">
              <h3>{highMatchSources}</h3>
              <p>High Match</p>
            </div>
          </div>
        </div>

        {/* Load More Progress */}
        {loadingMore && (
          <div className="loading-more-indicator">
            <div className="spinner"></div>
            <span>Loading more grants...</span>
          </div>
        )}

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

            <select className="filter-select">
              <option value="">All Sources</option>
              <option value="manual">Manual Entries</option>
              <option value="grants.gov">Grants.gov</option>
              <option value="grantwatch">GrantWatch</option>
            </select>
          </div>

          <div className="toolbar-actions">
            <button 
              className="btn btn-outline sync-btn"
              onClick={onSyncAllSources}
              title="Sync all data sources"
            >
              <i className="fas fa-sync-alt"></i>
              Sync All
            </button>
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
                      <p>Get started by adding your first grant source or importing from external platforms.</p>
                      <div className="empty-state-actions">
                        <button 
                          className="btn btn-primary"
                          onClick={onCreateSource}
                        >
                          <i className="fas fa-plus"></i>
                          Add Source
                        </button>
                        <button 
                          className="btn btn-secondary"
                          onClick={onImportFromGrantsGov}
                          disabled={!isIntegrationEnabled('grantsGov')}
                        >
                          <i className="fas fa-government-flag"></i>
                          Import from Grants.gov
                        </button>
                        <button 
                          className="btn btn-secondary"
                          onClick={onImportFromGrantWatch}
                          disabled={!isIntegrationEnabled('grantWatch')}
                        >
                          <i className="fas fa-database"></i>
                          Import from GrantWatch
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                sources.map(source => (
                  <tr key={source.id} className={`source-row ${source.source === 'grants.gov' ? 'grants-gov-row' : source.source === 'grantwatch' ? 'grantwatch-row' : ''}`}>
                    <td>
                      <div className="source-info">
                        <div className="source-name-wrapper">
                          <button 
                            className="source-name-link"
                            onClick={() => onViewSource(source)}
                          >
                            {source.name}
                            {getSourceBadge(source)}
                          </button>
                          {source.opportunityNumber && (
                            <div className="opportunity-number">
                              #{source.opportunityNumber}
                            </div>
                          )}
                          {source.region && source.source === 'grantwatch' && (
                            <div className="grantwatch-region">
                              <i className="fas fa-map-marker-alt"></i>
                              {source.region}
                            </div>
                          )}
                        </div>
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
                        {source.deadline && new Date(source.deadline) < new Date() && (
                          <span className="deadline-passed">Past</span>
                        )}
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
                        {(source.source !== 'grants.gov' && source.source !== 'grantwatch') && (
                          <>
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
                          </>
                        )}
                        {source.source === 'grants.gov' && (
                          <button 
                            className="btn-icon info"
                            onClick={() => window.open(source.website, '_blank')}
                            title="View on Grants.gov"
                          >
                            <i className="fas fa-external-link-alt"></i>
                          </button>
                        )}
                        {source.source === 'grantwatch' && (
                          <button 
                            className="btn-icon info"
                            onClick={() => window.open(source.website, '_blank')}
                            title="View on GrantWatch"
                          >
                            <i className="fas fa-external-link-alt"></i>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Load More Buttons */}
        <div className="load-more-section">
          {isIntegrationEnabled('grantsGov') && hasMoreGrantsGov && (
            <div className="load-more-card grants-gov-load">
              <div className="load-more-content">
                <div className="load-more-icon">
                  <i className="fas fa-government-flag"></i>
                </div>
                <div className="load-more-text">
                  <h4>Load More Grants.gov Opportunities</h4>
                  <p>
                    Currently showing {grantsGovCount} federal grant opportunities. 
                    Load more to discover additional funding opportunities from Grants.gov.
                  </p>
                </div>
                <div className="load-more-actions">
                  <button 
                    className="btn btn-primary load-more-btn"
                    onClick={onLoadMoreGrantsGov}
                    disabled={loadingMore}
                  >
                    {loadingMore ? (
                      <>
                        <div className="spinner-small"></div>
                        Loading...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-plus"></i>
                        Load More Grants.gov
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {isIntegrationEnabled('grantWatch') && hasMoreGrantWatch && (
            <div className="load-more-card grantwatch-load">
              <div className="load-more-content">
                <div className="load-more-icon">
                  <i className="fas fa-database"></i>
                </div>
                <div className="load-more-text">
                  <h4>Load More GrantWatch Opportunities</h4>
                  <p>
                    Currently showing {grantWatchCount} grant opportunities. 
                    Load more to discover additional foundation and corporate funding.
                  </p>
                </div>
                <div className="load-more-actions">
                  <button 
                    className="btn btn-primary load-more-btn"
                    onClick={onLoadMoreGrantWatch}
                    disabled={loadingMore}
                  >
                    {loadingMore ? (
                      <>
                        <div className="spinner-small"></div>
                        Loading...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-plus"></i>
                        Load More GrantWatch
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Show message when no more data available */}
          {(!hasMoreGrantsGov || !hasMoreGrantWatch) && (
            <div className="no-more-data">
              <div className="no-more-icon">
                <i className="fas fa-check-circle"></i>
              </div>
              <div className="no-more-text">
                <h4>All Available Grants Loaded</h4>
                <p>
                  You've loaded all currently available grant opportunities. 
                  Check back later for new opportunities or refresh to see updates.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h3>Quick Actions</h3>
          <div className="action-buttons-grid">
            <button 
              className="btn btn-outline"
              onClick={onImportFromGrantsGov}
              disabled={!isIntegrationEnabled('grantsGov')}
            >
              <i className="fas fa-government-flag"></i>
              Import from Grants.gov
            </button>
            <button 
              className="btn btn-outline"
              onClick={onImportFromGrantWatch}
              disabled={!isIntegrationEnabled('grantWatch')}
            >
              <i className="fas fa-database"></i>
              Import from GrantWatch
            </button>
            <button 
              className="btn btn-outline"
              onClick={onRefreshGrantsGov}
              disabled={!isIntegrationEnabled('grantsGov')}
            >
              <i className="fas fa-sync"></i>
              Refresh Grants.gov
            </button>
            <button 
              className="btn btn-outline"
              onClick={onRefreshGrantWatch}
              disabled={!isIntegrationEnabled('grantWatch')}
            >
              <i className="fas fa-sync"></i>
              Refresh GrantWatch
            </button>
            <button 
              className="btn btn-outline"
              onClick={onSyncAllSources}
            >
              <i className="fas fa-sync-alt"></i>
              Sync All Sources
            </button>
            <button className="btn btn-outline">
              <i className="fas fa-download"></i>
              Export Sources
            </button>
            <button className="btn btn-outline">
              <i className="fas fa-robot"></i>
              AI Matching
            </button>
          </div>
        </div>

        {/* Integration Banners */}
        <div className="integration-banners">
          {grantsGovSources > 0 && (
            <div className="integration-banner grants-gov-banner">
              <div className="banner-content">
                <div className="banner-icon">
                  <i className="fas fa-government-flag"></i>
                </div>
                <div className="banner-text">
                  <h4>Grants.gov Integration Active</h4>
                  <p>
                    You have {grantsGovSources} federal grant opportunities from Grants.gov. 
                    {hasMoreGrantsGov ? ' Load more to discover additional opportunities.' : ' All available opportunities have been loaded.'}
                  </p>
                </div>
                <div className="banner-actions">
                  <button 
                    className="btn btn-outline"
                    onClick={onImportFromGrantsGov}
                    disabled={!isIntegrationEnabled('grantsGov')}
                  >
                    <i className="fas fa-plus"></i>
                    Import More
                  </button>
                  <button 
                    className="btn btn-outline"
                    onClick={onRefreshGrantsGov}
                    disabled={!isIntegrationEnabled('grantsGov')}
                  >
                    <i className="fas fa-sync"></i>
                    Refresh Data
                  </button>
                  {hasMoreGrantsGov && (
                    <button 
                      className="btn btn-primary"
                      onClick={onLoadMoreGrantsGov}
                      disabled={loadingMore}
                    >
                      {loadingMore ? (
                        <>
                          <div className="spinner-small"></div>
                          Loading...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-plus"></i>
                          Load More
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {grantwatchSources > 0 && (
            <div className="integration-banner grantwatch-banner">
              <div className="banner-content">
                <div className="banner-icon">
                  <i className="fas fa-database"></i>
                </div>
                <div className="banner-text">
                  <h4>GrantWatch Integration Active</h4>
                  <p>
                    You have {grantwatchSources} grant opportunities from GrantWatch. 
                    {hasMoreGrantWatch ? ' Load more to discover additional opportunities.' : ' All available opportunities have been loaded.'}
                  </p>
                </div>
                <div className="banner-actions">
                  <button 
                    className="btn btn-outline"
                    onClick={onImportFromGrantWatch}
                    disabled={!isIntegrationEnabled('grantWatch')}
                  >
                    <i className="fas fa-plus"></i>
                    Import More
                  </button>
                  <button 
                    className="btn btn-outline"
                    onClick={onRefreshGrantWatch}
                    disabled={!isIntegrationEnabled('grantWatch')}
                  >
                    <i className="fas fa-sync"></i>
                    Refresh Data
                  </button>
                  {hasMoreGrantWatch && (
                    <button 
                      className="btn btn-primary"
                      onClick={onLoadMoreGrantWatch}
                      disabled={loadingMore}
                    >
                      {loadingMore ? (
                        <>
                          <div className="spinner-small"></div>
                          Loading...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-plus"></i>
                          Load More
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Integration Disabled Banners */}
          {!isIntegrationEnabled('grantsGov') && (
            <div className="integration-banner integration-disabled">
              <div className="banner-content">
                <div className="banner-icon">
                  <i className="fas fa-government-flag"></i>
                </div>
                <div className="banner-text">
                  <h4>Grants.gov Integration Disabled</h4>
                  <p>
                    Enable the Grants.gov integration to access federal grant opportunities and load more funding sources.
                  </p>
                </div>
                <div className="banner-actions">
                  <button className="btn btn-outline">
                    <i className="fas fa-cog"></i>
                    Enable Integration
                  </button>
                </div>
              </div>
            </div>
          )}

          {!isIntegrationEnabled('grantWatch') && (
            <div className="integration-banner integration-disabled">
              <div className="banner-content">
                <div className="banner-icon">
                  <i className="fas fa-database"></i>
                </div>
                <div className="banner-text">
                  <h4>GrantWatch Integration Disabled</h4>
                  <p>
                    Enable the GrantWatch integration to access foundation and corporate grant opportunities.
                  </p>
                </div>
                <div className="banner-actions">
                  <button className="btn btn-outline">
                    <i className="fas fa-cog"></i>
                    Enable Integration
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SourceList;