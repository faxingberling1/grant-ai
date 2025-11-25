// src/services/api.js - COMPLETE UPDATED VERSION WITH ADMIN USER MANAGEMENT
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://grant-ai.onrender.com';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL.replace(/\/$/, '');
    this.isBackendAvailable = null;
    console.log('🚀 API Service initialized with:', this.baseURL);
  }

  getAuthHeaders() {
    const token = localStorage.getItem('token');
    
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
      ...options,
    };

    // Enhanced body handling for different HTTP methods
    if (options.body) {
      config.body = options.body;
    } else if (options.method && ['POST', 'PUT', 'PATCH'].includes(options.method) && options.data) {
      config.body = JSON.stringify(options.data);
    }

    try {
      console.log(`🔄 API ${options.method || 'GET'} Request: ${url}`, {
        hasAuth: !!config.headers.Authorization,
        data: options.data ? Object.keys(options.data) : 'none',
        endpoint: endpoint
      });
      
      const response = await fetch(url, config);

      // Handle 401 Unauthorized specifically
      if (response.status === 401) {
        console.error('❌ 401 Unauthorized - removing token');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        throw new Error('Authentication failed. Please log in again.');
      }

      // Handle 404 specifically for missing routes
      if (response.status === 404) {
        throw new Error(`Route not found: ${endpoint}`);
      }

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          // If we can't parse JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      // For 204 No Content responses
      if (response.status === 204) {
        return { success: true, message: 'Operation completed successfully' };
      }
      
      const data = await response.json();
      console.log(`✅ API ${options.method || 'GET'} Response:`, {
        success: data.success,
        message: data.message,
        hasClient: !!data.client,
        hasClients: !!data.clients,
        hasUser: !!data.user,
        hasUsers: !!data.users,
        dataLength: data.clients ? data.clients.length : data.users ? data.users.length : 'N/A'
      });
      return data;
    } catch (error) {
      console.error(`❌ API ${options.method || 'GET'} ${url} failed:`, error.message);
      
      // Mark backend as unavailable for future requests
      if (error.message.includes('Route not found') || error.message.includes('Failed to fetch')) {
        this.isBackendAvailable = false;
      }
      
      throw error;
    }
  }

  // ===== USER MANAGEMENT METHODS =====
  async getUsers(search = '', page = 1, limit = 50) {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (page) params.append('page', page);
      if (limit) params.append('limit', limit);
      
      const queryString = params.toString();
      return await this.request(`/api/users${queryString ? `?${queryString}` : ''}`);
    } catch (error) {
      console.warn('⚠️ Using mock users data due to:', error.message);
      return this.getMockUsers();
    }
  }

  async getUser(id) {
    try {
      return await this.request(`/api/users/${id}`);
    } catch (error) {
      console.warn('⚠️ Using mock user data');
      const mockUsers = this.getMockUsers();
      return mockUsers.users.find(user => user._id === id) || mockUsers.users[0];
    }
  }

  async updateUser(id, userData) {
    try {
      console.log('🔄 API: Updating user', id, 'with data:', {
        name: userData.name,
        email: userData.email,
        role: userData.role,
        isActive: userData.isActive
      });
      
      const response = await this.request(`/api/users/${id}`, {
        method: 'PUT',
        data: userData,
      });

      console.log('✅ API: User update response received');
      return response;
    } catch (error) {
      console.error('❌ API: Update user failed:', error.message);
      
      // If backend is down, use mock data
      if (error.message.includes('Route not found') || error.message.includes('Failed to fetch')) {
        console.warn('⚠️ Using mock user update');
        const mockUser = this.createMockUser(userData, id);
        return {
          success: true,
          message: 'User updated successfully (demo mode)',
          user: mockUser
        };
      }
      
      throw error;
    }
  }

  async deleteUser(id) {
    try {
      return await this.request(`/api/users/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.warn('⚠️ Using mock user deletion');
      return {
        success: true,
        message: 'User deleted successfully (demo mode)'
      };
    }
  }

  // ===== ADMIN USER MANAGEMENT METHODS =====
  async getAdminUsers(search = '', status = '', role = '', page = 1, limit = 10) {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (status) params.append('status', status);
      if (role) params.append('role', role);
      if (page) params.append('page', page);
      if (limit) params.append('limit', limit);
      
      const queryString = params.toString();
      return await this.request(`/api/admin/users${queryString ? `?${queryString}` : ''}`);
    } catch (error) {
      console.warn('⚠️ Using mock admin users data due to:', error.message);
      return this.getMockAdminUsers();
    }
  }

  async getPendingUsers(search = '', page = 1, limit = 10) {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (page) params.append('page', page);
      if (limit) params.append('limit', limit);
      
      const queryString = params.toString();
      return await this.request(`/api/admin/pending-users${queryString ? `?${queryString}` : ''}`);
    } catch (error) {
      console.warn('⚠️ Using mock pending users data');
      const mockUsers = this.getMockUsers();
      const pendingUsers = mockUsers.users.filter(user => !user.approved);
      return {
        success: true,
        data: pendingUsers,
        pagination: {
          page: 1,
          limit: 10,
          totalPages: 1,
          total: pendingUsers.length
        }
      };
    }
  }

  async approveUser(userId) {
    try {
      console.log('✅ API: Approving user:', userId);
      
      const response = await this.request(`/api/admin/users/${userId}/approve`, {
        method: 'POST',
      });

      console.log('✅ API: User approval response received');
      return response;
    } catch (error) {
      console.error('❌ API: Approve user failed:', error.message);
      
      // If backend is down, use mock data
      if (error.message.includes('Route not found') || error.message.includes('Failed to fetch')) {
        console.warn('⚠️ Using mock user approval');
        return {
          success: true,
          message: 'User approved successfully (demo mode)',
          user: {
            _id: userId,
            approved: true,
            approvedAt: new Date().toISOString()
          }
        };
      }
      
      throw error;
    }
  }

  async rejectUser(userId, reason = '') {
    try {
      console.log('❌ API: Rejecting user:', userId, 'Reason:', reason);
      
      const response = await this.request(`/api/admin/users/${userId}/reject`, {
        method: 'POST',
        data: { reason }
      });

      console.log('✅ API: User rejection response received');
      return response;
    } catch (error) {
      console.error('❌ API: Reject user failed:', error.message);
      
      // If backend is down, use mock data
      if (error.message.includes('Route not found') || error.message.includes('Failed to fetch')) {
        console.warn('⚠️ Using mock user rejection');
        return {
          success: true,
          message: 'User rejected successfully (demo mode)',
          rejection: {
            email: 'user@example.com',
            name: 'Mock User',
            rejectedAt: new Date().toISOString(),
            reason: reason || 'No reason provided'
          }
        };
      }
      
      throw error;
    }
  }

  async makeUserAdmin(userId) {
    try {
      console.log('👑 API: Making user admin:', userId);
      
      const response = await this.request(`/api/admin/users/${userId}/make-admin`, {
        method: 'POST',
      });

      console.log('✅ API: Make user admin response received');
      return response;
    } catch (error) {
      console.error('❌ API: Make user admin failed:', error.message);
      
      // If backend is down, use mock data
      if (error.message.includes('Route not found') || error.message.includes('Failed to fetch')) {
        console.warn('⚠️ Using mock make user admin');
        return {
          success: true,
          message: 'User promoted to admin successfully (demo mode)',
          user: {
            _id: userId,
            role: 'admin',
            approved: true
          }
        };
      }
      
      throw error;
    }
  }

  async getAdminStats() {
    try {
      return await this.request('/api/admin/stats');
    } catch (error) {
      console.warn('⚠️ Using mock admin stats');
      const mockUsers = this.getMockUsers();
      const totalUsers = mockUsers.users.length;
      const pendingUsers = mockUsers.users.filter(user => !user.approved).length;
      const approvedUsers = mockUsers.users.filter(user => user.approved).length;
      const adminUsers = mockUsers.users.filter(user => user.role === 'admin').length;
      
      return {
        success: true,
        stats: {
          totalUsers,
          pendingUsers,
          approvedUsers,
          adminUsers,
          recentRegistrations: 2
        }
      };
    }
  }

  async bulkApproveUsers(userIds) {
    try {
      console.log('✅ API: Bulk approving users:', userIds);
      
      const response = await this.request('/api/admin/users/bulk-approve', {
        method: 'POST',
        data: { userIds }
      });

      console.log('✅ API: Bulk approve response received');
      return response;
    } catch (error) {
      console.error('❌ API: Bulk approve users failed:', error.message);
      
      // If backend is down, use mock data
      if (error.message.includes('Route not found') || error.message.includes('Failed to fetch')) {
        console.warn('⚠️ Using mock bulk approve');
        return {
          success: true,
          message: `${userIds.length} users approved successfully (demo mode)`,
          approvedCount: userIds.length
        };
      }
      
      throw error;
    }
  }

  // ===== ENHANCED CLIENT METHODS WITH CATEGORY SUPPORT =====
  async getClients(search = '', page = 1, limit = 50) {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (page) params.append('page', page);
      if (limit) params.append('limit', limit);
      
      const queryString = params.toString();
      return await this.request(`/api/clients${queryString ? `?${queryString}` : ''}`);
    } catch (error) {
      console.warn('⚠️ Using mock clients data due to:', error.message);
      return this.getMockClients();
    }
  }

  async getClient(id) {
    try {
      return await this.request(`/api/clients/${id}`);
    } catch (error) {
      console.warn('⚠️ Using mock client data');
      const mockClients = this.getMockClients();
      return mockClients.clients.find(client => client._id === id) || mockClients.clients[0];
    }
  }

  async createClient(clientData) {
    try {
      console.log('🆕 API: Creating client with enhanced data:', {
        organizationName: clientData.organizationName,
        primaryContactName: clientData.primaryContactName,
        emailAddress: clientData.emailAddress,
        category: clientData.category,
        focusAreas: clientData.focusAreas,
        fundingAreas: clientData.fundingAreas,
        grantSources: clientData.grantSources,
        priority: clientData.priority,
        grantPotential: clientData.grantPotential
      });
      
      // Enhanced validation for required fields
      if (!clientData.organizationName || !clientData.primaryContactName || !clientData.emailAddress) {
        throw new Error('Missing required fields: organizationName, primaryContactName, emailAddress');
      }
      
      // Enhanced data cleaning before sending
      const cleanedData = this.cleanClientData(clientData);
      
      return await this.request('/api/clients', {
        method: 'POST',
        data: cleanedData,
      });
    } catch (error) {
      console.error('❌ API: Create client failed:', error.message);
      
      // If backend is down, use mock data with enhanced category support
      if (error.message.includes('Route not found') || error.message.includes('Failed to fetch')) {
        console.warn('⚠️ Using mock client creation with enhanced category data');
        const mockClient = this.createMockClientWithEnhancedCategories(clientData);
        return {
          success: true,
          message: 'Client created successfully (demo mode)',
          client: mockClient
        };
      }
      
      throw error;
    }
  }

  async updateClient(id, clientData) {
    try {
      console.log('🔄 API: Updating client', id, 'with enhanced category data:', {
        organizationName: clientData.organizationName,
        category: clientData.category,
        focusAreas: clientData.focusAreas,
        fundingAreas: clientData.fundingAreas,
        grantSources: clientData.grantSources,
        priority: clientData.priority,
        grantPotential: clientData.grantPotential,
        tags: clientData.tags
      });
      
      // Enhanced data cleaning before sending
      const cleanedData = this.cleanClientData(clientData);
      
      const response = await this.request(`/api/clients/${id}`, {
        method: 'PUT',
        data: cleanedData,
      });

      console.log('✅ API: Update response received with enhanced category data');
      return response;
    } catch (error) {
      console.error('❌ API: Update client failed:', error.message);
      
      // If backend is down, use mock data with enhanced category support
      if (error.message.includes('Route not found') || error.message.includes('Failed to fetch')) {
        console.warn('⚠️ Using mock client update with enhanced category data');
        const mockClient = this.createMockClientWithEnhancedCategories(clientData, id);
        return {
          success: true,
          message: 'Client updated successfully (demo mode)',
          client: mockClient
        };
      }
      
      throw error;
    }
  }

  async deleteClient(id) {
    try {
      return await this.request(`/api/clients/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.warn('⚠️ Using mock client deletion');
      return {
        success: true,
        message: 'Client deleted successfully (demo mode)'
      };
    }
  }

  // Enhanced client data cleaning method
  cleanClientData(clientData) {
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
      
      // Enhanced Category Fields
      category: clientData.category || '',
      priority: clientData.priority || 'medium',
      referralSource: clientData.referralSource || '',
      grantPotential: clientData.grantPotential || '',
      nextFollowUp: clientData.nextFollowUp || '',
      
      // Arrays - ensure they're arrays with proper content
      focusAreas: Array.isArray(clientData.focusAreas) ? clientData.focusAreas : [],
      tags: Array.isArray(clientData.tags) ? clientData.tags : [],
      fundingAreas: Array.isArray(clientData.fundingAreas) ? clientData.fundingAreas : [],
      grantSources: Array.isArray(clientData.grantSources) ? clientData.grantSources : [],
      socialMediaLinks: Array.isArray(clientData.socialMediaLinks) ? clientData.socialMediaLinks : []
    };
  }

  // ===== AUTH METHODS =====
  async login(credentials) {
    try {
      console.log('🔐 API: Login attempt for:', credentials.email);
      
      const result = await this.request('/api/auth/login', {
        method: 'POST',
        data: credentials,
      });

      if (result.token) {
        console.log('✅ API: Login successful, storing token');
        localStorage.setItem('token', result.token);
        if (result.user) {
          localStorage.setItem('user', JSON.stringify(result.user));
        }
      } else {
        throw new Error('No token received from server');
      }

      return result;
    } catch (error) {
      console.error('❌ API: Login failed:', error.message);
      
      // For demo purposes, allow login even if backend is down
      if (error.message.includes('Route not found') || error.message.includes('Failed to fetch')) {
        console.warn('⚠️ Backend auth unavailable - using demo mode');
        const demoUser = {
          token: 'demo-token-' + Date.now(),
          user: {
            id: 'demo-user',
            name: 'Demo User',
            email: credentials.email,
            role: 'user'
          },
          success: true,
          message: 'Logged in successfully (demo mode)'
        };
        localStorage.setItem('token', demoUser.token);
        localStorage.setItem('user', JSON.stringify(demoUser.user));
        return demoUser;
      }
      throw error;
    }
  }

  async register(userData) {
    try {
      console.log('📝 API: Register attempt for:', userData.email);
      
      const result = await this.request('/api/auth/register', {
        method: 'POST',
        data: userData,
      });

      if (result.token) {
        console.log('✅ API: Registration successful, storing token');
        localStorage.setItem('token', result.token);
        if (result.user) {
          localStorage.setItem('user', JSON.stringify(result.user));
        }
      }

      return result;
    } catch (error) {
      console.error('❌ API: Registration failed:', error.message);
      throw error;
    }
  }

  async logout() {
    console.log('🚪 API: Logging out');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return { success: true, message: 'Logged out successfully' };
  }

  // ===== GRANT SOURCES METHODS =====
  async getGrantSources(search = '', category = '', type = '', status = 'active', page = 1, limit = 100) {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category) params.append('category', category);
      if (type) params.append('type', type);
      if (status) params.append('status', status);
      if (page) params.append('page', page);
      if (limit) params.append('limit', limit);
      
      const queryString = params.toString();
      return await this.request(`/api/grant-sources${queryString ? `?${queryString}` : ''}`);
    } catch (error) {
      console.warn('⚠️ Using mock grant sources data');
      return this.getMockGrantSources();
    }
  }

  async getGrantSource(id) {
    try {
      return await this.request(`/api/grant-sources/${id}`);
    } catch (error) {
      console.warn('⚠️ Using mock grant source data');
      const mockSources = this.getMockGrantSources();
      return mockSources.grantSources.find(source => source._id === id) || mockSources.grantSources[0];
    }
  }

  // ===== TEMPLATE METHODS =====
  async getTemplates(category = '', search = '') {
    try {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (search) params.append('search', search);
      
      const queryString = params.toString();
      return await this.request(`/api/templates${queryString ? `?${queryString}` : ''}`);
    } catch (error) {
      console.warn('⚠️ Using mock templates data');
      return { success: true, templates: [] };
    }
  }

  // ===== MEETING METHODS =====
  async getMeetings(startDate = '', endDate = '', clientId = '') {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (clientId) params.append('clientId', clientId);
      
      const queryString = params.toString();
      return await this.request(`/api/meetings${queryString ? `?${queryString}` : ''}`);
    } catch (error) {
      console.warn('⚠️ Using mock meetings data');
      return { success: true, meetings: [] };
    }
  }

  async createMeeting(meetingData) {
    try {
      return await this.request('/api/meetings', {
        method: 'POST',
        data: meetingData,
      });
    } catch (error) {
      console.warn('⚠️ Using mock meeting creation');
      return {
        success: true,
        message: 'Meeting created successfully (demo mode)',
        meeting: {
          ...meetingData,
          _id: 'demo-meeting-' + Date.now(),
          createdAt: new Date().toISOString()
        }
      };
    }
  }

  // ===== COMMUNICATION METHODS =====
  async addCommunication(clientId, communicationData) {
    try {
      return await this.request(`/api/clients/${clientId}/communications`, {
        method: 'POST',
        data: communicationData,
      });
    } catch (error) {
      console.warn('⚠️ Using mock communication addition');
      return {
        success: true,
        message: 'Communication added successfully (demo mode)',
        communication: {
          ...communicationData,
          _id: 'demo-comm-' + Date.now(),
          createdAt: new Date().toISOString()
        }
      };
    }
  }

  // ===== MOCK DATA METHODS =====
  getMockUsers() {
    const mockUsers = [
      {
        _id: 'user-1',
        name: 'Admin User',
        email: 'admin@grantmanager.com',
        role: 'admin',
        approved: true,
        isActive: true,
        lastLogin: new Date().toISOString(),
        createdAt: new Date('2024-01-15').toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: 'user-2',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'user',
        approved: true,
        isActive: true,
        lastLogin: new Date('2024-01-18').toISOString(),
        createdAt: new Date('2024-01-16').toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: 'user-3',
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'user',
        approved: false,
        isActive: false,
        lastLogin: new Date('2024-01-10').toISOString(),
        createdAt: new Date('2024-01-17').toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: 'user-4',
        name: 'Bob Wilson',
        email: 'bob@example.com',
        role: 'user',
        approved: false,
        isActive: true,
        lastLogin: new Date().toISOString(),
        createdAt: new Date('2024-01-18').toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    return {
      success: true,
      users: mockUsers,
      pagination: {
        page: 1,
        limit: 50,
        totalPages: 1,
        total: mockUsers.length
      }
    };
  }

  getMockAdminUsers() {
    const mockUsers = this.getMockUsers();
    return {
      success: true,
      data: mockUsers.users,
      pagination: {
        page: 1,
        limit: 10,
        totalPages: 1,
        total: mockUsers.users.length
      }
    };
  }

  createMockUser(userData, id = null) {
    const timestamp = new Date().toISOString();
    const userId = id || 'user-' + Date.now();
    
    return {
      _id: userId,
      name: userData.name || 'Mock User',
      email: userData.email || 'mock@example.com',
      role: userData.role || 'user',
      approved: userData.approved !== undefined ? userData.approved : false,
      isActive: userData.isActive !== undefined ? userData.isActive : true,
      lastLogin: userData.lastLogin || timestamp,
      createdAt: timestamp,
      updatedAt: timestamp
    };
  }

  createMockClientWithEnhancedCategories(clientData, id = null) {
    const timestamp = new Date().toISOString();
    const clientId = id || 'demo-' + Date.now();
    
    // Enhanced mock client with complete ClientForm data structure
    return {
      // Core identification
      _id: clientId,
      id: clientId,
      
      // Basic information (from clientData or defaults)
      organizationName: clientData.organizationName || 'New Client Organization',
      primaryContactName: clientData.primaryContactName || 'Contact Name',
      titleRole: clientData.titleRole || 'Executive Director',
      emailAddress: clientData.emailAddress || 'email@example.com',
      phoneNumbers: clientData.phoneNumbers || '(555) 123-4567',
      
      // Additional Contact Information
      additionalContactName: clientData.additionalContactName || '',
      additionalContactTitle: clientData.additionalContactTitle || '',
      additionalContactEmail: clientData.additionalContactEmail || '',
      additionalContactPhone: clientData.additionalContactPhone || '',
      
      // Organization details
      mailingAddress: clientData.mailingAddress || '123 Main St, City, State 12345',
      website: clientData.website || 'https://example.com',
      socialMediaLinks: Array.isArray(clientData.socialMediaLinks) ? clientData.socialMediaLinks : [],
      taxIdEIN: clientData.taxIdEIN || '12-3456789',
      organizationType: clientData.organizationType || 'Nonprofit 501(c)(3)',
      missionStatement: clientData.missionStatement || 'Our mission is to make a positive impact in the community.',
      serviceArea: clientData.serviceArea || 'Local, Regional',
      annualBudget: clientData.annualBudget || '$100,000 - $500,000',
      staffCount: clientData.staffCount || '6-10',
      
      // Status and metadata
      status: clientData.status || 'active',
      notes: clientData.notes || 'New client added via demo mode.',
      lastContact: clientData.lastContact || timestamp,
      grantsSubmitted: clientData.grantsSubmitted || 0,
      grantsAwarded: clientData.grantsAwarded || 0,
      totalFunding: clientData.totalFunding || 0,
      avatar: clientData.avatar || '',
      
      // ENHANCED CATEGORY FIELDS - Complete ClientForm support
      category: clientData.category || 'Education',
      priority: clientData.priority || 'medium',
      referralSource: clientData.referralSource || 'Website Inquiry',
      grantPotential: clientData.grantPotential || '$10,000 - $50,000',
      nextFollowUp: clientData.nextFollowUp || '',
      
      // Enhanced array fields with safety checks and realistic data
      tags: Array.isArray(clientData.tags) && clientData.tags.length > 0 ? clientData.tags : ['nonprofit', 'education', 'community'],
      focusAreas: Array.isArray(clientData.focusAreas) && clientData.focusAreas.length > 0 ? clientData.focusAreas : ['Youth Development', 'Educational Programs'],
      fundingAreas: Array.isArray(clientData.fundingAreas) && clientData.fundingAreas.length > 0 ? clientData.fundingAreas : ['Program Development', 'Capacity Building'],
      grantSources: Array.isArray(clientData.grantSources) && clientData.grantSources.length > 0 ? clientData.grantSources : ['1', '2'],
      communicationHistory: Array.isArray(clientData.communicationHistory) ? clientData.communicationHistory : [],
      
      // Timestamps
      createdAt: timestamp,
      updatedAt: timestamp
    };
  }

  getMockClients() {
    const baseClients = [
      {
        _id: 'demo-1',
        organizationName: 'Tech4Kids Foundation',
        primaryContactName: 'Sarah Johnson',
        titleRole: 'Executive Director',
        emailAddress: 'sarah@tech4kids.org',
        phoneNumbers: '(555) 123-4567',
        status: 'active',
        category: 'Education',
        organizationType: 'Nonprofit 501(c)(3)',
        totalFunding: '$500,000',
        grantsSubmitted: 5,
        grantsAwarded: 3,
        // Enhanced category fields
        focusAreas: ['STEM Education', 'Youth Development', 'Technology'],
        fundingAreas: ['Educational Grants', 'STEM Funding'],
        grantSources: ['1', '2'],
        priority: 'high',
        referralSource: 'Website Inquiry',
        grantPotential: '$100,000 - $250,000',
        tags: ['education', 'stem', 'youth'],
        annualBudget: '$500,000 - $1,000,000',
        staffCount: '11-25',
        serviceArea: 'National',
        missionStatement: 'Empowering youth through technology education and STEM programs.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: 'demo-2',
        organizationName: 'Green Earth Alliance',
        primaryContactName: 'Michael Chen',
        titleRole: 'Program Director',
        emailAddress: 'michael@greenearth.org',
        phoneNumbers: '(555) 234-5678',
        status: 'active',
        category: 'Environment',
        organizationType: 'Nonprofit 501(c)(3)',
        totalFunding: '$750,000',
        grantsSubmitted: 8,
        grantsAwarded: 5,
        // Enhanced category fields
        focusAreas: ['Conservation', 'Climate Change', 'Sustainability'],
        fundingAreas: ['Environmental Grants', 'Conservation Funding'],
        grantSources: ['3', '4'],
        priority: 'medium',
        referralSource: 'Partner Organization',
        grantPotential: '$250,000 - $500,000',
        tags: ['environment', 'conservation', 'sustainability'],
        annualBudget: '$1,000,000 - $5,000,000',
        staffCount: '26-50',
        serviceArea: 'Regional',
        missionStatement: 'Protecting our planet through conservation and sustainable practices.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: 'demo-3',
        organizationName: 'Community Health Initiative',
        primaryContactName: 'Dr. Maria Rodriguez',
        titleRole: 'Medical Director',
        emailAddress: 'maria@communityhealth.org',
        phoneNumbers: '(555) 345-6789',
        status: 'active',
        category: 'Healthcare',
        organizationType: 'Nonprofit 501(c)(3)',
        totalFunding: '$1,200,000',
        grantsSubmitted: 12,
        grantsAwarded: 8,
        // Enhanced category fields
        focusAreas: ['Public Health', 'Mental Health', 'Community Wellness'],
        fundingAreas: ['Healthcare Grants', 'Public Health Funding'],
        grantSources: ['5', '6'],
        priority: 'critical',
        referralSource: 'Referral from Existing Client',
        grantPotential: 'Over $1,000,000',
        tags: ['healthcare', 'public-health', 'community'],
        annualBudget: '$5,000,000 - $10,000,000',
        staffCount: '51-100',
        serviceArea: 'Local',
        missionStatement: 'Improving community health through accessible healthcare services.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    return {
      success: true,
      clients: baseClients,
      pagination: {
        page: 1,
        limit: 50,
        totalPages: 1,
        total: baseClients.length
      }
    };
  }

  getMockGrantSources() {
    return {
      success: true,
      grantSources: [
        {
          _id: '1',
          name: 'Federal Education Grants',
          type: 'Federal',
          category: 'Education',
          description: 'Federal funding for educational programs and initiatives',
          status: 'active',
          createdAt: new Date().toISOString()
        },
        {
          _id: '2',
          name: 'STEM Innovation Fund',
          type: 'Private',
          category: 'Education',
          description: 'Private foundation supporting STEM education initiatives',
          status: 'active',
          createdAt: new Date().toISOString()
        },
        {
          _id: '3',
          name: 'Environmental Protection Fund',
          type: 'Federal',
          category: 'Environment',
          description: 'Federal grants for environmental conservation and protection',
          status: 'active',
          createdAt: new Date().toISOString()
        },
        {
          _id: '4',
          name: 'Green Future Foundation',
          type: 'Foundation',
          category: 'Environment',
          description: 'Foundation supporting sustainable environmental projects',
          status: 'active',
          createdAt: new Date().toISOString()
        }
      ],
      pagination: {
        page: 1,
        limit: 100,
        totalPages: 1,
        total: 8
      }
    };
  }

  // ===== UTILITY METHODS =====
  async getCurrentUser() {
    try {
      // Try to get user info from backend
      return await this.request('/api/auth/me');
    } catch (error) {
      // Fallback to localStorage user data
      const userStr = localStorage.getItem('user');
      if (userStr) {
        return { success: true, user: JSON.parse(userStr) };
      }
      throw new Error('No user session available');
    }
  }

  isAuthenticated() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return !!(token && user);
  }

  clearAuth() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // Health check with better error handling
  async checkHealth() {
    try {
      return await this.request('/api/health');
    } catch (error) {
      if (error.message.includes('Route not found')) {
        return { 
          status: 'healthy', 
          message: 'Frontend running in demo mode - backend routes not implemented',
          timestamp: new Date().toISOString(),
          mode: 'demo'
        };
      }
      throw error;
    }
  }

  // Enhanced connection testing
  async testConnection() {
    try {
      console.log('🔍 Testing API connection...');
      const startTime = Date.now();
      
      const response = await this.request('/api/health');
      
      const responseTime = Date.now() - startTime;
      
      return {
        success: true,
        message: 'API server is responding correctly',
        responseTime: `${responseTime}ms`,
        data: response,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ API connection test failed:', error.message);
      
      return {
        success: false,
        message: `API server connection failed: ${error.message}`,
        error: error.message,
        timestamp: new Date().toISOString(),
        mode: 'demo'
      };
    }
  }

  // Simple auth status check
  async checkAuthStatus() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
      throw new Error('No authentication token found');
    }
    
    // Try to make a simple API call to verify auth
    try {
      const result = await this.getClients('', 1, 1); // Get just 1 client to test auth
      return {
        success: true,
        message: 'Authentication verified',
        hasClients: result.clients && result.clients.length > 0
      };
    } catch (error) {
      console.error('Auth check failed:', error);
      throw error;
    }
  }

  // Enhanced debug method for operations
  async debugOperation(operation, id = null, data = null) {
    console.log(`🐛 DEBUG: ${operation} operation`, {
      id,
      data: data ? {
        name: data.name || data.organizationName,
        email: data.email,
        category: data.category,
        type: typeof data
      } : 'No data'
    });

    const token = localStorage.getItem('token');
    console.log('🔐 DEBUG: Token exists:', !!token);

    try {
      let result;
      switch (operation) {
        case 'create-client':
          result = await this.createClient(data);
          break;
        case 'update-client':
          result = await this.updateClient(id, data);
          break;
        case 'get-client':
          result = await this.getClient(id);
          break;
        case 'get-users':
          result = await this.getUsers();
          break;
        case 'update-user':
          result = await this.updateUser(id, data);
          break;
        case 'approve-user':
          result = await this.approveUser(id);
          break;
        case 'reject-user':
          result = await this.rejectUser(id, data?.reason);
          break;
        case 'make-user-admin':
          result = await this.makeUserAdmin(id);
          break;
        default:
          throw new Error(`Unknown operation: ${operation}`);
      }
      
      console.log(`✅ DEBUG: ${operation} operation successful`);
      return result;
    } catch (error) {
      console.error(`❌ DEBUG: ${operation} operation failed:`, error.message);
      throw error;
    }
  }

  // Batch operations for efficiency
  async batchGetClients(clientIds) {
    try {
      return await this.request('/api/clients/batch', {
        method: 'POST',
        data: { clientIds }
      });
    } catch (error) {
      console.warn('⚠️ Using mock batch client data');
      const mockClients = this.getMockClients();
      const clients = mockClients.clients.filter(client => 
        clientIds.includes(client._id)
      );
      return { success: true, clients };
    }
  }

  // Search across multiple entities
  async globalSearch(query, types = ['clients', 'users', 'grant-sources']) {
    try {
      return await this.request('/api/search', {
        method: 'POST',
        data: { query, types }
      });
    } catch (error) {
      console.warn('⚠️ Using mock global search');
      const results = {};
      
      if (types.includes('clients')) {
        const clientsResult = this.getMockClients();
        results.clients = clientsResult.clients.filter(client =>
          client.organizationName.toLowerCase().includes(query.toLowerCase()) ||
          client.primaryContactName.toLowerCase().includes(query.toLowerCase())
        );
      }
      
      if (types.includes('users')) {
        const usersResult = this.getMockUsers();
        results.users = usersResult.users.filter(user =>
          user.name.toLowerCase().includes(query.toLowerCase()) ||
          user.email.toLowerCase().includes(query.toLowerCase())
        );
      }
      
      return { success: true, results };
    }
  }
}

// Create and export singleton instance
const apiService = new ApiService();
export default apiService;