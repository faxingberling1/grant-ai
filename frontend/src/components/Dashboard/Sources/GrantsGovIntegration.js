import React, { useState, useEffect } from 'react';
import { GrantsGovService } from '../../../services/grantsGovApi';
import './GrantsGovIntegration.css';

const GrantsGovIntegration = ({ grants, onImport, onCancel }) => {
  const [searchParams, setSearchParams] = useState({
    keyword: '',
    category: '',
    agency: '',
    status: 'posted'
  });
  const [searchResults, setSearchResults] = useState(grants);
  const [selectedGrants, setSelectedGrants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('browse');

  const categories = [
    'Health Research', 'STEM Education', 'Clean Energy', 'Community Development',
    'Small Business', 'Environmental', 'Arts & Culture', 'Technology',
    'Agriculture', 'Infrastructure', 'Public Health', 'Workforce Development'
  ];

  const agencies = [
    'Department of Health and Human Services',
    'Department of Education', 
    'Department of Energy',
    'National Science Foundation',
    'Department of Housing and Urban Development',
    'Environmental Protection Agency',
    'National Endowment for the Arts',
    'Department of Commerce',
    'Department of Agriculture',
    'Department of Transportation'
  ];

  useEffect(() => {
    setSearchResults(grants);
  }, [grants]);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      console.log('🔍 Searching Grants.gov...');
      const results = await GrantsGovService.searchGrants(searchParams);
      setSearchResults(results);
      console.log(`✅ Found ${results.length} grants`);
    } catch (error) {
      console.error('❌ Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectGrant = (grant) => {
    setSelectedGrants(prev => {
      const isSelected = prev.find(g => g.opportunityNumber === grant.opportunityNumber);
      if (isSelected) {
        return prev.filter(g => g.opportunityNumber !== grant.opportunityNumber);
      } else {
        return [...prev, grant];
      }
    });
  };

  const handleSelectAll = (grantsList) => {
    const allSelected = grantsList.every(grant => 
      selectedGrants.find(selected => selected.opportunityNumber === grant.opportunityNumber)
    );

    if (allSelected) {
      setSelectedGrants(prev => prev.filter(selected => 
        !grantsList.find(grant => grant.opportunityNumber === selected.opportunityNumber)
      ));
    } else {
      const newSelections = grantsList.filter(grant => 
        !selectedGrants.find(selected => selected.opportunityNumber === grant.opportunityNumber)
      );
      setSelectedGrants(prev => [...prev, ...newSelections]);
    }
  };

  const handleImportSelected = () => {
    if (selectedGrants.length === 0) {
      alert('Please select at least one grant to import.');
      return;
    }
    
    onImport(selectedGrants);
  };

  const handleParamChange = (field, value) => {
    setSearchParams(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getDaysUntilDeadline = (closeDate) => {
    if (!closeDate) return null;
    const today = new Date();
    const deadline = new Date(closeDate);
    const diffTime = deadline - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="grants-gov-integration">
      {/* Header with Back Button */}
      <div className="integration-header">
        <div className="header-top">
          <button 
            className="btn-back"
            onClick={onCancel}
            title="Back to Sources"
          >
            <i className="fas fa-arrow-left"></i>
            Back to Sources
          </button>
        </div>
        
        <div className="header-content">
          <h2>
            <i className="fas fa-database"></i>
            Grants.gov Integration
          </h2>
          <p>Browse and import federal grant opportunities directly from Grants.gov</p>
          <div className="integration-stats">
            <span className="stat">
              <strong>{searchResults.length}</strong> opportunities available
            </span>
            <span className="stat">
              <strong>{selectedGrants.length}</strong> selected for import
            </span>
          </div>
        </div>
      </div>

      <div className="integration-tabs">
        <button 
          className={`tab-button ${activeTab === 'browse' ? 'active' : ''}`}
          onClick={() => setActiveTab('browse')}
        >
          <i className="fas fa-th-list"></i>
          Browse All Opportunities
        </button>
        <button 
          className={`tab-button ${activeTab === 'search' ? 'active' : ''}`}
          onClick={() => setActiveTab('search')}
        >
          <i className="fas fa-search"></i>
          Advanced Search
        </button>
      </div>

      {activeTab === 'search' && (
        <div className="search-panel">
          <form onSubmit={handleSearch} className="search-form">
            <div className="form-row">
              <div className="form-group">
                <label>Keywords</label>
                <input
                  type="text"
                  value={searchParams.keyword}
                  onChange={(e) => handleParamChange('keyword', e.target.value)}
                  placeholder="Search grant titles and descriptions..."
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Category</label>
                <select
                  value={searchParams.category}
                  onChange={(e) => handleParamChange('category', e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Agency</label>
                <select
                  value={searchParams.agency}
                  onChange={(e) => handleParamChange('agency', e.target.value)}
                >
                  <option value="">All Agencies</option>
                  {agencies.map(agency => (
                    <option key={agency} value={agency}>{agency}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Searching...
                  </>
                ) : (
                  <>
                    <i className="fas fa-search"></i>
                    Search Grants.gov
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="results-header">
        <div className="results-info">
          <h3>
            {activeTab === 'browse' ? 'Available Opportunities' : 'Search Results'}
            <span className="count-badge">{searchResults.length} grants</span>
          </h3>
          {searchResults.length > 0 && (
            <button
              className="btn-select-all"
              onClick={() => handleSelectAll(searchResults)}
            >
              {selectedGrants.length === searchResults.length ? 'Deselect All' : 'Select All'}
            </button>
          )}
        </div>

        {selectedGrants.length > 0 && (
          <div className="import-actions">
            <span className="selected-count">
              {selectedGrants.length} grants selected
            </span>
            <button
              className="btn-primary"
              onClick={handleImportSelected}
            >
              <i className="fas fa-download"></i>
              Import Selected to Dashboard
            </button>
          </div>
        )}
      </div>

      <div className="grants-results">
        {loading ? (
          <div className="loading-state">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Loading grants from Grants.gov...</p>
          </div>
        ) : searchResults.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-inbox"></i>
            <h4>No grants found</h4>
            <p>Try adjusting your search criteria or browse all opportunities.</p>
          </div>
        ) : (
          <div className="grants-grid">
            {searchResults.map(grant => {
              const daysUntilDeadline = getDaysUntilDeadline(grant.closeDate);
              const isSelected = selectedGrants.find(g => g.opportunityNumber === grant.opportunityNumber);
              
              return (
                <div
                  key={grant.opportunityNumber}
                  className={`grant-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelectGrant(grant)}
                >
                  <div className="grant-select">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleSelectGrant(grant)}
                    />
                  </div>

                  <div className="grant-content">
                    <div className="grant-header">
                      <h4>{grant.title}</h4>
                      <span className={`status-badge status-${grant.status}`}>
                        {grant.status}
                      </span>
                    </div>

                    <div className="grant-meta">
                      <div className="meta-item">
                        <i className="fas fa-building"></i>
                        <span>{grant.agency}</span>
                      </div>
                      <div className="meta-item">
                        <i className="fas fa-tag"></i>
                        <span>{grant.category}</span>
                      </div>
                      <div className="meta-item">
                        <i className="fas fa-calendar"></i>
                        <span>
                          Closes: {new Date(grant.closeDate).toLocaleDateString()}
                          {daysUntilDeadline > 0 && (
                            <span className="days-remaining"> ({daysUntilDeadline} days)</span>
                          )}
                        </span>
                      </div>
                    </div>

                    <p className="grant-description">
                      {grant.description.length > 150 
                        ? `${grant.description.substring(0, 150)}...` 
                        : grant.description
                      }
                    </p>

                    <div className="grant-funding">
                      <strong>Funding:</strong> {grant.estimatedFunding}
                      {grant.awardCeiling && (
                        <span className="award-range">
                          (Award: {grant.awardFloor || 'Varies'} - {grant.awardCeiling})
                        </span>
                      )}
                    </div>

                    <div className="grant-actions">
                      <a
                        href={grant.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-link"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <i className="fas fa-external-link-alt"></i>
                        View on Grants.gov
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer with Back Button */}
      <div className="integration-footer">
        <button className="btn-secondary" onClick={onCancel}>
          <i className="fas fa-arrow-left"></i>
          Back to Sources
        </button>
        
        {selectedGrants.length > 0 && (
          <button className="btn-primary" onClick={handleImportSelected}>
            <i className="fas fa-download"></i>
            Import {selectedGrants.length} Selected Grants
          </button>
        )}
      </div>
    </div>
  );
};

export default GrantsGovIntegration;