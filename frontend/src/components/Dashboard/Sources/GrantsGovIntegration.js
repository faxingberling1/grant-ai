import React, { useState, useEffect } from 'react';
import './GrantsGovIntegration.css';

const GrantsGovIntegration = ({ 
  grants = [], 
  onImport, 
  onCancel,
  isEnabled = true,
  onStatusChange 
}) => {
  const [selectedGrants, setSelectedGrants] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [localGrants, setLocalGrants] = useState([]);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  // Initialize with passed grants or sample data
  useEffect(() => {
    console.log('🔧 GrantsGovIntegration - Initializing with grants:', grants);
    console.log('🔧 GrantsGovIntegration - isEnabled:', isEnabled);
    
    if (grants && grants.length > 0) {
      console.log(`✅ Using ${grants.length} provided grants`);
      setLocalGrants(grants);
    } else {
      console.log('⚠️ No grants provided, using sample data');
      // Fallback to sample data if no grants provided
      setLocalGrants(getSampleGrantsGovData());
    }
    
    setLastRefreshed(new Date());
  }, [grants, isEnabled]);

  const getSampleGrantsGovData = () => {
    return [
      {
        id: 'grants-gov-1',
        title: 'National Science Foundation Research Grant',
        agency: 'National Science Foundation',
        amount: '$500,000',
        deadline: '2024-12-15',
        category: 'Research',
        status: 'active',
        source: 'grants.gov',
        description: 'Funding for innovative scientific research projects in STEM fields. This opportunity supports groundbreaking research that addresses national priorities and advances scientific knowledge.',
        opportunityNumber: 'NSF-24-001',
        eligibility: 'Universities, Research Institutions, Non-profit Research Organizations',
        matchRequired: false,
        closeDate: '2024-12-15',
        awardFloor: '500000',
        awardCeiling: '500000',
        estimatedFunding: '$500,000',
        matchScore: 92,
        grantorContact: 'grants@nsf.gov',
        website: 'https://www.grants.gov/web/grants/view-opportunity.html?oppId=NSF-24-001',
        lastUpdated: '2024-01-15'
      },
      {
        id: 'grants-gov-2',
        title: 'NIH Health Disparities Research',
        agency: 'National Institutes of Health',
        amount: '$750,000',
        deadline: '2024-11-30',
        category: 'Healthcare',
        status: 'active',
        source: 'grants.gov',
        description: 'Research addressing health disparities in underserved communities. Focus on innovative approaches to reduce health inequities and improve healthcare access.',
        opportunityNumber: 'NIH-HD-24-005',
        eligibility: 'Healthcare Organizations, Research Institutions, Community Health Centers',
        matchRequired: true,
        closeDate: '2024-11-30',
        awardFloor: '750000',
        awardCeiling: '750000',
        estimatedFunding: '$750,000',
        matchScore: 88,
        grantorContact: 'grants@nih.gov',
        website: 'https://www.grants.gov/web/grants/view-opportunity.html?oppId=NIH-HD-24-005',
        lastUpdated: '2024-01-10'
      },
      {
        id: 'grants-gov-3',
        title: 'DOE Renewable Energy Innovation',
        agency: 'Department of Energy',
        amount: '$1,200,000',
        deadline: '2024-12-20',
        category: 'Energy',
        status: 'active',
        source: 'grants.gov',
        description: 'Funding for innovative renewable energy technologies and research. Supports projects that advance clean energy solutions and reduce carbon emissions.',
        opportunityNumber: 'DOE-RE-24-012',
        eligibility: 'Energy Companies, Research Institutions, Universities, National Labs',
        matchRequired: false,
        closeDate: '2024-12-20',
        awardFloor: '1200000',
        awardCeiling: '1200000',
        estimatedFunding: '$1,200,000',
        matchScore: 85,
        grantorContact: 'grants@energy.gov',
        website: 'https://www.grants.gov/web/grants/view-opportunity.html?oppId=DOE-RE-24-012',
        lastUpdated: '2024-01-08'
      },
      {
        id: 'grants-gov-4',
        title: 'Education Innovation and Research',
        agency: 'Department of Education',
        amount: '$350,000',
        deadline: '2024-11-15',
        category: 'Education',
        status: 'active',
        source: 'grants.gov',
        description: 'Support for innovative educational programs and research. Focus on improving student outcomes and educational equity through evidence-based practices.',
        opportunityNumber: 'ED-EIR-24-008',
        eligibility: 'Educational Institutions, Non-profits, School Districts',
        matchRequired: true,
        closeDate: '2024-11-15',
        awardFloor: '350000',
        awardCeiling: '350000',
        estimatedFunding: '$350,000',
        matchScore: 90,
        grantorContact: 'grants@ed.gov',
        website: 'https://www.grants.gov/web/grants/view-opportunity.html?oppId=ED-EIR-24-008',
        lastUpdated: '2024-01-12'
      },
      {
        id: 'grants-gov-5',
        title: 'Small Business Innovation Research',
        agency: 'Small Business Administration',
        amount: '$150,000',
        deadline: '2024-12-10',
        category: 'Business',
        status: 'active',
        source: 'grants.gov',
        description: 'Funding for small businesses to conduct innovative research and development. Supports commercialization of new technologies and products.',
        opportunityNumber: 'SBA-SBIR-24-003',
        eligibility: 'Small Businesses, Startups, Technology Companies',
        matchRequired: false,
        closeDate: '2024-12-10',
        awardFloor: '150000',
        awardCeiling: '150000',
        estimatedFunding: '$150,000',
        matchScore: 78,
        grantorContact: 'grants@sba.gov',
        website: 'https://www.grants.gov/web/grants/view-opportunity.html?oppId=SBA-SBIR-24-003',
        lastUpdated: '2024-01-18'
      },
      {
        id: 'grants-gov-6',
        title: 'Environmental Protection Research',
        agency: 'Environmental Protection Agency',
        amount: '$600,000',
        deadline: '2024-10-31',
        category: 'Environmental',
        status: 'active',
        source: 'grants.gov',
        description: 'Research grants for environmental protection and conservation projects. Focus on sustainable practices and environmental justice initiatives.',
        opportunityNumber: 'EPA-EP-24-015',
        eligibility: 'Environmental Organizations, Research Institutions, Universities',
        matchRequired: true,
        closeDate: '2024-10-31',
        awardFloor: '600000',
        awardCeiling: '600000',
        estimatedFunding: '$600,000',
        matchScore: 82,
        grantorContact: 'grants@epa.gov',
        website: 'https://www.grants.gov/web/grants/view-opportunity.html?oppId=EPA-EP-24-015',
        lastUpdated: '2024-01-20'
      },
      {
        id: 'grants-gov-7',
        title: 'Rural Community Development',
        agency: 'Department of Agriculture',
        amount: '$800,000',
        deadline: '2024-09-30',
        category: 'Community Development',
        status: 'active',
        source: 'grants.gov',
        description: 'Funding for rural community development and infrastructure projects. Supports economic growth and quality of life improvements in rural areas.',
        opportunityNumber: 'USDA-RCD-24-007',
        eligibility: 'Rural Communities, Local Governments, Non-profits',
        matchRequired: true,
        closeDate: '2024-09-30',
        awardFloor: '800000',
        awardCeiling: '800000',
        estimatedFunding: '$800,000',
        matchScore: 79,
        grantorContact: 'grants@usda.gov',
        website: 'https://www.grants.gov/web/grants/view-opportunity.html?oppId=USDA-RCD-24-007',
        lastUpdated: '2024-01-14'
      },
      {
        id: 'grants-gov-8',
        title: 'Technology Innovation Program',
        agency: 'Department of Commerce',
        amount: '$2,000,000',
        deadline: '2024-12-31',
        category: 'Technology',
        status: 'active',
        source: 'grants.gov',
        description: 'Support for technology innovation and commercialization. Focus on emerging technologies with potential for significant economic impact.',
        opportunityNumber: 'DOC-TIP-24-009',
        eligibility: 'Technology Companies, Research Institutions, Universities',
        matchRequired: false,
        closeDate: '2024-12-31',
        awardFloor: '2000000',
        awardCeiling: '2000000',
        estimatedFunding: '$2,000,000',
        matchScore: 87,
        grantorContact: 'grants@doc.gov',
        website: 'https://www.grants.gov/web/grants/view-opportunity.html?oppId=DOC-TIP-24-009',
        lastUpdated: '2024-01-22'
      }
    ];
  };

  const handleGrantSelect = (grantId) => {
    if (!isEnabled) return;
    
    setSelectedGrants(prev => {
      if (prev.includes(grantId)) {
        return prev.filter(id => id !== grantId);
      } else {
        return [...prev, grantId];
      }
    });
  };

  const handleSelectAll = () => {
    if (!isEnabled) return;
    
    if (selectedGrants.length === filteredGrants.length) {
      setSelectedGrants([]);
    } else {
      setSelectedGrants(filteredGrants.map(grant => grant.id));
    }
  };

  const handleImportSelected = () => {
    if (!isEnabled) {
      alert('Grants.gov integration is disabled. Please enable it in Integration Settings to import grants.');
      return;
    }

    if (selectedGrants.length === 0) {
      alert('Please select at least one grant to import.');
      return;
    }

    setIsLoading(true);
    
    try {
      const grantsToImport = filteredGrants.filter(grant => 
        selectedGrants.includes(grant.id)
      );
      
      console.log('📥 Importing grants from Grants.gov:', grantsToImport.length);
      console.log('📋 Grants to import:', grantsToImport);
      
      if (onImport) {
        onImport(grantsToImport);
      } else {
        console.error('❌ No onImport handler provided!');
        alert('Import functionality not available. Please check the console for details.');
      }
    } catch (error) {
      console.error('❌ Error importing grants:', error);
      alert('Failed to import grants. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!isEnabled) {
      alert('Grants.gov integration is disabled. Please enable it in Integration Settings to refresh data.');
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API refresh
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real implementation, this would fetch fresh data from Grants.gov API
      const refreshedGrants = getSampleGrantsGovData();
      setLocalGrants(refreshedGrants);
      setSelectedGrants([]);
      setLastRefreshed(new Date());
      
      console.log('✅ Refreshed Grants.gov data');
    } catch (error) {
      console.error('Error refreshing grants:', error);
      alert('Failed to refresh grants. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter grants based on search and category
  const filteredGrants = localGrants.filter(grant => {
    const matchesSearch = grant.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         grant.agency.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (grant.description && grant.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = filterCategory === 'all' || grant.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Get unique categories for filter
  const categories = ['all', ...new Set(localGrants.map(grant => grant.category))];

  const formatDate = (dateString) => {
    if (!dateString) return 'No deadline';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const formatTime = (date) => {
    if (!date) return 'Never';
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate days until deadline
  const getDaysUntilDeadline = (deadline) => {
    if (!deadline) return null;
    try {
      const today = new Date();
      const deadlineDate = new Date(deadline);
      const diffTime = deadlineDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch (error) {
      return null;
    }
  };

  return (
    <div className="grants-gov-integration">
      {/* Header */}
      <div className="integration-header">
        <div className="header-content">
          <div className="header-icon">
            <i className="fas fa-landmark"></i>
          </div>
          <div className="header-info">
            <h2>Grants.gov Integration</h2>
            <p>Browse and import federal grant opportunities from the official U.S. government source</p>
            <div className="integration-status">
              <span className={`status-badge ${isEnabled ? 'active' : 'inactive'}`}>
                <i className={`fas fa-${isEnabled ? 'check' : 'times'}-circle`}></i>
                {isEnabled ? 'Connected' : 'Disabled'}
              </span>
              {lastRefreshed && (
                <span className="last-refreshed">
                  Last refreshed: {formatTime(lastRefreshed)}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="header-actions">
          <button 
            className="btn btn-outline"
            onClick={onCancel}
          >
            <i className="fas fa-arrow-left"></i>
            Back to Sources
          </button>
        </div>
      </div>

      {/* Warning Message if Integration is Disabled */}
      {!isEnabled && (
        <div className="integration-warning">
          <div className="warning-content">
            <i className="fas fa-exclamation-triangle"></i>
            <div>
              <h4>Integration Disabled</h4>
              <p>Grants.gov integration is currently disabled. Enable it in Integration Settings to import grants.</p>
              <button 
                className="btn btn-warning btn-sm"
                onClick={() => onStatusChange && onStatusChange(true)}
              >
                <i className="fas fa-cog"></i>
                Enable Integration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Bar */}
      <div className="integration-stats">
        <div className="stat-item">
          <div className="stat-value">{localGrants.length}</div>
          <div className="stat-label">Available Grants</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{selectedGrants.length}</div>
          <div className="stat-label">Selected</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">
            {categories.length - 1}
          </div>
          <div className="stat-label">Categories</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">
            {filteredGrants.length}
          </div>
          <div className="stat-label">Showing</div>
        </div>
      </div>

      {/* Controls */}
      <div className="integration-controls">
        <div className="search-control">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Search grants by title, agency, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
            disabled={!isEnabled}
          />
        </div>
        
        <div className="filter-control">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="filter-select"
            disabled={!isEnabled}
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>
        </div>

        <div className="action-controls">
          <button 
            className="btn btn-outline"
            onClick={handleRefresh}
            disabled={isLoading || !isEnabled}
          >
            {isLoading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Refreshing...
              </>
            ) : (
              <>
                <i className="fas fa-sync"></i>
                Refresh
              </>
            )}
          </button>
          
          <button 
            className="btn btn-primary"
            onClick={handleImportSelected}
            disabled={isLoading || selectedGrants.length === 0 || !isEnabled}
          >
            {isLoading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Importing...
              </>
            ) : (
              <>
                <i className="fas fa-download"></i>
                Import Selected ({selectedGrants.length})
              </>
            )}
          </button>
        </div>
      </div>

      {/* Grants List */}
      <div className="grants-list-container">
        <div className="grants-list-header">
          <div className="select-all">
            <input
              type="checkbox"
              checked={selectedGrants.length > 0 && selectedGrants.length === filteredGrants.length}
              onChange={handleSelectAll}
              className="select-all-checkbox"
              disabled={!isEnabled || filteredGrants.length === 0}
            />
            <span>Select All</span>
          </div>
          <div className="grants-count">
            Showing {filteredGrants.length} of {localGrants.length} grants
            {!isEnabled && ' (Read-only)'}
          </div>
        </div>

        <div className="grants-list">
          {filteredGrants.length === 0 ? (
            <div className="no-grants">
              <i className="fas fa-search"></i>
              <h4>No grants found</h4>
              <p>Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            filteredGrants.map(grant => {
              const daysUntilDeadline = getDaysUntilDeadline(grant.deadline);
              
              return (
                <div 
                  key={grant.id} 
                  className={`grant-item ${selectedGrants.includes(grant.id) ? 'selected' : ''} ${!isEnabled ? 'disabled' : ''}`}
                  onClick={() => handleGrantSelect(grant.id)}
                >
                  <div className="grant-select">
                    <input
                      type="checkbox"
                      checked={selectedGrants.includes(grant.id)}
                      onChange={() => handleGrantSelect(grant.id)}
                      className="grant-checkbox"
                      disabled={!isEnabled}
                    />
                  </div>
                  
                  <div className="grant-content">
                    <div className="grant-header">
                      <h4 className="grant-title">{grant.title}</h4>
                      <span className="grant-agency">{grant.agency}</span>
                    </div>
                    
                    <div className="grant-details">
                      <div className="grant-meta">
                        <span className="grant-amount">
                          <i className="fas fa-dollar-sign"></i>
                          {grant.amount || 'Funding varies'}
                        </span>
                        <span className={`grant-deadline ${daysUntilDeadline && daysUntilDeadline < 30 ? 'urgent' : ''}`}>
                          <i className="fas fa-calendar"></i>
                          Due: {formatDate(grant.deadline)}
                          {daysUntilDeadline && daysUntilDeadline < 30 && (
                            <span className="deadline-warning"> ({daysUntilDeadline} days)</span>
                          )}
                        </span>
                        <span className="grant-category">
                          <i className="fas fa-tag"></i>
                          {grant.category}
                        </span>
                      </div>
                      
                      <div className="grant-description">
                        {grant.description || 'No description available.'}
                      </div>
                      
                      <div className="grant-footer">
                        <span className="grant-opportunity">
                          <i className="fas fa-hashtag"></i>
                          {grant.opportunityNumber || 'N/A'}
                        </span>
                        <span className="grant-match">
                          <i className="fas fa-chart-line"></i>
                          Match Score: {grant.matchScore || 75}%
                        </span>
                        {grant.eligibility && (
                          <span className="grant-eligibility">
                            <i className="fas fa-users"></i>
                            {grant.eligibility.split(',').slice(0, 2).join(', ')}
                            {grant.eligibility.split(',').length > 2 && '...'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Bottom Actions */}
      {selectedGrants.length > 0 && isEnabled && (
        <div className="integration-footer">
          <div className="footer-actions">
            <span className="selected-count">
              {selectedGrants.length} grant{selectedGrants.length !== 1 ? 's' : ''} selected
            </span>
            <button 
              className="btn btn-primary"
              onClick={handleImportSelected}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Importing...
                </>
              ) : (
                <>
                  <i className="fas fa-download"></i>
                  Import Selected Grants
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Help Text */}
      {isEnabled && (
        <div className="integration-help">
          <div className="help-content">
            <i className="fas fa-info-circle"></i>
            <div>
              <h5>Importing Grants</h5>
              <p>Selected grants will be imported as individual sources in your Grant Sources list. You can manage them like any other source, track deadlines, and set up notifications.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GrantsGovIntegration;