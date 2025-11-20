import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import apiService from '../services/api';

const ClientsContext = createContext();

export const useClients = () => {
  const context = useContext(ClientsContext);
  if (!context) {
    throw new Error('useClients must be used within a ClientsProvider');
  }
  return context;
};

export const ClientsProvider = ({ children }) => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  // Enhanced transform function to ensure all fields are properly handled
  const transformClientForComponents = (client) => {
    if (!client) return null;

    // Handle MongoDB ObjectId format
    const clientId = typeof client._id === 'object' && client._id.$oid 
      ? client._id.$oid 
      : client._id;

    return {
      _id: clientId,
      userId: client.userId,

      // Basic info - with proper fallbacks
      organizationName: client.organizationName || client.organization || '',
      primaryContactName: client.primaryContactName || client.name || '',
      titleRole: client.titleRole || '',
      emailAddress: client.emailAddress || client.email || '',
      phoneNumbers: client.phoneNumbers || client.phone || '',
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
      
      // Other fields with proper fallbacks
      taxIdEIN: client.taxIdEIN || '',
      organizationType: client.organizationType || '',
      missionStatement: client.missionStatement || '',
      serviceArea: client.serviceArea || '',
      annualBudget: client.annualBudget || '',
      staffCount: client.staffCount || '',
      status: client.status || 'active',
      avatar: client.avatar || '',

      // Stats with proper defaults
      grantsSubmitted: client.grantsSubmitted || 0,
      grantsAwarded: client.grantsAwarded || 0,
      totalFunding: client.totalFunding || '$0',

      // Timestamps with proper handling
      lastContact: client.lastContact ? new Date(client.lastContact) : null,
      createdAt: client.createdAt ? new Date(client.createdAt) : new Date(),
      updatedAt: client.updatedAt ? new Date(client.updatedAt) : new Date(),

      // Notes
      notes: client.notes || '',
    };
  };

  const extractClientFromResponse = (response) => {
    if (!response) return null;

    console.log('📥 Extracting client from response:', response);

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

  // Enhanced fetch clients with better data handling
  const fetchClients = async (searchTerm = '') => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      console.log('🔄 Fetching clients from context...');
      const response = await apiService.getClients(searchTerm);
      
      let clientsData = [];
      if (response && response.success) {
        clientsData = response.clients || response.data || [];
        console.log(`✅ Context loaded ${clientsData.length} clients`);
      } else if (Array.isArray(response)) {
        clientsData = response;
        console.log(`✅ Context loaded ${clientsData.length} clients (array response)`);
      } else {
        console.warn('⚠️ Unexpected API response format:', response);
        clientsData = [];
      }

      // Log category data for debugging
      if (clientsData.length > 0) {
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
      }
      
      setClients(clientsData);
    } catch (error) {
      console.error('❌ Error fetching clients in context:', error);
      setError(error.message);
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  // Enhanced add client with comprehensive data handling
  const addClient = async (clientData) => {
    try {
      console.log('💾 Adding new client via context...', {
        organizationName: clientData.organizationName,
        category: clientData.category,
        focusAreas: clientData.focusAreas,
        tags: clientData.tags
      });

      // Enhanced data cleaning with all fields from ClientForm
      const cleanedData = {
        // Basic Information
        organizationName: clientData.organizationName.trim(),
        primaryContactName: clientData.primaryContactName.trim(),
        titleRole: clientData.titleRole?.trim() || '',
        emailAddress: clientData.emailAddress.trim(),
        phoneNumbers: clientData.phoneNumbers?.trim() || '',
        
        // Additional Contact
        additionalContactName: clientData.additionalContactName?.trim() || '',
        additionalContactTitle: clientData.additionalContactTitle?.trim() || '',
        additionalContactEmail: clientData.additionalContactEmail?.trim() || '',
        additionalContactPhone: clientData.additionalContactPhone?.trim() || '',
        
        // Organization Details
        mailingAddress: clientData.mailingAddress?.trim() || '',
        website: clientData.website?.trim() || '',
        taxIdEIN: clientData.taxIdEIN?.trim() || '',
        organizationType: clientData.organizationType?.trim() || '',
        missionStatement: clientData.missionStatement?.trim() || '',
        serviceArea: clientData.serviceArea?.trim() || '',
        annualBudget: clientData.annualBudget?.trim() || '',
        staffCount: clientData.staffCount?.trim() || '',
        
        // Status and Metadata
        status: clientData.status || 'active',
        notes: clientData.notes?.trim() || '',
        
        // Category Fields - Ensure these are properly saved
        category: clientData.category || '',
        priority: clientData.priority || 'medium',
        referralSource: clientData.referralSource || '',
        grantPotential: clientData.grantPotential || '',
        nextFollowUp: clientData.nextFollowUp || '',
        
        // Arrays - ensure they're arrays
        focusAreas: Array.isArray(clientData.focusAreas) ? clientData.focusAreas : [],
        tags: Array.isArray(clientData.tags) ? clientData.tags : [],
        fundingAreas: Array.isArray(clientData.fundingAreas) ? clientData.fundingAreas : [],
        grantSources: Array.isArray(clientData.grantSources) ? clientData.grantSources : [],
        socialMediaLinks: Array.isArray(clientData.socialMediaLinks) ? clientData.socialMediaLinks : []
      };

      const response = await apiService.createClient(cleanedData);
      const newClient = extractClientFromResponse(response);
      
      if (!newClient) {
        throw new Error('No client data received from MongoDB');
      }

      console.log('✅ Client added successfully via context:', {
        id: newClient._id,
        organizationName: newClient.organizationName,
        category: newClient.category
      });

      setClients(prev => [newClient, ...prev]);
      return newClient;
    } catch (error) {
      console.error('❌ Error adding client via context:', error);
      setError(error.message);
      throw error;
    }
  };

  // Enhanced update client with comprehensive data handling
  const updateClient = async (clientId, clientData) => {
    try {
      console.log('📝 Updating client via context...', {
        clientId,
        organizationName: clientData.organizationName,
        category: clientData.category,
        focusAreas: clientData.focusAreas,
        tags: clientData.tags
      });

      // Enhanced data cleaning with all fields from ClientForm
      const cleanedData = {
        // Basic Information
        organizationName: clientData.organizationName.trim(),
        primaryContactName: clientData.primaryContactName.trim(),
        titleRole: clientData.titleRole?.trim() || '',
        emailAddress: clientData.emailAddress.trim(),
        phoneNumbers: clientData.phoneNumbers?.trim() || '',
        
        // Additional Contact
        additionalContactName: clientData.additionalContactName?.trim() || '',
        additionalContactTitle: clientData.additionalContactTitle?.trim() || '',
        additionalContactEmail: clientData.additionalContactEmail?.trim() || '',
        additionalContactPhone: clientData.additionalContactPhone?.trim() || '',
        
        // Organization Details
        mailingAddress: clientData.mailingAddress?.trim() || '',
        website: clientData.website?.trim() || '',
        taxIdEIN: clientData.taxIdEIN?.trim() || '',
        organizationType: clientData.organizationType?.trim() || '',
        missionStatement: clientData.missionStatement?.trim() || '',
        serviceArea: clientData.serviceArea?.trim() || '',
        annualBudget: clientData.annualBudget?.trim() || '',
        staffCount: clientData.staffCount?.trim() || '',
        
        // Status and Metadata
        status: clientData.status || 'active',
        notes: clientData.notes?.trim() || '',
        
        // Category Fields - Ensure these are properly saved
        category: clientData.category || '',
        priority: clientData.priority || 'medium',
        referralSource: clientData.referralSource || '',
        grantPotential: clientData.grantPotential || '',
        nextFollowUp: clientData.nextFollowUp || '',
        
        // Arrays - ensure they're arrays
        focusAreas: Array.isArray(clientData.focusAreas) ? clientData.focusAreas : [],
        tags: Array.isArray(clientData.tags) ? clientData.tags : [],
        fundingAreas: Array.isArray(clientData.fundingAreas) ? clientData.fundingAreas : [],
        grantSources: Array.isArray(clientData.grantSources) ? clientData.grantSources : [],
        socialMediaLinks: Array.isArray(clientData.socialMediaLinks) ? clientData.socialMediaLinks : []
      };

      const response = await apiService.updateClient(clientId, cleanedData);
      const updatedClient = extractClientFromResponse(response);
      
      if (!updatedClient) {
        throw new Error('No client data received from MongoDB');
      }

      console.log('✅ Client updated successfully via context:', {
        id: updatedClient._id,
        organizationName: updatedClient.organizationName,
        category: updatedClient.category
      });

      setClients(prev => prev.map(client => 
        client._id === clientId ? updatedClient : client
      ));
      return updatedClient;
    } catch (error) {
      console.error('❌ Error updating client via context:', error);
      setError(error.message);
      throw error;
    }
  };

  // Delete a client
  const deleteClient = async (clientId) => {
    try {
      console.log('🗑️ Deleting client via context...', clientId);
      await apiService.deleteClient(clientId);
      setClients(prev => prev.filter(client => client._id !== clientId));
      console.log('✅ Client deleted successfully via context');
    } catch (error) {
      console.error('❌ Error deleting client via context:', error);
      setError(error.message);
      throw error;
    }
  };

  // Add communication to a client
  const addCommunication = async (clientId, communication) => {
    try {
      console.log('💬 Adding communication via context...', { clientId, communication });
      const response = await apiService.addCommunication(clientId, communication);
      const updatedClient = extractClientFromResponse(response);
      
      if (!updatedClient) {
        throw new Error('No client data received after adding communication');
      }

      setClients(prev => prev.map(client => 
        client._id === clientId ? updatedClient : client
      ));
      console.log('✅ Communication added successfully via context');
      return updatedClient;
    } catch (error) {
      console.error('❌ Error adding communication via context:', error);
      setError(error.message);
      throw error;
    }
  };

  // Get client by ID
  const getClientById = (clientId) => {
    return clients.find(client => client._id === clientId);
  };

  // Get clients by category
  const getClientsByCategory = (category) => {
    if (category === 'all') return clients;
    return clients.filter(client => client.category === category);
  };

  // Get all unique categories
  const getAllCategories = () => {
    const categories = new Set();
    clients.forEach(client => {
      if (client.category && client.category.trim() !== '') {
        categories.add(client.category);
      }
    });
    return ['all', ...Array.from(categories).sort()];
  };

  // Search clients with enhanced search
  const searchClients = (searchTerm) => {
    if (!searchTerm.trim()) return clients;
    
    const searchLower = searchTerm.toLowerCase();
    return clients.filter(client => {
      return (
        (client.organizationName || '').toLowerCase().includes(searchLower) ||
        (client.primaryContactName || '').toLowerCase().includes(searchLower) ||
        (client.emailAddress || '').toLowerCase().includes(searchLower) ||
        (client.category || '').toLowerCase().includes(searchLower) ||
        (client.tags || []).some(tag => tag.toLowerCase().includes(searchLower)) ||
        (client.focusAreas || []).some(area => area.toLowerCase().includes(searchLower)) ||
        (client.organizationType || '').toLowerCase().includes(searchLower) ||
        (client.serviceArea || '').toLowerCase().includes(searchLower) ||
        (client.missionStatement || '').toLowerCase().includes(searchLower)
      );
    });
  };

  // Calculate category statistics
  const getCategoryStats = () => {
    const stats = {};
    
    // Get all unique categories from clients
    const allCategories = new Set();
    clients.forEach(client => {
      const category = client.category || '';
      if (category && category.trim() !== '') {
        allCategories.add(category);
      }
    });
    
    const uniqueCategories = ['all', ...Array.from(allCategories).sort()];
    
    // Calculate stats for each category
    uniqueCategories.forEach(category => {
      if (category === 'all') {
        stats[category] = {
          count: clients.length,
          active: clients.filter(c => c.status === 'active').length,
          funding: clients.reduce((total, client) => {
            const amount = parseFloat(client.totalFunding?.toString().replace(/[$,]/g, '') || '0');
            return total + (isNaN(amount) ? 0 : amount);
          }, 0),
          grants: clients.reduce((total, client) => total + (parseInt(client.grantsSubmitted) || 0), 0)
        };
      } else {
        const categoryClients = clients.filter(client => {
          const clientCategory = client.category || '';
          return clientCategory === category;
        });
        
        stats[category] = {
          count: categoryClients.length,
          active: categoryClients.filter(c => c.status === 'active').length,
          funding: categoryClients.reduce((total, client) => {
            const amount = parseFloat(client.totalFunding?.toString().replace(/[$,]/g, '') || '0');
            return total + (isNaN(amount) ? 0 : amount);
          }, 0),
          grants: categoryClients.reduce((total, client) => total + (parseInt(client.grantsSubmitted) || 0), 0)
        };
      }
    });
    
    return stats;
  };

  // Refresh clients
  const refreshClients = () => {
    console.log('🔄 Manually refreshing clients via context...');
    fetchClients();
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Debug functions
  const debugCategoryData = () => {
    console.log('🔍 DEBUGGING CATEGORY DATA IN CONTEXT:');
    console.log('Total clients:', clients.length);
    
    if (clients.length > 0) {
      clients.slice(0, 3).forEach((client, index) => {
        console.log(`Client ${index + 1}:`, {
          id: client._id,
          organizationName: client.organizationName,
          category: client.category,
          tags: client.tags,
          focusAreas: client.focusAreas
        });
      });
    }
    
    const categoryStats = getCategoryStats();
    console.log('📊 CATEGORY STATISTICS:', categoryStats);
  };

  // Expose debug function globally for testing
  useEffect(() => {
    window.debugClientsContext = debugCategoryData;
  }, [clients]);

  // Automatically fetch clients when user logs in
  useEffect(() => {
    if (currentUser) {
      console.log('👤 User authenticated, fetching clients...');
      fetchClients();
    } else {
      console.log('👤 No user, clearing clients...');
      setClients([]);
      setLoading(false);
    }
  }, [currentUser]);

  const value = {
    // State
    clients,
    loading,
    error,
    
    // Core actions
    fetchClients,
    addClient,
    updateClient,
    deleteClient,
    addCommunication,
    
    // Utility functions
    getClientById,
    getClientsByCategory,
    getAllCategories,
    searchClients,
    getCategoryStats,
    refreshClients,
    clearError,
    
    // Data transformation
    transformClientForComponents,
    
    // Debug functions
    debugCategoryData
  };

  return (
    <ClientsContext.Provider value={value}>
      {children}
    </ClientsContext.Provider>
  );
};