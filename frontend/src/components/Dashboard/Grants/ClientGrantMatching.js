// components/Dashboard/Grants/ClientGrantMatching.js
import React, { useState, useEffect } from 'react';
import './ClientGrantMatching.css';

const ClientGrantMatching = ({ onNavigateToGrants, onNavigateToNewGrant }) => {
  const [clients, setClients] = useState([]);
  const [grants, setGrants] = useState([]);
  const [filteredMatches, setFilteredMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [dataSource, setDataSource] = useState('matched'); // 'matched', 'allClients', 'allGrants'
  const [fetchStatus, setFetchStatus] = useState({
    clients: 'idle', // 'idle', 'loading', 'success', 'error'
    grants: 'idle'
  });

  // Mock client data - expanded with more clients
  const mockClients = [
    {
      id: 1,
      name: 'GreenTech Initiative',
      type: 'Environmental',
      focusArea: 'Clean Technology, Sustainability',
      budget: '$500,000',
      location: 'San Francisco, CA',
      established: '2018',
      employees: '25',
      description: 'Developing innovative clean technology solutions for urban environments',
      status: 'active',
      matchScore: 92,
      avatar: '🌱'
    },
    {
      id: 2,
      name: 'Community Health Alliance',
      type: 'Healthcare',
      focusArea: 'Rural Healthcare, Mental Health',
      budget: '$300,000',
      location: 'Austin, TX',
      established: '2015',
      employees: '18',
      description: 'Providing healthcare access to underserved rural communities',
      status: 'active',
      matchScore: 88,
      avatar: '🏥'
    },
    {
      id: 3,
      name: 'Youth Future Foundation',
      type: 'Education',
      focusArea: 'STEM Education, Youth Development',
      budget: '$250,000',
      location: 'New York, NY',
      established: '2012',
      employees: '32',
      description: 'Empowering youth through STEM education and career development',
      status: 'vip',
      matchScore: 95,
      avatar: '🎓'
    },
    {
      id: 4,
      name: 'Arts Collective',
      type: 'Arts & Culture',
      focusArea: 'Public Art, Community Arts',
      budget: '$150,000',
      location: 'Portland, OR',
      established: '2019',
      employees: '8',
      description: 'Promoting public art and cultural programs in urban communities',
      status: 'active',
      matchScore: 78,
      avatar: '🎨'
    },
    {
      id: 5,
      name: 'Sustainable Agriculture Network',
      type: 'Agriculture',
      focusArea: 'Organic Farming, Food Security',
      budget: '$400,000',
      location: 'Denver, CO',
      established: '2016',
      employees: '15',
      description: 'Supporting sustainable farming practices and local food systems',
      status: 'pending',
      matchScore: 85,
      avatar: '🌾'
    },
    // Additional clients for "All Clients" view
    {
      id: 6,
      name: 'Tech Education Hub',
      type: 'Education',
      focusArea: 'Digital Literacy, Coding Bootcamps',
      budget: '$200,000',
      location: 'Seattle, WA',
      established: '2020',
      employees: '12',
      description: 'Providing technology education and career transition programs',
      status: 'active',
      matchScore: 65,
      avatar: '💻'
    },
    {
      id: 7,
      name: 'Urban Green Spaces',
      type: 'Environmental',
      focusArea: 'Urban Forestry, Park Development',
      budget: '$350,000',
      location: 'Chicago, IL',
      established: '2014',
      employees: '20',
      description: 'Creating and maintaining green spaces in urban environments',
      status: 'active',
      matchScore: 72,
      avatar: '🌳'
    },
    {
      id: 8,
      name: 'Mental Wellness Center',
      type: 'Healthcare',
      focusArea: 'Mental Health, Counseling Services',
      budget: '$280,000',
      location: 'Boston, MA',
      established: '2017',
      employees: '14',
      description: 'Providing accessible mental health services to the community',
      status: 'vip',
      matchScore: 89,
      avatar: '🧠'
    }
  ];

  // Mock grants data - expanded with more grants
  const mockGrants = [
    {
      id: 1,
      grantName: 'Clean Energy Innovation Fund',
      category: 'Environmental',
      amount: '$250,000',
      status: 'active',
      deadline: '2024-06-30',
      eligibility: ['Environmental', 'Technology'],
      focusAreas: ['Clean Technology', 'Sustainability', 'Renewable Energy'],
      minBudget: '$100,000',
      location: 'National',
      description: 'Funding for innovative clean energy solutions and sustainable technology development'
    },
    {
      id: 2,
      grantName: 'Rural Healthcare Access Program',
      category: 'Healthcare',
      amount: '$500,000',
      status: 'active',
      deadline: '2024-07-15',
      eligibility: ['Healthcare', 'Non-Profit'],
      focusAreas: ['Rural Health', 'Healthcare Access', 'Community Health'],
      minBudget: '$200,000',
      location: 'Rural Areas',
      description: 'Support for healthcare organizations serving rural and underserved communities'
    },
    {
      id: 3,
      grantName: 'STEM Education Initiative',
      category: 'Education',
      amount: '$300,000',
      status: 'active',
      deadline: '2024-08-20',
      eligibility: ['Education', 'Non-Profit'],
      focusAreas: ['STEM Education', 'Youth Development', 'Career Training'],
      minBudget: '$150,000',
      location: 'National',
      description: 'Funding for STEM education programs and youth career development initiatives'
    },
    {
      id: 4,
      grantName: 'Community Arts Development Grant',
      category: 'Arts',
      amount: '$175,000',
      status: 'active',
      deadline: '2024-09-15',
      eligibility: ['Arts & Culture', 'Non-Profit'],
      focusAreas: ['Public Art', 'Cultural Programs', 'Community Engagement'],
      minBudget: '$75,000',
      location: 'Urban Areas',
      description: 'Support for public art installations and community cultural programs'
    },
    {
      id: 5,
      grantName: 'Sustainable Agriculture Fund',
      category: 'Agriculture',
      amount: '$400,000',
      status: 'active',
      deadline: '2024-10-30',
      eligibility: ['Agriculture', 'Environmental'],
      focusAreas: ['Organic Farming', 'Food Security', 'Sustainable Agriculture'],
      minBudget: '$180,000',
      location: 'National',
      description: 'Funding for sustainable agriculture practices and local food system development'
    },
    {
      id: 6,
      grantName: 'Urban Renewal and Development',
      category: 'Community Development',
      amount: '$600,000',
      status: 'active',
      deadline: '2024-11-15',
      eligibility: ['Community Development', 'Non-Profit'],
      focusAreas: ['Urban Development', 'Community Infrastructure', 'Public Spaces'],
      minBudget: '$250,000',
      location: 'Urban Areas',
      description: 'Support for urban renewal projects and community infrastructure development'
    }
  ];

  // All clients from the system (simulating data from Client Tab)
  const allSystemClients = [...mockClients, 
    {
      id: 9,
      name: 'Senior Care Network',
      type: 'Healthcare',
      focusArea: 'Elderly Care, Senior Services',
      budget: '$450,000',
      location: 'Miami, FL',
      established: '2013',
      employees: '28',
      description: 'Providing comprehensive care and services for senior citizens',
      status: 'active',
      matchScore: 60,
      avatar: '👵'
    },
    {
      id: 10,
      name: 'Digital Arts Foundation',
      type: 'Arts & Culture',
      focusArea: 'Digital Media, Interactive Arts',
      budget: '$180,000',
      location: 'Los Angeles, CA',
      established: '2021',
      employees: '6',
      description: 'Promoting digital arts and interactive media experiences',
      status: 'pending',
      matchScore: 45,
      avatar: '🎭'
    }
  ];

  // All grants from the system
  const allSystemGrants = [...mockGrants,
    {
      id: 7,
      grantName: 'Digital Literacy Advancement Grant',
      category: 'Education',
      amount: '$150,000',
      status: 'active',
      deadline: '2024-12-10',
      eligibility: ['Education', 'Technology'],
      focusAreas: ['Digital Literacy', 'Technology Education', 'Workforce Development'],
      minBudget: '$50,000',
      location: 'National',
      description: 'Support for digital literacy programs and technology education initiatives'
    },
    {
      id: 8,
      grantName: 'Mental Health Innovation Award',
      category: 'Healthcare',
      amount: '$350,000',
      status: 'active',
      deadline: '2024-11-30',
      eligibility: ['Healthcare', 'Mental Health'],
      focusAreas: ['Mental Health', 'Counseling', 'Community Support'],
      minBudget: '$120,000',
      location: 'National',
      description: 'Funding for innovative mental health programs and community support services'
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // Simulate API call
      setTimeout(() => {
        setClients(mockClients);
        setGrants(mockGrants);
        setLoading(false);
      }, 1500);
    };

    fetchData();
  }, []);

  // Match clients with applicable grants
  useEffect(() => {
    if (clients.length > 0 && grants.length > 0) {
      const matches = clients.map(client => {
        const applicableGrants = grants.filter(grant => 
          isGrantApplicable(client, grant)
        );
        
        return {
          client,
          applicableGrants,
          matchScore: calculateMatchScore(client, applicableGrants)
        };
      });
      
      setFilteredMatches(matches);
    }
  }, [clients, grants, searchQuery, activeFilter]);

  const isGrantApplicable = (client, grant) => {
    // Check eligibility based on client type
    const isEligible = grant.eligibility.some(eligibility => 
      client.type.includes(eligibility) || eligibility.includes(client.type)
    );
    
    // Check focus area match
    const focusMatch = grant.focusAreas.some(area => 
      client.focusArea.includes(area) || area.includes(client.focusArea)
    );
    
    // Check budget requirements
    const clientBudget = parseInt(client.budget.replace(/[$,]/g, ''));
    const minBudget = parseInt(grant.minBudget.replace(/[$,]/g, ''));
    const budgetMatch = clientBudget >= minBudget;
    
    return isEligible && focusMatch && budgetMatch;
  };

  const calculateMatchScore = (client, applicableGrants) => {
    if (applicableGrants.length === 0) return 0;
    
    // Calculate score based on number of matches and client status
    const baseScore = (applicableGrants.length / grants.length) * 100;
    const statusMultiplier = client.status === 'vip' ? 1.2 : 1;
    
    return Math.min(Math.round(baseScore * statusMultiplier), 100);
  };

  const handleFetchAllClients = async () => {
    setFetchStatus(prev => ({ ...prev, clients: 'loading' }));
    setDataSource('allClients');
    
    // Simulate API call to fetch all clients
    setTimeout(() => {
      setClients(allSystemClients);
      setFetchStatus(prev => ({ ...prev, clients: 'success' }));
    }, 1000);
  };

  const handleFetchAllGrants = async () => {
    setFetchStatus(prev => ({ ...prev, grants: 'loading' }));
    setDataSource('allGrants');
    
    // Simulate API call to fetch all grants
    setTimeout(() => {
      setGrants(allSystemGrants);
      setFetchStatus(prev => ({ ...prev, grants: 'success' }));
    }, 1000);
  };

  const handleResetToMatches = () => {
    setDataSource('matched');
    setClients(mockClients);
    setGrants(mockGrants);
    setSearchQuery('');
    setActiveFilter('all');
    setSelectedClient(null);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  const handleClientSelect = (client) => {
    setSelectedClient(selectedClient?.id === client.id ? null : client);
  };

  const handleApplyGrant = (client, grant) => {
    console.log('Applying grant:', grant.grantName, 'for client:', client.name);
    if (onNavigateToNewGrant) {
      onNavigateToNewGrant({ client, grant });
    }
  };

  const handleExploreMatching = () => {
    setShowComingSoon(true);
  };

  const closeComingSoon = () => {
    setShowComingSoon(false);
  };

  const getMatchBadge = (score) => {
    if (score >= 90) return 'match-score-excellent';
    if (score >= 80) return 'match-score-good';
    if (score >= 70) return 'match-score-fair';
    return 'match-score-poor';
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active': return 'client-status-active';
      case 'vip': return 'client-status-vip';
      case 'pending': return 'client-status-pending';
      default: return 'client-status-active';
    }
  };

  const getDataSourceBadge = () => {
    switch (dataSource) {
      case 'allClients': return 'data-source-all-clients';
      case 'allGrants': return 'data-source-all-grants';
      default: return 'data-source-matched';
    }
  };

  const filteredClients = filteredMatches.filter(match =>
    match.client.name.toLowerCase().includes(searchQuery) ||
    match.client.type.toLowerCase().includes(searchQuery) ||
    match.client.focusArea.toLowerCase().includes(searchQuery)
  );

  if (loading) {
    return (
      <div className="grants-page-container">
        <div className="grants-page-loading">
          <span className="loading-icon">🎯</span>
          <p>Analyzing Client-Grant Matches...</p>
          <div className="loading-bar">
            <div className="loading-progress"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grants-page-container">
      {/* Navigation Bar */}
      <nav className="grants-page-nav">
        <div className="grants-page-nav-buttons">
          <div className="grants-page-nav-section">
            <button 
              className="grants-page-nav-button back-button"
              onClick={onNavigateToGrants}
            >
              <span className="button-icon">←</span>
              Back to Grants
            </button>
          </div>
        </div>
        
        <div className="grants-page-nav-actions">
          <button 
            className="grants-page-nav-add-btn explore-matching-btn"
            onClick={handleExploreMatching}
          >
            <span className="button-icon">🔍</span>
            Explore Advanced Matching
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="grants-page-content">
        <div className="grants-page-list">
          <div className="grants-page-header">
            <div className="grants-page-header-content">
              <div className="grants-page-header-title">
                <h1>Client-Grant Matching</h1>
                <p>Discover the best grant opportunities for your clients based on their profile and needs</p>
              </div>
            </div>
          </div>

          {/* Data Source Controls - MOVED BENEATH THE HEADER */}
          <div className="data-source-controls">
            <div className="data-source-buttons">
              <button 
                className={`data-source-btn ${dataSource === 'matched' ? 'active' : ''}`}
                onClick={handleResetToMatches}
              >
                <span className="button-icon">🎯</span>
                Smart Matches
              </button>
              <button 
                className={`data-source-btn ${dataSource === 'allClients' ? 'active' : ''} ${
                  fetchStatus.clients === 'loading' ? 'loading' : ''
                }`}
                onClick={handleFetchAllClients}
                disabled={fetchStatus.clients === 'loading'}
              >
                <span className="button-icon">
                  {fetchStatus.clients === 'loading' ? '⏳' : '👥'}
                </span>
                {fetchStatus.clients === 'loading' ? 'Loading...' : 'All Clients'}
                <span className="client-count-badge">{allSystemClients.length}</span>
              </button>
              <button 
                className={`data-source-btn ${dataSource === 'allGrants' ? 'active' : ''} ${
                  fetchStatus.grants === 'loading' ? 'loading' : ''
                }`}
                onClick={handleFetchAllGrants}
                disabled={fetchStatus.grants === 'loading'}
              >
                <span className="button-icon">
                  {fetchStatus.grants === 'loading' ? '⏳' : '💰'}
                </span>
                {fetchStatus.grants === 'loading' ? 'Loading...' : 'All Grants'}
                <span className="grant-count-badge">{allSystemGrants.length}</span>
              </button>
            </div>
            
            {dataSource !== 'matched' && (
              <div className="data-source-info">
                <span className={`data-source-badge ${getDataSourceBadge()}`}>
                  {dataSource === 'allClients' ? 'Viewing All Clients' : 'Viewing All Grants'}
                </span>
                <button 
                  className="reset-view-btn"
                  onClick={handleResetToMatches}
                >
                  Return to Smart Matches
                </button>
              </div>
            )}
          </div>

          {/* Summary Stats */}
          <div className="grants-page-summary">
            <div className="grants-page-summary-card">
              <div className="grants-page-summary-icon grants-page-summary-primary">
                <span className="summary-icon">👥</span>
              </div>
              <div className="grants-page-summary-content">
                <h3>{clients.length}</h3>
                <p>
                  {dataSource === 'allClients' ? 'System Clients' : 
                   dataSource === 'allGrants' ? 'Clients with Grants' : 'Matched Clients'}
                </p>
                <div className="grants-page-stat-trend grants-page-trend-positive">
                  <span className="trend-icon">📈</span>
                  {dataSource === 'allClients' ? 'All available clients' : 
                   dataSource === 'allGrants' ? 'Viewing all grants' : 'Smart filtered'}
                </div>
              </div>
            </div>
            
            <div className="grants-page-summary-card">
              <div className="grants-page-summary-icon grants-page-summary-success">
                <span className="summary-icon">🎯</span>
              </div>
              <div className="grants-page-summary-content">
                <h3>{grants.length}</h3>
                <p>
                  {dataSource === 'allGrants' ? 'System Grants' : 'Available Grants'}
                </p>
                <div className="grants-page-stat-trend grants-page-trend-positive">
                  <span className="trend-icon">📈</span>
                  {dataSource === 'allGrants' ? 'All grants in system' : 
                   dataSource === 'allClients' ? 'Grants for all clients' : 'Matched grants'}
                </div>
              </div>
            </div>
            
            <div className="grants-page-summary-card">
              <div className="grants-page-summary-icon grants-page-summary-warning">
                <span className="summary-icon">📊</span>
              </div>
              <div className="grants-page-summary-content">
                <h3>
                  {filteredMatches.reduce((total, match) => total + match.applicableGrants.length, 0)}
                </h3>
                <p>Total Matches</p>
                <div className="grants-page-stat-trend grants-page-trend-positive">
                  <span className="trend-icon">
                    {dataSource === 'matched' ? '🎯' : dataSource === 'allClients' ? '👥' : '💰'}
                  </span>
                  {dataSource === 'matched' ? 'Smart matches' : 
                   dataSource === 'allClients' ? 'All clients view' : 'All grants view'}
                </div>
              </div>
            </div>
            
            <div className="grants-page-summary-card">
              <div className="grants-page-summary-icon grants-page-summary-info">
                <span className="summary-icon">⭐</span>
              </div>
              <div className="grants-page-summary-content">
                <h3>
                  {filteredMatches.length > 0 
                    ? Math.round(filteredMatches.reduce((total, match) => total + match.matchScore, 0) / filteredMatches.length)
                    : 0
                  }%
                </h3>
                <p>Avg Match Score</p>
                <div className="grants-page-stat-trend grants-page-trend-positive">
                  <span className="trend-icon">📈</span>
                  {dataSource === 'allClients' ? 'Extended client base' : 
                   dataSource === 'allGrants' ? 'Full grant catalog' : 'Optimized matching'}
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="grants-page-toolbar">
            <div className="grants-page-search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder={
                  dataSource === 'allClients' ? "Search all clients..." :
                  dataSource === 'allGrants' ? "Search clients with grants..." :
                  "Search clients by name, type, or focus area..."
                }
                value={searchQuery}
                onChange={handleSearch}
                className="search-input"
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
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value)}
              >
                <option value="all">All Clients</option>
                <option value="high-match">High Match (80%+)</option>
                <option value="vip">VIP Clients</option>
                <option value="environmental">Environmental</option>
                <option value="healthcare">Healthcare</option>
                <option value="education">Education</option>
                {dataSource === 'allClients' && <option value="low-match">Low Match (Below 50%)</option>}
              </select>
            </div>
          </div>

          {/* View Information Banner */}
          {dataSource !== 'matched' && (
            <div className={`view-info-banner ${getDataSourceBadge()}`}>
              <div className="banner-content">
                <span className="banner-icon">
                  {dataSource === 'allClients' ? '👥' : '💰'}
                </span>
                <div className="banner-text">
                  <h4>
                    {dataSource === 'allClients' ? 'All Clients View' : 'All Grants View'}
                  </h4>
                  <p>
                    {dataSource === 'allClients' 
                      ? `Viewing all ${clients.length} clients from your system. Some may have lower match scores as they're not pre-filtered.`
                      : `Viewing all ${grants.length} grants from the system. Explore broader opportunities beyond smart matches.`
                    }
                  </p>
                </div>
              </div>
              <button 
                className="banner-action-btn"
                onClick={handleResetToMatches}
              >
                Return to Smart Matches
              </button>
            </div>
          )}

          {/* Client-Grant Matches */}
          <div className="client-grant-matches">
            {filteredClients.length === 0 ? (
              <div className="grants-page-no-grants">
                <div className="grants-page-empty-state">
                  <span className="empty-icon">
                    {dataSource === 'allClients' ? '👥' : 
                     dataSource === 'allGrants' ? '💰' : '🎯'}
                  </span>
                  <h3>
                    {dataSource === 'allClients' ? 'No Clients Found' :
                     dataSource === 'allGrants' ? 'No Grant Matches Found' :
                     'No Client Matches Found'}
                  </h3>
                  <p>
                    {searchQuery 
                      ? "No clients match your search criteria. Try adjusting your search terms."
                      : dataSource === 'allClients' 
                        ? "No clients available in the system. Add clients to get started."
                        : dataSource === 'allGrants'
                          ? "No grant matches found with current filters."
                          : "No client-grant matches found. This could be due to specific eligibility requirements."
                    }
                  </p>
                  <div className="grants-page-empty-actions">
                    {searchQuery && (
                      <button 
                        className="grants-page-btn grants-page-btn-primary"
                        onClick={() => setSearchQuery('')}
                      >
                        Clear Search
                      </button>
                    )}
                    <button 
                      className="grants-page-btn grants-page-btn-secondary"
                      onClick={onNavigateToGrants}
                    >
                      Back to Grants
                    </button>
                    <button 
                      className="grants-page-btn grants-page-btn-outline"
                      onClick={handleExploreMatching}
                    >
                      Explore Advanced Matching
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              filteredClients.map((match) => (
                <div key={match.client.id} className="client-match-card">
                  <div 
                    className="client-match-header"
                    onClick={() => handleClientSelect(match.client)}
                  >
                    <div className="client-info">
                      <div className="client-avatar">
                        {match.client.avatar}
                      </div>
                      <div className="client-details">
                        <h3>{match.client.name}</h3>
                        <div className="client-meta">
                          <span className={`client-status ${getStatusBadge(match.client.status)}`}>
                            {match.client.status.toUpperCase()}
                          </span>
                          <span className="client-type">{match.client.type}</span>
                          <span className="client-focus">{match.client.focusArea}</span>
                          <span className="client-location">{match.client.location}</span>
                          {dataSource === 'allClients' && match.matchScore < 50 && (
                            <span className="client-low-match">LOW MATCH</span>
                          )}
                        </div>
                        <p className="client-description">{match.client.description}</p>
                      </div>
                    </div>
                    <div className="match-score">
                      <span className={`match-score-badge ${getMatchBadge(match.matchScore)}`}>
                        {match.matchScore}% Match
                      </span>
                      <span className="grant-count">
                        {match.applicableGrants.length} applicable grants
                      </span>
                      {dataSource === 'allClients' && (
                        <span className="data-source-indicator">
                          System Client
                        </span>
                      )}
                    </div>
                    <div className="expand-icon">
                      {selectedClient?.id === match.client.id ? '▲' : '▼'}
                    </div>
                  </div>
                  
                  {selectedClient?.id === match.client.id && (
                    <div className="applicable-grants">
                      <div className="applicable-grants-header">
                        <h4>
                          {dataSource === 'allGrants' ? 'All Available Grants' : 'Recommended Grants'}
                          {dataSource === 'allClients' && match.matchScore < 50 && (
                            <span className="low-match-warning">
                              ⚠️ Lower match score - consider refining client profile
                            </span>
                          )}
                        </h4>
                        <button 
                          className="grants-page-btn grants-page-btn-outline explore-matching-small"
                          onClick={handleExploreMatching}
                        >
                          <span className="button-icon">🔍</span>
                          Advanced Matching
                        </button>
                      </div>
                      {match.applicableGrants.length === 0 ? (
                        <div className="no-grants">
                          <p>
                            {dataSource === 'allGrants' 
                              ? "No grants currently match this client's profile. Consider expanding eligibility criteria."
                              : "No grants currently match this client's profile perfectly."
                            }
                          </p>
                          <div className="no-grants-actions">
                            <button 
                              className="grants-page-btn grants-page-btn-primary"
                              onClick={handleExploreMatching}
                            >
                              Explore Advanced Matching
                            </button>
                            {dataSource === 'allClients' && (
                              <button 
                                className="grants-page-btn grants-page-btn-outline"
                                onClick={handleFetchAllGrants}
                              >
                                View All Grants
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="grants-grid">
                          {match.applicableGrants.map(grant => (
                            <div key={grant.id} className="grant-match-card">
                              <div className="grant-match-info">
                                <h5>{grant.grantName}</h5>
                                <div className="grant-details">
                                  <span className="grant-amount">{grant.amount}</span>
                                  <span className="grant-deadline">
                                    Deadline: {new Date(grant.deadline).toLocaleDateString()}
                                  </span>
                                  <span className="grant-category">{grant.category}</span>
                                  {dataSource === 'allGrants' && (
                                    <span className="grant-source">System Grant</span>
                                  )}
                                </div>
                                <p className="grant-description">{grant.description}</p>
                                <div className="grant-focus-areas">
                                  {grant.focusAreas.map(area => (
                                    <span key={area} className="focus-tag">{area}</span>
                                  ))}
                                </div>
                              </div>
                              <div className="grant-match-actions">
                                <button 
                                  className="grants-page-btn grants-page-btn-primary"
                                  onClick={() => handleApplyGrant(match.client, grant)}
                                >
                                  Apply for Grant
                                </button>
                                <button className="grants-page-btn grants-page-btn-secondary">
                                  Save for Later
                                </button>
                                {dataSource === 'allGrants' && (
                                  <button className="grants-page-btn grants-page-btn-outline">
                                    View Details
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Coming Soon Popup */}
      {showComingSoon && (
        <div className="coming-soon-popup-overlay">
          <div className="coming-soon-popup">
            <div className="coming-soon-popup-header">
              <div className="coming-soon-icon">
                <span>🚀</span>
              </div>
              <h2>Advanced Matching Coming Soon!</h2>
              <button className="close-popup-btn" onClick={closeComingSoon}>
                <span>×</span>
              </button>
            </div>
            <div className="coming-soon-popup-content">
              <p>We're enhancing our matching algorithm with powerful new features:</p>
              <ul>
                <li>🤖 AI-Powered Compatibility Analysis</li>
                <li>📊 Historical Success Rate Scoring</li>
                <li>🎯 Predictive Funding Likelihood</li>
                <li>🔍 Deep Grant Opportunity Mining</li>
                <li>📈 Real-time Market Trend Analysis</li>
                <li>💡 Smart Recommendation Engine</li>
              </ul>
              <p>This advanced feature will be available in our Q1 2024 update.</p>
            </div>
            <div className="coming-soon-popup-actions">
              <button 
                className="grants-page-btn grants-page-btn-primary"
                onClick={closeComingSoon}
              >
                Got It!
              </button>
              <button 
                className="grants-page-btn grants-page-btn-outline"
                onClick={closeComingSoon}
              >
                Notify Me
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientGrantMatching;