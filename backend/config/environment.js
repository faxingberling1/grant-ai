const path = require('path');

const getEnvConfig = () => {
  // Determine which .env file to load based on NODE_ENV
  const envFile = process.env.NODE_ENV === 'development' ? '.env.local' : '.env.production';
  require('dotenv').config({ path: path.resolve(process.cwd(), envFile) });

  const config = {
    NODE_ENV: process.env.NODE_ENV || 'production',
    PORT: process.env.PORT || 5000,
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL || 'admin@deleuxedesign.com',
    RESEND_FROM_NAME: process.env.RESEND_FROM_NAME || 'Grant Funds',
    FRONTEND_URL: process.env.FRONTEND_URL || 'https://grant-ai-eight.vercel.app',
    CORS_ORIGINS: [
      'http://localhost:3000',
      'https://grant-ai-eight.vercel.app',
      'https://grant-ai-git-main-alex-murphys-projects.vercel.app',
      'https://grant-ai-alex-murphys-projects.vercel.app',
      'https://*.vercel.app'
    ]
  };

  // Validate required environment variables
  const required = ['MONGO_URI', 'JWT_SECRET'];
  const missing = required.filter(key => !config[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing.join(', '));
    process.exit(1);
  }

  console.log('🚀 Environment Configuration:');
  console.log(`   - NODE_ENV: ${config.NODE_ENV}`);
  console.log(`   - MongoDB: ${config.MONGO_URI ? 'URI Found' : 'URI Missing'}`);
  console.log(`   - JWT Secret: ${config.JWT_SECRET ? 'Set' : 'Missing'}`);
  console.log(`   - Gemini API: ${config.GEMINI_API_KEY ? 'Key Found' : 'Key Missing'}`);
  console.log(`   - Resend API: ${config.RESEND_API_KEY ? 'Key Found' : 'Key Missing'}`);
  console.log(`   - Port: ${config.PORT}`);

  return config;
};

module.exports = { getEnvConfig };