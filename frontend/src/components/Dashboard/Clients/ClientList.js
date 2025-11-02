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
        <i className="fas fa-spinner"></i>
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

  return (
    <div className="clients-list">
      <div className="clients-header">
        <div className="clients-header-content">
          <div className="clients-header-title">
            <h1>Client Management</h1>
            <p>Manage your client portfolio and communications</p>
          </div>
          {/* Header actions removed - now in navigation */}
        </div>
      </div>

      <div className="clients-content">
        <div className="clients-toolbar">
          <div className="clients-search-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search clients by name, organization, or email..."
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
            </select>
          </div>
        </div>

        {clients.length > 0 ? (
          <>
            <div className="clients-table-container">
              <table className="clients-table">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Organization</th>
                    <th>Contact</th>
                    <th>Status</th>
                    <th>Grants</th>
                    <th>Funding</th>
                    <th>Last Contact</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map(client => (
                    <tr key={client.id} className="clients-row">
                      <td>
                        <div className="clients-client-info">
                          <img src={client.avatar} alt={client.name} className="clients-client-avatar" />
                          <div className="clients-client-details">
                            <span className="clients-client-name" onClick={() => onViewClient(client)}>
                              {client.name}
                            </span>
                            <div className="clients-client-email">{client.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="clients-organization">{client.organization}</div>
                      </td>
                      <td>
                        <div className="clients-contact-info">
                          <div className="clients-phone">{client.phone}</div>
                        </div>
                      </td>
                      <td>
                        {getStatusBadge(client.status)}
                      </td>
                      <td>
                        <div className="clients-grants-stats">
                          <div className="clients-grant-count">
                            <strong>{client.grantsSubmitted}</strong> submitted
                          </div>
                          <div className="clients-grant-success">
                            <strong>{client.grantsAwarded}</strong> awarded
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="clients-funding-amount">{client.totalFunding}</div>
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