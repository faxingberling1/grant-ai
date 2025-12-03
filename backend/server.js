const express = require('express');
const cors = require('cors');
const http = require('http');
const path = require('path');

// Configurations
const { getEnvConfig } = require('./config/environment');
const { connectDB, checkDatabaseHealth, getConnectionStats } = require('./config/database');
const { initializeSocket } = require('./socket/notificationSocket');

// Utils and Seeders
const { initializeDemoData } = require('./utils/helpers');
const { seedSystemTemplates } = require('./seeders/templateSeeder');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const clientRoutes = require('./routes/clients');
const templateRoutes = require('./routes/templates');
const grantRoutes = require('./routes/grants');
const notificationRoutes = require('./routes/notifications');
const adminRoutes = require('./routes/admin');
const aiRoutes = require('./routes/ai');
const debugRoutes = require('./routes/debug');
const documentRoutes = require('./routes/documents');
const grantSourceRoutes = require('./routes/grantSources');
const meetingRoutes = require('./routes/meetings');

// Initialize app and server
const app = express();
const server = http.createServer(app);
const config = getEnvConfig();

// Initialize Socket.io
initializeSocket(server);

// ==================== GRIDFS INITIALIZATION ====================

// Import GridFS service
const gridfsService = require('./services/gridfsService');
const mongoose = require('mongoose');

// GridFS auto-initializes in constructor, just check status
mongoose.connection.once('open', async () => {
  console.log('📁 MongoDB connected, checking GridFS status...');
  
  // Wait a moment for GridFS to initialize
  setTimeout(async () => {
    try {
      const health = await gridfsService.healthCheck();
      if (health.healthy) {
        console.log('✅ GridFS initialized successfully');
        console.log(`📊 GridFS Status: ${health.status}`);
        
        // Get stats if available
        try {
          const stats = await gridfsService.getStorageStats();
          console.log(`📁 GridFS Files: ${stats.totalFiles || 0}`);
          console.log(`💾 GridFS Storage: ${stats.totalSizeFormatted || '0 Bytes'}`);
        } catch (statsError) {
          console.log('📊 GridFS: Ready (stats unavailable)');
        }
      } else {
        console.warn(`⚠️ GridFS: ${health.status}`);
      }
    } catch (error) {
      console.warn('⚠️ GridFS health check failed:', error.message);
    }
  }, 1000);
});

// ==================== CORS CONFIGURATION ====================

// Enhanced CORS configuration for production
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = Array.isArray(config.CORS_ORIGINS) 
      ? config.CORS_ORIGINS 
      : config.CORS_ORIGINS?.split(',') || [];
    
    // Add default origins for development
    if (config.NODE_ENV === 'development') {
      allowedOrigins.push('http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000');
    }
    
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      console.warn(`🚫 CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept', 'x-api-key'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400 // 24 hours
}));

// Pre-flight requests
app.options('*', cors());

// ==================== MIDDLEWARE ====================

// Enhanced body parsing with limits
app.use(express.json({
  limit: '10mb',
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      res.status(400).json({
        success: false,
        message: 'Invalid JSON payload'
      });
      throw new Error('Invalid JSON');
    }
  }
}));

app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb' 
}));

// Enhanced request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 400 ? '❌' : '✅';
    console.log(`${logLevel} ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms - ${req.ip}`);
  });
  
  next();
});

// Security headers middleware
app.use((req, res, next) => {
  // Basic security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  
  // API-specific headers
  res.setHeader('X-API-Version', '1.0.0');
  res.setHeader('X-Environment', config.NODE_ENV);
  
  next();
});

// ==================== HEALTH & MONITORING ENDPOINTS ====================

// Comprehensive health check endpoint with GridFS status
app.get('/api/health', async (req, res) => {
  try {
    const dbHealth = await checkDatabaseHealth();
    const connectionStats = getConnectionStats();
    
    // Get GridFS health
    let gridfsHealth = { status: 'unknown', message: 'Not initialized' };
    try {
      gridfsHealth = await gridfsService.healthCheck();
    } catch (error) {
      gridfsHealth = { status: 'error', message: error.message };
    }
    
    res.status(200).json({
      status: 'ok',
      message: 'Grant AI backend is running successfully 🚀',
      timestamp: new Date().toISOString(),
      environment: config.NODE_ENV,
      version: '1.0.0',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      services: {
        database: {
          status: dbHealth.status,
          readyState: dbHealth.readyState,
          ping: dbHealth.ping || 'unknown'
        },
        gridfs: {
          status: gridfsHealth.status,
          message: gridfsHealth.message,
          bucket: gridfsHealth.stats?.bucketName || 'documents'
        },
        ai: {
          gemini: config.GEMINI_API_KEY ? 'Available' : 'Not Configured',
          status: config.GEMINI_API_KEY ? 'Ready' : 'Disabled'
        },
        email: {
          resend: config.RESEND_API_KEY ? 'Configured' : 'Not Configured',
          status: 'Ready'
        },
        notifications: {
          websocket: global.io ? 'Connected' : 'Disconnected',
          status: 'Active'
        },
        storage: {
          documents: 'GridFS Enabled',
          uploads: 'Memory Storage',
          maxFileSize: '5MB'
        },
        templates: {
          system: 'Available for all users',
          status: 'Ready'
        }
      },
      connections: connectionStats,
      system: {
        node: process.version,
        platform: process.platform,
        arch: process.arch
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Health check failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Database and GridFS health check endpoint
app.get('/api/health/database', async (req, res) => {
  try {
    const health = await checkDatabaseHealth();
    const stats = getConnectionStats();
    
    // Get GridFS health
    let gridfsHealth = { status: 'unknown' };
    try {
      gridfsHealth = await gridfsService.healthCheck();
    } catch (error) {
      gridfsHealth = { status: 'error', message: error.message };
    }
    
    res.json({
      success: true,
      database: health,
      gridfs: gridfsHealth,
      connectionStats: stats,
      timestamp: new Date().toISOString(),
      mongodb: {
        version: require('mongoose').version,
        connected: health.status === 'healthy',
        gridfsAvailable: gridfsHealth.healthy === true
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// GridFS-specific health check
app.get('/api/health/gridfs', async (req, res) => {
  try {
    const health = await gridfsService.healthCheck();
    res.json({
      success: true,
      gridfs: health,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// GridFS storage statistics
app.get('/api/health/gridfs/stats', async (req, res) => {
  try {
    const stats = await gridfsService.getStorageStats();
    res.json({
      success: true,
      stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// System metrics endpoint (for monitoring)
app.get('/api/metrics', (req, res) => {
  const metrics = {
    timestamp: new Date().toISOString(),
    process: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      pid: process.pid,
      version: process.version
    },
    system: {
      arch: process.arch,
      platform: process.platform,
      cpus: require('os').cpus().length,
      totalMemory: require('os').totalmem(),
      freeMemory: require('os').freemem()
    },
    environment: config.NODE_ENV,
    gridfs: {
      maxFileSize: '5MB',
      chunkSize: '255KB',
      storageType: 'MongoDB GridFS'
    }
  };
  
  res.json(metrics);
});

// Test connection endpoint
app.get('/api/test-connection', (req, res) => {
  res.json({
    success: true,
    message: `Backend connection successful - ${config.NODE_ENV} environment`,
    environment: config.NODE_ENV,
    timestamp: new Date().toISOString(),
    client: {
      ip: req.ip,
      userAgent: req.get('User-Agent')
    },
    storage: {
      type: 'GridFS (MongoDB)',
      status: 'Active',
      maxFileSize: '5MB'
    }
  });
});

// Email configuration verification
app.get('/api/email/verify-config', async (req, res) => {
  try {
    const EmailService = require('./services/emailService');
    const emailService = new EmailService();
    const config = await emailService.verifyConfiguration();
    res.json(config);
  } catch (error) {
    console.error('❌ Email config verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify email configuration',
      error: error.message
    });
  }
});

// ==================== API ROUTES ====================

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/grants', grantRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/debug', debugRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/grant-sources', grantSourceRoutes);
app.use('/api/meetings', meetingRoutes);

// ==================== GRIDFS UTILITY ROUTES ====================

// GridFS maintenance endpoint (admin only)
app.post('/api/admin/gridfs/cleanup', async (req, res) => {
  try {
    // Check admin access
    const { authMiddleware, adminMiddleware } = require('./middleware/auth');
    
    // Use middleware chain
    await new Promise((resolve, reject) => {
      authMiddleware(req, res, () => {
        adminMiddleware(req, res, () => {
          resolve();
        });
      });
    });
    
    console.log('🧹 Admin requested GridFS cleanup');
    
    // Run orphaned chunk cleanup
    const cleanupResult = await gridfsService.cleanupOrphanedChunks();
    
    res.json({
      success: true,
      message: 'GridFS cleanup completed',
      result: cleanupResult,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ GridFS cleanup error:', error);
    res.status(500).json({
      success: false,
      message: 'GridFS cleanup failed',
      error: error.message
    });
  }
});

// GridFS file list endpoint (admin only)
app.get('/api/admin/gridfs/files', async (req, res) => {
  try {
    // Check admin access
    const { authMiddleware, adminMiddleware } = require('./middleware/auth');
    
    // Use middleware chain
    await new Promise((resolve, reject) => {
      authMiddleware(req, res, () => {
        adminMiddleware(req, res, () => {
          resolve();
        });
      });
    });
    
    const { userId, limit = 50, skip = 0 } = req.query;
    
    let filter = {};
    if (userId) {
      filter['metadata.userId'] = userId;
    }
    
    const files = await gridfsService.listFiles(filter, { limit: parseInt(limit), skip: parseInt(skip) });
    
    res.json({
      success: true,
      files: files.map(file => ({
        _id: file._id,
        filename: file.filename,
        originalName: file.metadata?.originalName || file.filename,
        size: file.length,
        sizeFormatted: gridfsService.formatBytes(file.length),
        contentType: file.contentType,
        uploadDate: file.uploadDate,
        userId: file.metadata?.userId || 'unknown',
        userEmail: file.metadata?.userEmail || 'unknown'
      })),
      count: files.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ GridFS file list error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to list GridFS files',
      error: error.message
    });
  }
});

// ==================== ROOT & INFO ENDPOINTS ====================

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'GrantFlow CRM Backend API',
    version: '1.0.0',
    environment: config.NODE_ENV,
    status: 'running',
    timestamp: new Date().toISOString(),
    documentation: 'https://github.com/your-repo/docs',
    support: 'support@grantflow.com',
    storage: {
      type: 'MongoDB GridFS',
      status: 'Active',
      maxFileSize: '5MB',
      features: ['Secure file storage', 'Direct streaming', 'Automatic cleanup']
    },
    endpoints: {
      auth: '/api/auth/*',
      clients: '/api/clients/*',
      templates: '/api/templates/*',
      grants: '/api/grants/*',
      notifications: '/api/notifications/*',
      admin: '/api/admin/*',
      ai: '/api/ai/*',
      documents: '/api/documents/*',
      health: '/api/health',
      'health/gridfs': '/api/health/gridfs',
      metrics: '/api/metrics',
      test: '/api/test-connection'
    }
  });
});

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    api: 'GrantFlow CRM API',
    version: '1.0.0',
    status: 'operational',
    environment: config.NODE_ENV,
    timestamp: new Date().toISOString(),
    baseUrl: `${req.protocol}://${req.get('host')}/api`,
    features: [
      'User Authentication & Authorization',
      'Client Management',
      'Grant Proposal Management',
      'AI-Powered Content Generation',
      'Real-time Notifications',
      'Document Storage & Management (GridFS)',
      'Email Templates & Automation',
      'Admin Dashboard & Analytics',
      'System Templates for All Users'
    ],
    storage: {
      type: 'MongoDB GridFS',
      description: 'Secure file storage directly in MongoDB',
      maxFileSize: '5MB',
      benefits: [
        'No filesystem dependencies',
        'Automatic replication',
        'Built-in chunking',
        'Streaming downloads'
      ]
    }
  });
});

// ==================== ERROR HANDLING ====================

// 404 handler for API routes
app.use('/api/*', notFoundHandler);

// Serve static files in production (if needed)
if (config.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// Global error handler
app.use(errorHandler);

// ==================== SERVER STARTUP ====================

// System template initialization function
const initializeSystemTemplates = async () => {
  try {
    console.log('🌱 Checking system templates...');
    
    const Template = require('./models/Template');
    
    // Check if system templates already exist
    const existingSystemTemplates = await Template.countDocuments({ 
      isSystemTemplate: true, 
      isActive: true 
    });
    
    if (existingSystemTemplates > 0) {
      console.log(`✅ System templates: ${existingSystemTemplates} templates already exist`);
      return;
    }
    
    console.log('📝 Creating system templates for all users...');
    
    // Use the existing seeder
    const createdTemplates = await seedSystemTemplates();
    console.log(`✅ System templates: Created ${createdTemplates.length} templates for all users`);
    
  } catch (error) {
    console.error('❌ System templates initialization failed:', error.message);
  }
};

// GridFS initialization check
const checkGridFSStatus = async () => {
  try {
    // Wait a bit for GridFS to initialize
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const health = await gridfsService.healthCheck();
    if (health.healthy) {
      console.log(`✅ GridFS: ${health.status}`);
      
      try {
        const stats = await gridfsService.getStorageStats();
        console.log(`📊 GridFS Stats: ${stats.totalFiles} files, ${stats.totalSizeFormatted}`);
      } catch (statsError) {
        console.log('📊 GridFS: Stats unavailable');
      }
      
      return true;
    } else {
      console.warn(`⚠️ GridFS: ${health.status}`);
      return false;
    }
  } catch (error) {
    console.error('❌ GridFS status check failed:', error.message);
    
    // Check if it's just not ready yet
    if (error.message.includes('GridFS bucket not initialized') || 
        error.message.includes('initialization timeout')) {
      console.log('⏳ GridFS: Still initializing...');
      return false;
    }
    
    return false;
  }
};

const startServer = async () => {
  try {
    console.log('🎯 ==========================================');
    console.log('🚀 Starting GrantFlow CRM Server...');
    console.log(`🔗 Environment: ${config.NODE_ENV}`);
    console.log(`📊 MongoDB Atlas: Connecting...`);
    console.log('🎯 ==========================================');

    // Connect to database with retry logic
    let dbConnected = false;
    let retryCount = 0;
    const maxRetries = 3;
    
    while (!dbConnected && retryCount < maxRetries) {
      try {
        await connectDB();
        dbConnected = true;
        console.log('✅ MongoDB Atlas: Connected successfully');
      } catch (dbError) {
        retryCount++;
        console.error(`❌ MongoDB Atlas connection attempt ${retryCount} failed:`, dbError.message);
        
        if (retryCount < maxRetries) {
          console.log(`🔄 Retrying in 5 seconds... (${retryCount}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, 5000));
        } else {
          throw new Error(`Failed to connect to MongoDB Atlas after ${maxRetries} attempts`);
        }
      }
    }

    // Setup admin account
    const debugController = require('./controllers/debugController');
    try {
      const mockRes = {
        json: (result) => {
          if (result.success) {
            console.log(`✅ ${result.message}`);
          } else {
            console.log(`❌ ${result.message}`);
          }
        },
        status: function() { return this; }
      };
      await debugController.setupAdmin({ headers: {} }, mockRes);
    } catch (adminError) {
      console.error('❌ Admin setup failed:', adminError.message);
    }
    
    // Initialize demo data
    try {
      await initializeDemoData();
      console.log('✅ Demo data: Initialized');
    } catch (demoError) {
      console.error('❌ Demo data initialization failed:', demoError.message);
    }
    
    // Initialize system templates for all users
    try {
      await initializeSystemTemplates();
    } catch (templateError) {
      console.error('❌ System templates initialization failed:', templateError.message);
    }
    
    // Check GridFS status
    try {
      await checkGridFSStatus();
    } catch (error) {
      console.error('❌ GridFS initialization failed:', error.message);
    }
    
    // Start server
    const PORT = config.PORT || 3000;
    server.listen(PORT, '0.0.0.0', () => {
      console.log('🎯 ==========================================');
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🔗 Environment: ${config.NODE_ENV}`);
      console.log(`📊 Database: MongoDB Atlas Connected`);
      console.log(`📁 Storage: MongoDB GridFS Enabled`);
      console.log(`🤖 AI Services: ${config.GEMINI_API_KEY ? 'Gemini Enabled' : 'AI Disabled'}`);
      console.log(`📧 Email Services: ${config.RESEND_API_KEY ? 'Resend Configured' : 'Email Disabled'}`);
      console.log(`🔔 Notification System: WebSocket Enabled`);
      console.log(`📁 Document Storage: GridFS (Memory-based)`);
      console.log(`📄 Max File Size: 5MB (Free Tier Optimized)`);
      console.log(`📧 System Templates: Available for all users`);
      console.log(`⏰ Started: ${new Date().toISOString()}`);
      console.log('🎯 ==========================================');
      console.log('🔐 Demo credentials:');
      console.log('   Email: demo@grantfunds.com');
      console.log('   Password: demo123');
      console.log('🔐 Admin credentials:');
      console.log('   Email: admin@deleuxedesign.com');
      console.log('   Password: AlexMurphy');
      console.log('🎯 ==========================================');
      console.log('📋 Available endpoints:');
      console.log(`   GET  /api/health              - Health check`);
      console.log(`   GET  /api/health/database     - Database health`);
      console.log(`   GET  /api/health/gridfs       - GridFS health`);
      console.log(`   GET  /api/metrics             - System metrics`);
      console.log(`   GET  /api/test-connection     - Test connection`);
      console.log(`   POST /api/auth/login          - User login`);
      console.log(`   POST /api/auth/register       - User registration`);
      console.log(`   GET  /api/clients             - Get user clients`);
      console.log(`   POST /api/documents/upload    - Upload document (GridFS)`);
      console.log(`   GET  /api/admin/stats         - Admin statistics`);
      console.log(`   POST /api/ai/generate         - AI content generation`);
      console.log(`   GET  /api/templates           - Get templates (system + user)`);
      console.log(`   POST /api/templates/admin/create-system-templates - Create system templates (admin)`);
      console.log('🎯 ==========================================');
      
      // Perform initial health check
      setTimeout(async () => {
        try {
          const health = await checkDatabaseHealth();
          console.log(`💚 Initial health check: ${health.status.toUpperCase()}`);
          
          // Check GridFS
          try {
            const gridfsStatus = await gridfsService.healthCheck();
            console.log(`📁 GridFS status: ${gridfsStatus.status}`);
          } catch (gridfsError) {
            console.log(`📁 GridFS status: ${gridfsError.message}`);
          }
        } catch (error) {
          console.error(`💔 Initial health check failed: ${error.message}`);
        }
      }, 1000);
    });
    
    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
        process.exit(1);
      } else {
        console.error('❌ Server error:', error);
        process.exit(1);
      }
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// ==================== GRACEFUL SHUTDOWN ====================

const gracefulShutdown = async (signal) => {
  console.log(`\n🔻 Received ${signal}. Shutting down gracefully...`);
  
  try {
    // Close HTTP server
    server.close(() => {
      console.log('✅ HTTP server closed.');
    });
    
    // Close WebSocket server
    if (global.io) {
      global.io.close();
      console.log('✅ WebSocket server closed.');
    }
    
    // Close GridFS connections
    console.log('📁 Closing GridFS connections...');
    
    // Close database connections
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('✅ MongoDB connection closed.');
    }
    
    console.log('👋 Graceful shutdown completed.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
};

// Register shutdown handlers
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2')); // For nodemon

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
startServer();