// frontend/src/components/Dashboard/Matching/ClientProfile.js
import React from 'react';
import './ClientProfile.css';

const ClientProfile = ({ clients, onAnalyzeClient, loading, error, usingDemoData }) => {
  // Safe data access helper functions - UPDATED to match MongoDB field names
  const getClientName = (client) => {
    return client?.organizationName || client?.name || 'Unknown Organization';
  };

  const getClientCategory = (client) => {
    return client?.category || 'Not specified';
  };

  // FIXED: Use missionStatement instead of mission
  const getClientMission = (client) => {
    return client?.missionStatement || client?.mission || 'No mission statement provided';
  };

  // FIXED: Use annualBudget instead of budget
  const getClientBudget = (client) => {
    const budget = client?.annualBudget || client?.budget;
    if (budget === undefined || budget === null || budget === '') return 'Not specified';
    
    // Handle both string and number formats
    if (typeof budget === 'number') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0
      }).format(budget);
    }
    
    // If it's already a string with currency, return as is
    if (typeof budget === 'string' && budget.includes('$')) {
      return budget;
    }
    
    // If it's a string without currency, add it
    return budget ? `$${budget}` : 'Not specified';
  };

  // FIXED: Use serviceArea instead of location
  const getClientLocation = (client) => {
    return client?.serviceArea || client?.location || 'Not specified';
  };

  const getTargetPopulation = (client) => {
    // This might not exist in your current schema - using focusAreas as alternative
    if (client?.targetPopulation && Array.isArray(client.targetPopulation)) {
      return client.targetPopulation;
    }
    // Fallback to focus areas or tags
    if (client?.focusAreas && Array.isArray(client.focusAreas) && client.focusAreas.length > 0) {
      return client.focusAreas;
    }
    if (client?.tags && Array.isArray(client.tags) && client.tags.length > 0) {
      return client.tags;
    }
    return ['Not specified'];
  };

  // FIXED: Use focusAreas from MongoDB
  const getFocusAreas = (client) => {
    if (client?.focusAreas && Array.isArray(client.focusAreas) && client.focusAreas.length > 0) {
      return client.focusAreas;
    }
    if (client?.tags && Array.isArray(client.tags) && client.tags.length > 0) {
      return client.tags;
    }
    return ['Not specified'];
  };

  // FIXED: This might not exist in your schema - using grantsAwarded as alternative
  const getPreviousGrants = (client) => {
    if (client?.previousGrants && Array.isArray(client.previousGrants)) {
      return client.previousGrants;
    }
    // Fallback: if grantsAwarded count is available, create descriptive text
    const grantsAwarded = client?.grantsAwarded;
    if (grantsAwarded && grantsAwarded > 0) {
      return [`Successfully awarded ${grantsAwarded} grants`];
    }
    if (client?.grantSources && Array.isArray(client.grantSources) && client.grantSources.length > 0) {
      return client.grantSources.map(source => `Funding from ${source}`);
    }
    return ['No previous grants recorded'];
  };

  // FIXED: This might not exist in your schema
  const getOperatingYears = (client) => {
    if (client?.operatingYears) return client.operatingYears;
    
    // Fallback: calculate from createdAt if available
    if (client?.createdAt) {
      const created = new Date(client.createdAt);
      const now = new Date();
      const years = now.getFullYear() - created.getFullYear();
      return years > 0 ? `${years} years` : 'New organization';
    }
    
    return 'Not specified';
  };

  // FIXED: This might not exist in your schema
  const getEligibility = (client) => {
    if (client?.eligibility) return client.eligibility;
    
    // Fallback based on organization type
    const orgType = client?.organizationType;
    if (orgType) {
      return `${orgType} - Eligible for most grants`;
    }
    
    return 'Eligibility information not specified';
  };

  // FIXED: Updated to match MongoDB field names
  const getContactInfo = (client) => {
    const primaryContact = client?.primaryContactName || 'Not specified';
    const email = client?.emailAddress || 'Not specified';
    const phone = client?.phoneNumbers || 'Not specified';
    
    return { primaryContact, email, phone };
  };

  // Debug function to see actual client data
  const debugClientData = (client) => {
    console.log('🔍 Client Profile - Raw Client Data:', {
      id: client._id,
      organizationName: client.organizationName,
      missionStatement: client.missionStatement,
      annualBudget: client.annualBudget,
      serviceArea: client.serviceArea,
      focusAreas: client.focusAreas,
      tags: client.tags,
      category: client.category,
      organizationType: client.organizationType,
      primaryContactName: client.primaryContactName,
      emailAddress: client.emailAddress,
      phoneNumbers: client.phoneNumbers,
      grantsAwarded: client.grantsAwarded,
      grantSources: client.grantSources,
      createdAt: client.createdAt,
      allKeys: Object.keys(client)
    });
  };

  const handleAnalyzeClick = (client) => {
    // Debug the actual data being received
    debugClientData(client);
    
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
        
        {/* Debug button to see what data we have */}
        <button 
          className="debug-btn"
          onClick={() => {
            console.log('🔍 ALL CLIENTS DATA:', clients);
            clients.forEach((client, index) => {
              console.log(`Client ${index + 1}:`, {
                name: client.organizationName,
                mission: client.missionStatement,
                budget: client.annualBudget,
                focusAreas: client.focusAreas,
                category: client.category
              });
            });
          }}
          style={{
            padding: '5px 10px',
            background: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '12px',
            cursor: 'pointer',
            marginLeft: '10px'
          }}
        >
          Debug Data
        </button>
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
                  {client.organizationType && (
                    <span className="client-org-type">{client.organizationType}</span>
                  )}
                </div>
                <div className="client-status">
                  <span className={`status-badge ${client?.status || 'active'}`}>
                    {client?.status || 'Active'}
                  </span>
                </div>
              </div>

              <div className="client-card-body">
                <div className="client-mission">
                  <h4>Mission Statement</h4>
                  <p>{getClientMission(client)}</p>
                </div>

                <div className="client-details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Annual Budget</span>
                    <span className="detail-value">{getClientBudget(client)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Service Area</span>
                    <span className="detail-value">{getClientLocation(client)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Operating History</span>
                    <span className="detail-value">{getOperatingYears(client)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Eligibility Status</span>
                    <span className="detail-value">{getEligibility(client)}</span>
                  </div>
                </div>

                <div className="client-tags">
                  <div className="tag-group">
                    <span className="tag-label">Program Focus:</span>
                    <div className="tags">
                      {getFocusAreas(client).map((area, index) => (
                        <span key={index} className="tag">{area}</span>
                      ))}
                    </div>
                  </div>
                  <div className="tag-group">
                    <span className="tag-label">Target Population:</span>
                    <div className="tags">
                      {getTargetPopulation(client).map((population, index) => (
                        <span key={index} className="tag">{population}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="previous-grants">
                  <h4>Grant Experience</h4>
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
                      <span className="contact-label">Primary Contact:</span>
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
                
                {/* Small debug button for individual client */}
                <button 
                  className="client-debug-btn"
                  onClick={() => debugClientData(client)}
                  title="Debug this client's data"
                  style={{
                    padding: '2px 6px',
                    background: 'transparent',
                    color: '#6c757d',
                    border: '1px solid #6c757d',
                    borderRadius: '3px',
                    fontSize: '10px',
                    cursor: 'pointer',
                    marginLeft: '8px'
                  }}
                >
                  debug
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="analysis-info">
        <div className="info-card">
          <h4>Data Sources & Fields Used</h4>
          <ul>
            <li>🏢 <strong>Organization Name</strong>: <code>organizationName</code></li>
            <li>🎯 <strong>Mission Statement</strong>: <code>missionStatement</code></li>
            <li>💰 <strong>Annual Budget</strong>: <code>annualBudget</code></li>
            <li>📍 <strong>Service Area</strong>: <code>serviceArea</code></li>
            <li>📊 <strong>Focus Areas</strong>: <code>focusAreas</code> array</li>
            <li>🏷️ <strong>Categories & Tags</strong>: <code>category</code> & <code>tags</code></li>
            <li>📞 <strong>Contact Info</strong>: <code>primaryContactName</code>, <code>emailAddress</code>, <code>phoneNumbers</code></li>
          </ul>
          <p style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
            If data appears missing, check that these fields are populated in the client form.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ClientProfile;