// frontend/src/components/Dashboard/Matching/ClientProfile.js
import React from 'react';
import './ClientProfile.css';

const ClientProfile = ({ clients, onAnalyzeClient, loading, error, usingDemoData }) => {
  // Safe data access helper functions
  const getClientName = (client) => {
    return client?.organizationName || client?.name || 'Unknown Organization';
  };

  const getClientCategory = (client) => {
    return client?.category || 'Not specified';
  };

  const getClientMission = (client) => {
    return client?.mission || 'No mission statement provided';
  };

  const getClientBudget = (client) => {
    if (client?.budget === undefined || client?.budget === null) return 'Not specified';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(client.budget);
  };

  const getClientLocation = (client) => {
    return client?.location || 'Not specified';
  };

  const getTargetPopulation = (client) => {
    if (!client?.targetPopulation || !Array.isArray(client.targetPopulation)) {
      return ['Not specified'];
    }
    return client.targetPopulation;
  };

  const getFocusAreas = (client) => {
    if (!client?.focusAreas || !Array.isArray(client.focusAreas)) {
      return ['Not specified'];
    }
    return client.focusAreas;
  };

  const getPreviousGrants = (client) => {
    if (!client?.previousGrants || !Array.isArray(client.previousGrants)) {
      return ['No previous grants recorded'];
    }
    return client.previousGrants;
  };

  const getOperatingYears = (client) => {
    return client?.operatingYears || 'Not specified';
  };

  const getEligibility = (client) => {
    return client?.eligibility || 'Not specified';
  };

  const getContactInfo = (client) => {
    const contact = client?.contact || {};
    const primaryContact = client?.primaryContactName || contact?.name || 'Not specified';
    const email = client?.emailAddress || contact?.email || 'Not specified';
    const phone = client?.phoneNumber || contact?.phone || 'Not specified';
    
    return { primaryContact, email, phone };
  };

  const handleAnalyzeClick = (client) => {
    if (onAnalyzeClient) {
      onAnalyzeClient(client);
    }
  };

  if (!clients || clients.length === 0) {
    return (
      <div className="client-profile">
        <div className="client-header">
          <h2>Client Analysis</h2>
          <p>Select a client to analyze grant matching opportunities</p>
        </div>
        <div className="no-clients">
          <div className="no-clients-icon">📊</div>
          <h3>No Clients Available</h3>
          <p>No client data found. Please add clients to analyze grant matches.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="client-profile">
      <div className="client-header">
        <h2>Client Analysis</h2>
        <p>Select a client to analyze grant matching opportunities using AI</p>
        {usingDemoData && (
          <div className="demo-notice">
            <span className="demo-badge">Demo Data</span>
            <span>Using sample client data for demonstration</span>
          </div>
        )}
      </div>

      {error && (
        <div className="error-message">
          <span>⚠️ {error}</span>
        </div>
      )}

      <div className="clients-grid">
        {clients.map((client) => {
          const contactInfo = getContactInfo(client);
          
          return (
            <div key={client._id || client.id} className="client-card">
              <div className="client-card-header">
                <div className="client-avatar">
                  {getClientName(client).charAt(0).toUpperCase()}
                </div>
                <div className="client-basic-info">
                  <h3 className="client-name">{getClientName(client)}</h3>
                  <span className="client-category">{getClientCategory(client)}</span>
                </div>
                <div className="client-status">
                  <span className={`status-badge ${client?.status || 'active'}`}>
                    {client?.status || 'Active'}
                  </span>
                </div>
              </div>

              <div className="client-card-body">
                <div className="client-mission">
                  <p>{getClientMission(client)}</p>
                </div>

                <div className="client-details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Budget Capacity</span>
                    <span className="detail-value">{getClientBudget(client)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Location Scope</span>
                    <span className="detail-value">{getClientLocation(client)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Operating Years</span>
                    <span className="detail-value">{getOperatingYears(client)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Eligibility</span>
                    <span className="detail-value">{getEligibility(client)}</span>
                  </div>
                </div>

                <div className="client-tags">
                  <div className="tag-group">
                    <span className="tag-label">Target Population:</span>
                    <div className="tags">
                      {getTargetPopulation(client).map((population, index) => (
                        <span key={index} className="tag">{population}</span>
                      ))}
                    </div>
                  </div>
                  <div className="tag-group">
                    <span className="tag-label">Focus Areas:</span>
                    <div className="tags">
                      {getFocusAreas(client).map((area, index) => (
                        <span key={index} className="tag">{area}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="previous-grants">
                  <h4>Previous Grant Experience</h4>
                  <ul>
                    {getPreviousGrants(client).slice(0, 3).map((grant, index) => (
                      <li key={index}>{grant}</li>
                    ))}
                    {getPreviousGrants(client).length > 3 && (
                      <li className="more-grants">
                        +{getPreviousGrants(client).length - 3} more grants
                      </li>
                    )}
                  </ul>
                </div>

                <div className="contact-info">
                  <h4>Contact Information</h4>
                  <div className="contact-details">
                    <div className="contact-item">
                      <span className="contact-label">Contact:</span>
                      <span className="contact-value">{contactInfo.primaryContact}</span>
                    </div>
                    <div className="contact-item">
                      <span className="contact-label">Email:</span>
                      <span className="contact-value">{contactInfo.email}</span>
                    </div>
                    <div className="contact-item">
                      <span className="contact-label">Phone:</span>
                      <span className="contact-value">{contactInfo.phone}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="client-card-footer">
                <button
                  className="analyze-btn"
                  onClick={() => handleAnalyzeClick(client)}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="spinner-small"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <span className="analyze-icon">🔍</span>
                      Analyze Grant Matches
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="analysis-info">
        <div className="info-card">
          <h4>How AI Matching Works</h4>
          <ul>
            <li>🤖 <strong>AI-Powered Analysis</strong>: Advanced algorithm evaluates 5 key matching factors</li>
            <li>🎯 <strong>Category Alignment</strong>: Matches your organization's focus with grant categories</li>
            <li>💰 <strong>Budget Compatibility</strong>: Analyzes financial capacity and grant size fit</li>
            <li>🌍 <strong>Geographic Scope</strong>: Ensures location alignment with funder requirements</li>
            <li>👥 <strong>Population Match</strong>: Aligns target populations with grant priorities</li>
            <li>📈 <strong>Experience Fit</strong>: Evaluates your track record and capacity</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ClientProfile;