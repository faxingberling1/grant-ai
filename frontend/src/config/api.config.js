export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  ENDPOINTS: {
    // Auth endpoints
    AUTH: {
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register',
      VERIFY_EMAIL: '/api/auth/verify-email',
      FORGOT_PASSWORD: '/api/auth/forgot-password',
      RESET_PASSWORD: '/api/auth/reset-password',
      ME: '/api/auth/me'
    },
    // User management endpoints
    USERS: '/api/users',
    USER_BY_ID: (id) => `/api/users/${id}`,
    
    // Client endpoints
    CLIENTS: '/api/clients',
    CLIENT_BY_ID: (id) => `/api/clients/${id}`,
    
    // Meeting endpoints
    MEETINGS: '/api/meetings',
    MEETING_BY_ID: (id) => `/api/meetings/${id}`,
    
    // Template endpoints
    TEMPLATES: '/api/templates',
    TEMPLATE_BY_ID: (id) => `/api/templates/${id}`,
    
    // Grant sources endpoints
    GRANT_SOURCES: '/api/grant-sources',
    GRANT_SOURCE_BY_ID: (id) => `/api/grant-sources/${id}`,
    
    // AI endpoints
    GENERATE: '/api/generate',
    IMPROVE: '/api/improve',
    ANALYZE: '/api/analyze',
    
    // Health check
    HEALTH: '/api/health'
  },
  TIMEOUT: 30000
};

export const createApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};