// src/services/api.js - COMPLETE VERSION
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://grant-ai.onrender.com';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL.replace(/\/$/, '');
    console.log('🚀 API Service initialized with:', this.baseURL);
  }

  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
          ...options.headers,
        },
        ...options,
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        throw new Error('Authentication failed. Please log in again.');
      }

      if (!response.ok) {
        let errorMessage = `Server error: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Template methods
  async getTemplates(category = '', search = '') {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    
    const queryString = params.toString();
    return this.request(`/api/templates${queryString ? `?${queryString}` : ''}`);
  }

  async getTemplate(id) {
    return this.request(`/api/templates/${id}`);
  }

  async createTemplate(templateData) {
    return this.request('/api/templates', {
      method: 'POST',
      body: JSON.stringify(templateData),
    });
  }

  async updateTemplate(id, templateData) {
    return this.request(`/api/templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(templateData),
    });
  }

  async deleteTemplate(id) {
    return this.request(`/api/templates/${id}`, {
      method: 'DELETE',
    });
  }

  async incrementTemplateUsage(id) {
    return this.request(`/api/templates/${id}/usage`, {
      method: 'PATCH',
    });
  }

  // Client methods
  async getClients(search = '') {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    
    const queryString = params.toString();
    return this.request(`/api/clients${queryString ? `?${queryString}` : ''}`);
  }

  async getClient(id) {
    return this.request(`/api/clients/${id}`);
  }

  async createClient(clientData) {
    return this.request('/api/clients', {
      method: 'POST',
      body: JSON.stringify(clientData),
    });
  }

  async updateClient(id, clientData) {
    return this.request(`/api/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(clientData),
    });
  }

  async deleteClient(id) {
    return this.request(`/api/clients/${id}`, {
      method: 'DELETE',
    });
  }

  async addCommunication(clientId, communicationData) {
    return this.request(`/api/clients/${clientId}/communications`, {
      method: 'POST',
      body: JSON.stringify(communicationData),
    });
  }

  // Auth methods
  async login(credentials) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getCurrentUser() {
    return this.request('/api/auth/me');
  }

  // Health check
  async checkHealth() {
    return this.request('/api/health');
  }

  // Test production connection
  async testProductionConnection() {
    try {
      const health = await this.checkHealth();
      return { 
        success: true, 
        health, 
        environment: 'production',
        message: 'Connected to production server successfully'
      };
    } catch (error) {
      console.error('Production connection test failed:', error);
      return {
        success: false,
        error: error.message,
        environment: 'production',
        message: `Production connection failed: ${error.message}`
      };
    }
  }

  // Test local connection
  async testLocalConnection() {
    try {
      // Temporarily switch to local URL for testing
      const originalBaseURL = this.baseURL;
      this.baseURL = 'http://localhost:5000';
      
      const health = await this.checkHealth();
      
      // Restore original base URL
      this.baseURL = originalBaseURL;
      
      return { 
        success: true, 
        health, 
        environment: 'local',
        message: 'Connected to local server successfully'
      };
    } catch (error) {
      // Restore original base URL even if there's an error
      this.baseURL = 'https://grant-ai.onrender.com';
      
      return {
        success: false,
        error: error.message,
        environment: 'local',
        message: `Local connection failed: ${error.message}`
      };
    }
  }

  // Auto-detect environment
  async detectEnvironment() {
    console.log('🔍 Detecting environment...');
    
    // Test production first
    const productionTest = await this.testProductionConnection();
    if (productionTest.success) {
      console.log('✅ Using production environment');
      return productionTest;
    }
    
    // If production fails, test local
    console.log('🔄 Production failed, testing local environment...');
    const localTest = await this.testLocalConnection();
    if (localTest.success) {
      console.log('✅ Using local environment');
      // Switch to local URL
      this.baseURL = 'http://localhost:5000';
    } else {
      console.log('❌ Both production and local connections failed');
    }
    
    return localTest;
  }
}

export default new ApiService();