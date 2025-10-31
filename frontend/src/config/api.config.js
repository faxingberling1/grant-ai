// frontend/src/config/api.config.js
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  ENDPOINTS: {
    HEALTH: '/api/health',
    GENERATE: '/api/generate',
    IMPROVE: '/api/improve',
    ANALYZE: '/api/analyze',
    TEMPLATES: '/api/templates'
  },
  TIMEOUT: 30000
};

export const createApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};