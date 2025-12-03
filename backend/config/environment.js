const path = require('path');

// Load environment variables first
const loadEnv = () => {
  // Determine which .env file to load based on NODE_ENV
  const envFile = process.env.NODE_ENV === 'development' ? '.env.local' : '.env.production';
  require('dotenv').config({ 
    path: path.resolve(process.cwd(), envFile),
    override: true 
  });
};

// Load environment variables immediately
loadEnv();

const getEnvConfig = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const isDevelopment = !isProduction;
  const isVercel = process.env.VERCEL === '1';
  const isRender = process.env.RENDER === 'true';

  // Platform-specific MongoDB URI selection
  let mongoUri = process.env.MONGO_URI;
  
  // Priority: Platform-specific URI > General URI > Local fallback
  if (isVercel && process.env.MONGO_URI_VERCEL) {
    mongoUri = process.env.MONGO_URI_VERCEL;
    console.log('⚡ Using Vercel-specific MongoDB URI');
  } else if (isRender && process.env.MONGO_URI_RENDER) {
    mongoUri = process.env.MONGO_URI_RENDER;
    console.log('🖥️  Using Render-specific MongoDB URI');
  } else if (!mongoUri && isDevelopment) {
    // Local development fallback
    mongoUri = process.env.MONGO_URI_LOCAL || 'mongodb://localhost:27017/grant-ai';
    console.log('💻 Using local MongoDB URI');
  }

  // Clean up URI if needed
  if (mongoUri) {
    mongoUri = mongoUri.trim();
  }

  // Default CORS origins including both default and custom
  const defaultCorsOrigins = [
    'http://localhost:3000',
    'https://grant-ai-eight.vercel.app',
    'https://grant-ai-git-main-alex-murphys-projects.vercel.app',
    'https://grant-ai-alex-murphys-projects.vercel.app',
    'https://*.vercel.app'
  ];

  // Parse custom CORS origins from environment variable
  let corsOrigins = defaultCorsOrigins;
  if (process.env.CORS_ORIGINS) {
    try {
      // If it's a JSON array string
      if (process.env.CORS_ORIGINS.startsWith('[')) {
        corsOrigins = JSON.parse(process.env.CORS_ORIGINS);
      } else {
        // If it's a comma-separated list
        corsOrigins = process.env.CORS_ORIGINS.split(',').map(origin => origin.trim());
      }
      corsOrigins = [...new Set([...defaultCorsOrigins, ...corsOrigins])]; // Merge and deduplicate
    } catch (error) {
      console.warn('⚠️ Failed to parse CORS_ORIGINS, using defaults');
    }
  }

  // Construct configuration object
  const config = {
    NODE_ENV: process.env.NODE_ENV || 'production',
    PORT: process.env.PORT || (isVercel ? 3000 : 5000),
    MONGO_URI: mongoUri,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRY: process.env.JWT_EXPIRY || '7d',
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL || 'admin@deleuxedesign.com',
    RESEND_FROM_NAME: process.env.RESEND_FROM_NAME || 'Grant Funds',
    FRONTEND_URL: process.env.FRONTEND_URL || (isDevelopment 
      ? 'http://localhost:3000' 
      : 'https://grant-ai-eight.vercel.app'),
    CORS_ORIGINS: corsOrigins,
    MAX_FILE_SIZE: process.env.MAX_FILE_SIZE || (5 * 1024 * 1024), // 5MB default
    GRIDFS_ENABLED: process.env.GRIDFS_ENABLED !== 'false', // Default to true
    RATE_LIMIT_WINDOW: process.env.RATE_LIMIT_WINDOW || 15 * 60 * 1000, // 15 minutes
    RATE_LIMIT_MAX: process.env.RATE_LIMIT_MAX || 100, // 100 requests per window
    LOG_LEVEL: process.env.LOG_LEVEL || (isProduction ? 'warn' : 'debug'),
    // Session configuration
    SESSION_SECRET: process.env.SESSION_SECRET || process.env.JWT_SECRET,
    SESSION_MAX_AGE: process.env.SESSION_MAX_AGE || 24 * 60 * 60 * 1000, // 24 hours
  };

  // Validate required environment variables based on environment
  const required = ['MONGO_URI', 'JWT_SECRET'];
  
  // Add platform-specific required variables
  if (isProduction) {
    if (!isVercel && !isRender) {
      required.push('RESEND_API_KEY');
    }
  }

  const missing = required.filter(key => !config[key] || config[key].trim() === '');
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing.join(', '));
    if (isProduction) {
      process.exit(1);
    } else {
      console.warn('⚠️ Running with missing environment variables in development mode');
    }
  }

  // Log configuration (sensitive info redacted)
  console.log('🚀 Environment Configuration:');
  console.log(`   - NODE_ENV: ${config.NODE_ENV}`);
  console.log(`   - Platform: ${isVercel ? 'Vercel' : isRender ? 'Render' : 'Local/Other'}`);
  console.log(`   - MongoDB: ${config.MONGO_URI ? 'Configured' : 'Missing'}`);
  console.log(`   - JWT Secret: ${config.JWT_SECRET ? 'Set' : 'Missing'}`);
  console.log(`   - Gemini API: ${config.GEMINI_API_KEY ? 'Key Found' : 'Key Missing'}`);
  console.log(`   - Resend API: ${config.RESEND_API_KEY ? 'Key Found' : 'Key Missing'}`);
  console.log(`   - Port: ${config.PORT}`);
  console.log(`   - Frontend URL: ${config.FRONTEND_URL}`);
  console.log(`   - CORS Origins: ${config.CORS_ORIGINS.length} origins configured`);
  console.log(`   - Log Level: ${config.LOG_LEVEL}`);

  return config;
};

module.exports = { getEnvConfig };