// /backend/config/database.js
const mongoose = require('mongoose');
const { getEnvConfig } = require('./environment');

// MongoDB connection state tracking
let isConnected = false;
let connectionRetries = 0;
const MAX_RETRIES = 3;

// Connection events for better monitoring
mongoose.connection.on('connecting', () => {
  console.log('🔌 Connecting to MongoDB...');
});

mongoose.connection.on('connected', () => {
  isConnected = true;
  connectionRetries = 0;
  console.log('✅ MongoDB connected successfully');
});

mongoose.connection.on('open', () => {
  console.log('🚪 MongoDB connection is open and ready');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err.message);
  isConnected = false;
  connectionRetries++;
  
  if (connectionRetries >= MAX_RETRIES) {
    console.error(`🚨 Max connection retries (${MAX_RETRIES}) reached`);
  }
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected');
  isConnected = false;
});

mongoose.connection.on('reconnected', () => {
  console.log('🔄 MongoDB reconnected');
  isConnected = true;
  connectionRetries = 0;
});

// Platform detection
const getPlatformInfo = () => {
  const isVercel = process.env.VERCEL === '1';
  const isRender = process.env.RENDER === 'true';
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isVercel) return { platform: 'vercel', type: 'serverless' };
  if (isRender) return { platform: 'render', type: 'traditional' };
  if (isProduction) return { platform: 'production', type: 'traditional' };
  return { platform: 'development', type: 'local' };
};

// Get optimized connection options based on platform
const getConnectionOptions = (config) => {
  const { platform, type } = getPlatformInfo();
  const isAtlas = config.MONGO_URI.includes('mongodb+srv://');
  
  // Base options common to all platforms
  const baseOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    retryWrites: true,
    retryReads: true,
  };
  
  // Platform-specific optimizations
  if (platform === 'vercel') {
    // Vercel (Serverless) - Optimized for cold starts and stateless
    return {
      ...baseOptions,
      maxPoolSize: 1,                     // Minimal pool for serverless
      minPoolSize: 0,                     // No minimum for serverless
      serverSelectionTimeoutMS: 5000,     // Fast timeout for serverless
      socketTimeoutMS: 10000,             // Socket timeout for serverless
      connectTimeoutMS: 10000,            // Connection timeout
      bufferCommands: false,              // Disable buffering for serverless
      autoIndex: false,                   // Disable auto-index in serverless
      ssl: true,                          // Always use SSL for Atlas
      sslValidate: isAtlas,               // Validate SSL for Atlas
      // Use new SSL option to avoid deprecation warning
      tlsAllowInvalidCertificates: !isAtlas, // Allow self-signed for local
    };
  }
  
  if (platform === 'render' || platform === 'production') {
    // Render & Production - Optimized for persistent connections
    return {
      ...baseOptions,
      maxPoolSize: 10,                    // Balanced pool for production
      minPoolSize: 2,                     // Keep some connections ready
      serverSelectionTimeoutMS: 30000,    // Reasonable timeout for production
      socketTimeoutMS: 45000,             // Socket timeout for production
      connectTimeoutMS: 10000,            // Connection timeout
      bufferCommands: true,               // Enable buffering
      autoIndex: platform !== 'production', // Auto-index in dev, disable in prod
      ssl: true,                          // Always use SSL
      sslValidate: true,                  // Always validate SSL
      // Use new SSL option to avoid deprecation warning
      tlsAllowInvalidCertificates: false, // Never allow invalid certs in prod
      compressors: ['snappy', 'zlib'],    // Compression for better performance
      zlibCompressionLevel: 3,            // Balanced compression level
      readPreference: 'primary',          // Read from primary
      w: 'majority',                      // Write concern
      journal: true,                      // Journal writes
    };
  }
  
  // Development/Local
  return {
    ...baseOptions,
    maxPoolSize: 5,                       // Small pool for development
    minPoolSize: 1,                       // Minimal pool
    serverSelectionTimeoutMS: 5000,       // Fast timeout for local
    socketTimeoutMS: 10000,               // Socket timeout
    connectTimeoutMS: 5000,               // Connection timeout
    bufferCommands: true,                 // Enable buffering
    autoIndex: true,                      // Auto-index in development
    ssl: isAtlas,                         // SSL for Atlas, not for local
    sslValidate: isAtlas,                 // Validate SSL for Atlas
    // Use new SSL option to avoid deprecation warning
    tlsAllowInvalidCertificates: !isAtlas, // Allow self-signed for local
  };
};

// Extract database name from URI safely
const extractDatabaseName = (uri) => {
  try {
    if (!uri) return 'unknown';
    
    // Try to extract database name from connection string
    const match = uri.match(/\/([^/?]+)(\?|$)/);
    if (match && match[1]) {
      return match[1];
    }
    
    return 'unknown';
  } catch {
    return 'unknown';
  }
};

// Clean URI for logging (hide credentials)
const cleanUriForLogging = (uri) => {
  if (!uri) return 'unknown';
  
  try {
    // Hide password in logs
    return uri.replace(/:[^:@]*@/, ':****@');
  } catch {
    return 'hidden';
  }
};

// Connect to MongoDB
const connectDB = async () => {
  try {
    const config = getEnvConfig();
    const { platform, type } = getPlatformInfo();
    
    console.log('🔗 MongoDB Connection Setup:');
    console.log(`   Platform: ${platform} (${type})`);
    console.log(`   Environment: ${config.NODE_ENV}`);
    console.log(`   Database: ${extractDatabaseName(config.MONGO_URI)}`);
    
    // Get optimized connection options
    const options = getConnectionOptions(config);
    
    // Log connection details (for debugging)
    if (config.NODE_ENV === 'development') {
      console.log('   Connection Options:', {
        maxPoolSize: options.maxPoolSize,
        minPoolSize: options.minPoolSize,
        serverSelectionTimeoutMS: options.serverSelectionTimeoutMS,
        socketTimeoutMS: options.socketTimeoutMS,
        ssl: options.ssl,
        platform: platform,
        type: type
      });
    }
    
    // Platform-specific connection strategy
    if (platform === 'vercel') {
      console.log('   ⚡ Serverless mode: Using connection-per-request strategy');
      console.log('   ⚠️  Note: GridFS will use separate connections');
    } else {
      console.log('   🖥️  Traditional mode: Using persistent connection pool');
    }
    
    // Connect with timeout
    const connectionPromise = mongoose.connect(config.MONGO_URI, options);
    
    // Set timeout for connection attempts
    const timeoutPromise = new Promise((_, reject) => {
      const timeout = platform === 'vercel' ? 10000 : 30000;
      setTimeout(() => {
        reject(new Error(`MongoDB connection timeout after ${timeout}ms`));
      }, timeout);
    });
    
    // Race between connection and timeout
    await Promise.race([connectionPromise, timeoutPromise]);
    
    // Connection successful
    console.log('✅ MongoDB connected successfully');
    console.log(`   Host: ${mongoose.connection.host || 'unknown'}`);
    console.log(`   Database: ${mongoose.connection.db?.databaseName || 'unknown'}`);
    console.log(`   Pool Size: ${options.maxPoolSize}`);
    console.log(`   Platform Mode: ${type.toUpperCase()}`);
    
    // Log database statistics (if not serverless)
    if (platform !== 'vercel') {
      try {
        const db = mongoose.connection.db;
        const stats = await db.stats();
        console.log(`📊 Database Stats:`);
        console.log(`   Collections: ${stats.collections}`);
        console.log(`   Documents: ${stats.objects.toLocaleString()}`);
        console.log(`   Storage: ${(stats.storageSize / 1024 / 1024).toFixed(2)} MB`);
        
        // Check GridFS collections
        const collections = await db.listCollections().toArray();
        const gridfsFiles = collections.some(c => c.name === 'documents.files');
        const gridfsChunks = collections.some(c => c.name === 'documents.chunks');
        console.log(`📁 GridFS Status: ${gridfsFiles ? 'Ready' : 'Not initialized'}`);
        
      } catch (statsError) {
        console.log('📊 Stats: Could not fetch database statistics');
      }
    }
    
    return mongoose.connection;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    
    // Platform-specific troubleshooting
    const { platform } = getPlatformInfo();
    
    if (platform === 'vercel') {
      console.error('💡 Vercel Troubleshooting:');
      console.error('   - Check if MongoDB URI includes correct database name');
      console.error('   - Ensure IP is whitelisted in MongoDB Atlas');
      console.error('   - Consider using serverless-compatible GridFS service');
      console.error('   - Use connection-per-request pattern for serverless');
    } else if (platform === 'render') {
      console.error('💡 Render Troubleshooting:');
      console.error('   - Check environment variables in Render dashboard');
      console.error('   - Verify MongoDB Atlas cluster is not paused');
      console.error('   - Ensure proper network access from Render IPs');
    } else {
      console.error('💡 General Troubleshooting:');
      console.error('   - Check MongoDB service is running (for local)');
      console.error('   - Verify connection string format');
      console.error('   - Check firewall/network settings');
    }
    
    // Don't exit immediately in development for debugging
    if (process.env.NODE_ENV === 'production') {
      console.error('🚨 Production connection failed. Exiting...');
      process.exit(1);
    }
    
    throw error;
  }
};

// Database health check
const checkDatabaseHealth = async () => {
  try {
    const state = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    const { platform, type } = getPlatformInfo();
    
    const health = {
      status: state === 1 ? 'healthy' : 'unhealthy',
      readyState: states[state] || 'unknown',
      readyStateCode: state,
      timestamp: new Date().toISOString(),
      environment: getEnvConfig().NODE_ENV,
      platform: platform,
      connectionType: type,
      isConnected: isConnected,
      connectionRetries: connectionRetries,
      database: mongoose.connection.db?.databaseName || 'unknown',
      host: mongoose.connection.host || 'unknown',
    };
    
    if (state === 1) {
      // Test connection with a simple query
      try {
        await mongoose.connection.db.admin().ping();
        health.ping = 'ok';
        
        // Get basic stats (skip for serverless)
        if (platform !== 'vercel') {
          const stats = await mongoose.connection.db.stats();
          health.stats = {
            collections: stats.collections,
            documents: stats.objects,
            storageSize: `${(stats.storageSize / 1024 / 1024).toFixed(2)} MB`,
            dataSize: `${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`,
          };
        }
      } catch (pingError) {
        health.ping = 'failed';
        health.pingError = pingError.message;
      }
    }
    
    return health;
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString(),
      platform: getPlatformInfo().platform,
      isConnected: false,
      connectionRetries: connectionRetries
    };
  }
};

// Get connection statistics
const getConnectionStats = () => {
  const { platform, type } = getPlatformInfo();
  const currentConnection = mongoose.connection;
  
  const stats = {
    platform: platform,
    connectionType: type,
    isConnected: isConnected,
    connectionRetries: connectionRetries,
    currentConnection: {
      readyState: currentConnection.readyState,
      host: currentConnection.host || 'unknown',
      port: currentConnection.port || 'unknown',
      database: currentConnection.db?.databaseName || 'unknown',
    },
    timestamp: new Date().toISOString(),
    environment: getEnvConfig().NODE_ENV,
  };
  
  // Add pool info if available
  if (currentConnection.getClient) {
    try {
      const client = currentConnection.getClient();
      stats.poolInfo = {
        maxPoolSize: client?.options?.maxPoolSize || 'unknown',
        minPoolSize: client?.options?.minPoolSize || 'unknown',
      };
    } catch (error) {
      // Ignore errors getting client info
    }
  }
  
  return stats;
};

// Close database connection
const closeDB = async () => {
  try {
    const { platform } = getPlatformInfo();
    
    if (platform === 'vercel') {
      console.log('⚡ Vercel: Using serverless connection model, no persistent connection to close');
      return true;
    }
    
    console.log('🔄 Closing database connection...');
    
    const readyState = mongoose.connection.readyState;
    if (readyState !== 0) { // Not already disconnected
      await mongoose.connection.close();
      console.log('✅ MongoDB connection closed');
    } else {
      console.log('   Already disconnected');
    }
    
    isConnected = false;
    return true;
  } catch (error) {
    console.error('❌ Error closing MongoDB connection:', error);
    return false;
  }
};

// Reconnect database (for traditional hosting)
const reconnectDB = async () => {
  const { platform } = getPlatformInfo();
  
  if (platform === 'vercel') {
    console.log('⚡ Vercel: Serverless reconnects automatically per request');
    return true;
  }
  
  try {
    console.log('🔄 Attempting to reconnect to MongoDB...');
    
    if (mongoose.connection.readyState === 1) {
      console.log('   Already connected');
      return true;
    }
    
    await closeDB();
    await connectDB();
    
    console.log('✅ Reconnected successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to reconnect:', error);
    return false;
  }
};

// Setup graceful shutdown handlers
const setupGracefulShutdown = () => {
  const { platform } = getPlatformInfo();
  
  if (platform === 'vercel') {
    console.log('⚡ Vercel: Using serverless model, no graceful shutdown needed');
    return;
  }
  
  // For SIGINT (Ctrl+C)
  process.on('SIGINT', async () => {
    console.log('\n📦 Received SIGINT. Closing MongoDB connection...');
    await closeDB();
    process.exit(0);
  });

  // For SIGTERM (e.g., Render shutdown)
  process.on('SIGTERM', async () => {
    console.log('\n📦 Received SIGTERM. Closing MongoDB connection...');
    await closeDB();
    process.exit(0);
  });

  // For uncaught exceptions
  process.on('uncaughtException', async (error) => {
    console.error('🚨 Uncaught Exception:', error);
    await closeDB();
    process.exit(1);
  });

  // For unhandled promise rejections
  process.on('unhandledRejection', async (reason, promise) => {
    console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason);
    await closeDB();
    process.exit(1);
  });
  
  console.log('✅ Graceful shutdown handlers registered');
};

// Export everything
module.exports = {
  mongoose,
  connectDB,
  checkDatabaseHealth,
  getConnectionStats,
  closeDB,
  reconnectDB,
  isConnected: () => isConnected,
  getPlatformInfo,
  setupGracefulShutdown,
  
  // Helper functions for platform detection
  isVercel: () => process.env.VERCEL === '1',
  isRender: () => process.env.RENDER === 'true',
  isProduction: () => process.env.NODE_ENV === 'production',
};