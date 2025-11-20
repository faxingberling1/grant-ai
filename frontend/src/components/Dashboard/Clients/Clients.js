import React, { useState, useEffect } from 'react';
import ClientList from './ClientList';
import ClientForm from './ClientForm'; // This is your updated form
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

// Updated API service to work with MongoDB Atlas
const apiService = {
  baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  },

  async getClients(searchTerm = '') {
    const query = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : '';
    return this.request(`/api/clients${query}`);
  },

  async createClient(clientData) {
    return this.request('/api/clients', {
      method: 'POST',
      body: JSON.stringify(clientData)
    });
  },

  async updateClient(clientId, clientData) {
    return this.request(`/api/clients/${clientId}`, {
      method: 'PUT',
      body: JSON.stringify(clientData)
    });
  },

  async deleteClient(clientId) {
    return this.request(`/api/clients/${clientId}`, {
      method: 'DELETE'
    });
  },

  async addCommunication(clientId, communicationData) {
    return this.request(`/api/clients/${clientId}/communications`, {
      method: 'POST',
      body: JSON.stringify(communicationData)
    });
  },

  async login(credentials) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  },

  async testConnection() {
    try {
      const response = await fetch(`${this.baseUrl}/api/health`);
      return response.ok ? { success: true } : { success: false, message: 'Health check failed' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
};

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
  const [showDebugPanel, setShowDebugPanel] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  useEffect(() => {
    if (isAuthenticated && connectionStatus === 'connected') {
      fetchClients();
    }
  }, [searchTerm, isAuthenticated, connectionStatus]);

  useEffect(() => {
    if (clients.length > 0) {
      const categoryStats = clients.reduce((stats, client) => {
        const category = client.category || 'Uncategorized';
        stats[category] = (stats[category] || 0) + 1;
        return stats;
      }, {});
      
      console.log('📊 Current category distribution:', categoryStats);
    }
  }, [clients]);

  // Transform function to handle data from ClientForm correctly
  const transformClientForComponents = (client) => {
    if (!client) return null;

    return {
      _id: typeof client._id === 'object' && client._id.$oid ? client._id.$oid : client._id,
      userId: client.userId,

      // Basic info
      organizationName: client.organizationName || '',
      primaryContactName: client.primaryContactName || '',
      titleRole: client.titleRole || '',
      emailAddress: client.emailAddress || '',
      // IMPORTANT: ClientForm sends phoneNumbers as a STRING
      phoneNumbers: client.phoneNumbers || '',
      mailingAddress: client.mailingAddress || '',
      website: client.website || '',

      // Contact Fields
      additionalContactName: client.additionalContactName || '',
      additionalContactTitle: client.additionalContactTitle || '',
      additionalContactEmail: client.additionalContactEmail || '',
      additionalContactPhone: client.additionalContactPhone || '',

      // Category data - PRESERVE EXACTLY from MongoDB
      category: client.category || '',
      priority: client.priority || 'medium',
      referralSource: client.referralSource || '',
      grantPotential: client.grantPotential || '',
      nextFollowUp: client.nextFollowUp || '',

      // Arrays - ensure they're arrays but preserve content
      focusAreas: Array.isArray(client.focusAreas) ? client.focusAreas : [],
      tags: Array.isArray(client.tags) ? client.tags : [],
      socialMediaLinks: Array.isArray(client.socialMediaLinks) ? client.socialMediaLinks : [],
      fundingAreas: Array.isArray(client.fundingAreas) ? client.fundingAreas : [],
      grantSources: Array.isArray(client.grantSources) ? client.grantSources : [],
      communicationHistory: Array.isArray(client.communicationHistory) ? client.communicationHistory : [],
      
      // Other fields
      taxIdEIN: client.taxIdEIN || '',
      organizationType: client.organizationType || '',
      missionStatement: client.missionStatement || '',
      serviceArea: client.serviceArea || '',
      annualBudget: client.annualBudget || '',
      staffCount: client.staffCount || '',
      status: client.status || 'active',
      avatar: client.avatar || '',

      // Stats
      grantsSubmitted: client.grantsSubmitted || 0,
      grantsAwarded: client.grantsAwarded || 0,
      totalFunding: client.totalFunding || '$0',

      // Timestamps
      lastContact: client.lastContact ? new Date(client.lastContact) : null,
      createdAt: client.createdAt ? new Date(client.createdAt) : new Date(),
      updatedAt: client.updatedAt ? new Date(client.updatedAt) : new Date(),

      // Notes
      notes: client.notes || '',
    };
  };

  const extractClientFromResponse = (response) => {
    if (!response) return null;

    if (response.success && response.client) {
      return response.client;
    }
    if (response.success && response.data) {
      return response.data;
    }
    if (response._id) {
      return response;
    }
    if (Array.isArray(response) && response.length > 0) {
      return response[0];
    }

    console.warn('⚠️ Unrecognized response format:', response);
    return null;
  };

  const debugCategoryData = () => {
    console.log('🔍 DEBUGGING CATEGORY DATA:');
    console.log('Raw clients from MongoDB:', clients);
    
    if (clients.length > 0) {
      clients.slice(0, 3).forEach((client, index) => {
        console.log(`Client ${index + 1} raw data:`, {
          id: client._id,
          organizationName: client.organizationName,
          category: client.category,
          hasCategory: !!client.category
        });
        
        const transformed = transformClientForComponents(client);
        console.log(`Client ${index + 1} transformed:`, {
          category: transformed.category
        });
      });
    }
  };

  const initializeApp = async () => {
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
      const result = await apiService.testConnection();
      
      if (result.success) {
        setConnectionStatus('connected');
        setError(null);
        console.log(`✅ ${environment} MongoDB connection successful:`, result);
      } else {
        throw new Error(result.message || 'Connection test failed');
      }
    } catch (error) {
      console.error(`${environment} MongoDB connection check failed:`, error);
      setConnectionStatus('disconnected');
      setError(`Cannot connect to MongoDB Atlas: ${error.message}`);
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

  const fetchClients = async () => {
    if (!isAuthenticated || connectionStatus !== 'connected') return;
    
    setLoading(true);
    setError(null);
    try {
      console.log(`🔄 Fetching clients from MongoDB Atlas...`);
      const response = await apiService.getClients(searchTerm);
      
      let clientsData = [];
      if (response && response.success) {
        clientsData = response.clients || [];
        console.log(`✅ Loaded ${clientsData.length} clients from MongoDB Atlas`);
        
        console.log('🎯 CLIENT CATEGORY DATA SAMPLE:');
        clientsData.slice(0, 3).forEach((client, index) => {
          console.log(`Client ${index + 1}:`, {
            id: client._id,
            organizationName: client.organizationName,
            category: client.category,
            tags: client.tags,
            focusAreas: client.focusAreas
          });
        });
        
      } else if (Array.isArray(response)) {
        clientsData = response;
        console.log(`✅ Loaded ${clientsData.length} clients from MongoDB (array response)`);
      } else {
        console.warn('⚠️ Unexpected API response format:', response);
        clientsData = [];
      }
      
      setClients(clientsData);
      
    } catch (error) {
      console.error(`❌ Error fetching clients from MongoDB:`, error);
      if (error.message.includes('Authentication failed') || error.message.includes('No token')) {
        setIsAuthenticated(false);
        setError('Session expired. Please log in again.');
      } else if (error.message.includes('Network error') || error.message.includes('Cannot connect')) {
        setConnectionStatus('disconnected');
        setError(`Cannot connect to MongoDB Atlas. Please check your connection.`);
      } else {
        setError(`Failed to load clients: ${error.message}`);
      }
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log(`🔐 Attempting demo login to MongoDB backend...`);
      const result = await apiService.login({
        email: 'demo@grantfunds.com',
        password: 'demo123'
      });
      
      if (result.token || result.success) {
        console.log(`✅ MongoDB demo login successful, storing token...`);
        localStorage.setItem('token', result.token || 'demo-token');
        localStorage.setItem('user', JSON.stringify(result.user || {
          id: 'demo-user',
          name: 'Demo User',
          email: 'demo@grantfunds.com',
          role: 'user'
        }));
        setIsAuthenticated(true);
        setConnectionStatus('connected');
        setError(null);
        await fetchClients();
      } else {
        throw new Error(result.message || 'Login failed');
      }
    } catch (error) {
      console.error(`❌ MongoDB login error:`, error);
      setError(`Login failed: ${error.message}`);
      
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

  // FIXED: Enhanced handleSaveClient that correctly handles phoneNumbers as string
  const handleSaveClient = async (clientData) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('💾 Saving client data to MongoDB:', {
        organizationName: clientData.organizationName,
        category: clientData.category, // This will now be saved correctly!
        focusAreas: clientData.focusAreas,
        tags: clientData.tags,
        phoneNumbers: clientData.phoneNumbers // This is now a string
      });

      // Validate required fields
      if (!clientData.organizationName?.trim() || !clientData.emailAddress?.trim()) {
        throw new Error('Organization name and email are required');
      }

      // Auth check
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      // Clean up data - handle phoneNumbers as string (from ClientForm)
      const cleanedData = {
        ...clientData,
        organizationName: clientData.organizationName.trim(),
        primaryContactName: clientData.primaryContactName.trim(),
        titleRole: clientData.titleRole?.trim() || '',
        emailAddress: clientData.emailAddress.trim(),
        // IMPORTANT: Clean phoneNumbers as string, not array
        phoneNumbers: clientData.phoneNumbers?.trim() || '',
        // Clean other string fields
        mailingAddress: clientData.mailingAddress?.trim() || '',
        website: clientData.website?.trim() || '',
        additionalContactName: clientData.additionalContactName?.trim() || '',
        additionalContactTitle: clientData.additionalContactTitle?.trim() || '',
        additionalContactEmail: clientData.additionalContactEmail?.trim() || '',
        additionalContactPhone: clientData.additionalContactPhone?.trim() || '',
        taxIdEIN: clientData.taxIdEIN?.trim() || '',
        organizationType: clientData.organizationType?.trim() || '',
        missionStatement: clientData.missionStatement?.trim() || '',
        serviceArea: clientData.serviceArea?.trim() || '',
        annualBudget: clientData.annualBudget?.trim() || '',
        staffCount: clientData.staffCount?.trim() || '',
        notes: clientData.notes?.trim() || '',
        // Ensure arrays are arrays and strings are strings
        focusAreas: Array.isArray(clientData.focusAreas) ? clientData.focusAreas : [],
        tags: Array.isArray(clientData.tags) ? clientData.tags : [],
        fundingAreas: Array.isArray(clientData.fundingAreas) ? clientData.fundingAreas : [],
        grantSources: Array.isArray(clientData.grantSources) ? clientData.grantSources : [],
        socialMediaLinks: Array.isArray(clientData.socialMediaLinks) ? clientData.socialMediaLinks : []
      };

      let response;
      if (selectedClient) {
        response = await apiService.updateClient(selectedClient._id, cleanedData);
      } else {
        response = await apiService.createClient(cleanedData);
      }

      const savedClient = extractClientFromResponse(response);
      
      if (!savedClient) {
        throw new Error('No client data received from MongoDB');
      }

      console.log('✅ MongoDB response category data:', {
        category: savedClient.category, // This should now be correctly updated!
        focusAreas: savedClient.focusAreas,
        tags: savedClient.tags
      });

      setClients(prevClients => {
        if (selectedClient) {
          return prevClients.map(client => 
            client._id === selectedClient._id ? savedClient : client
          );
        } else {
          return [savedClient, ...prevClients];
        }
      });

      setView('list');
      
    } catch (error) {
      console.error('❌ Save error:', error);
      
      let userFriendlyMessage = error.message;
      
      if (error.message.includes('Network Error') || error.message.includes('Failed to fetch')) {
        userFriendlyMessage = `Cannot connect to MongoDB Atlas. Please check your connection.`;
      } else if (error.message.includes('401') || error.message.includes('Authentication')) {
        userFriendlyMessage = 'Your session has expired. Please log in again.';
        setIsAuthenticated(false);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } else if (error.message.includes('404')) {
        userFriendlyMessage = 'Client not found. It may have been deleted.';
      } else if (error.message.includes('500')) {
        userFriendlyMessage = 'Server error. Please try again later.';
      } else if (error.message.includes('Validation')) {
        userFriendlyMessage = `Invalid data: ${error.message}`;
      }
      
      setError(userFriendlyMessage);
      
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClient = async (clientId) => {
    if (window.confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
      try {
        const result = await apiService.deleteClient(clientId);
        if (result.success) {
          setClients(clients.filter(client => client._id !== clientId));
          setError(null);
        } else {
          throw new Error(result.message || 'Failed to delete client');
        }
      } catch (error) {
        console.error('Error deleting client from MongoDB:', error);
        setError('Failed to delete client. Please try again.');
      }
    }
  };

  const handleSendEmail = (client) => {
    setSelectedClient(client);
    setSelectedTemplate(null);
    setView('email-composer');
  };

  const handleAddCommunication = async (communication) => {
    if (selectedClient) {
      try {
        const result = await apiService.addCommunication(selectedClient._id, communication);
        if (result.success && result.communication) {
          const updatedClient = {
            ...selectedClient,
            communicationHistory: [
              ...(selectedClient.communicationHistory || []),
              result.communication
            ]
          };
          setSelectedClient(updatedClient);
          
          setClients(clients.map(client => 
            client._id === selectedClient._id ? updatedClient : client
          ));
        }
      } catch (error) {
        console.error('Error adding communication to MongoDB:', error);
        setError('Failed to add communication. Please try again.');
      }
    }
  };

  const handleSendEmailFromComposer = async (emailData) => {
    try {
      console.log(`📧 Sending email via MongoDB server...`);
      
      if (selectedClient) {
        const communicationData = {
          type: 'email',
          direction: 'outgoing',
          subject: emailData.subject,
          content: emailData.content,
          preview: emailData.content.substring(0, 100) + '...',
          timestamp: new Date(),
          status: 'sent',
          important: false
        };
        
        const result = await apiService.addCommunication(selectedClient._id, communicationData);
        if (result.success) {
          const updatedClient = {
            ...selectedClient,
            communicationHistory: [
              ...(selectedClient.communicationHistory || []),
              result.communication
            ]
          };
          setSelectedClient(updatedClient);
          
          setClients(clients.map(client => 
            client._id === selectedClient._id ? updatedClient : client
          ));
        }
      }
      
      setView('list');
      setError(null);
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

  const debugClientAPI = async () => {
    console.log('🧪 DEBUG: Testing MongoDB API with Category Check');
    
    if (!clients.length) {
      console.log('❌ No clients available for testing');
      return;
    }
    
    const testClient = clients[0];
    console.log('📋 Test client:', testClient._id, testClient.organizationName);
    console.log('🎯 Current category data:', {
      category: testClient.category,
      tags: testClient.tags,
      focusAreas: testClient.focusAreas
    });
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      console.log('✅ Auth token exists');
    } catch (authError) {
      console.error('❌ Auth test failed:', authError);
      return;
    }
    
    console.log('\n2. 🎯 Testing category update...');
    try {
      const updateData = {
        organizationName: testClient.organizationName,
        primaryContactName: testClient.primaryContactName,
        emailAddress: testClient.emailAddress,
        phoneNumbers: testClient.phoneNumbers, // Handle as string
        category: 'Education', // This category will be saved to MongoDB!
        tags: ['education', 'stem', 'test'],
        focusAreas: ['STEM Education', 'Youth Development'],
        fundingAreas: ['Educational Grants'],
        priority: 'high',
        referralSource: 'Website Inquiry',
        grantPotential: '$50,000 - $100,000'
      };
      
      console.log('📤 Update data:', updateData);
      const updateResult = await apiService.updateClient(testClient._id, updateData);
      console.log('✅ MongoDB Update response:', updateResult);
      
      await fetchClients();
    } catch (updateError) {
      console.error('❌ Category update test failed:', updateError);
    }
  };

  const testCategoryAssignment = async () => {
    if (!clients.length) {
      console.log('❌ No clients available for testing');
      return;
    }
    
    const testClient = clients[0];
    console.log('🧪 Testing category assignment for:', testClient.organizationName);
    
    const testData = {
      organizationName: testClient.organizationName,
      phoneNumbers: testClient.phoneNumbers, // Handle as string
      category: 'Education', // This category will be saved to MongoDB!
      tags: ['test', 'education', 'debug'],
      focusAreas: ['Youth Education', 'STEM'],
      priority: 'high'
    };
    
    try {
      console.log('📤 Sending test update to MongoDB:', testData);
      const result = await apiService.updateClient(testClient._id, testData);
      console.log('✅ MongoDB Update response:', result);
      
      await fetchClients();
    } catch (error) {
      console.error('❌ Test update failed:', error);
    }
  };

  const quickCategoryTest = async () => {
    if (!clients.length) return;
    
    const client = clients[0];
    const testData = {
      organizationName: client.organizationName,
      phoneNumbers: client.phoneNumbers, // Handle as string
      category: 'Education', // Using one of the valid categories
      tags: ['test', 'debug'],
      focusAreas: ['Test Focus Area'],
      priority: 'medium'
    };
    
    try {
      console.log('🧪 Quick category test:', testData);
      const result = await apiService.updateClient(client._id, testData);
      console.log('✅ MongoDB Test result:', result);
      await fetchClients(); // Refresh to see changes
    } catch (error) {
      console.error('❌ Quick test failed:', error);
    }
  };

  const debugCurrentCategories = () => {
    console.log('🔍 CURRENT CLIENT CATEGORIES IN MONGODB:');
    clients.forEach((client, index) => {
      console.log(`Client ${index + 1}:`, {
        id: client._id,
        organizationName: client.organizationName,
        category: client.category,
        tags: client.tags,
        focusAreas: client.focusAreas,
        fundingAreas: client.fundingAreas
      });
    });
    
    const categoryCounts = clients.reduce((acc, client) => {
      const category = client.category || 'Uncategorized';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});
    
    console.log('📊 CATEGORY STATISTICS:', categoryCounts);
  };

  window.debugClientAPI = debugClientAPI;
  window.apiService = apiService;
  window.testCategoryAssignment = testCategoryAssignment;
  window.quickCategoryTest = quickCategoryTest;
  window.debugCurrentCategories = debugCurrentCategories;

  const filteredClients = clients
    .map(transformClientForComponents)
    .filter(client => {
      const searchLower = searchTerm.toLowerCase();
      return (
        (client.organizationName || '').toLowerCase().includes(searchLower) ||
        (client.primaryContactName || '').toLowerCase().includes(searchLower) ||
        (client.emailAddress || '').toLowerCase().includes(searchLower) ||
        (client.category || '').toLowerCase().includes(searchLower) ||
        (client.tags || []).some(tag => tag.toLowerCase().includes(searchLower)) ||
        (client.focusAreas || []).some(area => area.toLowerCase().includes(searchLower)) ||
        (client.organizationType || '').toLowerCase().includes(searchLower) ||
        (client.serviceArea || '').toLowerCase().includes(searchLower)
      );
    });

  const CompactConnectionStatus = () => {
    const getStatusConfig = () => {
      if (connectionStatus === 'connected') {
        return {
          icon: '✓',
          text: `MongoDB Atlas Connected`,
          color: '#28a745',
          bgColor: 'rgba(40, 167, 69, 0.1)'
        };
      } else if (connectionStatus === 'checking') {
        return {
          icon: '⟳',
          text: `Connecting to MongoDB Atlas...`,
          color: '#ffc107',
          bgColor: 'rgba(255, 193, 7, 0.1)'
        };
      } else {
        return {
          icon: '✗',
          text: `MongoDB Atlas Disconnected`,
          color: '#dc3545',
          bgColor: 'rgba(220, 53, 69, 0.1)'
        };
      }
    };

    const config = getStatusConfig();

    return (
      <div 
        className="compact-status-item"
        style={{
          background: config.bgColor,
          border: `1px solid ${config.color}`,
          color: config.color,
        }}
        onClick={handleRetryConnection}
      >
        <span className="compact-status-icon" style={{ color: config.color }}>
          {config.icon}
        </span>
        <span className="compact-status-text">{config.text}</span>
      </div>
    );
  };

  const CompactDebugPanel = () => {
    const testConnection = async () => {
      try {
        const result = await apiService.testConnection();
        console.log(`✅ MongoDB Atlas connection test:`, result);
        alert(`✅ MongoDB Atlas is working! Check console for details.`);
      } catch (error) {
        console.error(`❌ MongoDB Atlas test failed:`, error);
        alert(`❌ MongoDB Atlas connection failed: ${error.message}`);
      }
    };

    const categoryStats = clients.reduce((stats, client) => {
      const category = client.category || 'Uncategorized';
      stats[category] = (stats[category] || 0) + 1;
      return stats;
    }, {});

    return (
      <div className="compact-debug-panel">
        <div className="compact-debug-header">
          <div className="compact-debug-icon">
            {environment === 'production' ? '🚀' : '🔧'}
          </div>
          <span className="compact-debug-title">
            GrantFlow CRM - MongoDB Atlas
          </span>
          <button 
            className="compact-debug-toggle"
            onClick={() => setShowDebugPanel(!showDebugPanel)}
          >
            {showDebugPanel ? '▲' : '▼'}
          </button>
        </div>

        {showDebugPanel && (
          <div className="compact-debug-content">
            <div className="compact-debug-actions">
              <button onClick={testConnection} className="compact-debug-btn">
                <i className="fas fa-bolt"></i>
                Test MongoDB
              </button>
              <button onClick={debugClientAPI} className="compact-debug-btn">
                <i className="fas fa-vial"></i>
                Test Categories
              </button>
              <button onClick={testCategoryAssignment} className="compact-debug-btn">
                <i className="fas fa-tag"></i>
                Assign Test Category
              </button>
              <button onClick={quickCategoryTest} className="compact-debug-btn">
                <i className="fas fa-rocket"></i>
                Quick Category Test
              </button>
              <button onClick={debugCurrentCategories} className="compact-debug-btn">
                <i className="fas fa-chart-bar"></i>
                Category Stats
              </button>
              <button onClick={fetchClients} className="compact-debug-btn">
                <i className="fas fa-sync-alt"></i>
                Refresh Clients
              </button>
              <button onClick={handleLogout} className="compact-debug-btn danger">
                <i className="fas fa-sign-out-alt"></i>
                Logout
              </button>
            </div>
            
            <div className="compact-debug-status">
              <div className="compact-status-indicators">
                <div className="compact-status-indicator">
                  <div className={`status-dot ${isAuthenticated ? 'authenticated' : 'disconnected'}`}></div>
                  {isAuthenticated ? 'Authenticated' : 'Not authenticated'}
                </div>
                <div className="compact-status-indicator">
                  <div className={`status-dot ${connectionStatus}`}></div>
                  MongoDB: {connectionStatus}
                </div>
                <div className="compact-status-indicator">
                  <i className="fas fa-users"></i>
                  Clients: {clients.length}
                </div>
                <div className="compact-status-indicator">
                  <i className="fas fa-database"></i>
                  Environment: {environment}
                </div>
              </div>
              
              <div className="category-stats">
                <h4>Category Analysis:</h4>
                {Object.entries(categoryStats).map(([category, count]) => (
                  <div key={category} className="stat-item">
                    <span>{category}:</span>
                    <span>{count}</span>
                  </div>
                ))}
                <div className="stat-item total">
                  <span>Total Clients:</span>
                  <span>{clients.length}</span>
                </div>
                <div className="stat-item uncategorized">
                  <span>Uncategorized:</span>
                  <span>{clients.filter(c => !c.category).length}</span>
                </div>
              </div>
            </div>

            <div className="client-data-sample">
              <h4>Client Data Sample:</h4>
              {clients.slice(0, 2).map((client, index) => (
                <div key={index} className="client-sample">
                  <div><strong>{client.organizationName}</strong></div>
                  <div>Category: {client.category || 'None'}</div>
                  <div>Tags: {client.tags?.join(', ') || 'None'}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const LoginHelper = () => {
    const getLoginConfig = () => {
      if (environment === 'production') {
        return {
          background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
          border: '#2196f3',
          buttonColor: '#1976d2',
          title: '🚀 GrantFlow CRM - MongoDB Atlas Production',
          serverType: 'MongoDB Atlas production server',
          buttonText: 'Login with Demo Account'
        };
      } else {
        return {
          background: 'linear-gradient(135deg, #e8f5e8 0%, #c3e6cb 100%)',
          border: '#4caf50',
          buttonColor: '#28a745',
          title: '🔧 GrantFlow CRM - MongoDB Atlas Development',
          serverType: 'MongoDB Atlas development server',
          buttonText: 'Login with Demo Account'
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
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
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
          You are connected to <strong>MongoDB Atlas</strong> database at:
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
          border: '1px solid rgba(0, 0, 0, 0.1)'
        }}>
          {process.env.REACT_APP_API_URL || 'http://localhost:5000'}
        </code>
        <p style={{ 
          margin: '20px 0',
          fontSize: '1rem',
          color: '#1a472a'
        }}>
          Please log in with the demo account to access clients stored in MongoDB Atlas.
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
            fontWeight: 'bold'
          }}
        >
          {loading ? (
            <>
              <i className="fas fa-spinner fa-spin" style={{ marginRight: '8px' }}></i>
              Logging in...
            </>
          ) : connectionStatus === 'disconnected' ? (
            'MongoDB Server Offline'
          ) : (
            config.buttonText
          )}
        </button>
        <div style={{ 
          marginTop: '20px', 
          padding: '15px',
          background: 'rgba(255, 255, 255, 0.7)',
          borderRadius: '10px'
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
            borderRadius: '10px'
          }}>
            <strong>🚫 MongoDB Atlas not detected!</strong><br />
            <div style={{ marginTop: '8px', fontSize: '0.9rem' }}>
              Make sure your backend is properly connected to MongoDB Atlas
            </div>
          </div>
        )}
        {connectionStatus === 'connected' && (
          <div style={{ 
            marginTop: '20px', 
            padding: '15px',
            background: 'rgba(209, 236, 241, 0.8)',
            color: '#0c5460',
            borderRadius: '10px'
          }}>
            <strong>✅ MongoDB Atlas is connected!</strong><br />
            <div style={{ marginTop: '5px', fontSize: '0.9rem' }}>
              You can now log in and test the application
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderView = () => {
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
            onCommunication={handleCommunication}
            onViewHistory={handleViewHistory}
            onCommunicationHub={handleCommunicationHub}
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
            loading={loading}
            environment={environment}
            isNewClient={!selectedClient}
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
      case 'communication-hub':
        return (
          <CommunicationHub
            onBack={() => setView('list')}
            onEmails={() => setView('emails')}
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
      {!isAuthenticated ? (
        <LoginHelper />
      ) : (
        <>
          {error && (
            <div className="error-message">
              <span>{error}</span>
              <button onClick={() => setError(null)}>×</button>
            </div>
          )}

          <div className="clients-content">
            {renderView()}
          </div>

          <div className="clients-footer">
            <CompactConnectionStatus />
            <CompactDebugPanel />
          </div>
        </>
      )}
    </div>
  );
};

export default Clients;