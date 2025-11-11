// components/Dashboard/Grants/Grants.js
import React, { useState, useEffect } from 'react';
import GrantForm from './GrantForm';
import GrantDraft from './GrantDraft'; // ADD THIS IMPORT
import './Grants.css';

// Icons
const Icon = {
  Add: () => <span>➕</span>,
  Download: () => <span>📥</span>,
  Search: () => <span>🔍</span>,
  View: () => <span>👁️</span>,
  Edit: () => <span>✏️</span>,
  Delete: () => <span>🗑️</span>,
  Document: () => <span>📄</span>,
  TrendingUp: () => <span>📈</span>,
  TrendingDown: () => <span>📉</span>,
  Dollar: () => <span>💵</span>,
  Check: () => <span>✅</span>,
  Pending: () => <span>⏳</span>,
  Draft: () => <span>📝</span>,
  Clients: () => <span>👥</span>,
  Match: () => <span>🎯</span>
};

const Grants = ({ onNavigateToMatching, onNavigateToNewGrant, onNavigateToDrafts }) => {
  const [currentView, setCurrentView] = useState('grants'); // 'grants', 'form', 'drafts'
  const [grants, setGrants] = useState([]);
  const [draftGrants, setDraftGrants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [activeNav, setActiveNav] = useState('all');

  // Load grants and drafts on component mount
  useEffect(() => {
    const fetchGrants = async () => {
      setLoading(true);
      
      // Load drafts from localStorage
      const savedDrafts = localStorage.getItem('grantDrafts');
      if (savedDrafts) {
        setDraftGrants(JSON.parse(savedDrafts));
      }

      // Mock API call for grants
      setTimeout(() => {
        setGrants([
          {
            id: 1,
            grantName: 'Community Development Fund 2024',
            client: 'City Renewal Project',
            amount: '$250,000',
            status: 'active',
            deadline: '2024-06-30',
            submittedDate: '2024-01-15',
            programOfficer: 'Sarah Johnson',
            progress: 75,
            category: 'Community Development'
          },
          {
            id: 2,
            grantName: 'STEM Education Initiative',
            client: 'Tech Futures Inc.',
            amount: '$150,000',
            status: 'pending',
            deadline: '2024-07-15',
            submittedDate: '2024-02-01',
            programOfficer: 'Michael Chen',
            progress: 40,
            category: 'Education'
          },
          {
            id: 3,
            grantName: 'Healthcare Access Grant',
            client: 'Rural Health Alliance',
            amount: '$500,000',
            status: 'closed',
            deadline: '2024-05-20',
            submittedDate: '2024-01-10',
            programOfficer: 'Emily Rodriguez',
            progress: 100,
            category: 'Healthcare'
          },
          {
            id: 4,
            grantName: 'Environmental Sustainability',
            client: 'Green Earth Foundation',
            amount: '$300,000',
            status: 'draft',
            deadline: '2024-08-30',
            submittedDate: '2024-02-15',
            programOfficer: 'David Kim',
            progress: 25,
            category: 'Environment'
          },
          {
            id: 5,
            grantName: 'Arts & Culture Program',
            client: 'Creative Community Hub',
            amount: '$175,000',
            status: 'active',
            deadline: '2024-09-15',
            submittedDate: '2024-03-01',
            programOfficer: 'Lisa Wang',
            progress: 60,
            category: 'Arts'
          }
        ]);
        setLoading(false);
      }, 1000);
    };

    fetchGrants();
  }, []);

  // Update drafts when localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const savedDrafts = localStorage.getItem('grantDrafts');
      if (savedDrafts) {
        setDraftGrants(JSON.parse(savedDrafts));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also check for drafts periodically
    const interval = setInterval(() => {
      const savedDrafts = localStorage.getItem('grantDrafts');
      if (savedDrafts) {
        setDraftGrants(JSON.parse(savedDrafts));
      }
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Navigation functions
  const handleNewGrant = () => {
    console.log('Opening Grant Form...');
    setCurrentView('grantForm');
  };

  const handleViewDrafts = () => {
    console.log('Opening Drafts...');
    setCurrentView('drafts');
  };

  const handleBackToGrants = () => {
    setCurrentView('grants');
  };

  const handleSaveGrant = (grantData) => {
    console.log('Saving grant:', grantData);
    // Here you would typically save to your backend or state
    handleBackToGrants();
  };

  const handleClientMatching = () => {
    console.log('Navigate to client matching');
    if (onNavigateToMatching) {
      onNavigateToMatching();
    } else {
      alert('Client Matching feature would open here');
    }
  };

  // NEW: If we're in drafts view, show the GrantDraft component
  if (currentView === 'drafts') {
    return (
      <GrantDraft 
        onBack={handleBackToGrants}
        drafts={draftGrants}
      />
    );
  }

  // If we're in grantForm view, show the GrantForm component
  if (currentView === 'grantForm') {
    return (
      <GrantForm 
        onSave={handleSaveGrant}
        onCancel={handleBackToGrants}
        mode="create"
      />
    );
  }

  // Rest of your existing functions
  const handleNavClick = (navItem) => {
    console.log('Nav click:', navItem);
    setActiveNav(navItem);
    if (navItem === 'drafts') {
      handleViewDrafts(); // UPDATED: Use internal navigation
    } else if (navItem === 'matching') {
      handleClientMatching();
    } else {
      setStatusFilter(navItem === 'all' ? 'all' : navItem);
    }
  };

  const handleViewGrant = (grantId) => {
    console.log('View grant:', grantId);
    alert(`Viewing grant ${grantId} - This would open a detailed view`);
  };

  const handleEditGrant = (grantId) => {
    console.log('Edit grant:', grantId);
    alert(`Editing grant ${grantId} - This would open the grant form in edit mode`);
  };

  const handleDeleteGrant = (grantId) => {
    if (window.confirm('Are you sure you want to delete this grant?')) {
      setGrants(prev => prev.filter(grant => grant.id !== grantId));
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { label: 'Active', className: 'grants-page-status-badge grants-page-status-active' },
      pending: { label: 'Pending', className: 'grants-page-status-badge grants-page-status-pending' },
      closed: { label: 'Closed', className: 'grants-page-status-badge grants-page-status-closed' },
      draft: { label: 'Draft', className: 'grants-page-status-badge grants-page-status-draft' }
    };
    
    const config = statusConfig[status] || { label: status, className: 'grants-page-status-badge grants-page-status-draft' };
    
    return (
      <span className={config.className}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredGrants = grants.filter(grant => {
    const matchesSearch = !searchQuery || 
      grant.grantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      grant.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      grant.programOfficer.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || grant.status === statusFilter;
    const matchesDate = dateFilter === 'all';

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Calculate stats including drafts
  const stats = {
    total: grants.length,
    active: grants.filter(g => g.status === 'active').length,
    pending: grants.filter(g => g.status === 'pending').length,
    drafts: draftGrants.length,
    totalAmount: grants.reduce((sum, grant) => {
      const amount = parseInt(grant.amount.replace(/[$,]/g, ''));
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0)
  };

  const getGrantInitials = (grantName) => {
    return grantName
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const handleDownloadReport = () => {
    console.log('Downloading grants report...');
    alert('Download functionality would generate and download a report');
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setDateFilter('all');
    setActiveNav('all');
  };

  if (loading) {
    return (
      <div className="grants-page-container">
        <div className="grants-page-loading">
          <Icon.Document />
          <p>Loading Grants...</p>
        </div>
      </div>
    );
  }

  // This is the original Grants component JSX that shows when currentView === 'grants'
  return (
    <div className="grants-page-container">
      {/* Navigation Bar */}
      <nav className="grants-page-nav">
        <div className="grants-page-nav-buttons">
          <div className="grants-page-nav-section">
            <button 
              className={`grants-page-nav-button ${activeNav === 'all' ? 'grants-active' : ''}`}
              onClick={() => handleNavClick('all')}
            >
              <Icon.Document />
              All Grants
              {grants.length > 0 && (
                <span className="grants-page-nav-count">{grants.length}</span>
              )}
            </button>
            <button 
              className={`grants-page-nav-button ${activeNav === 'active' ? 'grants-active' : ''}`}
              onClick={() => handleNavClick('active')}
            >
              <Icon.Check />
              Active
              {stats.active > 0 && (
                <span className="grants-page-nav-count">{stats.active}</span>
              )}
            </button>
            <button 
              className={`grants-page-nav-button ${activeNav === 'pending' ? 'grants-active' : ''}`}
              onClick={() => handleNavClick('pending')}
            >
              <Icon.Pending />
              Pending
              {stats.pending > 0 && (
                <span className="grants-page-nav-count">{stats.pending}</span>
              )}
            </button>
            <button 
              className={`grants-page-nav-button ${activeNav === 'drafts' ? 'grants-active' : ''}`}
              onClick={() => handleNavClick('drafts')}
            >
              <Icon.Draft />
              Drafts
              {stats.drafts > 0 && (
                <span className="grants-page-nav-count grants-page-nav-count-draft">
                  {stats.drafts}
                </span>
              )}
            </button>
            <button 
              className={`grants-page-nav-button ${activeNav === 'matching' ? 'grants-active' : ''}`}
              onClick={() => handleNavClick('matching')}
            >
              <Icon.Match />
              Client Matching
              <span className="grants-page-nav-count grants-page-nav-count-match">
                New
              </span>
            </button>
          </div>
        </div>

        <div className="grants-page-nav-actions">
          <button className="grants-page-nav-add-btn" onClick={handleNewGrant}>
            <Icon.Add />
            New Grant
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="grants-page-content">
        <div className="grants-page-list">
          <div className="grants-page-header">
            <div className="grants-page-header-content">
              <div className="grants-page-header-title">
                <h1>Grants Management</h1>
                <p>Track and manage all grant applications and funding opportunities</p>
                {activeNav !== 'all' && activeNav !== 'drafts' && activeNav !== 'matching' && (
                  <div className="grants-page-active-filter">
                    Currently viewing: <strong>{activeNav.charAt(0).toUpperCase() + activeNav.slice(1)} Grants</strong>
                    <button 
                      className="grants-page-clear-filter"
                      onClick={handleClearFilters}
                    >
                      Show All
                    </button>
                  </div>
                )}
              </div>
              <div className="grants-page-header-actions">
                <button 
                  className="grants-page-btn grants-page-btn-secondary"
                  onClick={handleDownloadReport}
                >
                  <Icon.Download />
                  Download Report
                </button>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grants-page-summary">
            <div className="grants-page-summary-card">
              <div className="grants-page-summary-icon grants-page-summary-primary">
                <Icon.Document />
              </div>
              <div className="grants-page-summary-content">
                <h3>{stats.total}</h3>
                <p>Total Grants</p>
                <div className="grants-page-stat-trend grants-page-trend-positive">
                  <Icon.TrendingUp /> +12% from last month
                </div>
              </div>
            </div>
            
            <div className="grants-page-summary-card">
              <div className="grants-page-summary-icon grants-page-summary-success">
                <Icon.Check />
              </div>
              <div className="grants-page-summary-content">
                <h3>{stats.active}</h3>
                <p>Active Grants</p>
                <div className="grants-page-stat-trend grants-page-trend-positive">
                  <Icon.TrendingUp /> +5% from last quarter
                </div>
              </div>
            </div>
            
            <div className="grants-page-summary-card">
              <div className="grants-page-summary-icon grants-page-summary-warning">
                <Icon.Pending />
              </div>
              <div className="grants-page-summary-content">
                <h3>{stats.pending}</h3>
                <p>Pending Review</p>
                <div className="grants-page-stat-trend grants-page-trend-negative">
                  <Icon.TrendingDown /> -2% from last week
                </div>
              </div>
            </div>
            
            <div className="grants-page-summary-card">
              <div className="grants-page-summary-icon grants-page-summary-info">
                <Icon.Dollar />
              </div>
              <div className="grants-page-summary-content">
                <h3>${(stats.totalAmount / 1000).toFixed(0)}K</h3>
                <p>Total Funding</p>
                <div className="grants-page-stat-trend grants-page-trend-positive">
                  <Icon.TrendingUp /> +8% from last quarter
                </div>
              </div>
            </div>
          </div>

          {/* Client Matching Quick Access */}
          <div className="grants-page-matching-alert">
            <div className="grants-page-matching-alert-content">
              <Icon.Match />
              <div className="grants-page-matching-alert-text">
                <strong>Discover the perfect grants for your clients</strong>
                <span>Use our smart matching system to find grants that align with your clients' profiles and needs</span>
              </div>
              <button 
                className="grants-page-btn grants-page-btn-primary"
                onClick={handleClientMatching}
              >
                Explore Client Matching
              </button>
            </div>
          </div>

          {/* Drafts Quick Access */}
          {stats.drafts > 0 && (
            <div className="grants-page-drafts-alert">
              <div className="grants-page-drafts-alert-content">
                <Icon.Draft />
                <div className="grants-page-drafts-alert-text">
                  <strong>You have {stats.drafts} saved draft{stats.drafts !== 1 ? 's' : ''}</strong>
                  <span>Continue working on your draft grant applications</span>
                </div>
                <button 
                  className="grants-page-btn grants-page-btn-secondary"
                  onClick={handleViewDrafts} // UPDATED: Use internal navigation
                >
                  View Drafts
                </button>
              </div>
            </div>
          )}

          {/* Toolbar */}
          <div className="grants-page-toolbar">
            <div className="grants-page-search-box">
              <Icon.Search />
              <input
                type="text"
                placeholder="Search grants, clients, or program officers..."
                value={searchQuery}
                onChange={handleSearch}
              />
              {searchQuery && (
                <button 
                  className="grants-page-search-clear"
                  onClick={() => setSearchQuery('')}
                >
                  ×
                </button>
              )}
            </div>
            
            <div className="grants-page-filters">
              <select 
                className="grants-page-filter-select"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setActiveNav(e.target.value === 'all' ? 'all' : e.target.value);
                }}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="closed">Closed</option>
                <option value="draft">Draft</option>
              </select>
              
              <select 
                className="grants-page-filter-select"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <option value="all">All Dates</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
              </select>

              {(searchQuery || statusFilter !== 'all' || dateFilter !== 'all') && (
                <button 
                  className="grants-page-clear-filters-btn"
                  onClick={handleClearFilters}
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Grants Table */}
          <div className="grants-page-table-container">
            {filteredGrants.length === 0 ? (
              <div className="grants-page-no-grants">
                <div className="grants-page-empty-state">
                  <Icon.Document />
                  <h3>No Grants Found</h3>
                  <p>
                    {searchQuery || statusFilter !== 'all' || dateFilter !== 'all' 
                      ? "No grants match your current search criteria. Try adjusting your filters or search terms."
                      : "You don't have any grants yet. Start by creating your first grant application."
                    }
                  </p>
                  <div className="grants-page-empty-actions">
                    <button 
                      className="grants-page-btn grants-page-btn-primary"
                      onClick={handleNewGrant}
                    >
                      <Icon.Add />
                      Create New Grant
                    </button>
                    <button 
                      className="grants-page-btn grants-page-btn-secondary"
                      onClick={handleClientMatching}
                    >
                      <Icon.Match />
                      Find Grants for Clients
                    </button>
                    {(searchQuery || statusFilter !== 'all' || dateFilter !== 'all') && (
                      <button 
                        className="grants-page-btn grants-page-btn-secondary"
                        onClick={handleClearFilters}
                      >
                        Clear Filters
                      </button>
                    )}
                    {stats.drafts > 0 && (
                      <button 
                        className="grants-page-btn grants-page-btn-secondary"
                        onClick={handleViewDrafts} // UPDATED: Use internal navigation
                      >
                        <Icon.Draft />
                        View Drafts ({stats.drafts})
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="grants-page-table-header">
                  <div className="grants-page-table-results">
                    Showing {filteredGrants.length} of {grants.length} grants
                    {(searchQuery || statusFilter !== 'all') && (
                      <span className="grants-page-filter-indicator">
                        {searchQuery && ` • Search: "${searchQuery}"`}
                        {statusFilter !== 'all' && ` • Status: ${statusFilter}`}
                      </span>
                    )}
                  </div>
                </div>
                <table className="grants-page-table">
                  <thead>
                    <tr>
                      <th>Grant Information</th>
                      <th>Status</th>
                      <th>Funding Amount</th>
                      <th>Deadline</th>
                      <th>Program Officer</th>
                      <th>Progress</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredGrants.map(grant => (
                      <tr key={grant.id} className="grants-page-row">
                        <td>
                          <div className="grants-page-grant-info">
                            <div className="grants-page-grant-icon">
                              {getGrantInitials(grant.grantName)}
                            </div>
                            <div className="grants-page-grant-details">
                              <div 
                                className="grants-page-grant-name"
                                onClick={() => handleViewGrant(grant.id)}
                                style={{ cursor: 'pointer' }}
                              >
                                {grant.grantName}
                              </div>
                              <div className="grants-page-grant-client">{grant.client}</div>
                              {grant.category && (
                                <div className="grants-page-grant-category">{grant.category}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          {getStatusBadge(grant.status)}
                        </td>
                        <td>
                          <div className="grants-page-funding-amount">{grant.amount}</div>
                        </td>
                        <td>
                          <div className="grants-page-date">{formatDate(grant.deadline)}</div>
                        </td>
                        <td>
                          <div className="grants-page-grant-client">{grant.programOfficer}</div>
                        </td>
                        <td>
                          <div className="grants-page-progress-bar">
                            <div 
                              className="grants-page-progress-fill" 
                              style={{ width: `${grant.progress}%` }}
                            ></div>
                          </div>
                          <div className="grants-page-date">{grant.progress}% Complete</div>
                        </td>
                        <td>
                          <div className="grants-page-action-buttons">
                            <button 
                              className="grants-page-btn-icon" 
                              title="View Grant"
                              onClick={() => handleViewGrant(grant.id)}
                            >
                              <Icon.View />
                            </button>
                            <button 
                              className="grants-page-btn-icon" 
                              title="Edit Grant"
                              onClick={() => handleEditGrant(grant.id)}
                            >
                              <Icon.Edit />
                            </button>
                            <button 
                              className="grants-page-btn-icon grants-page-btn-icon-danger" 
                              title="Delete Grant"
                              onClick={() => handleDeleteGrant(grant.id)}
                            >
                              <Icon.Delete />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Grants;