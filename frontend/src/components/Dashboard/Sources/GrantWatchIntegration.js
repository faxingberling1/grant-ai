import React, { useState, useEffect } from 'react';
import { GrantWatchService } from '../../../services/grantWatchApi';
import './GrantWatchIntegration.css';

const GrantWatchIntegration = ({ onImport, onCancel }) => {
  const [grants, setGrants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedGrants, setSelectedGrants] = useState(new Set());
  const [searching, setSearching] = useState(false);

  const categories = [
    'All Categories', 'Arts', 'Education', 'Healthcare', 'Environment', 
    'Business', 'Community Development', 'Technology', 'Research'
  ];

  const states = [
    'All States', 'National', 'Multiple', 'Alabama', 'Alaska', 'Arizona', 'Arkansas', 
    'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia',
    'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
    'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
    'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
    'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota',
    'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina',
    'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia',
    'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
  ];

  useEffect(() => {
    loadInitialGrants();
  }, []);

  const loadInitialGrants = async () => {
    setLoading(true);
    try {
      const grantsData = await GrantWatchService.searchGrants({ rows: 10 });
      setGrants(grantsData);
    } catch (error) {
      console.error('Error loading GrantWatch grants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setSearching(true);
    try {
      const grantsData = await GrantWatchService.searchGrants({
        keyword: searchTerm,
        category: selectedCategory === 'All Categories' ? '' : selectedCategory,
        state: selectedState === 'All States' ? '' : selectedState,
        rows: 20
      });
      setGrants(grantsData);
    } catch (error) {
      console.error('Error searching GrantWatch:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleGrantSelect = (grantId) => {
    setSelectedGrants(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(grantId)) {
        newSelection.delete(grantId);
      } else {
        newSelection.add(grantId);
      }
      return newSelection;
    });
  };

  const handleSelectAll = () => {
    if (selectedGrants.size === grants.length) {
      setSelectedGrants(new Set());
    } else {
      setSelectedGrants(new Set(grants.map(grant => grant.id)));
    }
  };

  const handleImportSelected = () => {
    const grantsToImport = grants.filter(grant => selectedGrants.has(grant.id));
    onImport(grantsToImport);
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Healthcare': 'fas fa-heartbeat',
      'Education': 'fas fa-graduation-cap',
      'Business': 'fas fa-briefcase',
      'Environment': 'fas fa-leaf',
      'Arts': 'fas fa-palette',
      'Technology': 'fas fa-laptop-code',
      'Research': 'fas fa-flask',
      'Community Development': 'fas fa-hands-helping'
    };
    return icons[category] || 'fas fa-grant';
  };

  if (loading) {
    return (
      <div className="grantwatch-loading">
        <i className="fas fa-spinner fa-spin"></i>
        <p>Connecting to GrantWatch...</p>
      </div>
    );
  }

  return (
    <div className="grantwatch-integration">
      <div className="integration-header">
        <h2>
          <i className="fas fa-database"></i>
          GrantWatch Integration
        </h2>
        <p>Search and import grants from GrantWatch database</p>
      </div>

      {/* Search Controls */}
      <div className="search-controls">
        <div className="search-row">
          <div className="search-field">
            <label>Search Keywords</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Enter keywords, grant titles, or agencies..."
            />
          </div>
          
          <div className="search-field">
            <label>Category</label>
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="search-field">
            <label>State/Region</label>
            <select 
              value={selectedState} 
              onChange={(e) => setSelectedState(e.target.value)}
            >
              {states.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>

          <button 
            className="btn btn-primary search-btn"
            onClick={handleSearch}
            disabled={searching}
          >
            {searching ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Searching...
              </>
            ) : (
              <>
                <i className="fas fa-search"></i>
                Search Grants
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results Header */}
      <div className="results-header">
        <div className="results-info">
          <span>Found {grants.length} grants</span>
          <span>{selectedGrants.size} selected</span>
        </div>
        <div className="results-actions">
          <button 
            className="btn btn-outline"
            onClick={handleSelectAll}
          >
            {selectedGrants.size === grants.length ? 'Deselect All' : 'Select All'}
          </button>
          <button 
            className="btn btn-primary"
            onClick={handleImportSelected}
            disabled={selectedGrants.size === 0}
          >
            <i className="fas fa-download"></i>
            Import Selected ({selectedGrants.size})
          </button>
        </div>
      </div>

      {/* Grants List */}
      <div className="grants-list">
        {grants.map(grant => (
          <div 
            key={grant.id} 
            className={`grant-card ${selectedGrants.has(grant.id) ? 'selected' : ''}`}
            onClick={() => handleGrantSelect(grant.id)}
          >
            <div className="grant-select">
              <input
                type="checkbox"
                checked={selectedGrants.has(grant.id)}
                onChange={() => handleGrantSelect(grant.id)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            
            <div className="grant-content">
              <div className="grant-header">
                <h3>{grant.title}</h3>
                <span className="match-score">
                  <i className="fas fa-bullseye"></i>
                  {grant.matchScore}% Match
                </span>
              </div>
              
              <div className="grant-meta">
                <span className="agency">
                  <i className="fas fa-building"></i>
                  {grant.agency}
                </span>
                <span className={`status ${grant.status}`}>
                  <i className="fas fa-circle"></i>
                  {grant.status}
                </span>
                <span className="category">
                  <i className={getCategoryIcon(grant.category)}></i>
                  {grant.category}
                </span>
                <span className="state">
                  <i className="fas fa-map-marker-alt"></i>
                  {grant.state}
                </span>
              </div>
              
              <p className="grant-description">{grant.description}</p>
              
              <div className="grant-details">
                <div className="detail">
                  <strong>Funding:</strong> {grant.estimatedFunding}
                </div>
                <div className="detail">
                  <strong>Deadline:</strong> {new Date(grant.deadline).toLocaleDateString()}
                </div>
                <div className="detail">
                  <strong>Eligibility:</strong> {grant.eligibility}
                </div>
              </div>
              
              <div className="grant-actions">
                <a 
                  href={grant.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-outline btn-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  <i className="fas fa-external-link-alt"></i>
                  View on GrantWatch
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Actions */}
      <div className="integration-footer">
        <button className="btn btn-secondary" onClick={onCancel}>
          <i className="fas fa-arrow-left"></i>
          Back to Sources
        </button>
        <div className="footer-actions">
          <button 
            className="btn btn-primary"
            onClick={handleImportSelected}
            disabled={selectedGrants.size === 0}
          >
            <i className="fas fa-download"></i>
            Import Selected Grants ({selectedGrants.size})
          </button>
        </div>
      </div>
    </div>
  );
};

export default GrantWatchIntegration;