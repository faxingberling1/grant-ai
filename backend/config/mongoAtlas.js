// /backend/config/mongoAtlas.js - SIMPLIFIED
const { getEnvConfig } = require('./environment');

const config = getEnvConfig();

module.exports = {
  // VALID MongoDB connection options only
  atlas: {
    maxPoolSize: config.NODE_ENV === 'production' ? 50 : 10,
    minPoolSize: 5,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    serverSelectionTimeoutMS: 30000,
    retryWrites: true,
    retryReads: true,
    ssl: true,
    sslValidate: true,
    readPreference: 'primary',
    w: 'majority',
    journal: true,
  },
  
  // GridFS settings (used by storageService, not mongoose)
  gridfs: {
    bucketName: 'documents',
    chunkSizeBytes: 255 * 1024,
    maxFileSize: 16 * 1024 * 1024,
  }
};