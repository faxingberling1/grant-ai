// config/mongoAtlas.js
const { getEnvConfig } = require('./environment');

const config = getEnvConfig();

module.exports = {
  // Atlas-specific settings
  atlas: {
    // Connection settings
    maxPoolSize: config.NODE_ENV === 'production' ? 50 : 10,
    minPoolSize: 5,
    
    // Timeout settings
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    
    // Retry settings
    retryWrites: true,
    retryReads: true,
    maxRetryAttempts: 3,
    
    // SSL settings (required for Atlas)
    ssl: true,
    sslValidate: true,
    
    // Read preference for replica sets
    readPreference: 'primary',
    
    // Write concern
    w: 'majority',
    journal: true
  },
  
  // Performance optimizations
  performance: {
    // Auto index building (disable in production)
    autoIndex: config.NODE_ENV !== 'production',
    
    // Buffer settings
    bufferCommands: true,
    bufferMaxEntries: -1,
    
    // Query optimizations
    maxTimeMS: 30000, // 30 second timeout for queries
  },
  
  // Monitoring and logging
  monitoring: {
    logQueries: config.NODE_ENV === 'development',
    slowQueryThreshold: 100, // ms
    logConnectionEvents: true
  }
};