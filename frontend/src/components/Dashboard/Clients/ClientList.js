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

  return (
    <div className="clients-list">
      <div className="clients-header">
        <div className="header-content">
          <div className="header-title">
            <h1>Client Management</h1>
            <p>Manage your clients and communications</p>
          </div>
          <div className="header-actions">
            <button className="btn btn-secondary" onClick={onBulkEmail}>
              <i className="fas fa-envelope"></i>
              Bulk Email
            </button>
            <button className="btn btn-primary" onClick={onAddClient}>
              <i className="fas fa-plus"></i>
              Add Client
            </button>
          </div>
        </div>
      </div>

      <div className="clients-content">
        {/* Search and Filters */}
        <div className="clients-toolbar">
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search clients by name, organization, or email..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          <div className="filters">
            <select className="filter-select">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <button className="btn btn-outline">
              <i className="fas fa-filter"></i>
              Filters
            </button>
          </div>
        </div>

        {/* Clients Table */}
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
              {clients.length === 0 ? (
                <tr>
                  <td colSpan="8" className="no-clients">
                    <div className="empty-state">
                      <i className="fas fa-users"></i>
                      <h3>No clients found</h3>
                      <p>Get started by adding your first client</p>
                      <button className="btn btn-primary" onClick={onAddClient}>
                        Add Client
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                clients.map(client => (
                  <tr key={client.id} className="client-row">
                    <td>
                      <div className="client-info">
                        <img src={client.avatar} alt={client.name} className="client-avatar" />
                        <div className="client-details">
                          <div className="client-name" onClick={() => onViewClient(client)}>
                            {client.name}
                          </div>
                          <div className="client-email">{client.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="organization">{client.organization}</div>
                    </td>
                    <td>
                      <div className="contact-info">
                        <div className="phone">{client.phone}</div>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${client.status}`}>
                        {client.status}
                      </span>
                    </td>
                    <td>
                      <div className="grants-stats">
                        <div className="grant-count">
                          <strong>{client.grantsSubmitted}</strong> submitted
                        </div>
                        <div className="grant-success">
                          <strong>{client.grantsAwarded}</strong> awarded
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="funding-amount">
                        {client.totalFunding}
                      </div>
                    </td>
                    <td>
                      <div className="last-contact">
                        {new Date(client.lastContact).toLocaleDateString()}
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn-icon" 
                          title="Send Email"
                          onClick={() => onSendEmail(client)}
                        >
                          <i className="fas fa-envelope"></i>
                        </button>
                        <button 
                          className="btn-icon" 
                          title="Edit Client"
                          onClick={() => onEditClient(client)}
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button 
                          className="btn-icon danger" 
                          title="Delete Client"
                          onClick={() => onDeleteClient(client.id)}
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

        {/* Summary Stats */}
        <div className="clients-summary">
          <div className="summary-card">
            <div className="summary-icon primary">
              <i className="fas fa-users"></i>
            </div>
            <div className="summary-content">
              <h3>{clients.length}</h3>
              <p>Total Clients</p>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon success">
              <i className="fas fa-check-circle"></i>
            </div>
            <div className="summary-content">
              <h3>{clients.filter(c => c.status === 'active').length}</h3>
              <p>Active Clients</p>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon warning">
              <i className="fas fa-envelope"></i>
            </div>
            <div className="summary-content">
              <h3>24</h3>
              <p>Pending Emails</p>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon info">
              <i className="fas fa-award"></i>
            </div>
            <div className="summary-content">
              <h3>$1.35M</h3>
              <p>Total Funding</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientList;