import React, { useState } from 'react';
import CommunicationThread from './CommunicationThread';

const ClientDetails = ({ client, onEdit, onBack, onSendEmail }) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!client) return null;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'fas fa-chart-bar' },
    { id: 'communications', label: 'Communications', icon: 'fas fa-envelope' },
    { id: 'grants', label: 'Grants', icon: 'fas fa-file-alt' },
    { id: 'documents', label: 'Documents', icon: 'fas fa-folder' }
  ];

  return (
    <div className="client-details">
      <div className="details-header">
        <button className="btn-back" onClick={onBack}>
          <i className="fas fa-arrow-left"></i>
          Back to Clients
        </button>
        <div className="header-actions">
          <button className="btn btn-outline" onClick={() => onSendEmail(client)}>
            <i className="fas fa-envelope"></i>
            Send Email
          </button>
          <button className="btn btn-primary" onClick={onEdit}>
            <i className="fas fa-edit"></i>
            Edit Client
          </button>
        </div>
      </div>

      <div className="client-profile">
        <div className="profile-header">
          <img src={client.avatar} alt={client.name} className="profile-avatar" />
          <div className="profile-info">
            <h1>{client.name}</h1>
            <p className="profile-organization">{client.organization}</p>
            <div className="profile-contacts">
              <div className="contact-item">
                <i className="fas fa-envelope"></i>
                <span>{client.email}</span>
              </div>
              <div className="contact-item">
                <i className="fas fa-phone"></i>
                <span>{client.phone}</span>
              </div>
            </div>
            <div className="profile-status">
              <span className={`status-badge ${client.status}`}>
                {client.status}
              </span>
              <span className="member-since">
                Member since {new Date().getFullYear()}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="client-tabs">
          <div className="tabs-header">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <i className={tab.icon}></i>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="tab-content">
            {activeTab === 'overview' && (
              <div className="overview-tab">
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon primary">
                      <i className="fas fa-file-alt"></i>
                    </div>
                    <div className="stat-content">
                      <h3>{client.grantsSubmitted}</h3>
                      <p>Grants Submitted</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon success">
                      <i className="fas fa-check-circle"></i>
                    </div>
                    <div className="stat-content">
                      <h3>{client.grantsAwarded}</h3>
                      <p>Grants Awarded</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon warning">
                      <i className="fas fa-percentage"></i>
                    </div>
                    <div className="stat-content">
                      <h3>{Math.round((client.grantsAwarded / client.grantsSubmitted) * 100)}%</h3>
                      <p>Success Rate</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon info">
                      <i className="fas fa-award"></i>
                    </div>
                    <div className="stat-content">
                      <h3>{client.totalFunding}</h3>
                      <p>Total Funding</p>
                    </div>
                  </div>
                </div>

                <div className="details-grid">
                  <div className="detail-section">
                    <h3>Client Information</h3>
                    <div className="detail-item">
                      <label>Last Contact</label>
                      <span>{new Date(client.lastContact).toLocaleDateString()}</span>
                    </div>
                    <div className="detail-item">
                      <label>Status</label>
                      <span className={`status-badge ${client.status}`}>
                        {client.status}
                      </span>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h3>Tags</h3>
                    <div className="tags-list">
                      {client.tags.map((tag, index) => (
                        <span key={index} className="tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="detail-section full-width">
                    <h3>Notes</h3>
                    <div className="notes-content">
                      {client.notes || 'No notes added for this client.'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'communications' && (
              <CommunicationThread client={client} />
            )}

            {activeTab === 'grants' && (
              <div className="grants-tab">
                <h3>Grant History</h3>
                <p>Grant tracking and history will be displayed here.</p>
                {/* Grant history table/component would go here */}
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="documents-tab">
                <h3>Client Documents</h3>
                <p>Document management will be available here.</p>
                {/* Document upload/management would go here */}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDetails;