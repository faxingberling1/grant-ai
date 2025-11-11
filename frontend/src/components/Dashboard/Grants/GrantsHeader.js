// GrantsHeader.js
import React, { useState } from 'react';
import './GrantsHeader.css';

// Icons (replace with your actual icon components)
const Icon = {
  Add: () => <span>➕</span>,
  Export: () => <span>📤</span>,
  Filter: () => <span>⚡</span>,
  Search: () => <span>🔍</span>,
  Calendar: () => <span>📅</span>,
  Download: () => <span>📥</span>,
  Upload: () => <span>📤</span>,
  Refresh: () => <span>🔄</span>
};

const GrantsHeader = ({ 
  onSearch, 
  onFilter, 
  onNewGrant, 
  onExport, 
  searchQuery,
  selectedView,
  onViewChange 
}) => {
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    status: [],
    dateRange: '',
    programOfficer: ''
  });

  const viewOptions = [
    { id: 'all', label: 'All Grants' },
    { id: 'active', label: 'Active' },
    { id: 'pending', label: 'Pending Review' },
    { id: 'draft', label: 'Drafts' },
    { id: 'closed', label: 'Closed' }
  ];

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'pending', label: 'Pending' },
    { value: 'draft', label: 'Draft' },
    { value: 'closed', label: 'Closed' }
  ];

  const dateRangeOptions = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' }
  ];

  const handleFilterApply = (filters) => {
    setActiveFilters(filters);
    setIsFilterMenuOpen(false);
    onFilter && onFilter(filters);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      status: [],
      dateRange: '',
      programOfficer: ''
    };
    setActiveFilters(clearedFilters);
    onFilter && onFilter(clearedFilters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (activeFilters.status.length > 0) count++;
    if (activeFilters.dateRange) count++;
    if (activeFilters.programOfficer) count++;
    return count;
  };

  return (
    <div className="grants-header">
      {/* Main Header Row */}
      <div className="grants-header-main">
        <div className="grants-header-title-section">
          <h1 className="grants-title">Grants Management</h1>
          <div className="grants-subtitle">
            Manage and track all grant applications
          </div>
        </div>
        
        <div className="grants-header-actions">
          <div className="header-action-group">
            <button 
              className="btn-secondary btn-icon-text"
              onClick={onExport}
            >
              <Icon.Export />
              Export Data
            </button>
            
            <button 
              className="btn-primary btn-icon-text"
              onClick={onNewGrant}
            >
              <Icon.Add />
              New Grant
            </button>
          </div>
        </div>
      </div>

      {/* Navigation and Search Row */}
      <div className="grants-header-navigation">
        {/* View Tabs */}
        <div className="view-tabs">
          {viewOptions.map(view => (
            <button
              key={view.id}
              className={`view-tab ${selectedView === view.id ? 'view-tab-active' : ''}`}
              onClick={() => onViewChange && onViewChange(view.id)}
            >
              {view.label}
            </button>
          ))}
        </div>

        {/* Search and Filter Controls */}
        <div className="header-controls">
          {/* Search Box */}
          <div className="search-box">
            <div className="search-icon">
              <Icon.Search />
            </div>
            <input
              type="text"
              className="search-input"
              placeholder="Search grants, clients, or program officers..."
              value={searchQuery}
              onChange={(e) => onSearch && onSearch(e.target.value)}
            />
            {searchQuery && (
              <button 
                className="search-clear"
                onClick={() => onSearch && onSearch('')}
              >
                ×
              </button>
            )}
          </div>

          {/* Filter Button with Badge */}
          <div className="filter-container">
            <button 
              className={`btn-filter ${getActiveFiltersCount() > 0 ? 'btn-filter-active' : ''}`}
              onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
            >
              <Icon.Filter />
              Filters
              {getActiveFiltersCount() > 0 && (
                <span className="filter-badge">
                  {getActiveFiltersCount()}
                </span>
              )}
            </button>

            {/* Filter Dropdown Menu */}
            {isFilterMenuOpen && (
              <div className="filter-menu">
                <div className="filter-menu-header">
                  <h3>Filter Grants</h3>
                  <button 
                    className="btn-clear-filters"
                    onClick={handleClearFilters}
                  >
                    Clear All
                  </button>
                </div>

                {/* Status Filter */}
                <div className="filter-section">
                  <label className="filter-label">Status</label>
                  <div className="filter-options">
                    {statusOptions.map(option => (
                      <label key={option.value} className="filter-option">
                        <input
                          type="checkbox"
                          checked={activeFilters.status.includes(option.value)}
                          onChange={(e) => {
                            const newStatus = e.target.checked
                              ? [...activeFilters.status, option.value]
                              : activeFilters.status.filter(s => s !== option.value);
                            handleFilterApply({ ...activeFilters, status: newStatus });
                          }}
                        />
                        <span className="filter-option-label">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Date Range Filter */}
                <div className="filter-section">
                  <label className="filter-label">Date Range</label>
                  <select 
                    className="filter-select"
                    value={activeFilters.dateRange}
                    onChange={(e) => handleFilterApply({ ...activeFilters, dateRange: e.target.value })}
                  >
                    <option value="">All Dates</option>
                    {dateRangeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Program Officer Filter */}
                <div className="filter-section">
                  <label className="filter-label">Program Officer</label>
                  <input
                    type="text"
                    className="filter-input"
                    placeholder="Search program officer..."
                    value={activeFilters.programOfficer}
                    onChange={(e) => handleFilterApply({ ...activeFilters, programOfficer: e.target.value })}
                  />
                </div>

                <div className="filter-menu-actions">
                  <button 
                    className="btn-apply-filters"
                    onClick={() => setIsFilterMenuOpen(false)}
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="quick-actions">
            <button className="btn-icon" title="Refresh">
              <Icon.Refresh />
            </button>
            <button className="btn-icon" title="Download Template">
              <Icon.Download />
            </button>
            <button className="btn-icon" title="Upload Grants">
              <Icon.Upload />
            </button>
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {getActiveFiltersCount() > 0 && (
        <div className="active-filters">
          <div className="active-filters-label">Active Filters:</div>
          <div className="active-filters-tags">
            {activeFilters.status.map(status => (
              <span key={status} className="filter-tag">
                Status: {statusOptions.find(s => s.value === status)?.label}
                <button 
                  onClick={() => {
                    const newStatus = activeFilters.status.filter(s => s !== status);
                    handleFilterApply({ ...activeFilters, status: newStatus });
                  }}
                >
                  ×
                </button>
              </span>
            ))}
            {activeFilters.dateRange && (
              <span className="filter-tag">
                Date: {dateRangeOptions.find(d => d.value === activeFilters.dateRange)?.label}
                <button 
                  onClick={() => handleFilterApply({ ...activeFilters, dateRange: '' })}
                >
                  ×
                </button>
              </span>
            )}
            {activeFilters.programOfficer && (
              <span className="filter-tag">
                Officer: {activeFilters.programOfficer}
                <button 
                  onClick={() => handleFilterApply({ ...activeFilters, programOfficer: '' })}
                >
                  ×
                </button>
              </span>
            )}
          </div>
          <button 
            className="btn-clear-all-filters"
            onClick={handleClearFilters}
          >
            Clear All
          </button>
        </div>
      )}
    </div>
  );
};

export default GrantsHeader;