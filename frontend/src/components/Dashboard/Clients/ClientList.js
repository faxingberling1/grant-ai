import React from 'react';

const ClientList = ({
  clients,
  loading,
  onAddClient,
  onEditClient,
  onViewClient,
  onDeleteClient,
  onSendEmail,
  onBulkEmail,
  onCommunication,
  onViewHistory,
  onViewTemplates,
  onCommunicationHub,
  searchTerm,
  onSearchChange
}) => {
  if (loading) {
    return (
      <div className="clients-loading">
        <i className="fas fa-spinner fa-spin"></i>
        <p>Loading clients...</p>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="clients-status-badge active">Active</span>;
      case 'inactive':
        return <span className="clients-status-badge inactive">Inactive</span>;
      case 'prospect':
        return <span className="clients-status-badge prospect">Prospect</span>;
      default:
        return <span className="clients-status-badge active">Active</span>;
    }
  };

  const getOrganizationTypeIcon = (type) => {
    const icons = {
      'Nonprofit 501(c)(3)': 'fas fa-hands-helping',
      'Nonprofit 501(c)(4)': 'fas fa-hand-holding-heart',
      'Nonprofit 501(c)(6)': 'fas fa-building',
      'Government Agency': 'fas fa-landmark',
      'Educational Institution': 'fas fa-graduation-cap',
      'For-Profit Corporation': 'fas fa-briefcase',
      'Small Business': 'fas fa-store',
      'Startup': 'fas fa-rocket',
      'Community Organization': 'fas fa-users',
      'Religious Organization': 'fas fa-church',
      'Foundation': 'fas fa-gem',
      'Other': 'fas fa-building'
    };
    return icons[type] || 'fas fa-building';
  };

  // Helper function to safely get values from new or old structure
  const getClientValue = (client, newField, oldField) => {
    return client[newField] || client[oldField] || '';
  };

  return (
    <div className="clients-list">
      <div className="clients-header">
        <div className="clients-header-content">
          <div className="clients-header-title">
            <h1><i className="fas fa-users"></i> Client Management</h1>
            <p>Manage your client portfolio and communications</p>
          </div>
        </div>
      </div>

      <div className="clients-content">
        <div className="clients-toolbar">
          <div className="clients-search-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search clients by name, organization, email, or tags..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          <div className="clients-filters">
            <select className="clients-filter-select">
              <option>All Status</option>
              <option>Active</option>
              <option>Inactive</option>
              <option>Prospect</option>
            </select>
            <select className="clients-filter-select">
              <option>Sort by: Recent</option>
              <option>Sort by: Name</option>
              <option>Sort by: Funding</option>
              <option>Sort by: Organization</option>
            </select>
          </div>
        </div>

        {clients.length > 0 ? (
          <>
            <div className="clients-table-container">
              <table className="clients-table">
                <thead>
                  <tr>
                    <th>Organization</th>
                    <th>Primary Contact</th>
                    <th>Organization Type</th>
                    <th>Status</th>
                    <th>Grants</th>
                    <th>Funding</th>
                    <th>Focus Areas</th>
                    <th>Last Contact</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map(client => (
                    <tr key={client.id} className="clients-row">
                      <td>
                        <div className="clients-client-info">
                          <img src={client.avatar} alt={getClientValue(client, 'organizationName', 'organization')} className="clients-client-avatar" />
                          <div className="clients-client-details">
                            <span className="clients-client-name" onClick={() => onViewClient(client)}>
                              {getClientValue(client, 'organizationName', 'organization')}
                            </span>
                            <div className="clients-client-email">
                              <i className="fas fa-envelope"></i>
                              {getClientValue(client, 'emailAddress', 'email')}
                            </div>
                            {client.website && (
                              <div className="clients-client-website">
                                <i className="fas fa-globe"></i>
                                <a href={client.website} target="_blank" rel="noopener noreferrer">
                                  {client.website.replace(/^https?:\/\//, '')}
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="clients-contact-info">
                          <div className="clients-contact-name">
                            <strong>{getClientValue(client, 'primaryContactName', 'name')}</strong>
                          </div>
                          <div className="clients-contact-role">
                            <i className="fas fa-briefcase"></i>
                            {client.titleRole || 'Not specified'}
                          </div>
                          <div className="clients-phone">
                            <i className="fas fa-phone"></i>
                            {getClientValue(client, 'phoneNumbers', 'phone')}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="clients-organization-type">
                          <i className={getOrganizationTypeIcon(client.organizationType)}></i>
                          <span>{client.organizationType || 'Not specified'}</span>
                        </div>
                        {client.annualBudget && (
                          <div className="clients-budget">
                            <i className="fas fa-money-bill-wave"></i>
                            {client.annualBudget}
                          </div>
                        )}
                      </td>
                      <td>
                        {getStatusBadge(client.status)}
                        {client.staffCount && (
                          <div className="clients-staff-size">
                            <small>{client.staffCount} staff</small>
                          </div>
                        )}
                      </td>
                      <td>
                        <div className="clients-grants-stats">
                          <div className="clients-grant-count">
                            <strong>{client.grantsSubmitted}</strong> submitted
                          </div>
                          <div className="clients-grant-success">
                            <strong>{client.grantsAwarded}</strong> awarded
                            {client.grantsSubmitted > 0 && (
                              <span className="clients-success-rate">
                                ({Math.round((client.grantsAwarded / client.grantsSubmitted) * 100)}%)
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="clients-funding-amount">{client.totalFunding}</div>
                      </td>
                      <td>
                        <div className="clients-focus-areas">
                          {client.focusAreas && client.focusAreas.length > 0 ? (
                            <div className="clients-tags">
                              {client.focusAreas.slice(0, 2).map((area, index) => (
                                <span key={index} className="clients-tag">
                                  {area}
                                </span>
                              ))}
                              {client.focusAreas.length > 2 && (
                                <span className="clients-tag-more">
                                  +{client.focusAreas.length - 2} more
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="clients-no-focus">No focus areas</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="clients-last-contact">
                          {new Date(client.lastContact).toLocaleDateString()}
                        </div>
                      </td>
                      <td>
                        <div className="clients-action-buttons">
                          <button 
                            className="clients-btn-icon" 
                            onClick={() => onCommunication(client)}
                            title="Communication"
                          >
                            <i className="fas fa-comments"></i>
                          </button>
                          <button 
                            className="clients-btn-icon" 
                            onClick={() => onSendEmail(client)}
                            title="Send Email"
                          >
                            <i className="fas fa-envelope"></i>
                          </button>
                          <button 
                            className="clients-btn-icon" 
                            onClick={() => onViewHistory(client)}
                            title="View History"
                          >
                            <i className="fas fa-history"></i>
                          </button>
                          <button 
                            className="clients-btn-icon" 
                            onClick={() => onEditClient(client)}
                            title="Edit Client"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button 
                            className="clients-btn-icon danger" 
                            onClick={() => onDeleteClient(client.id)}
                            title="Delete Client"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="clients-summary">
              <div className="clients-summary-card">
                <div className="clients-summary-icon primary">
                  <i className="fas fa-users"></i>
                </div>
                <div className="clients-summary-content">
                  <h3>{clients.length}</h3>
                  <p>Total Clients</p>
                </div>
              </div>
              <div className="clients-summary-card">
                <div className="clients-summary-icon success">
                  <i className="fas fa-check-circle"></i>
                </div>
                <div className="clients-summary-content">
                  <h3>{clients.filter(c => c.status === 'active').length}</h3>
                  <p>Active Clients</p>
                </div>
              </div>
              <div className="clients-summary-card">
                <div className="clients-summary-icon warning">
                  <i className="fas fa-chart-line"></i>
                </div>
                <div className="clients-summary-content">
                  <h3>${clients.reduce((total, client) => {
                    const amount = parseInt(client.totalFunding.replace(/[$,]/g, ''));
                    return total + (isNaN(amount) ? 0 : amount);
                  }, 0).toLocaleString()}</h3>
                  <p>Total Funding</p>
                </div>
              </div>
              <div className="clients-summary-card">
                <div className="clients-summary-icon info">
                  <i className="fas fa-file-alt"></i>
                </div>
                <div className="clients-summary-content">
                  <h3>{clients.reduce((total, client) => total + client.grantsSubmitted, 0)}</h3>
                  <p>Grants Submitted</p>
                </div>
              </div>
            </div>

            {/* Additional Statistics */}
            <div className="clients-additional-stats">
              <div className="clients-stat-card">
                <div className="clients-stat-icon">
                  <i className="fas fa-map-marker-alt"></i>
                </div>
                <div className="clients-stat-content">
                  <h4>Service Areas</h4>
                  <p>
                    {[...new Set(clients.map(c => c.serviceArea).filter(Boolean))].join(', ') || 'Not specified'}
                  </p>
                </div>
              </div>
              <div className="clients-stat-card">
                <div className="clients-stat-icon">
                  <i className="fas fa-tags"></i>
                </div>
                <div className="clients-stat-content">
                  <h4>Organization Types</h4>
                  <p>
                    {[...new Set(clients.map(c => c.organizationType).filter(Boolean))].length} types
                  </p>
                </div>
              </div>
              <div className="clients-stat-card">
                <div className="clients-stat-icon">
                  <i className="fas fa-bullseye"></i>
                </div>
                <div className="clients-stat-content">
                  <h4>Focus Areas</h4>
                  <p>
                    {[...new Set(clients.flatMap(c => c.focusAreas || []))].length} unique areas
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="clients-no-clients">
            <div className="clients-empty-state">
              <i className="fas fa-users"></i>
              <h3>No clients found</h3>
              <p>
                {searchTerm 
                  ? `No clients match your search for "${searchTerm}"`
                  : "Get started by adding your first client to manage grants and communications."
                }
              </p>
              <button className="clients-btn clients-btn-primary" onClick={onAddClient}>
                <i className="fas fa-plus"></i>
                Add Your First Client
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientList;