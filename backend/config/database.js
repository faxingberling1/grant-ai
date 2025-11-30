const mongoose = require('mongoose');
const { getEnvConfig } = require('./environment');

// Connection events for better monitoring
mongoose.connection.on('connected', () => {
  console.log('✅ Mongoose connected to MongoDB Atlas');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️  Mongoose disconnected from MongoDB Atlas');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('📦 MongoDB connection closed through app termination');
  process.exit(0);
});

const connectDB = async () => {
  try {
    const config = getEnvConfig();
    
    console.log(`🔗 Attempting to connect to MongoDB Atlas...`);
    console.log(`   Environment: ${config.NODE_ENV}`);
    console.log(`   Database: ${config.MONGO_URI.split('/').pop().split('?')[0]}`); // Extract DB name
    
    // Updated MongoDB Atlas optimized connection options
    const connectionOptions = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      
      // Atlas-specific optimizations (updated)
      maxPoolSize: config.NODE_ENV === 'production' ? 50 : 10,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 30000, // Increased timeout for Atlas
      socketTimeoutMS: 45000,
      heartbeatFrequencyMS: 10000,
      maxIdleTimeMS: 30000,
      retryWrites: true,
      retryReads: true,
      
      // Remove deprecated options
      // bufferCommands: true, // This is enabled by default
      // bufferMaxEntries: -1, // REMOVED - deprecated option
      
      // Auto index building (disable in production for performance)
      autoIndex: config.NODE_ENV !== 'production',
      
      // Family 4 for IPv4 (can help with some network issues)
      family: 4
    };

    // Add SSL/TLS for production (Atlas requires SSL)
    if (config.NODE_ENV === 'production') {
      connectionOptions.ssl = true;
      connectionOptions.sslValidate = true;
    }

    await mongoose.connect(config.MONGO_URI, connectionOptions);
    
    console.log('✅ Successfully connected to MongoDB Atlas');
    console.log(`   Database: ${mongoose.connection.db.databaseName}`);
    console.log(`   Host: ${mongoose.connection.host}`);
    console.log(`   Port: ${mongoose.connection.port}`);
    console.log(`   Pool Size: ${connectionOptions.maxPoolSize}`);
    
    // Log connection stats
    const dbStats = await mongoose.connection.db.stats();
    console.log(`   Collections: ${dbStats.collections}`);
    console.log(`   Documents: ${dbStats.objects}`);
    console.log(`   Storage: ${(dbStats.dataSize / 1024 / 1024).toFixed(2)} MB`);
    
    return mongoose.connection;
  } catch (error) {
    console.error('❌ MongoDB Atlas connection error:', error.message);
    
    // Provide more specific error messages for common Atlas issues
    if (error.name === 'MongoNetworkError') {
      console.error('   💡 Network error - Check your internet connection and firewall settings');
    } else if (error.name === 'MongoServerSelectionError') {
      console.error('   💡 Server selection error - Check your Atlas cluster status and IP whitelist');
    } else if (error.message.includes('auth failed')) {
      console.error('   💡 Authentication failed - Check your username and password');
    } else if (error.message.includes('bad auth')) {
      console.error('   💡 Bad authentication - Verify your database user credentials');
    } else if (error.message.includes('self signed certificate')) {
      console.error('   💡 SSL certificate issue - Check your TLS/SSL configuration');
    } else if (error.message.includes('buffermaxentries')) {
      console.error('   💡 Remove bufferMaxEntries from connection options - it is deprecated');
    }
    
    console.error('   📖 MongoDB Atlas Troubleshooting Guide:');
    console.error('   - Check your IP is whitelisted in Atlas');
    console.error('   - Verify database user exists and has correct permissions');
    console.error('   - Ensure connection string is correct');
    console.error('   - Check cluster is not paused');
    console.error('   - Remove deprecated options like bufferMaxEntries');
    
    process.exit(1);
  }
};

// Database health check function
const checkDatabaseHealth = async () => {
  try {
    const state = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    const health = {
      status: state === 1 ? 'healthy' : 'unhealthy',
      readyState: states[state] || 'unknown',
      timestamp: new Date().toISOString(),
      database: mongoose.connection.db?.databaseName || 'unknown'
    };
    
    if (state === 1) {
      // Perform a simple query to verify connection is actually working
      await mongoose.connection.db.admin().ping();
      health.ping = 'ok';
    }
    
    return health;
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

// Function to get connection statistics
const getConnectionStats = () => {
  const connections = mongoose.connections;
  return {
    totalConnections: connections.length,
    readyStates: connections.map(conn => ({
      name: conn.name,
      readyState: conn.readyState,
      host: conn.host,
      port: conn.port
    })),
    poolSize: mongoose.connection.getClient()?.options?.maxPoolSize || 10
  };
};

// Function to close database connection gracefully
const closeDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('📦 MongoDB connection closed gracefully');
    return true;
  } catch (error) {
    console.error('❌ Error closing database connection:', error);
    return false;
  }
};

module.exports = { 
  connectDB, 
  checkDatabaseHealth, 
  getConnectionStats, 
  closeDB 
};