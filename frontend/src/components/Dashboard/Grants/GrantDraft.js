// components/Dashboard/Grants/GrantDraft.js
import React, { useState, useEffect } from 'react';
import GrantForm from './GrantForm'; // ADD THIS IMPORT
import './GrantDraft.css';

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
  Clock: () => <span>⏰</span>,
  Calendar: () => <span>📅</span>
};

const GrantDraft = ({ onBack, drafts = [] }) => {
  const [currentView, setCurrentView] = useState('drafts'); // 'drafts' or 'form'
  const [selectedDraft, setSelectedDraft] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [draftGrants, setDraftGrants] = useState(drafts);

  // Load drafts from localStorage on component mount
  useEffect(() => {
    const savedDrafts = localStorage.getItem('grantDrafts');
    if (savedDrafts) {
      setDraftGrants(JSON.parse(savedDrafts));
    }
  }, []);

  // Navigation functions
  const handleBackToDrafts = () => {
    setCurrentView('drafts');
    setSelectedDraft(null);
    
    // Refresh drafts list
    const savedDrafts = localStorage.getItem('grantDrafts');
    if (savedDrafts) {
      setDraftGrants(JSON.parse(savedDrafts));
    }
  };

  const handleNewGrant = () => {
    console.log('Opening New Grant Form from Drafts...');
    setSelectedDraft(null);
    setCurrentView('form');
  };

  const handleSaveGrant = (grantData) => {
    console.log('Saving grant from drafts:', grantData);
    // Remove from drafts if it was a draft
    if (selectedDraft) {
      const updatedDrafts = draftGrants.filter(draft => draft.id !== selectedDraft.id);
      setDraftGrants(updatedDrafts);
      localStorage.setItem('grantDrafts', JSON.stringify(updatedDrafts));
    }
    handleBackToDrafts();
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleDeleteDraft = (draftId) => {
    if (window.confirm('Are you sure you want to delete this draft?')) {
      const updatedDrafts = draftGrants.filter(draft => draft.id !== draftId);
      setDraftGrants(updatedDrafts);
      localStorage.setItem('grantDrafts', JSON.stringify(updatedDrafts));
    }
  };

  const handleEditDraft = (draftId) => {
    console.log('Edit draft:', draftId);
    const draft = draftGrants.find(d => d.id === draftId);
    if (draft) {
      setSelectedDraft(draft);
      setCurrentView('form');
    }
  };

  const handleContinueDraft = (draftId) => {
    console.log('Continue draft:', draftId);
    const draft = draftGrants.find(d => d.id === draftId);
    if (draft) {
      setSelectedDraft(draft);
      setCurrentView('form');
    }
  };

  // If we're in form view, show the GrantForm component
  if (currentView === 'form') {
    return (
      <GrantForm 
        grant={selectedDraft}
        onSave={handleSaveGrant}
        onCancel={handleBackToDrafts}
        mode={selectedDraft ? 'edit' : 'create'}
      />
    );
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { label: 'Draft', className: 'grant-draft-status-badge grant-draft-status-draft' },
      incomplete: { label: 'Incomplete', className: 'grant-draft-status-badge grant-draft-status-incomplete' },
      review: { label: 'Needs Review', className: 'grant-draft-status-badge grant-draft-status-review' }
    };
    
    const config = statusConfig[status] || { label: status, className: 'grant-draft-status-badge grant-draft-status-draft' };
    
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

  const getDaysAgo = (dateString) => {
    const today = new Date();
    const draftDate = new Date(dateString);
    const diffTime = Math.abs(today - draftDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  const filteredDrafts = draftGrants.filter(draft => {
    const matchesSearch = !searchQuery || 
      draft.grantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      draft.client.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDate = dateFilter === 'all'; // Add date filtering logic as needed

    return matchesSearch && matchesDate;
  });

  const stats = {
    total: draftGrants.length,
    incomplete: draftGrants.filter(d => d.status === 'incomplete').length,
    recent: draftGrants.filter(d => {
      const draftDate = new Date(d.lastModified);
      const today = new Date();
      const diffTime = Math.abs(today - draftDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    }).length
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
    console.log('Downloading drafts report...');
  };

  return (
    <div className="grant-draft-container">
      {/* Navigation Bar */}
      <nav className="grant-draft-nav">
        <div className="grant-draft-nav-buttons">
          <div className="grant-draft-nav-section">
            <button className="grant-draft-nav-button" onClick={onBack}>
              <Icon.Document />
              Back to Grants
            </button>
            <button className="grant-draft-nav-button grant-draft-active">
              <Icon.Draft />
              Grant Drafts
            </button>
          </div>
        </div>

        <div className="grant-draft-nav-actions">
          <button className="grant-draft-nav-add-btn" onClick={handleNewGrant}>
            <Icon.Add />
            New Grant
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="grant-draft-content">
        <div className="grant-draft-list">
          <div className="grant-draft-header">
            <div className="grant-draft-header-content">
              <div className="grant-draft-header-title">
                <h1>Grant Drafts</h1>
                <p>Manage and continue your draft grant applications</p>
              </div>
              <div className="grant-draft-header-actions">
                <button 
                  className="grant-draft-btn grant-draft-btn-secondary"
                  onClick={handleDownloadReport}
                >
                  <Icon.Download />
                  Export Drafts
                </button>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grant-draft-summary">
            <div className="grant-draft-summary-card">
              <div className="grant-draft-summary-icon grant-draft-summary-primary">
                <Icon.Document />
              </div>
              <div className="grant-draft-summary-content">
                <h3>{stats.total}</h3>
                <p>Total Drafts</p>
                <div className="grant-draft-stat-trend grant-draft-trend-neutral">
                  <Icon.Clock /> All saved drafts
                </div>
              </div>
            </div>
            
            <div className="grant-draft-summary-card">
              <div className="grant-draft-summary-icon grant-draft-summary-warning">
                <Icon.Pending />
              </div>
              <div className="grant-draft-summary-content">
                <h3>{stats.incomplete}</h3>
                <p>Incomplete</p>
                <div className="grant-draft-stat-trend grant-draft-trend-negative">
                  <Icon.Clock /> Need attention
                </div>
              </div>
            </div>
            
            <div className="grant-draft-summary-card">
              <div className="grant-draft-summary-icon grant-draft-summary-info">
                <Icon.Calendar />
              </div>
              <div className="grant-draft-summary-content">
                <h3>{stats.recent}</h3>
                <p>Recent Drafts</p>
                <div className="grant-draft-stat-trend grant-draft-trend-positive">
                  <Icon.TrendingUp /> Last 7 days
                </div>
              </div>
            </div>
            
            <div className="grant-draft-summary-card">
              <div className="grant-draft-summary-icon grant-draft-summary-success">
                <Icon.Clock />
              </div>
              <div className="grant-draft-summary-content">
                <h3>{draftGrants.length > 0 ? getDaysAgo(draftGrants[0].lastModified) : 'N/A'}</h3>
                <p>Last Updated</p>
                <div className="grant-draft-stat-trend grant-draft-trend-neutral">
                  <Icon.Calendar /> Most recent
                </div>
              </div>
            </div>
          </div>

          {/* Toolbar */}
          <div className="grant-draft-toolbar">
            <div className="grant-draft-search-box">
              <Icon.Search />
              <input
                type="text"
                placeholder="Search draft grants or clients..."
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
            
            <div className="grant-draft-filters">
              <select 
                className="grant-draft-filter-select"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
              
              <select 
                className="grant-draft-filter-select"
                defaultValue="all"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="incomplete">Incomplete</option>
                <option value="review">Needs Review</option>
              </select>
            </div>
          </div>

          {/* Drafts Table */}
          <div className="grant-draft-table-container">
            {filteredDrafts.length === 0 ? (
              <div className="grant-draft-no-drafts">
                <div className="grant-draft-empty-state">
                  <Icon.Draft />
                  <h3>No Drafts Found</h3>
                  <p>You don't have any saved grant drafts. Start a new grant application to create your first draft.</p>
                  <div className="grant-draft-empty-actions">
                    <button 
                      className="grant-draft-btn grant-draft-btn-primary"
                      onClick={handleNewGrant}
                    >
                      <Icon.Add />
                      Start New Grant
                    </button>
                    <button 
                      className="grant-draft-btn grant-draft-btn-secondary"
                      onClick={onBack}
                    >
                      Back to All Grants
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <table className="grant-draft-table">
                <thead>
                  <tr>
                    <th>Draft Information</th>
                    <th>Status</th>
                    <th>Last Modified</th>
                    <th>Client</th>
                    <th>Progress</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDrafts.map(draft => (
                    <tr key={draft.id} className="grant-draft-row">
                      <td>
                        <div className="grant-draft-info">
                          <div className="grant-draft-icon">
                            {getGrantInitials(draft.grantName)}
                          </div>
                          <div className="grant-draft-details">
                            <div className="grant-draft-name">
                              {draft.grantName}
                            </div>
                            <div className="grant-draft-meta">
                              <span className="grant-draft-date">
                                <Icon.Clock /> Created {getDaysAgo(draft.createdDate)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        {getStatusBadge(draft.status)}
                      </td>
                      <td>
                        <div className="grant-draft-date">{formatDate(draft.lastModified)}</div>
                        <div className="grant-draft-time">{getDaysAgo(draft.lastModified)}</div>
                      </td>
                      <td>
                        <div className="grant-draft-client">{draft.client}</div>
                      </td>
                      <td>
                        <div className="grant-draft-progress-bar">
                          <div 
                            className="grant-draft-progress-fill" 
                            style={{ width: `${draft.progress}%` }}
                          ></div>
                        </div>
                        <div className="grant-draft-progress-text">{draft.progress}% Complete</div>
                      </td>
                      <td>
                        <div className="grant-draft-action-buttons">
                          <button 
                            className="grant-draft-btn-icon grant-draft-btn-continue" 
                            title="Continue Draft"
                            onClick={() => handleContinueDraft(draft.id)}
                          >
                            <Icon.Edit />
                            Continue
                          </button>
                          <button 
                            className="grant-draft-btn-icon" 
                            title="Edit Draft"
                            onClick={() => handleEditDraft(draft.id)}
                          >
                            <Icon.View />
                          </button>
                          <button 
                            className="grant-draft-btn-icon grant-draft-btn-danger" 
                            title="Delete Draft"
                            onClick={() => handleDeleteDraft(draft.id)}
                          >
                            <Icon.Delete />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GrantDraft;