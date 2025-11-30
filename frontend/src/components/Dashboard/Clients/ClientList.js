import React, { useState, useEffect } from 'react';
import './ClientList.css';

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
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categoryStats, setCategoryStats] = useState({});
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [filteredClients, setFilteredClients] = useState([]);

  // FIXED: Enhanced useEffect to properly handle client updates
  useEffect(() => {
    console.log('🎯 ClientList clients updated:', clients?.length);
    
    if (clients && clients.length > 0) {
      // Log sample data for debugging
      console.log('📋 Sample client data:', clients.slice(0, 3).map(client => ({
        _id: client._id,
        organizationName: client.organizationName,
        category: client.category,
        primaryCategory: client.primaryCategory,
        status: client.status,
        totalFunding: client.totalFunding
      })));
      
      // Recalculate stats and filtered clients
      const stats = calculateCategoryStats();
      setCategoryStats(stats);
      
      // Update filtered clients
      const filtered = getFilteredClients();
      setFilteredClients(filtered);
      
      // Force UI update
      setLastUpdate(Date.now());
    } else {
      // Reset stats if no clients
      setCategoryStats({});
      setFilteredClients([]);
    }
  }, [clients, selectedCategory, searchTerm]); // This will trigger whenever clients prop or filters change

  // FIXED: Enhanced category stats calculation with better data handling
  const calculateCategoryStats = () => {
    const stats = {};
    
    console.log('🔄 Recalculating category stats for', clients?.length, 'clients');
    
    if (!clients || clients.length === 0) {
      return stats;
    }
    
    // Get all unique categories from clients
    const allCategories = new Set();
    clients.forEach(client => {
      const category = client.category || client.primaryCategory || '';
      if (category && category.trim() !== '') {
        allCategories.add(category);
      }
    });
    
    const uniqueCategories = ['all', ...Array.from(allCategories).sort()];
    
    console.log('📊 Found categories:', uniqueCategories);
    
    // Calculate stats for each category
    uniqueCategories.forEach(category => {
      if (category === 'all') {
        stats[category] = {
          count: clients.length,
          active: clients.filter(c => c.status === 'active').length,
          funding: clients.reduce((total, client) => {
            const amount = parseFloat(client.totalFunding?.toString().replace(/[$,]/g, '') || '0');
            return total + (isNaN(amount) ? 0 : amount);
          }, 0),
          grants: clients.reduce((total, client) => total + (parseInt(client.grantsSubmitted) || 0), 0)
        };
      } else {
        const categoryClients = clients.filter(client => {
          const clientCategory = client.category || client.primaryCategory || '';
          return clientCategory === category;
        });
        
        stats[category] = {
          count: categoryClients.length,
          active: categoryClients.filter(c => c.status === 'active').length,
          funding: categoryClients.reduce((total, client) => {
            const amount = parseFloat(client.totalFunding?.toString().replace(/[$,]/g, '') || '0');
            return total + (isNaN(amount) ? 0 : amount);
          }, 0),
          grants: categoryClients.reduce((total, client) => total + (parseInt(client.grantsSubmitted) || 0), 0)
        };
      }
    });
    
    console.log('📈 Final stats calculated:', stats);
    return stats;
  };

  // FIXED: Enhanced category filtering with proper dependency handling
  const getFilteredClients = () => {
    if (!clients || clients.length === 0) return [];
    
    let filtered = [...clients]; // Create a copy to avoid mutating original
    
    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(client => {
        const clientCategory = client.category || client.primaryCategory || '';
        return clientCategory === selectedCategory;
      });
    }
    
    // Apply search filter if searchTerm exists
    if (searchTerm && searchTerm.trim() !== '') {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(client => {
        const orgName = (client.organizationName || client.organization || '').toLowerCase();
        const contactName = (client.primaryContactName || client.name || '').toLowerCase();
        const email = (client.emailAddress || client.email || '').toLowerCase();
        const category = (client.category || client.primaryCategory || '').toLowerCase();
        const tags = Array.isArray(client.tags) ? client.tags.join(' ').toLowerCase() : '';
        const focusAreas = Array.isArray(client.focusAreas) ? client.focusAreas.join(' ').toLowerCase() : '';
        
        return orgName.includes(searchLower) ||
               contactName.includes(searchLower) ||
               email.includes(searchLower) ||
               category.includes(searchLower) ||
               tags.includes(searchLower) ||
               focusAreas.includes(searchLower);
      });
    }
    
    console.log(`🔍 Filtered clients: ${filtered.length} (category: ${selectedCategory}, search: "${searchTerm}")`);
    return filtered;
  };

  // FIXED: Enhanced category detection with proper data handling
  const getAllCategories = () => {
    if (!clients || clients.length === 0) return ['all'];
    
    const categories = new Set();
    
    clients.forEach(client => {
      const category = client.category || client.primaryCategory;
      if (category && category.trim() !== '') {
        categories.add(category);
      }
    });
    
    const allCategories = ['all', ...Array.from(categories).sort()];
    console.log('📂 Available categories:', allCategories);
    return allCategories;
  };

  // FIXED: Enhanced category change handler with immediate UI update
  const handleCategoryChange = (category) => {
    console.log(`🎯 Changing category from ${selectedCategory} to ${category}`);
    setSelectedCategory(category);
    
    // Update filtered clients immediately
    const filtered = getFilteredClients();
    setFilteredClients(filtered);
    
    // Force immediate UI update
    setLastUpdate(Date.now());
  };

  // FIXED: Enhanced client value helper with better fallbacks
  const getClientValue = (client, newField, oldField) => {
    return client[newField] || client[oldField] || '';
  };

  // FIXED: Enhanced category detection for display
  const getClientCategory = (client) => {
    return client.category || client.primaryCategory || '';
  };

  // FIXED: Enhanced focus areas display
  const getClientFocusAreas = (client) => {
    if (Array.isArray(client.focusAreas) && client.focusAreas.length > 0) {
      return client.focusAreas;
    }
    if (Array.isArray(client.tags) && client.tags.length > 0) {
      return client.tags;
    }
    return [];
  };

  // FIXED: Enhanced funding display
  const getClientFunding = (client) => {
    const funding = client.totalFunding || client.funding || client.annualBudget;
    if (typeof funding === 'number') {
      return `$${funding.toLocaleString()}`;
    }
    if (typeof funding === 'string') {
      if (funding.includes('$')) {
        return funding;
      }
      // Try to parse as number
      const parsed = parseFloat(funding.replace(/[$,]/g, ''));
      return isNaN(parsed) ? '$0' : `$${parsed.toLocaleString()}`;
    }
    return '$0';
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="client-list-status-badge active">Active</span>;
      case 'inactive':
        return <span className="client-list-status-badge inactive">Inactive</span>;
      case 'prospect':
        return <span className="client-list-status-badge prospect">Prospect</span>;
      default:
        return <span className="client-list-status-badge active">Active</span>;
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

  const getCategoryIcon = (category) => {
    const icons = {
      'Education': 'fas fa-graduation-cap',
      'Healthcare': 'fas fa-heartbeat',
      'Environment': 'fas fa-leaf',
      'Arts & Culture': 'fas fa-palette',
      'Social Services': 'fas fa-hands-helping',
      'Community Development': 'fas fa-home',
      'Technology': 'fas fa-laptop-code',
      'Research': 'fas fa-flask',
      'Animal Welfare': 'fas fa-paw',
      'International': 'fas fa-globe-americas',
      'Youth Development': 'fas fa-child',
      'Senior Services': 'fas fa-user-friends',
      'Disability Services': 'fas fa-wheelchair',
      'Housing': 'fas fa-house-user',
      'Food & Agriculture': 'fas fa-utensils',
      'Faith-Based': 'fas fa-pray',
      'STEM': 'fas fa-atom',
      'default': 'fas fa-folder'
    };
    return icons[category] || icons['default'];
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Education': '#4CAF50',
      'Healthcare': '#F44336',
      'Environment': '#8BC34A',
      'Arts & Culture': '#9C27B0',
      'Social Services': '#FF9800',
      'Community Development': '#795548',
      'Technology': '#2196F3',
      'Research': '#00BCD4',
      'Animal Welfare': '#FF5722',
      'International': '#3F51B5',
      'Youth Development': '#E91E63',
      'Senior Services': '#607D8B',
      'Disability Services': '#009688',
      'Housing': '#FFC107',
      'Food & Agriculture': '#CDDC39',
      'Faith-Based': '#7B1FA2',
      'STEM': '#00ACC1',
      'default': '#9E9E9E'
    };
    return colors[category] || colors['default'];
  };

  // FIXED: Enhanced edit handler with proper ID validation
  const handleEditClick = (client) => {
    console.log('🔍 ClientList EDIT BUTTON CLICKED:', {
      client: client,
      client_id: client._id,
      client_id_type: typeof client._id,
      client_keys: Object.keys(client),
      has_underscore_id: '_id' in client,
      has_id: 'id' in client
    });

    // Ensure we have the client with _id
    const clientWithId = {
      ...client,
      _id: client._id || client.id // Use _id if available, fallback to id
    };

    if (!clientWithId._id) {
      console.error('❌ Cannot edit client: No valid _id found in client:', client);
      return;
    }

    console.log('🔍 Editing client with ID:', clientWithId._id);
    onEditClient(clientWithId);
  };

  // FIXED: Enhanced delete handler with proper ID validation
  const handleDeleteClick = (client) => {
    const clientId = client._id || client.id;
    
    if (!clientId) {
      console.error('❌ Cannot delete client: No valid ID found in client:', client);
      return;
    }

    console.log('🗑️ Deleting client with ID:', clientId);
    onDeleteClient(clientId);
  };

  if (loading) {
    return (
      <div className="client-list-loading">
        <i className="fas fa-spinner fa-spin"></i>
        <p>Loading clients...</p>
      </div>
    );
  }

  // Calculate categories for display
  const allCategories = getAllCategories();
  const stats = categoryStats;

  return (
    <div className="client-list-full-page" key={lastUpdate}>
      <div className="client-list-header">
        <div className="client-list-header-content">
          <div className="client-list-header-title">
            <h1><i className="fas fa-users"></i> Client Management</h1>
            <p>Manage your client portfolio and communications</p>
          </div>
          <div className="client-list-header-actions">
            <button className="client-list-header-btn client-list-btn-primary" onClick={onAddClient}>
              <i className="fas fa-plus"></i>
              Add New Client
            </button>
          </div>
        </div>
      </div>

      <div className="client-list-main-content">
        {/* Category Navigation - COMPLETELY REMOVED */}

        <div className="client-list-toolbar">
          <div className="client-list-search-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search clients by name, organization, email, category, or tags..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          <div className="client-list-filters">
            <select className="client-list-filter-select">
              <option>All Status</option>
              <option>Active</option>
              <option>Inactive</option>
              <option>Prospect</option>
            </select>
            <select className="client-list-filter-select">
              <option>Sort by: Recent</option>
              <option>Sort by: Name</option>
              <option>Sort by: Funding</option>
              <option>Sort by: Organization</option>
            </select>
            <button className="client-list-filter-btn">
              <i className="fas fa-sliders-h"></i>
              Filters
            </button>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="client-list-quick-stats">
          <div className="client-list-stat-item">
            <div className="client-list-stat-value">{filteredClients.length}</div>
            <div className="client-list-stat-label">Total Clients</div>
          </div>
          <div className="client-list-stat-item">
            <div className="client-list-stat-value">{filteredClients.filter(c => c.status === 'active').length}</div>
            <div className="client-list-stat-label">Active</div>
          </div>
          <div className="client-list-stat-item">
            <div className="client-list-stat-value">{filteredClients.filter(c => c.status === 'prospect').length}</div>
            <div className="client-list-stat-label">Prospects</div>
          </div>
          <div className="client-list-stat-item">
            <div className="client-list-stat-value">
              ${filteredClients.reduce((total, client) => {
                const amount = parseFloat(client.totalFunding?.toString().replace(/[$,]/g, '') || '0');
                return total + (isNaN(amount) ? 0 : amount);
              }, 0).toLocaleString()}
            </div>
            <div className="client-list-stat-label">Total Funding</div>
          </div>
          <div className="client-list-stat-item">
            <div className="client-list-stat-value">
              {filteredClients.reduce((total, client) => total + (parseInt(client.grantsSubmitted) || 0), 0)}
            </div>
            <div className="client-list-stat-label">Grants Submitted</div>
          </div>
        </div>

        {/* Category Summary */}
        {selectedCategory !== 'all' && (
          <div className="client-list-category-summary">
            <div className="client-list-category-banner" style={{ backgroundColor: getCategoryColor(selectedCategory) + '20', borderLeftColor: getCategoryColor(selectedCategory) }}>
              <div className="client-list-category-banner-icon">
                <i className={getCategoryIcon(selectedCategory)} style={{ color: getCategoryColor(selectedCategory) }}></i>
              </div>
              <div className="client-list-category-banner-content">
                <h3>{selectedCategory} Clients</h3>
                <p>
                  {stats[selectedCategory]?.count || 0} organizations • 
                  ${(stats[selectedCategory]?.funding || 0).toLocaleString()} total funding • 
                  {stats[selectedCategory]?.grants || 0} grants submitted
                </p>
              </div>
              <div className="client-list-category-banner-actions">
                <button className="client-list-category-action-btn">
                  <i className="fas fa-envelope"></i>
                  Email All
                </button>
                <button className="client-list-category-action-btn">
                  <i className="fas fa-chart-bar"></i>
                  Reports
                </button>
              </div>
            </div>
          </div>
        )}

        {filteredClients.length > 0 ? (
          <div className="client-list-content-area">
            <div className="client-list-table-section">
              <div className="client-list-table-header">
                <h3>
                  {selectedCategory === 'all' ? 'All Clients' : selectedCategory + ' Clients'} 
                  ({filteredClients.length})
                </h3>
                <div className="client-list-table-actions">
                  <button className="client-list-action-btn">
                    <i className="fas fa-download"></i>
                    Export
                  </button>
                  <button className="client-list-action-btn">
                    <i className="fas fa-print"></i>
                    Print
                  </button>
                </div>
              </div>
              
              <div className="client-list-table-container">
                <table className="client-list-table">
                  <thead>
                    <tr>
                      <th className="client-list-col-organization">Organization</th>
                      <th className="client-list-col-category">Category</th>
                      <th className="client-list-col-contact">Primary Contact</th>
                      <th className="client-list-col-type">Organization Type</th>
                      <th className="client-list-col-status">Status</th>
                      <th className="client-list-col-grants">Grants</th>
                      <th className="client-list-col-funding">Funding</th>
                      <th className="client-list-col-focus">Focus Areas</th>
                      <th className="client-list-col-contact-date">Last Contact</th>
                      <th className="client-list-col-actions">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClients.map(client => {
                      const clientCategory = getClientCategory(client);
                      const focusAreas = getClientFocusAreas(client);
                      
                      return (
                        <tr key={client._id} className="client-list-row">
                          <td className="client-list-col-organization">
                            <div className="client-list-client-info">
                              <div className="client-list-avatar-container">
                                <img 
                                  src={client.avatar || '/api/placeholder/40/40'} 
                                  alt={getClientValue(client, 'organizationName', 'organization')} 
                                  className="client-list-client-avatar" 
                                />
                                {client.status === 'active' && <div className="client-list-online-indicator"></div>}
                              </div>
                              <div className="client-list-client-details">
                                <span className="client-list-client-name" onClick={() => onViewClient(client)}>
                                  {getClientValue(client, 'organizationName', 'organization')}
                                </span>
                                <div className="client-list-client-meta">
                                  <div className="client-list-client-email">
                                    <i className="fas fa-envelope"></i>
                                    {getClientValue(client, 'emailAddress', 'email')}
                                  </div>
                                  {client.website && (
                                    <div className="client-list-client-website">
                                      <i className="fas fa-globe"></i>
                                      <a href={client.website} target="_blank" rel="noopener noreferrer">
                                        {client.website.replace(/^https?:\/\//, '').split('/')[0]}
                                      </a>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="client-list-col-category">
                            {clientCategory ? (
                              <div className="client-list-category-badge" style={{ backgroundColor: getCategoryColor(clientCategory) + '20', color: getCategoryColor(clientCategory) }}>
                                <i className={getCategoryIcon(clientCategory)}></i>
                                {clientCategory}
                              </div>
                            ) : (
                              <span className="client-list-no-category">
                                Uncategorized
                              </span>
                            )}
                          </td>
                          <td className="client-list-col-contact">
                            <div className="client-list-contact-info">
                              <div className="client-list-contact-name">
                                <strong>{getClientValue(client, 'primaryContactName', 'name')}</strong>
                              </div>
                              <div className="client-list-contact-meta">
                                <div className="client-list-contact-role">
                                  <i className="fas fa-briefcase"></i>
                                  {client.titleRole || 'Not specified'}
                                </div>
                                <div className="client-list-phone">
                                  <i className="fas fa-phone"></i>
                                  {getClientValue(client, 'phoneNumbers', 'phone') || 'Not specified'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="client-list-col-type">
                            <div className="client-list-organization-type">
                              <i className={getOrganizationTypeIcon(client.organizationType)}></i>
                              <span>{client.organizationType || 'Not specified'}</span>
                            </div>
                            {client.annualBudget && (
                              <div className="client-list-budget">
                                <i className="fas fa-money-bill-wave"></i>
                                {client.annualBudget}
                              </div>
                            )}
                          </td>
                          <td className="client-list-col-status">
                            <div className="client-list-status-cell">
                              {getStatusBadge(client.status)}
                              {client.staffCount && (
                                <div className="client-list-staff-size">
                                  <small>{client.staffCount} staff</small>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="client-list-col-grants">
                            <div className="client-list-grants-stats">
                              <div className="client-list-grant-count">
                                <strong>{client.grantsSubmitted || 0}</strong> submitted
                              </div>
                              <div className="client-list-grant-success">
                                <strong>{client.grantsAwarded || 0}</strong> awarded
                                {client.grantsSubmitted > 0 && (
                                  <span className="client-list-success-rate">
                                    ({Math.round((client.grantsAwarded / client.grantsSubmitted) * 100)}%)
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="client-list-col-funding">
                            <div className="client-list-funding-amount">
                              {getClientFunding(client)}
                            </div>
                          </td>
                          <td className="client-list-col-focus">
                            <div className="client-list-focus-areas">
                              {focusAreas.length > 0 ? (
                                <div className="client-list-tags">
                                  {focusAreas.slice(0, 3).map((area, index) => (
                                    <span key={index} className="client-list-tag">
                                      {area}
                                    </span>
                                  ))}
                                  {focusAreas.length > 3 && (
                                    <span className="client-list-tag-more">
                                      +{focusAreas.length - 3} more
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="client-list-no-focus">No focus areas</span>
                              )}
                            </div>
                          </td>
                          <td className="client-list-col-contact-date">
                            <div className="client-list-last-contact">
                              {client.lastContact ? new Date(client.lastContact).toLocaleDateString() : 'Never'}
                            </div>
                          </td>
                          <td className="client-list-col-actions">
                            <div className="client-list-action-buttons">
                              <button 
                                className="client-list-btn-icon" 
                                onClick={() => onCommunication(client)}
                                title="Communication"
                              >
                                <i className="fas fa-comments"></i>
                              </button>
                              <button 
                                className="client-list-btn-icon" 
                                onClick={() => onSendEmail(client)}
                                title="Send Email"
                              >
                                <i className="fas fa-envelope"></i>
                              </button>
                              <button 
                                className="client-list-btn-icon" 
                                onClick={() => onViewHistory(client)}
                                title="View History"
                              >
                                <i className="fas fa-history"></i>
                              </button>
                              <button 
                                className="client-list-btn-icon" 
                                onClick={() => handleEditClick(client)}
                                title="Edit Client"
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                              <button 
                                className="client-list-btn-icon danger" 
                                onClick={() => handleDeleteClick(client)}
                                title="Delete Client"
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Summary Section */}
            <div className="client-list-summary-section">
              <div className="client-list-summary-cards">
                <div className="client-list-summary-card">
                  <div className="client-list-summary-icon primary">
                    <i className="fas fa-users"></i>
                  </div>
                  <div className="client-list-summary-content">
                    <h3>{filteredClients.length}</h3>
                    <p>Total Clients</p>
                  </div>
                </div>
                <div className="client-list-summary-card">
                  <div className="client-list-summary-icon success">
                    <i className="fas fa-check-circle"></i>
                  </div>
                  <div className="client-list-summary-content">
                    <h3>{filteredClients.filter(c => c.status === 'active').length}</h3>
                    <p>Active Clients</p>
                  </div>
                </div>
                <div className="client-list-summary-card">
                  <div className="client-list-summary-icon warning">
                    <i className="fas fa-chart-line"></i>
                  </div>
                  <div className="client-list-summary-content">
                    <h3>${filteredClients.reduce((total, client) => {
                      const amount = parseFloat(client.totalFunding?.toString().replace(/[$,]/g, '') || '0');
                      return total + (isNaN(amount) ? 0 : amount);
                    }, 0).toLocaleString()}</h3>
                    <p>Total Funding</p>
                  </div>
                </div>
                <div className="client-list-summary-card">
                  <div className="client-list-summary-icon info">
                    <i className="fas fa-file-alt"></i>
                  </div>
                  <div className="client-list-summary-content">
                    <h3>{filteredClients.reduce((total, client) => total + (parseInt(client.grantsSubmitted) || 0), 0)}</h3>
                    <p>Grants Submitted</p>
                  </div>
                </div>
              </div>

              {/* Category Distribution - COMPLETELY REMOVED */}

              {/* Additional Statistics */}
              <div className="client-list-additional-stats">
                <div className="client-list-stat-card">
                  <div className="client-list-stat-icon">
                    <i className="fas fa-map-marker-alt"></i>
                  </div>
                  <div className="client-list-stat-content">
                    <h4>Service Areas</h4>
                    <p>
                      {[...new Set(filteredClients.map(c => c.serviceArea).filter(Boolean))].join(', ') || 'Not specified'}
                    </p>
                  </div>
                </div>
                <div className="client-list-stat-card">
                  <div className="client-list-stat-icon">
                    <i className="fas fa-tags"></i>
                  </div>
                  <div className="client-list-stat-content">
                    <h4>Organization Types</h4>
                    <p>
                      {[...new Set(filteredClients.map(c => c.organizationType).filter(Boolean))].length} types
                    </p>
                  </div>
                </div>
                <div className="client-list-stat-card">
                  <div className="client-list-stat-icon">
                    <i className="fas fa-bullseye"></i>
                  </div>
                  <div className="client-list-stat-content">
                    <h4>Focus Areas</h4>
                    <p>
                      {[...new Set(filteredClients.flatMap(c => getClientFocusAreas(c)))].length} unique areas
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="client-list-no-clients">
            <div className="client-list-empty-state">
              <i className="fas fa-users"></i>
              <h3>No clients found</h3>
              <p>
                {searchTerm 
                  ? `No clients match your search for "${searchTerm}"`
                  : selectedCategory !== 'all'
                  ? `No clients found in the ${selectedCategory} category`
                  : "Get started by adding your first client to manage grants and communications."
                }
              </p>
              <button className="client-list-btn client-list-btn-primary" onClick={onAddClient}>
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