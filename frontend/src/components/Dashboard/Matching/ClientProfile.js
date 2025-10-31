// frontend/src/components/Dashboard/Matching/ClientProfile.js
import React from 'react';

const ClientProfile = ({ clients, onAnalyzeClient, loading }) => {
  return (
    <div className="client-profile">
      {/* Header */}
      <div className="matching-header">
        <div className="header-content">
          <div className="header-title">
            <h1>AI Grant Matching</h1>
            <p>Find the perfect funding opportunities for your clients using AI-powered analysis</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="matching-content">
        {/* Stats Overview */}
        <div className="matching-stats">
          <div className="stat-card">
            <div className="stat-icon primary">
              <i className="fas fa-robot"></i>
            </div>
            <div className="stat-content">
              <h3>{clients.length}</h3>
              <p>Available Clients</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon success">
              <i className="fas fa-chart-line"></i>
            </div>
            <div className="stat-content">
              <h3>85%</h3>
              <p>Average Match Rate</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon warning">
              <i className="fas fa-bolt"></i>
            </div>
            <div className="stat-content">
              <h3>24h</h3>
              <p>Analysis Time Saved</p>
            </div>
          </div>
        </div>

        {/* AI Analysis Description */}
        <div className="ai-description">
          <div className="description-card">
            <h3>How AI Matching Works</h3>
            <div className="ai-features">
              <div className="ai-feature">
                <i className="fas fa-search"></i>
                <div>
                  <h4>Comprehensive Analysis</h4>
                  <p>Analyzes client mission, budget, location, and target population against 1000+ funding sources</p>
                </div>
              </div>
              <div className="ai-feature">
                <i className="fas fa-chart-bar"></i>
                <div>
                  <h4>Smart Scoring</h4>
                  <p>Uses machine learning to calculate match scores based on multiple compatibility factors</p>
                </div>
              </div>
              <div className="ai-feature">
                <i className="fas fa-road"></i>
                <div>
                  <h4>Actionable Insights</h4>
                  <p>Provides timeline, action steps, and strategic recommendations for each match</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Client Selection */}
        <div className="client-selection">
          <h3>Select a Client for Analysis</h3>
          <p>Choose a client to analyze their compatibility with available grant opportunities</p>
          
          <div className="clients-grid">
            {clients.map(client => (
              <div key={client.id} className="client-card">
                <div className="client-header">
                  <div className="client-avatar">
                    {client.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="client-info">
                    <h4>{client.name}</h4>
                    <span className="client-category">{client.category}</span>
                  </div>
                </div>
                
                <div className="client-details">
                  <div className="detail-item">
                    <i className="fas fa-bullseye"></i>
                    <span>{client.mission}</span>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-map-marker-alt"></i>
                    <span>{client.location} Reach</span>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-users"></i>
                    <span>{client.targetPopulation.slice(0, 2).join(', ')}</span>
                  </div>
                </div>
                
                <div className="client-stats">
                  <div className="client-stat">
                    <div className="stat-value">${(client.budget / 1000).toFixed(0)}K</div>
                    <div className="stat-label">Budget</div>
                  </div>
                  <div className="client-stat">
                    <div className="stat-value">{client.previousGrants.length}</div>
                    <div className="stat-label">Past Grants</div>
                  </div>
                </div>
                
                <button 
                  className="btn btn-primary analyze-btn"
                  onClick={() => onAnalyzeClient(client)}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-magic"></i>
                      Analyze Matches
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Tips */}
        <div className="quick-tips">
          <h3>Optimizing Match Results</h3>
          <div className="tips-grid">
            <div className="tip-card">
              <i className="fas fa-database"></i>
              <h4>Complete Client Profiles</h4>
              <p>Ensure all client information is up-to-date for accurate matching</p>
            </div>
            <div className="tip-card">
              <i className="fas fa-tags"></i>
              <h4>Detailed Focus Areas</h4>
              <p>Specify multiple focus areas to increase match opportunities</p>
            </div>
            <div className="tip-card">
              <i className="fas fa-history"></i>
              <h4>Regular Updates</h4>
              <p>Update grant source database weekly for latest opportunities</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientProfile;