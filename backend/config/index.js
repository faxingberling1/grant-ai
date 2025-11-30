// backend/config/index.js
const path = require('path');
const dotenv = require('dotenv');

const envFile = process.env.NODE_ENV === 'development' ? '.env.local' : '.env.production';
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

// Optional: log config in development only
if (process.env.NODE_ENV === 'development') {
  console.log('🚀 Environment Configuration:');
  console.log(`   - NODE_ENV: ${process.env.NODE_ENV || 'production'}`);
  console.log(`   - Env File: ${envFile}`);
  console.log(`   - MongoDB: ${process.env.MONGO_URI ? 'Set' : '⚠️ Missing'}`);
  console.log(`   - JWT Secret: ${process.env.JWT_SECRET ? 'Set' : '⚠️ Missing'}`);
  console.log(`   - Gemini API: ${process.env.GEMINI_API_KEY ? 'Set' : '⚠️ Missing'}`);
  console.log(`   - Resend API: ${process.env.RESEND_API_KEY ? 'Set' : '⚠️ Missing'}`);
  console.log(`   - Port: ${process.env.PORT || 5000}`);
}

module.exports = {
  env: process.env.NODE_ENV || 'production',
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  frontendUrl: process.env.FRONTEND_URL || 'https://grant-ai-eight.vercel.app',
  resend: {
    apiKey: process.env.RESEND_API_KEY,
    fromEmail: process.env.RESEND_FROM_EMAIL || 'admin@deleuxedesign.com',
    fromName: process.env.RESEND_FROM_NAME || 'Grant Funds'
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY
  },
  corsOrigins: [
    'http://localhost:3000',
    'https://grant-ai-eight.vercel.app',
    'https://grant-ai-git-main-alex-murphys-projects.vercel.app',
    'https://grant-ai-alex-murphys-projects.vercel.app',
    'https://*.vercel.app'
  ]
};