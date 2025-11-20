import api from './api';

// Enhanced client service with MongoDB Atlas integration
export const clientService = {
  // Get all clients with optional search
  async getClients(searchTerm = '') {
    try {
      console.log('📡 Fetching clients from MongoDB...', searchTerm ? `search: "${searchTerm}"` : '');
      const query = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : '';
      const response = await api.get(`/api/clients${query}`);
      
      console.log('✅ Clients API response:', response.data);
      
      // Handle different response formats
      if (response.data && response.data.success) {
        return response.data.clients || response.data.data || [];
      } else if (Array.isArray(response.data)) {
        return response.data;
      } else {
        console.warn('⚠️ Unexpected API response format:', response.data);
        return [];
      }
    } catch (error) {
      console.error('❌ Error fetching clients from MongoDB:', error);
      throw this.handleApiError(error);
    }
  },

  // Get client by ID
  async getClientById(clientId) {
    try {
      console.log('📡 Fetching client by ID:', clientId);
      const response = await api.get(`/api/clients/${clientId}`);
      
      if (response.data && response.data.success) {
        return response.data.client || response.data.data;
      }
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching client by ID:', error);
      throw this.handleApiError(error);
    }
  },

  // Create new client with enhanced data handling
  async createClient(clientData) {
    try {
      console.log('📡 Creating new client in MongoDB:', {
        organizationName: clientData.organizationName,
        category: clientData.category,
        focusAreas: clientData.focusAreas,
        tags: clientData.tags
      });

      // Enhanced data validation
      if (!clientData.organizationName?.trim()) {
        throw new Error('Organization name is required');
      }
      if (!clientData.emailAddress?.trim()) {
        throw new Error('Email address is required');
      }

      const response = await api.post('/api/clients', clientData);
      
      console.log('✅ Client creation response:', response.data);
      
      if (response.data && response.data.success) {
        return response.data.client || response.data.data;
      }
      return response.data;
    } catch (error) {
      console.error('❌ Error creating client in MongoDB:', error);
      throw this.handleApiError(error);
    }
  },

  // Update client with comprehensive data handling
  async updateClient(clientId, clientData) {
    try {
      console.log('📡 Updating client in MongoDB:', {
        clientId,
        organizationName: clientData.organizationName,
        category: clientData.category,
        focusAreas: clientData.focusAreas,
        tags: clientData.tags
      });

      const response = await api.put(`/api/clients/${clientId}`, clientData);
      
      console.log('✅ Client update response:', response.data);
      
      if (response.data && response.data.success) {
        return response.data.client || response.data.data;
      }
      return response.data;
    } catch (error) {
      console.error('❌ Error updating client in MongoDB:', error);
      throw this.handleApiError(error);
    }
  },

  // Delete client
  async deleteClient(clientId) {
    try {
      console.log('📡 Deleting client from MongoDB:', clientId);
      const response = await api.delete(`/api/clients/${clientId}`);
      
      console.log('✅ Client deletion response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error deleting client from MongoDB:', error);
      throw this.handleApiError(error);
    }
  },

  // Add communication to client
  async addCommunication(clientId, communicationData) {
    try {
      console.log('📡 Adding communication to client:', { clientId, communicationData });
      const response = await api.post(`/api/clients/${clientId}/communications`, communicationData);
      
      console.log('✅ Communication addition response:', response.data);
      
      if (response.data && response.data.success) {
        return response.data.client || response.data.data;
      }
      return response.data;
    } catch (error) {
      console.error('❌ Error adding communication to client:', error);
      throw this.handleApiError(error);
    }
  },

  // Get communications for a client
  async getCommunications(clientId) {
    try {
      console.log('📡 Fetching communications for client:', clientId);
      const response = await api.get(`/api/clients/${clientId}/communications`);
      
      if (response.data && response.data.success) {
        return response.data.communications || response.data.data || [];
      }
      return response.data || [];
    } catch (error) {
      console.error('❌ Error fetching communications:', error);
      throw this.handleApiError(error);
    }
  },

  // Bulk operations
  async bulkUpdateClients(clientUpdates) {
    try {
      console.log('📡 Performing bulk client updates:', clientUpdates.length);
      const response = await api.put('/api/clients/bulk', { updates: clientUpdates });
      return response.data;
    } catch (error) {
      console.error('❌ Error performing bulk update:', error);
      throw this.handleApiError(error);
    }
  },

  // Category operations
  async getClientsByCategory(category) {
    try {
      console.log('📡 Fetching clients by category:', category);
      const response = await api.get(`/api/clients/category/${encodeURIComponent(category)}`);
      
      if (response.data && response.data.success) {
        return response.data.clients || response.data.data || [];
      }
      return response.data || [];
    } catch (error) {
      console.error('❌ Error fetching clients by category:', error);
      throw this.handleApiError(error);
    }
  },

  // Get category statistics
  async getCategoryStats() {
    try {
      console.log('📡 Fetching category statistics');
      const response = await api.get('/api/clients/stats/categories');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching category stats:', error);
      throw this.handleApiError(error);
    }
  },

  // Search clients with advanced filtering
  async searchClients(filters = {}) {
    try {
      console.log('📡 Searching clients with filters:', filters);
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value);
        }
      });
      
      const queryString = queryParams.toString();
      const url = `/api/clients/search${queryString ? `?${queryString}` : ''}`;
      
      const response = await api.get(url);
      
      if (response.data && response.data.success) {
        return response.data.clients || response.data.data || [];
      }
      return response.data || [];
    } catch (error) {
      console.error('❌ Error searching clients:', error);
      throw this.handleApiError(error);
    }
  },

  // Enhanced error handling
  handleApiError(error) {
    console.error('API Error Details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        data: error.config?.data
      }
    });

    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const message = error.response.data?.message || error.message;

      switch (status) {
        case 400:
          return new Error(`Bad Request: ${message}`);
        case 401:
          return new Error('Authentication required. Please log in again.');
        case 403:
          return new Error('Access forbidden. You do not have permission for this action.');
        case 404:
          return new Error('Client not found. It may have been deleted.');
        case 409:
          return new Error('Conflict: Client already exists.');
        case 422:
          return new Error(`Validation Error: ${message}`);
        case 500:
          return new Error('Server error. Please try again later.');
        default:
          return new Error(`Server error (${status}): ${message}`);
      }
    } else if (error.request) {
      // Request was made but no response received
      return new Error('Network error. Please check your connection and try again.');
    } else {
      // Something else happened
      return new Error(error.message || 'An unexpected error occurred');
    }
  },

  // Data validation helper
  validateClientData(clientData) {
    const errors = [];

    if (!clientData.organizationName?.trim()) {
      errors.push('Organization name is required');
    }

    if (!clientData.primaryContactName?.trim()) {
      errors.push('Primary contact name is required');
    }

    if (!clientData.emailAddress?.trim()) {
      errors.push('Email address is required');
    } else if (!this.isValidEmail(clientData.emailAddress)) {
      errors.push('Valid email address is required');
    }

    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    return true;
  },

  // Email validation helper
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Data transformation for consistent format
  transformClientData(clientData) {
    return {
      // Basic Information
      organizationName: clientData.organizationName?.trim() || '',
      primaryContactName: clientData.primaryContactName?.trim() || '',
      titleRole: clientData.titleRole?.trim() || '',
      emailAddress: clientData.emailAddress?.trim() || '',
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
      
      // Category Fields
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
  }
};

// Legacy export functions for backward compatibility
export const getClients = (searchTerm = '') => clientService.getClients(searchTerm);
export const getClientById = (clientId) => clientService.getClientById(clientId);
export const createClient = (clientData) => clientService.createClient(clientData);
export const updateClient = (clientId, clientData) => clientService.updateClient(clientId, clientData);
export const deleteClient = (clientId) => clientService.deleteClient(clientId);
export const addCommunication = (clientId, communicationData) => clientService.addCommunication(clientId, communicationData);

export default clientService;