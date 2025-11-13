import React, { useState, useEffect } from 'react';
import { GrantsGovService } from '../../../services/grantsGovApi';
import './FindGrants.css';

const FindGrants = ({ onBack, onViewGrant, onImportGrant, sourcesData = [] }) => {
  const [grants, setGrants] = useState([]);
  const [filteredGrants, setFilteredGrants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    agency: '',
    fundingType: '',
    status: '',
    source: ''
  });
  const [sortBy, setSortBy] = useState('deadline');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedGrant, setSelectedGrant] = useState(null);
  const [currentView, setCurrentView] = useState('list'); // 'list' or 'detail'
  const [grantComponents, setGrantComponents] = useState([]);

  // Load grants from all sources
  useEffect(() => {
    const loadAllGrants = async () => {
      setLoading(true);
      console.log('🔄 Starting to load all grants...');
      
      try {
        // 1. Process grants from Sources data
        console.log('📋 Processing sources data:', sourcesData?.length || 0, 'sources');
        const sourcesGrants = await GrantsGovService.getAllGrantsFromSources(sourcesData);
        console.log(`✅ Processed ${sourcesGrants.length} grants from sources`);
        
        // 2. Fetch additional grants from Grants.gov API
        let grantsGovData = [];
        try {
          console.log('🌐 Fetching Grants.gov data...');
          grantsGovData = await GrantsGovService.searchGrants({ rows: 15 });
          console.log(`✅ Fetched ${grantsGovData.length} grants from Grants.gov`);
        } catch (error) {
          console.warn('⚠️ Could not fetch Grants.gov data:', error);
          grantsGovData = [];
        }

        // 3. Combine all grants
        const allGrants = [
          ...sourcesGrants,
          ...grantsGovData
        ];

        console.log('🎯 Final grants compilation:');
        console.log(`   - ${sourcesGrants.length} from Sources`);
        console.log(`   - ${grantsGovData.length} from Grants.gov API`);
        console.log(`   - TOTAL: ${allGrants.length} grants`);

        setGrants(allGrants);
        setFilteredGrants(allGrants);
        
      } catch (error) {
        console.error('❌ Error loading grants:', error);
        // Fallback to empty array
        setGrants([]);
        setFilteredGrants([]);
      } finally {
        setLoading(false);
      }
    };

    loadAllGrants();
  }, [sourcesData]);

  // Filter and search grants
  useEffect(() => {
    let result = grants;

    // Apply search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(grant => 
        grant.title?.toLowerCase().includes(searchLower) ||
        grant.description?.toLowerCase().includes(searchLower) ||
        grant.sourceName?.toLowerCase().includes(searchLower) ||
        grant.category?.toLowerCase().includes(searchLower) ||
        (grant.focusAreas && grant.focusAreas.some(area => 
          area.toLowerCase().includes(searchLower)
        ))
      );
    }

    // Apply filters
    if (filters.category) {
      result = result.filter(grant => grant.category === filters.category);
    }
    if (filters.agency && filters.agency !== 'all') {
      result = result.filter(grant => 
        grant.agency === filters.agency || 
        grant.sourceName === filters.agency
      );
    }
    if (filters.fundingType) {
      if (filters.fundingType === 'Under $100,000') {
        result = result.filter(grant => {
          const amount = grant.amount || '';
          return amount.includes('Under $100,000') || 
                 amount.includes('$50,000') ||
                 amount.includes('$25,000') ||
                 (parseInt(amount.replace(/[^0-9]/g, '')) < 100000);
        });
      } else if (filters.fundingType === '$100,000 - $500,000') {
        result = result.filter(grant => {
          const amount = grant.amount || '';
          const numAmount = parseInt(amount.replace(/[^0-9]/g, '')) || 0;
          return (amount.includes('$100,000') || 
                 amount.includes('$250,000') ||
                 amount.includes('$500,000') ||
                 (numAmount >= 100000 && numAmount <= 500000));
        });
      } else if (filters.fundingType === '$500,000+') {
        result = result.filter(grant => {
          const amount = grant.amount || '';
          const numAmount = parseInt(amount.replace(/[^0-9]/g, '')) || 0;
          return (amount.includes('$1,000,000') || 
                 amount.includes('$2,000,000') ||
                 amount.includes('$5,000,000') ||
                 (numAmount > 500000));
        });
      }
    }
    if (filters.status) {
      result = result.filter(grant => grant.status === filters.status);
    }
    if (filters.source) {
      result = result.filter(grant => grant.source === filters.source);
    }

    // Apply sorting
    result = sortGrants(result, sortBy);

    setFilteredGrants(result);
  }, [grants, searchTerm, filters, sortBy]);

  const sortGrants = (grantsList, sortType) => {
    const sorted = [...grantsList];
    
    switch (sortType) {
      case 'deadline':
        return sorted.sort((a, b) => {
          const dateA = a.deadline ? new Date(a.deadline) : new Date('9999-12-31');
          const dateB = b.deadline ? new Date(b.deadline) : new Date('9999-12-31');
          return dateA - dateB;
        });
      case 'amount':
        return sorted.sort((a, b) => {
          const amountA = extractMaxAmount(a.amount);
          const amountB = extractMaxAmount(b.amount);
          return amountB - amountA;
        });
      case 'matchScore':
        return sorted.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
      case 'title':
        return sorted.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
      default:
        return sorted;
    }
  };

  const extractMaxAmount = (amountString) => {
    if (!amountString) return 0;
    
    try {
      const numbers = amountString.match(/\$?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g);
      if (!numbers) return 0;
      
      const maxAmount = Math.max(...numbers.map(num => {
        const cleanNum = num.replace(/[$,]/g, '');
        return parseFloat(cleanNum) || 0;
      }));
      
      return maxAmount;
    } catch (error) {
      console.warn('Error parsing amount:', amountString, error);
      return 0;
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilters({
      category: '',
      agency: '',
      fundingType: '',
      status: '',
      source: ''
    });
  };

  const getSourceBadge = (source) => {
    const sourceConfig = {
      government: { label: 'Government', class: 'source-government' },
      foundation: { label: 'Foundation', class: 'source-foundation' },
      corporate: { label: 'Corporate', class: 'source-corporate' },
      community: { label: 'Community', class: 'source-community' },
      'grants.gov': { label: 'Grants.gov', class: 'source-government' },
      manual: { label: 'Manual', class: 'source-manual' }
    };
    
    const config = sourceConfig[source] || { label: source, class: 'source-community' };
    return <span className={`source-badge ${config.class}`}>{config.label}</span>;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { label: 'Active', class: 'status-active' },
      upcoming: { label: 'Upcoming', class: 'status-upcoming' },
      closed: { label: 'Closed', class: 'status-closed' },
      pending: { label: 'Pending', class: 'status-upcoming' }
    };
    
    const config = statusConfig[status] || { label: status, class: 'status-active' };
    return <span className={`status-badge ${config.class}`}>{config.label}</span>;
  };

  const getDaysUntilDeadline = (deadline) => {
    if (!deadline) return null;
    try {
      const today = new Date();
      const deadlineDate = new Date(deadline);
      const diffTime = deadlineDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch (error) {
      console.warn('Error calculating days until deadline:', error);
      return null;
    }
  };

  const getMatchScoreClass = (score) => {
    if (score >= 90) return 'match-score high';
    if (score >= 80) return 'match-score medium';
    return 'match-score low';
  };

  const handleViewGrantDetails = (grant) => {
    setSelectedGrant(grant);
    setCurrentView('detail');
    console.log('🔍 Viewing grant details page:', grant.title);
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedGrant(null);
  };

  const handleCreateApplication = async (grant) => {
    console.log('📝 Creating application for grant:', grant.title);
    
    try {
      // Create initial grant components based on the grant requirements
      const components = await createInitialGrantComponents(grant);
      setGrantComponents(components);
      
      console.log('✅ Created grant components:', components);
      alert(`🎉 Application started for: ${grant.title}\n\nCreated ${components.length} initial components for your application.`);
      
      // You can navigate to application builder or show a success message
    } catch (error) {
      console.error('❌ Error creating application:', error);
      alert('Error creating application. Please try again.');
    }
  };

  const createInitialGrantComponents = async (grant) => {
    // This function creates relevant components for the grant application
    const baseComponents = [
      {
        id: `comp-${Date.now()}-1`,
        type: 'narrative',
        title: 'Project Narrative',
        description: 'Detailed description of your project',
        required: true,
        status: 'not-started',
        grantId: grant.id
      },
      {
        id: `comp-${Date.now()}-2`,
        type: 'budget',
        title: 'Project Budget',
        description: 'Detailed budget breakdown',
        required: true,
        status: 'not-started',
        grantId: grant.id
      },
      {
        id: `comp-${Date.now()}-3`,
        type: 'timeline',
        title: 'Project Timeline',
        description: 'Project implementation schedule',
        required: true,
        status: 'not-started',
        grantId: grant.id
      }
    ];

    // Add specific components based on grant requirements
    if (grant.category?.toLowerCase().includes('research')) {
      baseComponents.push({
        id: `comp-${Date.now()}-4`,
        type: 'methodology',
        title: 'Research Methodology',
        description: 'Detailed research approach and methods',
        required: true,
        status: 'not-started',
        grantId: grant.id
      });
    }

    if (grant.focusAreas?.includes('Education') || grant.category?.toLowerCase().includes('education')) {
      baseComponents.push({
        id: `comp-${Date.now()}-5`,
        type: 'curriculum',
        title: 'Curriculum Details',
        description: 'Educational curriculum and learning objectives',
        required: true,
        status: 'not-started',
        grantId: grant.id
      });
    }

    return baseComponents;
  };

  const handleSaveGrant = (grant) => {
    console.log('💾 Saving grant:', grant.title);
    if (onImportGrant) {
      onImportGrant(grant);
    }
    alert(`✅ Grant "${grant.title}" has been saved to your grants library!`);
  };

  const handleMatchClients = (grant) => {
    console.log('🤝 Matching clients for grant:', grant.title);
    alert(`AI Client Matching initiated for: ${grant.title}\n\nThis would open the client matching interface to find the best clients for this grant opportunity.`);
  };

  // Get unique values for filters
  const categories = [...new Set(grants.map(grant => grant.category).filter(Boolean))];
  const agencies = [...new Set(grants.map(grant => grant.agency || grant.sourceName).filter(Boolean))];
  const sources = [...new Set(grants.map(grant => grant.source).filter(Boolean))];

  // Calculate source statistics
  const sourceStats = {
    total: grants.length,
    government: grants.filter(g => g.source === 'government' || g.source === 'grants.gov').length,
    foundation: grants.filter(g => g.source === 'foundation').length,
    corporate: grants.filter(g => g.source === 'corporate').length,
    manual: grants.filter(g => g.source === 'manual').length
  };

  // Grant Detail View Component
  const GrantDetailView = ({ grant, onBack, onCreateApplication }) => {
    const daysUntilDeadline = getDaysUntilDeadline(grant.deadline);

    return (
      <div className="grant-detail-view">
        <div className="detail-header">
          <button className="btn-back" onClick={onBack}>
            <i className="fas fa-arrow-left"></i>
            Back to Grants List
          </button>
          <div className="header-actions">
            <button 
              className="btn btn-outline"
              onClick={() => window.print()}
            >
              <i className="fas fa-print"></i>
              Print
            </button>
            <button 
              className="btn btn-primary"
              onClick={() => onCreateApplication(grant)}
            >
              <i className="fas fa-file-alt"></i>
              Start Application
            </button>
          </div>
        </div>

        <div className="grant-detail-content">
          <div className="grant-detail-hero">
            <div className="hero-badges">
              {getSourceBadge(grant.source)}
              {getStatusBadge(grant.status)}
              <div className={getMatchScoreClass(grant.matchScore)}>
                <div className="match-score-value">{grant.matchScore}%</div>
                <div className="match-score-label">Match Score</div>
              </div>
            </div>
            <h1>{grant.title}</h1>
            <div className="grant-meta-large">
              <div className="meta-item">
                <i className="fas fa-building"></i>
                <div>
                  <strong>Agency/Organization</strong>
                  <span>{grant.agency || grant.sourceName || 'Unknown Agency'}</span>
                </div>
              </div>
              <div className="meta-item">
                <i className="fas fa-tag"></i>
                <div>
                  <strong>Category</strong>
                  <span>{grant.category || 'Uncategorized'}</span>
                </div>
              </div>
              <div className="meta-item">
                <i className="fas fa-money-bill-wave"></i>
                <div>
                  <strong>Funding Amount</strong>
                  <span>{grant.amount || 'Funding varies'}</span>
                </div>
              </div>
              <div className="meta-item">
                <i className="fas fa-calendar"></i>
                <div>
                  <strong>Deadline</strong>
                  <span>
                    {grant.deadline ? (
                      <>
                        {new Date(grant.deadline).toLocaleDateString()}
                        {daysUntilDeadline > 0 && (
                          <span className="days-remaining"> ({daysUntilDeadline} days left)</span>
                        )}
                      </>
                    ) : (
                      'Rolling Deadline'
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grant-detail-sections">
            <div className="detail-section">
              <h2>Grant Description</h2>
              <div className="section-content">
                <p>{grant.description || 'No description available.'}</p>
              </div>
            </div>

            {grant.eligibility && (
              <div className="detail-section">
                <h2>Eligibility Requirements</h2>
                <div className="section-content">
                  <p>{grant.eligibility}</p>
                </div>
              </div>
            )}

            {grant.focusAreas && grant.focusAreas.length > 0 && (
              <div className="detail-section">
                <h2>Focus Areas</h2>
                <div className="focus-areas-grid">
                  {grant.focusAreas.map((area, index) => (
                    <div key={index} className="focus-area-card">
                      <i className="fas fa-bullseye"></i>
                      <span>{area}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="detail-section">
              <h2>Application Details</h2>
              <div className="application-details-grid">
                <div className="app-detail-item">
                  <strong>Application Process:</strong>
                  <span>{grant.applicationProcess || 'Standard grant application process'}</span>
                </div>
                <div className="app-detail-item">
                  <strong>Review Criteria:</strong>
                  <span>{grant.reviewCriteria || 'Based on project merit, alignment with goals, and organizational capacity'}</span>
                </div>
                <div className="app-detail-item">
                  <strong>Notification Date:</strong>
                  <span>{grant.notificationDate || 'Typically 60-90 days after deadline'}</span>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h2>Contact Information</h2>
              <div className="contact-grid">
                {grant.grantorContact && (
                  <div className="contact-item">
                    <i className="fas fa-envelope"></i>
                    <div>
                      <strong>Contact Email</strong>
                      <span>{grant.grantorContact}</span>
                    </div>
                  </div>
                )}
                {grant.website && (
                  <div className="contact-item">
                    <i className="fas fa-globe"></i>
                    <div>
                      <strong>Website</strong>
                      <a href={grant.website} target="_blank" rel="noopener noreferrer">
                        {grant.website}
                      </a>
                    </div>
                  </div>
                )}
                {grant.phone && (
                  <div className="contact-item">
                    <i className="fas fa-phone"></i>
                    <div>
                      <strong>Phone</strong>
                      <span>{grant.phone}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grant-detail-actions">
            <h3>Ready to Apply?</h3>
            <div className="action-buttons-large">
              <button 
                className="btn btn-primary btn-large"
                onClick={() => onCreateApplication(grant)}
              >
                <i className="fas fa-file-alt"></i>
                Start Application
              </button>
              <button className="btn btn-success btn-large">
                <i className="fas fa-users"></i>
                Match with Clients
              </button>
              <button className="btn btn-outline btn-large">
                <i className="fas fa-save"></i>
                Save to Library
              </button>
              <button className="btn btn-outline btn-large">
                <i className="fas fa-share"></i>
                Share Grant
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Main render function
  if (currentView === 'detail' && selectedGrant) {
    return (
      <GrantDetailView 
        grant={selectedGrant}
        onBack={handleBackToList}
        onCreateApplication={handleCreateApplication}
      />
    );
  }

  return (
    <div className="find-grants">
      {/* Header */}
      <div className="find-grants-header">
        <div className="header-top">
          <button className="btn-back" onClick={onBack}>
            <i className="fas fa-arrow-left"></i>
            Back to Dashboard
          </button>
        </div>
        
        <div className="header-content">
          <h1>
            <i className="fas fa-search"></i>
            Find Grants
          </h1>
          <p>Discover and manage funding opportunities from all your grant sources in one place</p>
          
          <div className="header-stats">
            <div className="stat">
              <strong>{sourceStats.total}</strong>
              <span>Total Grants</span>
            </div>
            <div className="stat">
              <strong>{sourceStats.government}</strong>
              <span>Government</span>
            </div>
            <div className="stat">
              <strong>{sourceStats.foundation}</strong>
              <span>Foundations</span>
            </div>
            <div className="stat">
              <strong>{sourceStats.corporate}</strong>
              <span>Corporate</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - List View */}
      <div className="find-grants-main">
        {/* Search and Filters */}
        <div className="search-filters-section">
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search grants by title, description, category, or focus area..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button 
                className="clear-search"
                onClick={() => setSearchTerm('')}
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>

          <div className="filters-row">
            <div className="filter-group">
              <label>Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Agency/Organization</label>
              <select
                value={filters.agency}
                onChange={(e) => handleFilterChange('agency', e.target.value)}
              >
                <option value="">All Agencies</option>
                {agencies.map(agency => (
                  <option key={agency} value={agency}>{agency}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Funding Type</label>
              <select
                value={filters.fundingType}
                onChange={(e) => handleFilterChange('fundingType', e.target.value)}
              >
                <option value="">Any Amount</option>
                <option value="Under $100,000">Under $100,000</option>
                <option value="$100,000 - $500,000">$100,000 - $500,000</option>
                <option value="$500,000+">$500,000+</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Source</label>
              <select
                value={filters.source}
                onChange={(e) => handleFilterChange('source', e.target.value)}
              >
                <option value="">All Sources</option>
                <option value="government">Government</option>
                <option value="foundation">Foundation</option>
                <option value="corporate">Corporate</option>
                <option value="manual">Manual Entries</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="upcoming">Upcoming</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            <button className="btn-clear-filters" onClick={clearFilters}>
              <i className="fas fa-times"></i>
              Clear Filters
            </button>
          </div>
        </div>

        {/* Results Header */}
        <div className="results-header">
          <div className="results-info">
            <h3>
              {filteredGrants.length} Grants Found
              {searchTerm && (
                <span className="search-term"> for "{searchTerm}"</span>
              )}
            </h3>
            <div className="view-controls">
              <button 
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Grid View"
              >
                <i className="fas fa-th"></i>
              </button>
              <button 
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                title="List View"
              >
                <i className="fas fa-list"></i>
              </button>
            </div>
          </div>

          <div className="sort-controls">
            <label>Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="deadline">Deadline (Soonest)</option>
              <option value="amount">Funding Amount</option>
              <option value="matchScore">Match Score</option>
              <option value="title">Title (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="loading-state">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Loading grants from all sources...</p>
            <div className="loading-details">
              <small>Processing {sourcesData.length} sources and external APIs</small>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredGrants.length === 0 && (
          <div className="empty-state">
            <i className="fas fa-inbox"></i>
            <h4>No grants found</h4>
            <p>Try adjusting your search criteria or clearing some filters.</p>
            <div className="empty-state-actions">
              <button className="btn btn-primary" onClick={clearFilters}>
                Clear All Filters
              </button>
              <button className="btn btn-outline" onClick={onBack}>
                <i className="fas fa-plus"></i>
                Add More Sources
              </button>
            </div>
          </div>
        )}

        {/* Grants Grid/List */}
        {!loading && filteredGrants.length > 0 && (
          <div className={`grants-container ${viewMode}`}>
            {filteredGrants.map((grant, index) => {
              const daysUntilDeadline = getDaysUntilDeadline(grant.deadline);
              
              return (
                <div key={grant.id || `grant-${index}`} className="grant-card">
                  <div className="grant-header">
                    <div className="grant-source">
                      {getSourceBadge(grant.source)}
                      {getStatusBadge(grant.status)}
                    </div>
                    <div className={getMatchScoreClass(grant.matchScore)}>
                      <div className="match-score-value">{grant.matchScore}%</div>
                      <div className="match-score-label">Match</div>
                    </div>
                  </div>

                  <div className="grant-content">
                    <h3 className="grant-title">{grant.title}</h3>
                    
                    <div className="grant-meta">
                      <div className="meta-item">
                        <i className="fas fa-building"></i>
                        <span>{grant.agency || grant.sourceName || 'Unknown Agency'}</span>
                      </div>
                      <div className="meta-item">
                        <i className="fas fa-tag"></i>
                        <span>{grant.category || 'Uncategorized'}</span>
                      </div>
                      <div className="meta-item">
                        <i className="fas fa-money-bill-wave"></i>
                        <span>{grant.amount || 'Funding varies'}</span>
                      </div>
                    </div>

                    <p className="grant-description">
                      {grant.description ? 
                        (grant.description.length > 150 ? 
                          `${grant.description.substring(0, 150)}...` : 
                          grant.description
                        ) : 
                        'No description available.'
                      }
                    </p>

                    <div className="grant-deadline">
                      <i className="fas fa-calendar"></i>
                      <span>
                        {grant.deadline ? (
                          <>
                            Deadline: {new Date(grant.deadline).toLocaleDateString()}
                            {daysUntilDeadline > 0 && (
                              <span className="days-remaining"> ({daysUntilDeadline} days left)</span>
                            )}
                          </>
                        ) : (
                          'Rolling Deadline'
                        )}
                      </span>
                    </div>

                    {grant.focusAreas && grant.focusAreas.length > 0 && (
                      <div className="grant-tags">
                        {grant.focusAreas.slice(0, 3).map((area, areaIndex) => (
                          <span key={areaIndex} className="grant-tag">{area}</span>
                        ))}
                        {grant.focusAreas.length > 3 && (
                          <span className="grant-tag-more">+{grant.focusAreas.length - 3} more</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="grant-actions">
                    <button 
                      className="btn btn-primary"
                      onClick={() => handleViewGrantDetails(grant)}
                    >
                      <i className="fas fa-eye"></i>
                      View Details
                    </button>
                    <button 
                      className="btn btn-success"
                      onClick={() => handleCreateApplication(grant)}
                    >
                      <i className="fas fa-file-alt"></i>
                      Start Application
                    </button>
                    <button 
                      className="btn btn-outline"
                      onClick={() => handleSaveGrant(grant)}
                    >
                      <i className="fas fa-save"></i>
                      Save
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Quick Actions Footer */}
        <div className="quick-actions-footer">
          <div className="actions-content">
            <h4>Need Help Finding the Right Grant?</h4>
            <p>Use our AI-powered tools to match grants with your clients and create winning applications.</p>
            <div className="action-buttons">
              <button className="btn btn-primary" onClick={onBack}>
                <i className="fas fa-plus"></i>
                Add More Sources
              </button>
              <button className="btn btn-outline">
                <i className="fas fa-robot"></i>
                AI Grant Matching
              </button>
              <button className="btn btn-outline">
                <i className="fas fa-chart-line"></i>
                View Analytics
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FindGrants;