import React, { useState, useEffect } from 'react';
import ClientList from './ClientList';
import ClientForm from './ClientForm';
import ClientDetails from './ClientDetails';
import ClientEmails from './ClientEmails';
import ClientCommunication from './ClientCommunication';
import CommunicationHistory from './CommunicationHistory';
import BulkEmail from './BulkEmail';
import CommunicationHub from './CommunicationHub';
import EmailTemplates from '../CommunicationHub/EmailTemplates';
import EmailComposer from '../CommunicationHub/EmailComposer';
import './Clients.css';
import './CommunicationHub.css';
import apiService from '../../../services/api';

const Clients = () => {
  const [view, setView] = useState('list');
  const [selectedClient, setSelectedClient] = useState(null);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [communicationTab, setCommunicationTab] = useState('emails');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const [environment, setEnvironment] = useState('production');

  // Check authentication and connection on component mount
  useEffect(() => {
    initializeApp();
  }, []);

  // Fetch clients when authenticated or search term changes
  useEffect(() => {
    if (isAuthenticated && connectionStatus === 'connected') {
      fetchClients();
    }
  }, [searchTerm, isAuthenticated, connectionStatus]);

  const initializeApp = async () => {
    // Detect environment based on API URL
    const apiUrl = process.env.REACT_APP_API_URL || '';
    if (apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1')) {
      setEnvironment('development');
    } else {
      setEnvironment('production');
    }

    await checkConnection();
    checkAuthentication();
  };

  const checkConnection = async () => {
    setConnectionStatus('checking');
    try {
      let result;
      if (environment === 'development') {
        result = await apiService.testLocalConnection();
      } else {
        result = await apiService.testProductionConnection();
      }
      
      setConnectionStatus('connected');
      setError(null);
      console.log(`✅ ${environment} connection successful:`, result);
    } catch (error) {
      console.error(`${environment} connection check failed:`, error);
      setConnectionStatus('disconnected');
      setError(`Cannot connect to ${environment} server: ${error.message}`);
    }
  };

  const checkAuthentication = () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    console.log('🔐 Auth check:', { 
      hasToken: !!token, 
      hasUser: !!user,
      connection: connectionStatus,
      environment: environment
    });
    
    setIsAuthenticated(!!token);
    
    if (!token) {
      setError('Please log in to access clients.');
      setLoading(false);
    }
  };

  // Fetch clients from API
  const fetchClients = async () => {
    if (!isAuthenticated || connectionStatus !== 'connected') return;
    
    setLoading(true);
    setError(null);
    try {
      console.log(`🔄 Fetching clients from ${environment} server...`);
      const clientsData = await apiService.getClients(searchTerm);
      console.log(`✅ Loaded ${clientsData.length} clients from ${environment}`);
      setClients(clientsData);
    } catch (error) {
      console.error(`❌ Error fetching clients from ${environment}:`, error);
      if (error.message.includes('Authentication failed') || error.message.includes('No token')) {
        setIsAuthenticated(false);
        setError('Session expired. Please log in again.');
      } else if (error.message.includes('Network error') || error.message.includes('Cannot connect')) {
        setConnectionStatus('disconnected');
        setError(`Cannot connect to ${environment} server. Please check your connection.`);
      } else {
        setError(`Failed to load clients: ${error.message}`);
      }
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  // Login with demo account
  const handleDemoLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log(`🔐 Attempting demo login to ${environment} server...`);
      const result = await apiService.login({
        email: 'demo@grantfunds.com',
        password: 'demo123'
      });
      
      if (result.success) {
        console.log(`✅ ${environment} demo login successful, storing token...`);
        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        setIsAuthenticated(true);
        setConnectionStatus('connected');
        setError(null);
        await fetchClients();
      }
    } catch (error) {
      console.error(`❌ ${environment} login error:`, error);
      setError(`Login failed: ${error.message}`);
      
      // If login fails due to connection, update status
      if (error.message.includes('Network error') || error.message.includes('Cannot connect')) {
        setConnectionStatus('disconnected');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddClient = () => {
    setSelectedClient(null);
    setView('form');
  };

  const handleEditClient = (client) => {
    setSelectedClient(client);
    setView('form');
  };

  const handleViewClient = (client) => {
    setSelectedClient(client);
    setView('details');
  };

  const handleEmails = (client) => {
    setSelectedClient(client);
    setView('emails');
  };

  const handleCommunication = (client) => {
    setSelectedClient(client);
    setView('communication');
  };

  const handleViewHistory = (client) => {
    setSelectedClient(client);
    setView('history');
  };

  const handleCommunicationHub = () => {
    setView('communication-hub');
  };

  const handleSaveClient = async (clientData) => {
    try {
      // Transform data for API - ensure required fields are present
      const apiData = {
        organizationName: clientData.organizationName || '',
        primaryContactName: clientData.primaryContactName || '',
        emailAddress: clientData.emailAddress || '',
        phoneNumbers: clientData.phoneNumbers || '',
        status: clientData.status || 'active',
        tags: clientData.tags || [],
        notes: clientData.notes || '',
        titleRole: clientData.titleRole || '',
        additionalContactName: clientData.additionalContactName || '',
        additionalContactTitle: clientData.additionalContactTitle || '',
        additionalContactEmail: clientData.additionalContactEmail || '',
        additionalContactPhone: clientData.additionalContactPhone || '',
        mailingAddress: clientData.mailingAddress || '',
        website: clientData.website || '',
        socialMediaLinks: clientData.socialMediaLinks || [],
        taxIdEIN: clientData.taxIdEIN || '',
        organizationType: clientData.organizationType || '',
        missionStatement: clientData.missionStatement || '',
        focusAreas: clientData.focusAreas || [],
        serviceArea: clientData.serviceArea || '',
        annualBudget: clientData.annualBudget || '',
        staffCount: clientData.staffCount || '',
      };

      // Validate required fields
      if (!apiData.organizationName.trim()) {
        throw new Error('Organization name is required');
      }
      if (!apiData.primaryContactName.trim()) {
        throw new Error('Primary contact name is required');
      }
      if (!apiData.emailAddress.trim()) {
        throw new Error('Email address is required');
      }

      console.log(`💾 Saving client to ${environment} database...`);

      if (selectedClient) {
        // Update existing client
        const updatedClient = await apiService.updateClient(selectedClient._id, apiData);
        setClients(clients.map(client => 
          client._id === selectedClient._id ? updatedClient : client
        ));
      } else {
        // Create new client
        const newClient = await apiService.createClient(apiData);
        setClients([newClient, ...clients]);
      }
      setView('list');
    } catch (error) {
      console.error(`❌ Error saving client to ${environment}:`, error);
      setError(`Failed to save client: ${error.message}`);
    }
  };

  const handleDeleteClient = async (clientId) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        await apiService.deleteClient(clientId);
        setClients(clients.filter(client => client._id !== clientId));
      } catch (error) {
        console.error('Error deleting client:', error);
        setError('Failed to delete client. Please try again.');
      }
    }
  };

  const handleBulkEmail = () => {
    setView('bulk-email');
  };

  const handleSendEmail = (client) => {
    setSelectedClient(client);
    setSelectedTemplate(null);
    setView('email-composer');
  };

  const handleComposeEmail = (client = null, template = null) => {
    setSelectedClient(client);
    setSelectedTemplate(template);
    setView('email-composer');
  };

  const handleViewTemplates = () => {
    setView('templates');
  };

  const handleUseTemplate = (template) => {
    setSelectedTemplate(template);
    setSelectedClient(null);
    setView('email-composer');
  };

  const handleAddCommunication = async (communication) => {
    if (selectedClient) {
      try {
        const updatedClient = await apiService.addCommunication(selectedClient._id, communication);
        setSelectedClient(updatedClient);
        
        // Update client in the list
        setClients(clients.map(client => 
          client._id === selectedClient._id ? updatedClient : client
        ));
      } catch (error) {
        console.error('Error adding communication:', error);
        setError('Failed to add communication. Please try again.');
      }
    }
  };

  const handleSendEmailFromComposer = async (emailData) => {
    try {
      console.log(`📧 Sending email via ${environment} server...`);
      
      // Add to communication history if sending to a specific client
      if (selectedClient) {
        const communicationData = {
          type: 'email',
          direction: 'outgoing',
          subject: emailData.subject,
          content: emailData.content,
          preview: emailData.content.substring(0, 100) + '...',
          status: 'sent',
          important: false
        };
        
        const updatedClient = await apiService.addCommunication(selectedClient._id, communicationData);
        setSelectedClient(updatedClient);
        
        // Update client in the list
        setClients(clients.map(client => 
          client._id === selectedClient._id ? updatedClient : client
        ));
      }
      
      setView('list');
    } catch (error) {
      console.error('Error sending email:', error);
      setError('Failed to send email. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setClients([]);
    setError('Logged out successfully.');
  };

  const handleRetryConnection = async () => {
    setError(null);
    await checkConnection();
    if (connectionStatus === 'connected' && !isAuthenticated) {
      checkAuthentication();
    }
  };

  // Helper function to transform client data for components expecting the old structure
  const transformClientForComponents = (client) => {
    if (!client) return null;
    
    return {
      // Map MongoDB _id to id for compatibility
      id: client._id,
      // Core fields (for backward compatibility)
      name: client.primaryContactName || client.name,
      email: client.emailAddress || client.email,
      phone: client.phoneNumbers || client.phone,
      organization: client.organizationName || client.organization,
      status: client.status,
      lastContact: client.lastContact,
      grantsSubmitted: client.grantsSubmitted,
      grantsAwarded: client.grantsAwarded,
      totalFunding: client.totalFunding,
      avatar: client.avatar,
      notes: client.notes,
      tags: client.tags || [],
      communicationHistory: client.communicationHistory || [],
      
      // Include all new comprehensive fields
      ...client
    };
  };

  const filteredClients = clients
    .map(transformClientForComponents)
    .filter(client =>
      (client.organizationName || client.organization).toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.primaryContactName || client.name).toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.emailAddress || client.email).toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.tags || []).some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  // Enhanced Connection Status Component
  const ConnectionStatus = () => {
    const getStatusText = () => {
      if (connectionStatus === 'connected') {
        return `Connected to ${environment === 'production' ? 'Production' : 'Local'} Server`;
      } else if (connectionStatus === 'checking') {
        return `Connecting to ${environment === 'production' ? 'Production' : 'Local'} Server...`;
      } else {
        return `${environment === 'production' ? 'Production' : 'Local'} Server Disconnected`;
      }
    };

    return (
      <div className={`connection-status ${connectionStatus}`}>
        <div className="connection-status-content">
          <div className="connection-status-icon">
            {connectionStatus === 'connected' && '✓'}
            {connectionStatus === 'checking' && '⟳'}
            {connectionStatus === 'disconnected' && '✗'}
          </div>
          <span>{getStatusText()}</span>
        </div>
        {connectionStatus === 'disconnected' && (
          <button 
            className="connection-status-retry-btn"
            onClick={handleRetryConnection}
          >
            Retry Connection
          </button>
        )}
      </div>
    );
  };

  // Enhanced Debug Panel Component
  const DebugPanel = () => {
    const testConnection = async () => {
      try {
        let result;
        if (environment === 'development') {
          result = await apiService.testLocalConnection();
        } else {
          result = await apiService.testProductionConnection();
        }
        console.log(`✅ ${environment} connection test:`, result);
        alert(`✅ ${environment === 'production' ? 'Production' : 'Local'} server is working! Check console for details.`);
      } catch (error) {
        console.error(`❌ ${environment} test failed:`, error);
        alert(`❌ ${environment === 'production' ? 'Production' : 'Local'} server test failed: ${error.message}`);
      }
    };

    return (
      <div className={`debug-panel ${environment}`}>
        <div className="debug-panel-header">
          <div className="debug-panel-icon">
            {environment === 'production' ? '🚀' : '🔧'}
          </div>
          <h3 className="debug-panel-title">
            GrantFlow CRM - {environment === 'production' ? 'Production' : 'Local Development'}
          </h3>
        </div>
        
        <div className="debug-panel-actions">
          <button onClick={testConnection} className="debug-panel-btn primary">
            <i className="fas fa-bolt"></i>
            Test {environment === 'production' ? 'Production' : 'Local'} API
          </button>
          <button onClick={fetchClients} className="debug-panel-btn success">
            <i className="fas fa-sync-alt"></i>
            Refresh Clients
          </button>
          <button onClick={handleLogout} className="debug-panel-btn danger">
            <i className="fas fa-sign-out-alt"></i>
            Logout
          </button>
        </div>
        
        <div className="debug-panel-status">
          <div className="debug-status-item">
            <div className={`debug-status-indicator ${isAuthenticated ? 'authenticated' : 'disconnected'}`}></div>
            Status: {isAuthenticated ? 'Authenticated' : 'Not authenticated'}
          </div>
          <div className="debug-status-item">
            <div className={`debug-status-indicator ${connectionStatus}`}></div>
            Server: {connectionStatus}
          </div>
          <div className="debug-status-item">
            <i className="fas fa-globe"></i>
            Environment: {environment}
          </div>
          <div className="debug-status-item">
            <i className="fas fa-users"></i>
            Clients: {clients.length}
          </div>
        </div>
      </div>
    );
  };

  // Enhanced Login Helper Component
  const LoginHelper = () => {
    const getLoginConfig = () => {
      if (environment === 'production') {
        return {
          background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
          border: '#2196f3',
          buttonColor: '#1976d2',
          title: '🚀 GrantFlow CRM - Production',
          serverType: 'production server',
          buttonText: 'Login with Demo Account'
        };
      } else {
        return {
          background: 'linear-gradient(135deg, #e8f5e8 0%, #c3e6cb 100%)',
          border: '#4caf50',
          buttonColor: '#28a745',
          title: '🔧 GrantFlow CRM - Local Development',
          serverType: 'local development server',
          buttonText: 'Login with Demo Account (Local)'
        };
      }
    };

    const config = getLoginConfig();

    return (
      <div style={{
        padding: '30px',
        background: config.background,
        border: `2px solid ${config.border}`,
        borderRadius: '16px',
        margin: '20px',
        textAlign: 'center',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        animation: 'panelSlideIn 0.6s ease-out'
      }}>
        <h3 style={{ 
          margin: '0 0 15px 0',
          fontSize: '1.8rem',
          fontWeight: '700',
          background: 'linear-gradient(135deg, #1a472a 0%, #2d5a3a 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          {config.title}
        </h3>
        <p style={{ 
          fontSize: '1.1rem',
          margin: '0 0 20px 0',
          color: '#1a472a',
          fontWeight: '600'
        }}>
          You are connected to the <strong>{config.serverType}</strong> at:
        </p>
        <code style={{ 
          background: 'rgba(255, 255, 255, 0.9)',
          padding: '12px 16px', 
          borderRadius: '10px',
          fontSize: '14px',
          display: 'block',
          margin: '15px auto',
          maxWidth: '500px',
          fontWeight: '600',
          border: '1px solid rgba(0, 0, 0, 0.1)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}>
          {process.env.REACT_APP_API_URL || 'http://localhost:5000'}
        </code>
        <p style={{ 
          margin: '20px 0',
          fontSize: '1rem',
          color: '#1a472a'
        }}>
          Please log in with the demo account to access clients.
        </p>
        <button 
          onClick={handleDemoLogin}
          disabled={loading || connectionStatus === 'disconnected'}
          style={{
            padding: '14px 28px',
            background: connectionStatus === 'disconnected' ? '#6c757d' : config.buttonColor,
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            cursor: connectionStatus === 'disconnected' ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            marginTop: '15px',
            fontWeight: 'bold',
            transition: 'all 0.3s ease',
            boxShadow: connectionStatus === 'disconnected' ? 'none' : '0 4px 15px rgba(0, 0, 0, 0.2)'
          }}
          onMouseOver={(e) => {
            if (connectionStatus !== 'disconnected') {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.3)';
            }
          }}
          onMouseOut={(e) => {
            if (connectionStatus !== 'disconnected') {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
            }
          }}
        >
          {loading ? (
            <>
              <i className="fas fa-spinner fa-spin" style={{ marginRight: '8px' }}></i>
              Logging in...
            </>
          ) : connectionStatus === 'disconnected' ? (
            environment === 'production' ? 'Server Offline' : 'Backend Not Running'
          ) : (
            config.buttonText
          )}
        </button>
        <div style={{ 
          marginTop: '20px', 
          padding: '15px',
          background: 'rgba(255, 255, 255, 0.7)',
          borderRadius: '10px',
          border: '1px solid rgba(0, 0, 0, 0.1)'
        }}>
          <strong style={{ color: '#1a472a' }}>Demo Credentials:</strong><br />
          <div style={{ marginTop: '8px', lineHeight: '1.6' }}>
            <span style={{ fontWeight: '600' }}>Email:</span> demo@grantfunds.com<br />
            <span style={{ fontWeight: '600' }}>Password:</span> demo123
          </div>
        </div>
        {connectionStatus === 'disconnected' && (
          <div style={{ 
            marginTop: '20px', 
            padding: '15px',
            background: 'rgba(248, 215, 218, 0.8)',
            color: '#721c24',
            borderRadius: '10px',
            border: '1px solid #f5c6cb'
          }}>
            <strong>🚫 Server not detected!</strong><br />
            <div style={{ marginTop: '8px', fontSize: '0.9rem' }}>
              {environment === 'production' 
                ? 'Make sure your production backend is deployed and running on Render'
                : 'Make sure your backend is running on localhost:5000'
              }
            </div>
            <div style={{ marginTop: '5px', fontSize: '0.85rem', opacity: '0.8' }}>
              {environment === 'production' 
                ? 'Check: https://grant-ai.onrender.com/api/health'
                : 'Run: cd backend && npm start'
              }
            </div>
          </div>
        )}
        {connectionStatus === 'connected' && (
          <div style={{ 
            marginTop: '20px', 
            padding: '15px',
            background: 'rgba(209, 236, 241, 0.8)',
            color: '#0c5460',
            borderRadius: '10px',
            border: '1px solid #bee5eb'
          }}>
            <strong>✅ Server is running!</strong><br />
            <div style={{ marginTop: '5px', fontSize: '0.9rem' }}>
              You can now log in and test the application
            </div>
          </div>
        )}
      </div>
    );
  };

  // Simplified logic for determining active states
  const isClientsActive = view === 'list' || view === 'form' || view === 'details' || 
                         view === 'emails' || view === 'communication' || view === 'history';
  
  const isCommunicationHubActive = view === 'communication-hub';

  const renderView = () => {
    // Transform selected client for components
    const transformedSelectedClient = transformClientForComponents(selectedClient);

    switch (view) {
      case 'list':
        return (
          <ClientList
            clients={filteredClients}
            loading={loading}
            onAddClient={handleAddClient}
            onEditClient={handleEditClient}
            onViewClient={handleViewClient}
            onDeleteClient={handleDeleteClient}
            onSendEmail={handleSendEmail}
            onEmails={handleEmails}
            onBulkEmail={handleBulkEmail}
            onCommunication={handleCommunication}
            onViewHistory={handleViewHistory}
            onCommunicationHub={handleCommunicationHub}
            onViewTemplates={handleViewTemplates}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
        );
      case 'form':
        return (
          <ClientForm
            client={transformedSelectedClient}
            onSave={handleSaveClient}
            onCancel={() => setView('list')}
          />
        );
      case 'details':
        return (
          <ClientDetails
            client={transformedSelectedClient}
            onEdit={() => handleEditClient(selectedClient)}
            onBack={() => setView('list')}
            onSendEmail={() => handleSendEmail(selectedClient)}
            onEmails={() => handleEmails(selectedClient)}
            onCommunication={() => handleCommunication(selectedClient)}
            onViewHistory={() => handleViewHistory(selectedClient)}
          />
        );
      case 'emails':
        return (
          <ClientEmails
            client={transformedSelectedClient}
            onBack={() => setView('list')}
            onSendEmail={() => handleSendEmail(selectedClient)}
            onUseTemplate={handleUseTemplate}
          />
        );
      case 'communication':
        return (
          <ClientCommunication
            client={transformedSelectedClient}
            onSendEmail={() => handleSendEmail(selectedClient)}
            onAddCommunication={handleAddCommunication}
            onBack={() => setView('list')}
            activeTab={communicationTab}
            onTabChange={setCommunicationTab}
          />
        );
      case 'history':
        return (
          <CommunicationHistory
            client={transformedSelectedClient}
            onBack={() => setView('list')}
            onSendEmail={() => handleSendEmail(selectedClient)}
          />
        );
      case 'templates':
        return (
          <EmailTemplates
            onBack={() => setView('list')}
            onUseTemplate={handleUseTemplate}
          />
        );
      case 'bulk-email':
        return (
          <BulkEmail
            clients={clients.map(transformClientForComponents)}
            onSend={() => setView('list')}
            onCancel={() => setView('list')}
          />
        );
      case 'email-composer':
        return (
          <EmailComposer
            client={transformedSelectedClient}
            template={selectedTemplate}
            onSend={handleSendEmailFromComposer}
            onCancel={() => setView('list')}
          />
        );
      case 'communication-hub':
        return (
          <CommunicationHub
            onBack={() => setView('list')}
            onEmails={() => setView('emails')}
            onTemplates={handleViewTemplates}
            onBulkEmail={handleBulkEmail}
            onComposeEmail={handleComposeEmail}
            clients={clients.map(transformClientForComponents)}
          />
        );
      default:
        return (
          <div className="clients-loading">
            <i className="fas fa-exclamation-triangle"></i>
            <p>View not found: {view}</p>
            <button 
              className="clients-btn clients-btn-primary"
              onClick={() => setView('list')}
            >
              Return to Client List
            </button>
          </div>
        );
    }
  };

  return (
    <div className="clients-container">
      {/* Enhanced Connection Status */}
      <ConnectionStatus />
      
      {/* Show login helper if not authenticated */}
      {!isAuthenticated ? (
        <LoginHelper />
      ) : (
        <>
          {/* Enhanced Debug Panel */}
          <DebugPanel />
          
          {/* Error Message */}
          {error && (
            <div className="error-message" style={{
              background: 'linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%)',
              color: '#721c24',
              padding: '15px',
              borderRadius: '12px',
              margin: '0 2rem 1.5rem',
              border: '2px solid #dc3545',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: '0 4px 15px rgba(220, 53, 69, 0.2)',
              animation: 'statusSlideIn 0.5s ease-out'
            }}>
              <span style={{ fontWeight: '600' }}>{error}</span>
              <button 
                onClick={() => setError(null)} 
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '18px',
                  cursor: 'pointer',
                  color: '#721c24',
                  fontWeight: 'bold',
                  padding: '0',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = '#dc3545';
                  e.target.style.color = 'white';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = 'none';
                  e.target.style.color = '#721c24';
                }}
              >
                ×
              </button>
            </div>
          )}

          {/* Enhanced Navigation Bar */}
          <div className="clients-nav">
            <div className="clients-nav-buttons">
              {/* Clients Section */}
              <div className="clients-nav-section">
                <button 
                  className={`clients-nav-button ${isClientsActive ? 'active' : ''}`}
                  onClick={() => setView('list')}
                >
                  <i className="fas fa-users"></i>
                  Clients
                  {clients.filter(c => c.status === 'active').length > 0 && (
                    <span className="clients-nav-badge">
                      {clients.filter(c => c.status === 'active').length}
                    </span>
                  )}
                </button>
              </div>

              {/* Communication Section */}
              <div className="clients-nav-section">
                <button 
                  className={`clients-nav-button ${isCommunicationHubActive ? 'active' : ''}`}
                  onClick={handleCommunicationHub}
                >
                  <i className="fas fa-comments"></i>
                  Communication Hub
                  <span className="clients-nav-badge">3</span>
                </button>
                
                {/* Communication Actions - Always Visible */}
                <button 
                  className="clients-nav-action-btn"
                  onClick={handleViewTemplates}
                >
                  <i className="fas fa-layer-group"></i>
                  Email Templates
                </button>
                
                {/* Compose Email Button - Added before Bulk Email */}
                <button 
                  className="clients-nav-action-btn primary"
                  onClick={() => handleComposeEmail()}
                >
                  <i className="fas fa-edit"></i>
                  Compose Email
                </button>
                
                <button 
                  className="clients-nav-action-btn primary"
                  onClick={handleBulkEmail}
                >
                  <i className="fas fa-mail-bulk"></i>
                  Bulk Email
                </button>
              </div>
            </div>
            
            <div className="clients-nav-actions">
              {/* Add Client Button - Moved to right side */}
              <button className="clients-nav-add-btn" onClick={handleAddClient}>
                <i className="fas fa-plus"></i>
                Add Client
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="clients-content">
            {renderView()}
          </div>
        </>
      )}
    </div>
  );
};

export default Clients;