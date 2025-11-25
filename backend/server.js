// server.js - PRODUCTION READY with Google Gemini AI + Resend Email Integration + USER MANAGEMENT
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Resend } = require('resend');

// -------------------- ENVIRONMENT CONFIGURATION --------------------
// Determine which .env file to load based on NODE_ENV
const envFile = process.env.NODE_ENV === 'development' ? '.env.local' : '.env.production';
require('dotenv').config({ path: path.resolve(process.cwd(), envFile) });

console.log('🚀 Environment Configuration:');
console.log(`   - NODE_ENV: ${process.env.NODE_ENV || 'production'}`);
console.log(`   - Environment File: ${envFile}`);
console.log(`   - MongoDB: ${process.env.MONGO_URI ? 'URI Found' : 'URI Missing'}`);
console.log(`   - JWT Secret: ${process.env.JWT_SECRET ? 'Set' : 'Missing'}`);
console.log(`   - Gemini API: ${process.env.GEMINI_API_KEY ? 'Key Found' : 'Key Missing'}`);
console.log(`   - Resend API: ${process.env.RESEND_API_KEY ? 'Key Found' : 'Key Missing'}`);
console.log(`   - Port: ${process.env.PORT || 5000}`);

const app = express();

// -------------------- GOOGLE GEMINI AI INITIALIZATION --------------------
let genAI;
let model;
try {
  if (process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
    console.log('✅ Google Gemini AI initialized successfully');
  } else {
    console.log('⚠️  GEMINI_API_KEY not found - AI features will be disabled');
  }
} catch (error) {
  console.error('❌ Failed to initialize Google Gemini:', error.message);
}

// -------------------- RESEND EMAIL SERVICE INITIALIZATION --------------------
let resend;
try {
  if (process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
    console.log('✅ Resend Email service initialized successfully');
  } else {
    console.log('⚠️  RESEND_API_KEY not found - Email features will be disabled');
  }
} catch (error) {
  console.error('❌ Failed to initialize Resend email service:', error.message);
}

// -------------------- MIDDLEWARE --------------------
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://grant-ai-eight.vercel.app',
    'https://grant-ai-git-main-alex-murphys-projects.vercel.app',
    'https://grant-ai-alex-murphys-projects.vercel.app',
    'https://*.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin']
}));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.originalUrl}`);
  next();
});

// -------------------- DATABASE CONNECTION --------------------
const mongoURI = process.env.MONGO_URI;
if (!mongoURI) {
  console.error("❌ MONGO_URI not found in environment variables.");
  console.error("   Please check your .env file configuration.");
  process.exit(1);
}

// Enhanced MongoDB connection with better error handling
const connectDB = async () => {
  try {
    console.log(`🔗 Attempting to connect to MongoDB...`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'production'}`);
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ Successfully connected to MongoDB Atlas');
    console.log(`   Database: ${mongoose.connection.db.databaseName}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.error('   Please check your MONGO_URI and network connection');
    process.exit(1);
  }
};

// -------------------- MODELS --------------------
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'Grant Manager' },
  avatar: { type: String },
  approved: { type: Boolean, default: false },
  approvedAt: { type: Date },
  approvedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  emailVerified: { type: Boolean, default: false },
  emailVerificationToken: { type: String },
  emailVerificationExpires: { type: Date },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function(next) {
  // Only hash the password if it's modified (or new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with salt rounds
    const saltRounds = 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
    console.log(`🔐 Password hashed for: ${this.email}`);
    next();
  } catch (error) {
    console.error('❌ Password hashing error:', error);
    next(error);
  }
});

userSchema.methods.correctPassword = async function(candidatePassword) {
  if (!candidatePassword || !this.password) {
    return false;
  }
  
  try {
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    console.log(`🔐 Password check for ${this.email}: ${isMatch ? 'MATCH' : 'NO MATCH'}`);
    return isMatch;
  } catch (error) {
    console.error('❌ Password comparison error:', error);
    return false;
  }
};

const User = mongoose.model('User', userSchema);

// Email Verification Schema
const emailVerificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: '24h' } // Auto-delete after 24 hours
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const EmailVerification = mongoose.model('EmailVerification', emailVerificationSchema);

// Password Reset Schema
const passwordResetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: '1h' } // Auto-delete after 1 hour
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const PasswordReset = mongoose.model('PasswordReset', passwordResetSchema);

// Email Template Schema
const templateSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Template title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  subject: {
    type: String,
    required: [true, 'Email subject is required'],
    trim: true,
    maxlength: [200, 'Subject cannot be more than 200 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['proposal', 'followup', 'meeting', 'thankyou', 'reminder'],
      message: 'Category must be one of: proposal, followup, meeting, thankyou, reminder'
    }
  },
  description: {
    type: String,
    default: '',
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  content: {
    type: String,
    required: [true, 'Template content is required'],
    validate: {
      validator: function(v) {
        return v.length > 0;
      },
      message: 'Template content cannot be empty'
    }
  },
  variables: [{
    type: String,
    trim: true
  }],
  preview: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: 'fas fa-envelope'
  },
  usageCount: {
    type: Number,
    default: 0,
    min: 0
  },
  lastUsed: {
    type: Date,
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for better query performance
templateSchema.index({ category: 1, isActive: 1, createdAt: -1 });
templateSchema.index({ title: 'text', description: 'text', subject: 'text' });
templateSchema.index({ createdBy: 1 });

// Virtual for formatted last used
templateSchema.virtual('formattedLastUsed').get(function() {
  if (!this.lastUsed) return 'Never';
  const now = new Date();
  const diffTime = Math.abs(now - this.lastUsed);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffTime / (1000 * 60));
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return this.lastUsed.toLocaleDateString();
});

// Middleware to update preview if content changes
templateSchema.pre('save', function(next) {
  if (this.isModified('content') && this.content) {
    this.preview = this.content.substring(0, 100) + (this.content.length > 100 ? '...' : '');
  }
  next();
});

// Static method to increment usage
templateSchema.statics.incrementUsage = async function(templateId) {
  return this.findByIdAndUpdate(
    templateId,
    { 
      $inc: { usageCount: 1 },
      lastUsed: new Date()
    },
    { new: true }
  );
};

const Template = mongoose.model('Template', templateSchema);

// Grant Schema
const grantSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Grant title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  funder: {
    type: String,
    required: [true, 'Funder name is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['education', 'environment', 'healthcare', 'arts', 'community', 'technology', 'research', 'youth'],
      message: 'Category must be one of: education, environment, healthcare, arts, community, technology, research, youth'
    }
  },
  deadline: {
    type: Date,
    required: [true, 'Deadline is required']
  },
  maxAward: {
    type: Number,
    required: [true, 'Maximum award amount is required'],
    min: [0, 'Award amount cannot be negative']
  },
  focusAreas: [{
    type: String,
    trim: true
  }],
  eligibility: {
    type: String,
    required: [true, 'Eligibility criteria is required']
  },
  description: {
    type: String,
    default: ''
  },
  url: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'draft'],
    default: 'active'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for better query performance
grantSchema.index({ category: 1, status: 1, deadline: 1 });
grantSchema.index({ title: 'text', funder: 'text', description: 'text' });
grantSchema.index({ createdBy: 1 });

const Grant = mongoose.model('Grant', grantSchema);

const communicationSchema = new mongoose.Schema({
  type: { type: String, enum: ['email', 'call', 'meeting', 'note'], required: true },
  direction: { type: String, enum: ['incoming', 'outgoing'] },
  subject: String,
  content: String,
  preview: String,
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ['sent', 'delivered', 'read', 'completed'], default: 'sent' },
  important: { type: Boolean, default: false },
  duration: String,
  attachments: [String]
});

const socialMediaSchema = new mongoose.Schema({
  platform: String,
  url: String
});

const clientSchema = new mongoose.Schema({
  organizationName: { type: String, required: true },
  primaryContactName: { type: String, required: true },
  titleRole: String,
  emailAddress: { type: String, required: true },
  phoneNumbers: String,
  additionalContactName: String,
  additionalContactTitle: String,
  additionalContactEmail: String,
  additionalContactPhone: String,
  mailingAddress: String,
  website: String,
  socialMediaLinks: [socialMediaSchema],
  taxIdEIN: String,
  organizationType: String,
  missionStatement: String,
  focusAreas: [String],
  serviceArea: String,
  annualBudget: String,
  staffCount: String,
  status: { type: String, enum: ['active', 'inactive', 'prospect'], default: 'active' },
  tags: [String],
  notes: String,
  avatar: String,
  grantsSubmitted: { type: Number, default: 0 },
  grantsAwarded: { type: Number, default: 0 },
  totalFunding: { type: String, default: '$0' },
  lastContact: { type: Date, default: Date.now },
  communicationHistory: [communicationSchema],
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  category: String,
  priority: String,
  referralSource: String,
  grantPotential: String,
  nextFollowUp: Date,
  fundingAreas: [String],
  grantSources: [String]
});

clientSchema.index({ userId: 1 });
clientSchema.index({ emailAddress: 1 });
clientSchema.index({ organizationName: 1 });
clientSchema.index({ status: 1 });
clientSchema.index({ tags: 1 });
clientSchema.index({ createdAt: -1 });

clientSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Client = mongoose.model('Client', clientSchema);

// -------------------- RESEND EMAIL SERVICE FUNCTIONS --------------------
class EmailService {
  constructor() {
    this.resend = resend;
    this.fromEmail = process.env.RESEND_FROM_EMAIL || 'admin@deleuxedesign.com';
    this.fromName = process.env.RESEND_FROM_NAME || 'Grant Funds';
    this.frontendUrl = process.env.FRONTEND_URL || 'https://grant-ai-eight.vercel.app';
  }

  /**
   * Send email verification to user
   */
  async sendVerificationEmail(user, verificationToken) {
    try {
      if (!this.resend) {
        throw new Error('Resend email service not configured');
      }

      const verificationUrl = `${this.frontendUrl}/verify-email?token=${verificationToken}`;
      
      const emailData = {
        from: `${this.fromName} <${this.fromEmail}>`,
        to: user.email,
        subject: 'Verify Your Email - Grant Funds',
        html: this.getVerificationEmailTemplate(user.name, verificationUrl),
        tags: [
          {
            name: 'category',
            value: 'email_verification'
          }
        ]
      };

      const { data, error } = await this.resend.emails.send(emailData);

      if (error) {
        console.error('❌ Resend API error:', error);
        throw new Error(`Failed to send verification email: ${error.message}`);
      }

      console.log(`✅ Verification email sent to: ${user.email}`);
      console.log(`📧 Email ID: ${data?.id}`);

      // Log email sent event
      await this.logEmailEvent('verification_sent', user._id, data?.id);

      return {
        success: true,
        emailId: data?.id,
        message: 'Verification email sent successfully'
      };

    } catch (error) {
      console.error('❌ Error sending verification email:', error);
      
      // Log email failure
      await this.logEmailEvent('verification_failed', user._id, null, error.message);
      
      throw error;
    }
  }

  /**
   * Send welcome email after successful verification
   */
  async sendWelcomeEmail(user) {
    try {
      if (!this.resend) {
        throw new Error('Resend email service not configured');
      }

      const emailData = {
        from: `${this.fromName} <${this.fromEmail}>`,
        to: user.email,
        subject: 'Welcome to Grant Funds! 🚀',
        html: this.getWelcomeEmailTemplate(user.name),
        tags: [
          {
            name: 'category',
            value: 'welcome'
          }
        ]
      };

      const { data, error } = await this.resend.emails.send(emailData);

      if (error) {
        console.error('❌ Resend API error for welcome email:', error);
        
        // Log failure but don't throw error for welcome email
        await this.logEmailEvent('welcome_failed', user._id, null, error.message);
        return {
          success: false,
          error: error.message
        };
      }

      console.log(`✅ Welcome email sent to: ${user.email}`);
      console.log(`📧 Email ID: ${data?.id}`);

      await this.logEmailEvent('welcome_sent', user._id, data?.id);

      return {
        success: true,
        emailId: data?.id,
        message: 'Welcome email sent successfully'
      };

    } catch (error) {
      console.error('❌ Error sending welcome email:', error);
      
      await this.logEmailEvent('welcome_failed', user._id, null, error.message);
      
      // Don't throw error for welcome email failures
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(user, resetToken) {
    try {
      if (!this.resend) {
        throw new Error('Resend email service not configured');
      }

      const resetUrl = `${this.frontendUrl}/reset-password?token=${resetToken}`;
      
      const emailData = {
        from: `${this.fromName} <${this.fromEmail}>`,
        to: user.email,
        subject: 'Reset Your Password - Grant Funds',
        html: this.getPasswordResetTemplate(user.name, resetUrl),
        tags: [
          {
            name: 'category',
            value: 'password_reset'
          }
        ]
      };

      const { data, error } = await this.resend.emails.send(emailData);

      if (error) {
        console.error('❌ Resend API error for password reset:', error);
        throw new Error(`Failed to send password reset email: ${error.message}`);
      }

      console.log(`✅ Password reset email sent to: ${user.email}`);
      console.log(`📧 Email ID: ${data?.id}`);

      await this.logEmailEvent('password_reset_sent', user._id, data?.id);

      return {
        success: true,
        emailId: data?.id,
        message: 'Password reset email sent successfully'
      };

    } catch (error) {
      console.error('❌ Error sending password reset email:', error);
      
      await this.logEmailEvent('password_reset_failed', user._id, null, error.message);
      
      throw error;
    }
  }

  /**
   * Send account approval notification
   */
  async sendApprovalEmail(user) {
    try {
      if (!this.resend) {
        throw new Error('Resend email service not configured');
      }

      const emailData = {
        from: `${this.fromName} <${this.fromEmail}>`,
        to: user.email,
        subject: 'Your Grant Funds Account Has Been Approved! ✅',
        html: this.getApprovalEmailTemplate(user.name),
        tags: [
          {
            name: 'category',
            value: 'account_approval'
          }
        ]
      };

      const { data, error } = await this.resend.emails.send(emailData);

      if (error) {
        console.error('❌ Resend API error for approval email:', error);
        throw new Error(`Failed to send approval email: ${error.message}`);
      }

      console.log(`✅ Approval email sent to: ${user.email}`);
      console.log(`📧 Email ID: ${data?.id}`);

      await this.logEmailEvent('approval_sent', user._id, data?.id);

      return {
        success: true,
        emailId: data?.id,
        message: 'Approval email sent successfully'
      };

    } catch (error) {
      console.error('❌ Error sending approval email:', error);
      
      await this.logEmailEvent('approval_failed', user._id, null, error.message);
      
      throw error;
    }
  }

  /**
   * Send general notification email
   */
  async sendNotificationEmail(user, subject, content) {
    try {
      if (!this.resend) {
        throw new Error('Resend email service not configured');
      }

      const emailData = {
        from: `${this.fromName} <${this.fromEmail}>`,
        to: user.email,
        subject: subject,
        html: this.getNotificationTemplate(user.name, content, subject),
        tags: [
          {
            name: 'category',
            value: 'notification'
          }
        ]
      };

      const { data, error } = await this.resend.emails.send(emailData);

      if (error) {
        console.error('❌ Resend API error for notification email:', error);
        throw new Error(`Failed to send notification email: ${error.message}`);
      }

      console.log(`✅ Notification email sent to: ${user.email}`);
      console.log(`📧 Email ID: ${data?.id}`);

      await this.logEmailEvent('notification_sent', user._id, data?.id);

      return {
        success: true,
        emailId: data?.id,
        message: 'Notification email sent successfully'
      };

    } catch (error) {
      console.error('❌ Error sending notification email:', error);
      
      await this.logEmailEvent('notification_failed', user._id, null, error.message);
      
      throw error;
    }
  }

  /**
   * Verify email service configuration
   */
  async verifyConfiguration() {
    try {
      if (!this.resend) {
        throw new Error('Resend email service not configured');
      }

      // Test Resend API key by making a simple request
      const { data, error } = await this.resend.emails.send({
        from: `${this.fromName} <${this.fromEmail}>`,
        to: 'test@example.com',
        subject: 'Grant Funds - Service Test',
        html: '<p>This is a test email to verify service configuration.</p>'
      });

      if (error) {
        throw new Error(`Resend configuration error: ${error.message}`);
      }

      return {
        success: true,
        service: 'Resend',
        status: 'configured',
        fromEmail: this.fromEmail,
        fromName: this.fromName
      };

    } catch (error) {
      console.error('❌ Email service configuration error:', error);
      return {
        success: false,
        service: 'Resend',
        status: 'failed',
        error: error.message
      };
    }
  }

  // ==================== EMAIL TEMPLATES ====================

  getVerificationEmailTemplate(name, verificationUrl) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email - Grant Funds</title>
          <style>
              body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }
              .container { background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
              .header { background: linear-gradient(135deg, #1a472a, #2d5a3d); color: white; padding: 40px 30px; text-align: center; }
              .content { padding: 40px 30px; }
              .button { display: inline-block; background: #1a472a; color: white; padding: 14px 35px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; padding: 20px; background: #f5f5f5; }
              .code { background: #f8f9fa; padding: 15px; border-radius: 5px; font-family: 'Courier New', monospace; margin: 15px 0; border-left: 4px solid #1a472a; }
              .feature { background: #f8f9fa; padding: 15px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #1a472a; }
              @media (max-width: 600px) { .content { padding: 20px; } .header { padding: 30px 20px; } }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>Welcome to Grant Funds! 🎉</h1>
                  <p>Your AI-Powered Grant Management Platform</p>
              </div>
              <div class="content">
                  <h2>Hello ${name},</h2>
                  <p>Thank you for registering with <strong>Grant Funds</strong>! We're excited to help you streamline your grant management process.</p>
                  
                  <p>To get started and access your dashboard, please verify your email address:</p>
                  
                  <div style="text-align: center; margin: 30px 0;">
                      <a href="${verificationUrl}" class="button">Verify Email Address</a>
                  </div>
                  
                  <p>Or copy and paste this link in your browser:</p>
                  <div class="code">${verificationUrl}</div>
                  
                  <p><strong>This link will expire in 24 hours</strong> for security purposes.</p>
                  
                  <div class="feature">
                      <strong>🚀 What's waiting for you?</strong>
                      <ul style="margin: 10px 0; padding-left: 20px;">
                          <li>AI-powered grant writing assistance</li>
                          <li>Client and grant management tools</li>
                          <li>Professional email templates</li>
                          <li>Funding opportunity tracking</li>
                      </ul>
                  </div>
                  
                  <p>If you have any questions, simply reply to this email - we're here to help!</p>
                  
                  <p>Best regards,<br><strong>The Grant Funds Team</strong></p>
              </div>
              <div class="footer">
                  <p>If you didn't create an account with Grant Funds, please ignore this email.</p>
                  <p>&copy; ${new Date().getFullYear()} Grant Funds. All rights reserved.</p>
                  <p><a href="${this.frontendUrl}" style="color: #1a472a;">Visit Our Website</a></p>
              </div>
          </div>
      </body>
      </html>
    `;
  }

  getWelcomeEmailTemplate(name) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Grant Funds!</title>
          <style>
              body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }
              .container { background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
              .header { background: linear-gradient(135deg, #1a472a, #2d5a3d); color: white; padding: 40px 30px; text-align: center; }
              .content { padding: 40px 30px; }
              .button { display: inline-block; background: #1a472a; color: white; padding: 14px 35px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; padding: 20px; background: #f5f5f5; }
              .feature-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 25px 0; }
              .feature { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; border: 1px solid #e9ecef; }
              .feature-icon { font-size: 24px; margin-bottom: 10px; }
              @media (max-width: 600px) { 
                  .content { padding: 20px; } 
                  .header { padding: 30px 20px; } 
                  .feature-grid { grid-template-columns: 1fr; }
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>Email Verified Successfully! ✅</h1>
                  <p>Welcome to the Grant Funds family!</p>
              </div>
              <div class="content">
                  <h2>Welcome aboard, ${name}! 🎉</h2>
                  <p>Your email has been verified and your Grant Funds account is now fully activated!</p>
                  
                  <div style="text-align: center; margin: 30px 0;">
                      <a href="${this.frontendUrl}/dashboard" class="button">Launch Your Dashboard</a>
                  </div>
                  
                  <div class="feature-grid">
                      <div class="feature">
                          <div class="feature-icon">🤖</div>
                          <strong>AI Writing Assistant</strong>
                          <p style="font-size: 14px; margin: 10px 0 0 0;">Get AI-powered help with proposals and content</p>
                      </div>
                      <div class="feature">
                          <div class="feature-icon">👥</div>
                          <strong>Client Management</strong>
                          <p style="font-size: 14px; margin: 10px 0 0 0;">Organize all client information in one place</p>
                      </div>
                      <div class="feature">
                          <div class="feature-icon">📧</div>
                          <strong>Email Templates</strong>
                          <p style="font-size: 14px; margin: 10px 0 0 0;">Professional templates for grant communications</p>
                      </div>
                      <div class="feature">
                          <div class="feature-icon">💼</div>
                          <strong>Grant Sources</strong>
                          <p style="font-size: 14px; margin: 10px 0 0 0;">Discover and track funding opportunities</p>
                      </div>
                  </div>
                  
                  <p><strong>Need help getting started?</strong></p>
                  <ul style="margin: 15px 0; padding-left: 20px;">
                      <li>Check out our <a href="${this.frontendUrl}/guides" style="color: #1a472a;">getting started guide</a></li>
                      <li>Watch our <a href="${this.frontendUrl}/tutorials" style="color: #1a472a;">video tutorials</a></li>
                      <li>Contact our <a href="mailto:support@grantfunds.com" style="color: #1a472a;">support team</a></li>
                  </ul>
                  
                  <p>We're excited to see the impact you'll make!</p>
                  
                  <p>Happy grant writing!<br><strong>The Grant Funds Team</strong></p>
              </div>
              <div class="footer">
                  <p>&copy; ${new Date().getFullYear()} Grant Funds. All rights reserved.</p>
                  <p><a href="${this.frontendUrl}" style="color: #1a472a;">Visit Website</a> • <a href="${this.frontendUrl}/support" style="color: #1a472a;">Get Help</a></p>
              </div>
          </div>
      </body>
      </html>
    `;
  }

  getPasswordResetTemplate(name, resetUrl) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
          <style>
              body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }
              .container { background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
              .header { background: linear-gradient(135deg, #dc2626, #ef4444); color: white; padding: 40px 30px; text-align: center; }
              .content { padding: 40px 30px; }
              .button { display: inline-block; background: #dc2626; color: white; padding: 14px 35px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; padding: 20px; background: #f5f5f5; }
              .code { background: #f8f9fa; padding: 15px; border-radius: 5px; font-family: 'Courier New', monospace; margin: 15px 0; border-left: 4px solid #dc2626; }
              @media (max-width: 600px) { .content { padding: 20px; } .header { padding: 30px 20px; } }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>Password Reset Request</h1>
                  <p>Grant Funds Account Security</p>
              </div>
              <div class="content">
                  <h2>Hello ${name},</h2>
                  <p>We received a request to reset your password for your Grant Funds account.</p>
                  
                  <div style="text-align: center; margin: 30px 0;">
                      <a href="${resetUrl}" class="button">Reset Your Password</a>
                  </div>
                  
                  <p>Or copy and paste this link in your browser:</p>
                  <div class="code">${resetUrl}</div>
                  
                  <p><strong>This link will expire in 1 hour</strong> for security reasons.</p>
                  
                  <p><strong>Didn't request this change?</strong><br>
                  If you didn't request a password reset, please ignore this email. Your account remains secure.</p>
                  
                  <p>Best regards,<br><strong>The Grant Funds Team</strong></p>
              </div>
              <div class="footer">
                  <p>&copy; ${new Date().getFullYear()} Grant Funds. All rights reserved.</p>
                  <p><a href="${this.frontendUrl}" style="color: #1a472a;">Visit Our Website</a></p>
              </div>
          </div>
      </body>
      </html>
    `;
  }

  getApprovalEmailTemplate(name) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Account Approved</title>
          <style>
              body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }
              .container { background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
              .header { background: linear-gradient(135deg, #059669, #10b981); color: white; padding: 40px 30px; text-align: center; }
              .content { padding: 40px 30px; }
              .button { display: inline-block; background: #059669; color: white; padding: 14px 35px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; padding: 20px; background: #f5f5f5; }
              @media (max-width: 600px) { .content { padding: 20px; } .header { padding: 30px 20px; } }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>Account Approved! ✅</h1>
                  <p>You're ready to get started</p>
              </div>
              <div class="content">
                  <h2>Great news, ${name}!</h2>
                  <p>Your Grant Funds account has been approved and is now fully active!</p>
                  
                  <div style="text-align: center; margin: 30px 0;">
                      <a href="${this.frontendUrl}/dashboard" class="button">Access Your Dashboard</a>
                  </div>
                  
                  <p>You now have full access to all Grant Funds features:</p>
                  <ul style="margin: 15px 0; padding-left: 20px;">
                      <li>AI-powered grant writing tools</li>
                      <li>Client management system</li>
                      <li>Grant tracking and matching</li>
                      <li>Professional communication templates</li>
                      <li>And much more!</li>
                  </ul>
                  
                  <p>If you have any questions or need assistance getting started, don't hesitate to reach out to our support team.</p>
                  
                  <p>Welcome aboard!<br><strong>The Grant Funds Team</strong></p>
              </div>
              <div class="footer">
                  <p>&copy; ${new Date().getFullYear()} Grant Funds. All rights reserved.</p>
                  <p><a href="${this.frontendUrl}" style="color: #1a472a;">Visit Website</a></p>
              </div>
          </div>
      </body>
      </html>
    `;
  }

  getNotificationTemplate(name, content, subject) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
          <style>
              body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }
              .container { background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
              .header { background: linear-gradient(135deg, #1a472a, #2d5a3d); color: white; padding: 30px; text-align: center; }
              .content { padding: 40px 30px; }
              .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; padding: 20px; background: #f5f5f5; }
              @media (max-width: 600px) { .content { padding: 20px; } .header { padding: 20px; } }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>${subject}</h1>
              </div>
              <div class="content">
                  <h2>Hello ${name},</h2>
                  ${content}
                  <p>Best regards,<br><strong>The Grant Funds Team</strong></p>
              </div>
              <div class="footer">
                  <p>&copy; ${new Date().getFullYear()} Grant Funds. All rights reserved.</p>
                  <p><a href="${this.frontendUrl}" style="color: #1a472a;">Visit Our Website</a></p>
              </div>
          </div>
      </body>
      </html>
    `;
  }

  /**
   * Log email events for analytics and debugging
   */
  async logEmailEvent(eventType, userId, emailId = null, error = null) {
    try {
      const logEntry = {
        eventType,
        userId,
        emailId,
        timestamp: new Date(),
        success: !error,
        ...(error && { error })
      };

      console.log('📧 Email Event:', logEntry);

      return true;
    } catch (logError) {
      console.error('❌ Error logging email event:', logError);
      return false;
    }
  }
}

// Initialize email service
const emailService = new EmailService();

// -------------------- AUTH MIDDLEWARE --------------------
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'No token provided' 
      });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error('🔐 Auth middleware error:', error.message);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token' 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: 'Token expired' 
      });
    }
    res.status(401).json({ 
      success: false,
      message: 'Invalid token' 
    });
  }
};

// Optional auth middleware for routes where auth is not required
const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (user) {
        req.user = user;
      }
    }
    next();
  } catch (error) {
    // Continue without user for optional auth
    next();
  }
};

// -------------------- DEBUG ROUTES --------------------

// Diagnostic route to check user accounts
app.get('/api/debug/users', async (req, res) => {
  try {
    const users = await User.find().select('name email role approved createdAt');
    console.log('📊 Current users in database:');
    users.forEach(user => {
      console.log(`   - ${user.email} (${user.role}) - Approved: ${user.approved}`);
    });
    
    res.json({
      success: true,
      users: users,
      count: users.length
    });
  } catch (error) {
    console.error('❌ Debug error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Check admin account status
app.get('/api/debug/admin-check', async (req, res) => {
  try {
    const adminUser = await User.findOne({ email: "admin@deleuxedesign.com" });
    
    if (!adminUser) {
      return res.json({
        success: false,
        message: 'Admin user not found'
      });
    }

    // Test password verification
    const testPassword = "AlexMurphy";
    const isPasswordCorrect = await adminUser.correctPassword(testPassword, adminUser.password);
    
    res.json({
      success: true,
      adminUser: {
        id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role,
        approved: adminUser.approved,
        createdAt: adminUser.createdAt,
        // Don't log the actual password hash for security
        passwordHashExists: !!adminUser.password,
        passwordCorrect: isPasswordCorrect
      },
      testResults: {
        providedPassword: testPassword,
        isPasswordCorrect: isPasswordCorrect
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Force reset admin password
app.post('/api/debug/reset-admin-password', async (req, res) => {
  try {
    const adminUser = await User.findOne({ email: "admin@deleuxedesign.com" });
    
    if (!adminUser) {
      return res.status(404).json({
        success: false,
        message: 'Admin user not found'
      });
    }

    // Set the password directly - this will trigger the pre-save hook to hash it
    adminUser.password = "AlexMurphy";
    await adminUser.save();

    // Verify the new password works
    const isPasswordCorrect = await adminUser.correctPassword("AlexMurphy", adminUser.password);

    res.json({
      success: true,
      message: 'Admin password reset successfully',
      passwordWorks: isPasswordCorrect,
      admin: {
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role,
        approved: adminUser.approved
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Emergency admin reset (use carefully!)
app.post('/api/emergency/admin-reset', async (req, res) => {
  try {
    // Delete existing admin
    await User.deleteOne({ email: "admin@deleuxedesign.com" });
    
    // Create new admin
    const adminUser = new User({
      name: "Alex Murphy",
      email: "admin@deleuxedesign.com",
      password: "AlexMurphy",
      role: "admin",
      avatar: "https://i.pravatar.cc/150?img=1",
      approved: true,
      emailVerified: true
    });
    
    await adminUser.save();
    
    console.log('🆘 EMERGENCY ADMIN RESET COMPLETE');
    
    res.json({
      success: true,
      message: 'Admin account reset successfully',
      credentials: {
        email: "admin@deleuxedesign.com",
        password: "AlexMurphy"
      }
    });
  } catch (error) {
    console.error('❌ Emergency reset error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// -------------------- HELPER FUNCTIONS --------------------
// Helper function to build grant writing prompts
function buildGrantWritingPrompt(prompt, context, tone = 'professional', length = 'medium', format = 'paragraph') {
  const { client, grant, section } = context;
  const toneMap = {
    professional: "professional and formal",
    persuasive: "compelling and persuasive", 
    concise: "concise and direct",
    narrative: "storytelling and engaging"
  };
  const lengthMap = {
    short: "2-3 sentences",
    medium: "1-2 paragraphs", 
    long: "3-4 paragraphs"
  };
  const formatMap = {
    paragraph: "paragraph format",
    bullet: "bullet points",
    structured: "structured with headings"
  };
  let contextInfo = '';
  if (client) {
    contextInfo += `
  CLIENT INFORMATION:
  - Organization: ${client.organizationName || 'Not specified'}
  - Mission: ${client.missionStatement || 'Not specified'}
  - Focus Areas: ${client.focusAreas?.join(', ') || 'Not specified'}`;
  }
  if (grant) {
    contextInfo += `
  GRANT INFORMATION:
  - Grant Title: ${grant.title || 'Not specified'}
  - Funder: ${grant.funder || 'Not specified'}
  - Category: ${grant.category || 'Not specified'}`;
  }
  if (section) {
    contextInfo += `
  SECTION: ${section}`;
  }
  return `
  You are an expert grant writing assistant with extensive experience in nonprofit funding and proposal writing. Generate high-quality grant proposal content with the following specifications:
  ${contextInfo}
  WRITING REQUIREMENTS:
  - Tone: ${toneMap[tone] || 'professional'}
  - Length: ${lengthMap[length] || '1-2 paragraphs'}
  - Format: ${formatMap[format] || 'paragraph format'}
  - Quality: Compelling, well-researched, and persuasive
  SPECIFIC PROMPT: ${prompt}
  IMPORTANT GUIDELINES:
  - Focus on creating content that would be highly effective in securing grant funding
  - Use concrete examples and data where appropriate
  - Ensure alignment with the organization's mission and goals
  - Maintain a professional yet compelling tone
  - Structure the content for maximum impact and readability
  Please generate the requested grant writing content:
  `;
}

// Helper function to handle AI-specific errors
function handleAIError(error) {
  console.error('🤖 AI Service Error:', error);
  if (error.message.includes('API_KEY_INVALID') || error.message.includes('API key not valid')) {
    return {
      userMessage: 'AI service configuration error. Please contact administrator.',
      errorCode: 'INVALID_API_KEY',
      statusCode: 503
    };
  } else if (error.message.includes('quota') || error.message.includes('rate limit')) {
    return {
      userMessage: 'AI service quota exceeded. Please try again later.',
      errorCode: 'QUOTA_EXCEEDED',
      statusCode: 503
    };
  } else if (error.message.includes('safety') || error.message.includes('blocked')) {
    return {
      userMessage: 'Content was blocked for safety reasons. Please modify your prompt.',
      errorCode: 'SAFETY_BLOCKED',
      statusCode: 400
    };
  } else if (error.message.includes('timeout') || error.message.includes('network')) {
    return {
      userMessage: 'AI service timeout. Please try again.',
      errorCode: 'NETWORK_ERROR',
      statusCode: 503
    };
  } else {
    return {
      userMessage: 'Failed to process AI request. Please try again.',
      errorCode: 'AI_SERVICE_ERROR',
      statusCode: 500
    };
  }
}

// -------------------- DEMO DATA --------------------
async function createDemoUsers() {
  try {
    const demoUsers = [
      {
        name: "Demo User",
        email: "demo@grantfunds.com",
        password: "demo123",
        role: "Grant Manager",
        avatar: "https://i.pravatar.cc/150?img=45",
        approved: true,
        emailVerified: true
      },
      // Admin account - Alex Murphy
      {
        name: "Alex Murphy",
        email: "admin@deleuxedesign.com",
        password: "AlexMurphy",
        role: "admin",
        avatar: "https://i.pravatar.cc/150?img=1",
        approved: true,
        emailVerified: true
      }
    ];
    
    for (const userData of demoUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        const user = new User(userData);
        await user.save();
        console.log(`✅ ${userData.role} user created: ${userData.email}`);
      } else {
        // Update existing user to ensure they have admin privileges
        if (userData.role === 'admin') {
          await User.findOneAndUpdate(
            { email: userData.email },
            { 
              role: 'admin',
              approved: true,
              name: userData.name
            }
          );
          console.log(`✅ Admin user updated: ${userData.email}`);
        } else {
          console.log(`ℹ️  User already exists: ${userData.email}`);
        }
      }
    }
  } catch (error) {
    console.error('❌ Error creating demo users:', error);
  }
}

async function createDemoClients() {
  try {
    const demoUser = await User.findOne({ email: "demo@grantfunds.com" });
    if (!demoUser) {
      console.log('❌ Demo user not found for creating demo clients');
      return;
    }
    const existingClients = await Client.find({ userId: demoUser._id });
    if (existingClients.length > 0) {
      console.log(`ℹ️  ${existingClients.length} demo clients already exist`);
      return;
    }
    const demoClients = [
      {
        organizationName: 'GreenTech Initiative',
        primaryContactName: 'Sarah Chen',
        titleRole: 'Executive Director',
        emailAddress: 'sarah.chen@greentech.org',
        phoneNumbers: '+1 (555) 123-4567',
        status: 'active',
        tags: ['Environment', 'Technology', 'Non-Profit'],
        notes: 'Very responsive and organized. Great partnership potential.',
        grantsSubmitted: 12,
        grantsAwarded: 8,
        totalFunding: '$450,000',
        avatar: 'https://i.pravatar.cc/150?img=1',
        userId: demoUser._id
      },
      {
        organizationName: 'Community Health Alliance',
        primaryContactName: 'David Kim',
        titleRole: 'Program Director',
        emailAddress: 'david.kim@communityhealth.org',
        phoneNumbers: '+1 (555) 987-6543',
        status: 'active',
        tags: ['Healthcare', 'Community', 'Non-Profit'],
        notes: 'Focuses on healthcare access in underserved communities.',
        grantsSubmitted: 8,
        grantsAwarded: 5,
        totalFunding: '$280,000',
        avatar: 'https://i.pravatar.cc/150?img=32',
        userId: demoUser._id
      },
      {
        organizationName: 'Future Leaders Foundation',
        primaryContactName: 'Maria Rodriguez',
        titleRole: 'Development Director',
        emailAddress: 'maria.rodriguez@futureleaders.org',
        phoneNumbers: '+1 (555) 456-7890',
        status: 'prospect',
        tags: ['Education', 'Youth', 'Mentorship'],
        notes: 'New prospect - follow up in 2 weeks.',
        grantsSubmitted: 3,
        grantsAwarded: 1,
        totalFunding: '$75,000',
        avatar: 'https://i.pravatar.cc/150?img=28',
        userId: demoUser._id
      }
    ];
    for (const clientData of demoClients) {
      const client = new Client(clientData);
      await client.save();
      console.log(`✅ Demo client created: ${clientData.organizationName}`);
    }
    console.log(`🎉 Created ${demoClients.length} demo clients`);
  } catch (error) {
    console.error('❌ Error creating demo clients:', error);
  }
}

async function createDemoTemplates() {
  try {
    const demoUser = await User.findOne({ email: "demo@grantfunds.com" });
    if (!demoUser) {
      console.log('❌ Demo user not found for creating demo templates');
      return;
    }
    const existingTemplates = await Template.find({ createdBy: demoUser._id });
    if (existingTemplates.length > 0) {
      console.log(`ℹ️  ${existingTemplates.length} demo templates already exist`);
      return;
    }
    const demoTemplates = [
      {
        title: 'Initial Grant Inquiry',
        subject: 'Grant Opportunity Inquiry - [Client Name]',
        category: 'proposal',
        description: 'Template for initial contact about grant opportunities',
        content: `Dear [Client Name],
  I hope this email finds you well. I am writing to inquire about potential grant opportunities that may be available for your organization.
  Based on your work in [Field/Area], I believe there are several funding opportunities that could be a great fit. I would be happy to discuss:
  • Current grant opportunities that align with your mission
  • Application timelines and requirements
  • How we can collaborate to strengthen your proposals
  Please let me know if you would be available for a brief call next week to explore these possibilities further.
  Best regards,
  [Your Name]`,
        icon: 'fas fa-handshake',
        usageCount: 45,
        lastUsed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        createdBy: demoUser._id
      },
      {
        title: 'Proposal Follow-up',
        subject: 'Follow-up: [Grant Name] Proposal Submission',
        category: 'followup',
        description: 'Follow up on submitted grant proposal',
        content: `Dear [Client Name],
  I wanted to follow up on the grant proposal we submitted on [Date] for the [Grant Name] opportunity.
  I've been monitoring the application status and wanted to check if you have received any updates or if there are any additional materials needed from our end.
  If you have any questions or would like to discuss next steps, please don't hesitate to reach out.
  Thank you for your partnership in this important work.
  Best regards,
  [Your Name]`,
        icon: 'fas fa-sync',
        usageCount: 32,
        lastUsed: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        createdBy: demoUser._id
      },
      {
        title: 'Meeting Request',
        subject: 'Grant Strategy Meeting Request',
        category: 'meeting',
        description: 'Request a meeting to discuss grant strategy',
        content: `Dear [Client Name],
  I would like to schedule a meeting to discuss your grant strategy and explore upcoming funding opportunities that could support your important work.
  During our meeting, we could cover:
  • Review of current grant pipeline
  • Upcoming deadlines and opportunities
  • Strategy for maximizing funding success
  • Any specific challenges or questions you may have
  Please let me know what time works best for you next week. I am available [Available Times].
  Looking forward to our conversation.
  Best regards,
  [Your Name]`,
        icon: 'fas fa-calendar',
        usageCount: 28,
        lastUsed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        createdBy: demoUser._id
      },
      {
        title: 'Thank You Note',
        subject: 'Thank You - [Topic] Discussion',
        category: 'thankyou',
        description: 'Express gratitude after a meeting or collaboration',
        content: `Dear [Client Name],
  Thank you for your time today. I truly enjoyed our conversation about [Topic] and am excited about the potential opportunities we discussed.
  I appreciate you sharing insights about [Specific Point] and look forward to exploring how we can work together to achieve your funding goals.
  Please don't hesitate to reach out if you have any additional questions in the meantime.
  Warm regards,
  [Your Name]`,
        icon: 'fas fa-heart',
        usageCount: 22,
        lastUsed: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        createdBy: demoUser._id
      },
      {
        title: 'Deadline Reminder',
        subject: 'Reminder: [Grant Name] Deadline - [Date]',
        category: 'reminder',
        description: 'Remind clients about upcoming grant deadlines',
        content: `Dear [Client Name],
  This is a friendly reminder about the upcoming deadline for [Grant Name] on [Date].
  To ensure we have enough time to prepare a strong application, please make sure to:
  • Review the attached materials by [Review Date]
  • Provide any necessary documents by [Document Deadline]
  • Schedule a final review session if needed
  The deadline is approaching quickly, so let's make sure we're on track. Please let me know if you have any questions or need assistance with any part of the process.
  Best regards,
  [Your Name]`,
        icon: 'fas fa-bell',
        usageCount: 18,
        lastUsed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        createdBy: demoUser._id
      }
    ];
    for (const templateData of demoTemplates) {
      const template = new Template(templateData);
      await template.save();
      console.log(`✅ Demo template created: ${templateData.title}`);
    }
    console.log(`🎉 Created ${demoTemplates.length} demo templates`);
  } catch (error) {
    console.error('❌ Error creating demo templates:', error);
  }
}

async function createDemoGrants() {
  try {
    const demoUser = await User.findOne({ email: "demo@grantfunds.com" });
    if (!demoUser) {
      console.log('❌ Demo user not found for creating demo grants');
      return;
    }
    const existingGrants = await Grant.find({ createdBy: demoUser._id });
    if (existingGrants.length > 0) {
      console.log(`ℹ️  ${existingGrants.length} demo grants already exist`);
      return;
    }
    const demoGrants = [
      {
        title: 'NSF STEM Education Grant',
        funder: 'National Science Foundation',
        category: 'education',
        deadline: new Date('2024-03-15'),
        maxAward: 500000,
        focusAreas: ['STEM Education', 'K-12', 'Underserved Communities'],
        eligibility: 'Non-profit organizations, educational institutions',
        description: 'Funding for innovative STEM education programs targeting underserved youth populations.',
        url: 'https://www.nsf.gov/funding/',
        status: 'active',
        createdBy: demoUser._id
      },
      {
        title: 'Environmental Conservation Program',
        funder: 'Environmental Protection Agency',
        category: 'environment',
        deadline: new Date('2024-04-20'),
        maxAward: 750000,
        focusAreas: ['Conservation', 'Climate Change', 'Sustainability'],
        eligibility: 'Non-profit organizations, government agencies',
        description: 'Grants for projects focused on environmental conservation and climate change mitigation.',
        url: 'https://www.epa.gov/grants',
        status: 'active',
        createdBy: demoUser._id
      },
      {
        title: 'Community Health Initiative',
        funder: 'Department of Health and Human Services',
        category: 'healthcare',
        deadline: new Date('2024-05-30'),
        maxAward: 1000000,
        focusAreas: ['Public Health', 'Community Wellness', 'Healthcare Access'],
        eligibility: 'Non-profit organizations, healthcare providers',
        description: 'Funding for community health programs improving access to healthcare services.',
        url: 'https://www.hhs.gov/grants/',
        status: 'active',
        createdBy: demoUser._id
      },
      {
        title: 'Youth Development Fund',
        funder: 'Department of Education',
        category: 'youth',
        deadline: new Date('2024-06-15'),
        maxAward: 300000,
        focusAreas: ['After-school Programs', 'Mentorship', 'Career Readiness'],
        eligibility: 'Non-profit organizations, schools, community centers',
        description: 'Support for youth development programs focusing on education and career readiness.',
        url: 'https://www.ed.gov/funding',
        status: 'active',
        createdBy: demoUser._id
      },
      {
        title: 'Arts and Culture Grant',
        funder: 'National Endowment for the Arts',
        category: 'arts',
        deadline: new Date('2024-07-01'),
        maxAward: 250000,
        focusAreas: ['Arts Education', 'Cultural Programs', 'Community Arts'],
        eligibility: 'Non-profit organizations, arts institutions',
        description: 'Funding for arts and cultural programs that engage communities.',
        url: 'https://www.arts.gov/grants',
        status: 'active',
        createdBy: demoUser._id
      }
    ];
    for (const grantData of demoGrants) {
      const grant = new Grant(grantData);
      await grant.save();
      console.log(`✅ Demo grant created: ${grantData.title}`);
    }
    console.log(`🎉 Created ${demoGrants.length} demo grants`);
  } catch (error) {
    console.error('❌ Error creating demo grants:', error);
  }
}

// -------------------- USER MANAGEMENT ROUTES --------------------
// Get all users (for user management)
app.get('/api/users', authMiddleware, async (req, res) => {
  try {
    const { search, page = 1, limit = 50 } = req.query;
    
    // Build search query
    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const users = await User.find(query)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error while fetching users' 
    });
  }
});

// Get user by ID
app.get('/api/users/:id', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('❌ Error fetching user:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error while fetching user' 
    });
  }
});

// Update user
app.put('/api/users/:id', authMiddleware, async (req, res) => {
  try {
    const { name, email, role, isActive } = req.body;
    
    // Don't allow users to change their own role unless you're admin
    const updateData = { name, email };
    if (role) updateData.role = role;
    if (typeof isActive !== 'undefined') updateData.isActive = isActive;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    console.error('❌ Error updating user:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false,
        error: error.message 
      });
    }
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false,
        error: 'Email already exists' 
      });
    }
    res.status(500).json({ 
      success: false,
      error: 'Server error while updating user' 
    });
  }
});

// Delete user
app.delete('/api/users/:id', authMiddleware, async (req, res) => {
  try {
    // Prevent users from deleting themselves
    if (req.params.id === req.user.id) {
      return res.status(400).json({ 
        success: false,
        error: 'Cannot delete your own account' 
      });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting user:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error while deleting user' 
    });
  }
});

// -------------------- ROUTES --------------------
// Health check with detailed environment info
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Grant AI backend is running successfully 🚀',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    ai: {
      gemini: process.env.GEMINI_API_KEY ? 'Available' : 'Not Configured',
      status: process.env.GEMINI_API_KEY ? 'Ready' : 'Disabled'
    },
    email: {
      resend: process.env.RESEND_API_KEY ? 'Configured' : 'Not Configured',
      status: resend ? 'Ready' : 'Disabled'
    },
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    version: '1.0.0',
    nodeVersion: process.version,
    platform: process.platform
  });
});

// Test endpoint for connection testing
app.get('/api/test-connection', (req, res) => {
  res.json({
    success: true,
    message: `Backend connection successful - ${process.env.NODE_ENV || 'production'} environment`,
    environment: process.env.NODE_ENV || 'production',
    timestamp: new Date().toISOString()
  });
});

// -------------------- EMAIL ROUTES --------------------
// Verify email configuration
app.get('/api/email/verify-config', async (req, res) => {
  try {
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

// Send verification email
app.post('/api/auth/send-verification-email', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    
    // Generate verification token
    const crypto = require('crypto');
    const verificationToken = crypto.randomBytes(32).toString('hex');
    
    // Save verification token to database
    const emailVerification = new EmailVerification({
      userId: user._id,
      token: verificationToken,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    });
    await emailVerification.save();
    
    // Send verification email
    const result = await emailService.sendVerificationEmail(user, verificationToken);
    
    res.json({
      success: true,
      message: 'Verification email sent successfully',
      data: result
    });
  } catch (error) {
    console.error('❌ Send verification email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send verification email',
      error: error.message
    });
  }
});

// Verify email endpoint
app.post('/api/auth/verify-email', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required'
      });
    }
    
    // Find and validate token
    const emailVerification = await EmailVerification.findOne({ 
      token,
      expiresAt: { $gt: new Date() }
    });
    
    if (!emailVerification) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }
    
    // Update user email verification status
    const user = await User.findByIdAndUpdate(
      emailVerification.userId,
      { 
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null
      },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Delete used verification token
    await EmailVerification.deleteOne({ _id: emailVerification._id });
    
    // Send welcome email
    await emailService.sendWelcomeEmail(user);
    
    res.json({
      success: true,
      message: 'Email verified successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified
      }
    });
  } catch (error) {
    console.error('❌ Verify email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify email',
      error: error.message
    });
  }
});

// Forgot password endpoint
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal whether email exists
      return res.json({
        success: true,
        message: 'If the email exists, a password reset link has been sent'
      });
    }
    
    // Generate reset token
    const crypto = require('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Save reset token to database
    const passwordReset = new PasswordReset({
      userId: user._id,
      token: resetToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
    });
    await passwordReset.save();
    
    // Send password reset email
    await emailService.sendPasswordResetEmail(user, resetToken);
    
    res.json({
      success: true,
      message: 'If the email exists, a password reset link has been sent'
    });
  } catch (error) {
    console.error('❌ Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process password reset request',
      error: error.message
    });
  }
});

// Reset password endpoint
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    
    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: 'Token and password are required'
      });
    }
    
    // Find and validate token
    const passwordReset = await PasswordReset.findOne({ 
      token,
      expiresAt: { $gt: new Date() }
    });
    
    if (!passwordReset) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }
    
    // Update user password
    const user = await User.findById(passwordReset.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    user.password = password;
    await user.save();
    
    // Delete used reset token
    await PasswordReset.deleteOne({ _id: passwordReset._id });
    
    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('❌ Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password',
      error: error.message
    });
  }
});

// -------------------- AUTHENTICATION ROUTES (UPDATED) --------------------
// Login with detailed error reporting
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log(`🔐 Login attempt for: ${email}`);
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Email and password are required',
        errorCode: 'MISSING_CREDENTIALS'
      });
    }

    // Check database connection first
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database not connected',
        errorCode: 'DATABASE_ERROR'
      });
    }

    const user = await User.findOne({ email });
    
    if (!user) {
      console.log(`❌ Login failed: User not found - ${email}`);
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password',
        errorCode: 'USER_NOT_FOUND'
      });
    }

    // Check password
    const isPasswordValid = await user.correctPassword(password);
    
    if (!isPasswordValid) {
      console.log(`❌ Login failed: Invalid password for - ${email}`);
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password',
        errorCode: 'INVALID_PASSWORD'
      });
    }

    // Check if user is approved
    if (!user.approved) {
      console.log(`❌ Login blocked: User not approved - ${email}`);
      return res.status(403).json({
        success: false,
        message: 'Account pending approval. Please contact support.',
        errorCode: 'ACCOUNT_PENDING_APPROVAL',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          approved: user.approved
        }
      });
    }

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    
    console.log(`✅ Login successful: ${email} (${user.role})`);
    
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        approved: user.approved
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during login',
      error: error.message,
      errorCode: 'SERVER_ERROR'
    });
  }
});

// Register with approval workflow and Resend email
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ 
        success: false,
        message: 'User already exists with this email' 
      });

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Name, email, and password are required' 
      });
    }
    if (password.length < 6) {
      return res.status(400).json({ 
        success: false,
        message: 'Password must be at least 6 characters' 
      });
    }

    // Check if it's the specific admin email
    const isAdminEmail = email === "admin@deleuxedesign.com";
    
    // Create user with approved status
    const newUser = await User.create({
      name,
      email,
      password,
      avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
      approved: isAdminEmail,
      role: isAdminEmail ? 'admin' : 'Grant Manager'
    });

    // Send confirmation email using Resend
    if (!isAdminEmail && emailService.resend) {
      try {
        await emailService.sendNotificationEmail(
          newUser,
          '✅ Welcome! Your Account Is Pending Approval',
          `
            <p>Thank you for registering with <strong>Grant Funds</strong>!</p>
            <p>Your account is currently <strong>pending approval</strong>. We will review your request shortly.</p>
            <p>You'll receive another email once your account is activated.</p>
            <p>If you have any questions, please contact our support team.</p>
          `
        );
        console.log(`📧 Confirmation email sent to: ${email}`);
      } catch (emailError) {
        console.warn('⚠️ Failed to send confirmation email:', emailError.message);
      }
    }

    // Issue token only if approved (admin or auto-approved)
    let token = null;
    if (newUser.approved) {
      token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    }

    res.status(201).json({
      success: true,
      message: isAdminEmail 
        ? 'Admin account created successfully!' 
        : 'Registration successful! Please check your email for next steps.',
      token,
      user: newUser.approved ? {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        avatar: newUser.avatar
      } : null
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during registration',
      error: error.message 
    });
  }
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  res.json({ 
    success: true, 
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      avatar: req.user.avatar
    }
  });
});

// Quick admin setup route (for development only)
app.post('/api/admin/setup', async (req, res) => {
  try {
    // In production, you might want to restrict this route
    if (process.env.NODE_ENV === 'production' && !req.headers['x-admin-secret']) {
      return res.status(403).json({
        success: false,
        message: 'Admin setup not allowed in production without secret'
      });
    }

    const adminData = {
      name: "Alex Murphy",
      email: "admin@deleuxedesign.com",
      password: "AlexMurphy",
      role: "admin",
      avatar: "https://i.pravatar.cc/150?img=1",
      approved: true,
      emailVerified: true
    };

    // Check if admin already exists
    let adminUser = await User.findOne({ email: adminData.email });
    
    if (adminUser) {
      // Update existing admin
      adminUser.name = adminData.name;
      adminUser.role = adminData.role;
      adminUser.approved = adminData.approved;
      adminUser.avatar = adminData.avatar;
      adminUser.password = adminData.password;
      await adminUser.save();
      
      console.log(`✅ Admin account updated: ${adminData.email}`);
    } else {
      // Create new admin
      adminUser = new User(adminData);
      await adminUser.save();
      console.log(`✅ Admin account created: ${adminData.email}`);
    }

    res.json({
      success: true,
      message: 'Admin account setup successfully',
      admin: {
        id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role
      }
    });
  } catch (error) {
    console.error('❌ Admin setup error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to setup admin account',
      error: error.message
    });
  }
});

// -------------------- ADMIN ROUTES --------------------

// Admin middleware - only allow approved admin users
const adminMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'No token provided' 
      });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    // Check if user is admin and approved
    if (user.role !== 'admin' || !user.approved) {
      return res.status(403).json({ 
        success: false,
        message: 'Admin access required' 
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('🔐 Admin middleware error:', error.message);
    res.status(401).json({ 
      success: false,
      message: 'Invalid token' 
    });
  }
};

// Get all pending users (admin only)
app.get('/api/admin/pending-users', adminMiddleware, async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    
    let query = { 
      approved: false,
      role: { $ne: 'admin' } // Don't show pending admins
    };
    
    // Search in name or email
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 },
      select: '-password' // Exclude password
    };
    
    // Using mongoose directly since we don't have pagination plugin
    const skip = (options.page - 1) * options.limit;
    const users = await User.find(query)
      .select(options.select)
      .sort(options.sort)
      .skip(skip)
      .limit(options.limit);
    
    const total = await User.countDocuments(query);
    
    res.json({
      success: true,
      data: users,
      pagination: {
        page: options.page,
        limit: options.limit,
        total,
        pages: Math.ceil(total / options.limit)
      }
    });
  } catch (error) {
    console.error('❌ Get pending users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending users',
      error: error.message
    });
  }
});

// Get user statistics (admin only)
app.get('/api/admin/stats', adminMiddleware, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const pendingUsers = await User.countDocuments({ approved: false });
    const approvedUsers = await User.countDocuments({ approved: true });
    const adminUsers = await User.countDocuments({ role: 'admin' });
    
    // Recent registrations (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentRegistrations = await User.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });
    
    res.json({
      success: true,
      stats: {
        totalUsers,
        pendingUsers,
        approvedUsers,
        adminUsers,
        recentRegistrations
      }
    });
  } catch (error) {
    console.error('❌ Get admin stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin statistics',
      error: error.message
    });
  }
});

// Approve user account (admin only)
app.post('/api/admin/users/:id/approve', adminMiddleware, async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Find the user to approve
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (user.approved) {
      return res.status(400).json({
        success: false,
        message: 'User is already approved'
      });
    }
    
    // Update user to approved
    user.approved = true;
    user.approvedAt = new Date();
    user.approvedBy = req.user._id;
    await user.save();
    
    console.log(`✅ User approved: ${user.email} by admin: ${req.user.email}`);
    
    // Send approval email
    if (emailService.resend) {
      try {
        await emailService.sendApprovalEmail(user);
        console.log(`📧 Approval email sent to: ${user.email}`);
      } catch (emailError) {
        console.warn('⚠️ Failed to send approval email:', emailError.message);
      }
    }
    
    res.json({
      success: true,
      message: 'User approved successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        approved: user.approved,
        approvedAt: user.approvedAt
      }
    });
  } catch (error) {
    console.error('❌ Approve user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve user',
      error: error.message
    });
  }
});

// Bulk approve users (admin only)
app.post('/api/admin/users/bulk-approve', adminMiddleware, async (req, res) => {
  try {
    const { userIds } = req.body;
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'User IDs array is required'
      });
    }
    
    // Find all pending users from the provided IDs
    const usersToApprove = await User.find({
      _id: { $in: userIds },
      approved: false
    });
    
    if (usersToApprove.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No pending users found to approve'
      });
    }
    
    // Update all users to approved
    const updateResult = await User.updateMany(
      { _id: { $in: usersToApprove.map(u => u._id) } },
      { 
        $set: { 
          approved: true,
          approvedAt: new Date(),
          approvedBy: req.user._id
        } 
      }
    );
    
    console.log(`✅ Bulk approved ${updateResult.modifiedCount} users by admin: ${req.user.email}`);
    
    // Send approval emails
    if (emailService.resend) {
      for (const user of usersToApprove) {
        try {
          await emailService.sendApprovalEmail(user);
          console.log(`📧 Approval email sent to: ${user.email}`);
        } catch (emailError) {
          console.warn(`⚠️ Failed to send approval email to ${user.email}:`, emailError.message);
        }
      }
    }
    
    res.json({
      success: true,
      message: `Successfully approved ${updateResult.modifiedCount} users`,
      approvedCount: updateResult.modifiedCount
    });
  } catch (error) {
    console.error('❌ Bulk approve users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bulk approve users',
      error: error.message
    });
  }
});

// Reject user account (admin only)
app.post('/api/admin/users/:id/reject', adminMiddleware, async (req, res) => {
  try {
    const userId = req.params.id;
    const { reason } = req.body;
    
    // Find the user to reject
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (user.approved) {
      return res.status(400).json({
        success: false,
        message: 'Cannot reject an approved user'
      });
    }
    
    // Store rejection info before deleting
    const rejectionInfo = {
      email: user.email,
      name: user.name,
      rejectedAt: new Date(),
      rejectedBy: req.user._id,
      reason: reason || 'No reason provided'
    };
    
    console.log(`❌ User rejected: ${user.email} by admin: ${req.user.email}`, { reason });
    
    // Delete the user account
    await User.findByIdAndDelete(userId);
    
    // Send rejection email if reason provided
    if (emailService.resend && reason) {
      try {
        await emailService.sendNotificationEmail(
          { email: user.email, name: user.name },
          'Account Registration Update - Grant Funds',
          `
            <p>Dear ${user.name},</p>
            <p>Thank you for your interest in Grant Funds. After reviewing your registration, we're unable to approve your account at this time.</p>
            <p><strong>Reason:</strong> ${reason}</p>
            <p>If you believe this was a mistake or would like to discuss further, please contact our support team.</p>
            <p>Best regards,<br><strong>The Grant Funds Team</strong></p>
          `
        );
        console.log(`📧 Rejection email sent to: ${user.email}`);
      } catch (emailError) {
        console.warn('⚠️ Failed to send rejection email:', emailError.message);
      }
    }
    
    res.json({
      success: true,
      message: 'User rejected successfully',
      rejection: rejectionInfo
    });
  } catch (error) {
    console.error('❌ Reject user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject user',
      error: error.message
    });
  }
});

// Get all users with pagination and filtering (admin only)
app.get('/api/admin/users', adminMiddleware, async (req, res) => {
  try {
    const { 
      search, 
      status, // 'pending', 'approved', 'all'
      role,
      page = 1, 
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    let query = {};
    
    // Filter by approval status
    if (status === 'pending') {
      query.approved = false;
    } else if (status === 'approved') {
      query.approved = true;
    }
    
    // Filter by role
    if (role && role !== 'all') {
      query.role = role;
    }
    
    // Search in name or email
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const users = await User.find(query)
      .select('-password')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('approvedBy', 'name email');
    
    const total = await User.countDocuments(query);
    
    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('❌ Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
});

// Make user admin (admin only)
app.post('/api/admin/users/:id/make-admin', adminMiddleware, async (req, res) => {
  try {
    const userId = req.params.id;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'User is already an admin'
      });
    }
    
    user.role = 'admin';
    user.approved = true; // Auto-approve when making admin
    user.approvedAt = new Date();
    user.approvedBy = req.user._id;
    await user.save();
    
    console.log(`👑 User promoted to admin: ${user.email} by admin: ${req.user.email}`);
    
    res.json({
      success: true,
      message: 'User promoted to admin successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        approved: user.approved
      }
    });
  } catch (error) {
    console.error('❌ Make user admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to make user admin',
      error: error.message
    });
  }
});

// Email Templates Routes
app.get('/api/templates', optionalAuthMiddleware, async (req, res) => {
  try {
    console.log('🔍 GET /api/templates - Processing request');
    const { category, search } = req.query;
    let query = { isActive: true };
    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }
    // Search in title, description, or subject
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } }
      ];
    }
    // If user is authenticated, only show their templates
    if (req.user) {
      query.createdBy = req.user._id;
      console.log(`🔐 Fetching templates for authenticated user: ${req.user.email}`);
    } else {
      // For unauthenticated users, show demo templates
      const demoUser = await User.findOne({ email: "demo@grantfunds.com" });
      if (demoUser) {
        query.createdBy = demoUser._id;
        console.log('👤 Fetching demo templates for unauthenticated user');
      } else {
        console.log('❌ No demo user found, returning empty array');
        return res.json({
          success: true,
          count: 0,
          data: [],
          user: null
        });
      }
    }
    const templates = await Template.find(query).sort({ createdAt: -1 });
    console.log(`✅ Found ${templates.length} templates`);
    res.json({
      success: true,
      count: templates.length,
      data: templates,
      user: req.user ? {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        avatar: req.user.avatar
      } : null
    });
  } catch (error) {
    console.error('❌ Error fetching templates:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching templates',
      error: error.message
    });
  }
});

app.get('/api/templates/:id', optionalAuthMiddleware, async (req, res) => {
  try {
    console.log(`🔍 GET /api/templates/${req.params.id}`);
    let query = { _id: req.params.id, isActive: true };
    // If user is authenticated, only show their templates
    if (req.user) {
      query.createdBy = req.user._id;
    } else {
      // For unauthenticated users, show demo templates
      const demoUser = await User.findOne({ email: "demo@grantfunds.com" });
      if (demoUser) {
        query.createdBy = demoUser._id;
      }
    }
    const template = await Template.findOne(query);
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }
    res.json({
      success: true,
      data: template,
      user: req.user ? {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        avatar: req.user.avatar
      } : null
    });
  } catch (error) {
    console.error('❌ Error fetching template:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid template ID format'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error fetching template',
      error: error.message
    });
  }
});

app.post('/api/templates', authMiddleware, async (req, res) => {
  try {
    console.log('🔍 POST /api/templates - Creating template');
    const {
      title,
      subject,
      category,
      description,
      content,
      variables,
      icon
    } = req.body;
    // Basic validation
    if (!title || !subject || !category || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title, subject, category, and content are required'
      });
    }
    // Check if template with same title already exists
    const existingTemplate = await Template.findOne({ 
      title: title.trim(),
      isActive: true,
      createdBy: req.user._id
    });
    if (existingTemplate) {
      return res.status(409).json({
        success: false,
        message: 'A template with this title already exists'
      });
    }
    const templateData = {
      title: title.trim(),
      subject: subject.trim(),
      category,
      description: description?.trim() || '',
      content: content.trim(),
      variables: variables || [],
      icon: icon || 'fas fa-envelope',
      createdBy: req.user._id
    };
    const template = new Template(templateData);
    const savedTemplate = await template.save();
    console.log(`✅ Template created: ${savedTemplate.title}`);
    res.status(201).json({
      success: true,
      message: 'Template created successfully',
      data: savedTemplate,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        avatar: req.user.avatar
      }
    });
  } catch (error) {
    console.error('❌ Error creating template:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error creating template',
      error: error.message
    });
  }
});

app.put('/api/templates/:id', authMiddleware, async (req, res) => {
  try {
    console.log(`🔍 PUT /api/templates/${req.params.id}`);
    const {
      title,
      subject,
      category,
      description,
      content,
      variables,
      icon
    } = req.body;
    // Check if template exists and is active
    const existingTemplate = await Template.findOne({
      _id: req.params.id,
      isActive: true,
      createdBy: req.user._id
    });
    if (!existingTemplate) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }
    // Check for duplicate title (excluding current template)
    if (title && title !== existingTemplate.title) {
      const duplicateTemplate = await Template.findOne({
        title: title.trim(),
        isActive: true,
        createdBy: req.user._id,
        _id: { $ne: req.params.id }
      });
      if (duplicateTemplate) {
        return res.status(409).json({
          success: false,
          message: 'A template with this title already exists'
        });
      }
    }
    const updateData = {};
    if (title) updateData.title = title.trim();
    if (subject) updateData.subject = subject.trim();
    if (category) updateData.category = category;
    if (description !== undefined) updateData.description = description.trim();
    if (content) updateData.content = content.trim();
    if (variables) updateData.variables = variables;
    if (icon) updateData.icon = icon;
    const updatedTemplate = await Template.findByIdAndUpdate(
      req.params.id,
      updateData,
      { 
        new: true, 
        runValidators: true 
      }
    );
    console.log(`✅ Template updated: ${updatedTemplate.title}`);
    res.json({
      success: true,
      message: 'Template updated successfully',
      data: updatedTemplate,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        avatar: req.user.avatar
      }
    });
  } catch (error) {
    console.error('❌ Error updating template:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid template ID format'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error updating template',
      error: error.message
    });
  }
});

app.delete('/api/templates/:id', authMiddleware, async (req, res) => {
  try {
    console.log(`🔍 DELETE /api/templates/${req.params.id}`);
    const template = await Template.findOne({
      _id: req.params.id,
      isActive: true,
      createdBy: req.user._id
    });
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }
    // Soft delete by setting isActive to false
    await Template.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    console.log(`✅ Template deleted: ${template.title}`);
    res.json({
      success: true,
      message: 'Template deleted successfully',
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        avatar: req.user.avatar
      }
    });
  } catch (error) {
    console.error('❌ Error deleting template:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid template ID format'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error deleting template',
      error: error.message
    });
  }
});

app.patch('/api/templates/:id/usage', optionalAuthMiddleware, async (req, res) => {
  try {
    console.log(`🔍 PATCH /api/templates/${req.params.id}/usage`);
    let query = { 
      _id: req.params.id,
      isActive: true 
    };
    // If user is authenticated, only allow usage of their templates
    if (req.user) {
      query.createdBy = req.user._id;
    } else {
      // For unauthenticated users, allow usage of demo templates
      const demoUser = await User.findOne({ email: "demo@grantfunds.com" });
      if (demoUser) {
        query.createdBy = demoUser._id;
      }
    }
    const template = await Template.findOne(query);
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }
    const updatedTemplate = await Template.incrementUsage(req.params.id);
    console.log(`✅ Usage incremented for: ${updatedTemplate.title}`);
    res.json({
      success: true,
      message: 'Usage count updated',
      data: updatedTemplate,
      user: req.user ? {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        avatar: req.user.avatar
      } : null
    });
  } catch (error) {
    console.error('❌ Error incrementing usage:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid template ID format'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error updating usage count',
      error: error.message
    });
  }
});

// -------------------- GRANT SOURCES ROUTES --------------------
// Get all grant sources
app.get('/api/grants/sources', authMiddleware, async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = { 
      status: 'active',
      isActive: true 
    };
    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }
    // Search in title, funder, or description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { funder: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { focusAreas: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    const grants = await Grant.find(query)
      .sort({ deadline: 1, createdAt: -1 })
      .select('-isActive');
    console.log(`✅ Found ${grants.length} grant sources`);
    res.json(grants);
  } catch (error) {
    console.error('❌ Error fetching grant sources:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching grant sources',
      error: error.message 
    });
  }
});

// Get single grant source
app.get('/api/grants/sources/:id', authMiddleware, async (req, res) => {
  try {
    const grant = await Grant.findOne({
      _id: req.params.id,
      status: 'active',
      isActive: true
    });
    if (!grant) {
      return res.status(404).json({
        success: false,
        message: 'Grant source not found'
      });
    }
    res.json({
      success: true,
      data: grant
    });
  } catch (error) {
    console.error('❌ Error fetching grant source:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid grant ID format'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error fetching grant source',
      error: error.message
    });
  }
});

// Create new grant (for user's grant proposals)
app.post('/api/grants', authMiddleware, async (req, res) => {
  try {
    const {
      title,
      funder,
      category,
      deadline,
      maxAward,
      focusAreas,
      eligibility,
      description,
      url,
      clientId
    } = req.body;
    // Basic validation
    if (!title || !funder || !category || !deadline || !maxAward || !eligibility) {
      return res.status(400).json({
        success: false,
        message: 'Title, funder, category, deadline, maxAward, and eligibility are required'
      });
    }
    const grantData = {
      title: title.trim(),
      funder: funder.trim(),
      category,
      deadline: new Date(deadline),
      maxAward: Number(maxAward),
      focusAreas: focusAreas || [],
      eligibility: eligibility.trim(),
      description: description?.trim() || '',
      url: url || '',
      status: 'draft',
      createdBy: req.user._id,
      clientId: clientId || null
    };
    const grant = new Grant(grantData);
    const savedGrant = await grant.save();
    console.log(`✅ Grant created: ${savedGrant.title} for user: ${req.user.email}`);
    res.status(201).json({
      success: true,
      message: 'Grant created successfully',
      data: savedGrant
    });
  } catch (error) {
    console.error('❌ Error creating grant:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error creating grant',
      error: error.message
    });
  }
});

// Get user's grants
app.get('/api/grants', authMiddleware, async (req, res) => {
  try {
    const { status, clientId } = req.query;
    let query = { createdBy: req.user._id };
    if (status && status !== 'all') {
      query.status = status;
    }
    if (clientId) {
      query.clientId = clientId;
    }
    const grants = await Grant.find(query)
      .sort({ createdAt: -1 })
      .populate('clientId', 'organizationName primaryContactName');
    res.json({
      success: true,
      data: grants,
      count: grants.length
    });
  } catch (error) {
    console.error('❌ Error fetching user grants:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching grants',
      error: error.message
    });
  }
});

// Update grant
app.put('/api/grants/:id', authMiddleware, async (req, res) => {
  try {
    const grant = await Grant.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    });
    if (!grant) {
      return res.status(404).json({
        success: false,
        message: 'Grant not found'
      });
    }
    const updatedGrant = await Grant.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    res.json({
      success: true,
      message: 'Grant updated successfully',
      data: updatedGrant
    });
  } catch (error) {
    console.error('❌ Error updating grant:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error updating grant',
      error: error.message
    });
  }
});

// -------------------- GOOGLE GEMINI AI ROUTES --------------------
// AI Content Generation Endpoint
app.post('/api/generate', authMiddleware, async (req, res) => {
  try {
    if (!genAI || !model) {
      return res.status(503).json({
        success: false,
        message: 'AI service is not configured. Please check GEMINI_API_KEY.',
        error: 'AI_SERVICE_UNAVAILABLE'
      });
    }
    const { prompt, context, tone = 'professional', length = 'medium', format = 'paragraph' } = req.body;
    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: 'Prompt is required for content generation'
      });
    }
    // Get client and grant details if available
    let client = null;
    let grant = null;
    if (context?.clientId) {
      client = await Client.findOne({ 
        _id: context.clientId, 
        userId: req.user._id 
      });
    }
    if (context?.grantId) {
      grant = await Grant.findOne({
        _id: context.grantId,
        createdBy: req.user._id
      });
    }
    // Construct a detailed prompt for grant writing
    const fullPrompt = buildGrantWritingPrompt(prompt, {
      client,
      grant,
      section: context?.section,
      ...context
    }, tone, length, format);
    console.log(`🤖 Generating content with Gemini for user: ${req.user.email}`);
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const content = response.text();
    // Log the AI usage
    console.log(`✅ Content generated successfully for user: ${req.user.email}`);
    res.json({
      success: true,
      content: content,
      usage: {
        prompt_tokens: result.usageMetadata?.promptTokenCount || 0,
        completion_tokens: result.usageMetadata?.candidatesTokenCount || 0,
        total_tokens: result.usageMetadata?.totalTokenCount || 0
      },
      metadata: {
        model: 'gemini-pro',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('❌ Error generating content with Gemini:', error);
    const errorInfo = handleAIError(error);
    res.status(errorInfo.statusCode).json({
      success: false,
      message: errorInfo.userMessage,
      error: error.message,
      errorCode: errorInfo.errorCode
    });
  }
});

// AI Content Improvement Endpoint
app.post('/api/improve', authMiddleware, async (req, res) => {
  try {
    if (!genAI || !model) {
      return res.status(503).json({
        success: false,
        message: 'AI service is not configured.',
        error: 'AI_SERVICE_UNAVAILABLE'
      });
    }
    const { content, improvement_type = 'clarity', context } = req.body;
    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Content is required for improvement'
      });
    }
    const improvementPrompts = {
      clarity: `Improve the clarity and readability of this grant writing content while maintaining its professional tone. Focus on making it easier to understand:
  ${content}`,
      persuasiveness: `Make this grant proposal content more persuasive and compelling. Strengthen the arguments and make it more convincing to funders:
  ${content}`,
      conciseness: `Make this content more concise while preserving all key information and impact. Remove redundancy and tighten the language:
  ${content}`,
      professionalism: `Enhance the professional tone and formality of this grant writing content. Ensure it meets high standards of grant writing:
  ${content}`,
      impact: `Increase the impact and emotional appeal of this content while maintaining professionalism. Make the outcomes more compelling:
  ${content}`
    };
    const prompt = improvementPrompts[improvement_type] || improvementPrompts.clarity;
    // Add context if available
    let fullPrompt = prompt;
    if (context?.clientId) {
      const client = await Client.findOne({ 
        _id: context.clientId, 
        userId: req.user._id 
      });
      if (client) {
        fullPrompt += `
  Context: Client - ${client.organizationName}`;
      }
    }
    console.log(`🔧 Improving content with type: ${improvement_type} for user: ${req.user.email}`);
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const improvedContent = response.text();
    res.json({
      success: true,
      improved_content: improvedContent,
      improvement_type: improvement_type,
      usage: {
        prompt_tokens: result.usageMetadata?.promptTokenCount || 0,
        completion_tokens: result.usageMetadata?.candidatesTokenCount || 0
      }
    });
  } catch (error) {
    console.error('❌ Error improving content with Gemini:', error);
    const errorInfo = handleAIError(error);
    res.status(errorInfo.statusCode).json({
      success: false,
      message: errorInfo.userMessage,
      error: error.message,
      errorCode: errorInfo.errorCode
    });
  }
});

// AI Content Analysis Endpoint
app.post('/api/analyze', authMiddleware, async (req, res) => {
  try {
    if (!genAI || !model) {
      return res.status(503).json({
        success: false,
        message: 'AI service is not configured.',
        error: 'AI_SERVICE_UNAVAILABLE'
      });
    }
    const { content, analysis_type = 'strength', context } = req.body;
    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Content is required for analysis'
      });
    }
    const analysisPrompts = {
      strength: `Analyze the strengths of this grant writing content and provide specific, actionable feedback. Focus on what works well:
  ${content}`,
      weakness: `Identify weaknesses or areas for improvement in this grant writing content. Be constructive and specific:
  ${content}`,
      compliance: `Check if this grant content complies with standard grant writing guidelines and requirements. Identify any compliance issues:
  ${content}`,
      completeness: `Analyze if this grant section is complete and covers all necessary elements. Identify any missing components:
  ${content}`,
      scoring: `Provide a score out of 10 for this grant content and detailed feedback on how to improve. Consider clarity, persuasiveness, and structure:
  ${content}`
    };
    const prompt = analysisPrompts[analysis_type] || analysisPrompts.strength;
    const fullPrompt = `${prompt}
  Provide your analysis in a structured, actionable format with specific recommendations.`;
    console.log(`🔍 Analyzing content with type: ${analysis_type} for user: ${req.user.email}`);
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const analysis = response.text();
    res.json({
      success: true,
      analysis: analysis,
      analysis_type: analysis_type,
      usage: {
        prompt_tokens: result.usageMetadata?.promptTokenCount || 0,
        completion_tokens: result.usageMetadata?.candidatesTokenCount || 0
      }
    });
  } catch (error) {
    console.error('❌ Error analyzing content with Gemini:', error);
    const errorInfo = handleAIError(error);
    res.status(errorInfo.statusCode).json({
      success: false,
      message: errorInfo.userMessage,
      error: error.message,
      errorCode: errorInfo.errorCode
    });
  }
});

// Grant Writing Templates Endpoint
app.get('/api/templates/:templateType', authMiddleware, async (req, res) => {
  try {
    const { templateType } = req.params;
    const templateCategories = {
      needs_statement: [
        {
          id: '1',
          name: 'Community Needs Assessment',
          description: 'Template for describing community problems and needs',
          structure: ['Problem Statement', 'Data & Statistics', 'Impact Description', 'Urgency'],
          prompt: 'Write a compelling needs statement for a grant proposal focusing on community needs and gaps in services.'
        },
        {
          id: '2',
          name: 'Program Gap Analysis',
          description: 'Identify gaps in existing services and programs',
          structure: ['Current Services', 'Identified Gaps', 'Target Population', 'Proposed Solution'],
          prompt: 'Create a gap analysis showing the need for a new program or service.'
        }
      ],
      objectives: [
        {
          id: '1',
          name: 'SMART Objectives',
          description: 'Specific, Measurable, Achievable, Relevant, Time-bound objectives',
          structure: ['Specific', 'Measurable', 'Achievable', 'Relevant', 'Time-bound'],
          prompt: 'Develop SMART objectives for a grant proposal that are clear and achievable.'
        },
        {
          id: '2',
          name: 'Program Outcomes',
          description: 'Define expected program outcomes and impact',
          structure: ['Short-term Outcomes', 'Long-term Impact', 'Measurement Methods', 'Timeline'],
          prompt: 'Outline the expected outcomes and impact of the proposed program.'
        }
      ],
      methodology: [
        {
          id: '1',
          name: 'Program Implementation Plan',
          description: 'Detailed program activities and implementation steps',
          structure: ['Activities', 'Timeline', 'Staffing', 'Resources', 'Monitoring'],
          prompt: 'Describe the methodology and implementation plan for the proposed program.'
        },
        {
          id: '2',
          name: 'Project Timeline',
          description: 'Clear timeline for project activities and milestones',
          structure: ['Phase 1', 'Phase 2', 'Phase 3', 'Milestones', 'Deliverables'],
          prompt: 'Create a detailed project timeline with clear milestones and deliverables.'
        }
      ],
      evaluation: [
        {
          id: '1',
          name: 'Program Evaluation Plan',
          description: 'Comprehensive evaluation framework and methods',
          structure: ['Evaluation Questions', 'Data Collection', 'Analysis Methods', 'Reporting'],
          prompt: 'Develop an evaluation plan to measure program success and impact.'
        }
      ],
      budget: [
        {
          id: '1',
          name: 'Budget Narrative Template',
          description: 'Justify and explain budget items clearly',
          structure: ['Personnel Costs', 'Operating Expenses', 'Equipment', 'Indirect Costs'],
          prompt: 'Write a budget narrative that clearly justifies each expense in the proposal.'
        }
      ]
    };
    const templates = templateCategories[templateType] || [];
    res.json({
      success: true,
      templates: templates,
      category: templateType,
      count: templates.length
    });
  } catch (error) {
    console.error('❌ Error fetching AI templates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch templates',
      error: error.message
    });
  }
});

// Client routes
app.get('/api/clients', authMiddleware, async (req, res) => {
  try {
    const { search } = req.query;
    let query = { userId: req.user._id };
    if (search) {
      query.$or = [
        { organizationName: { $regex: search, $options: 'i' } },
        { primaryContactName: { $regex: search, $options: 'i' } },
        { emailAddress: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    const clients = await Client.find(query).sort({ createdAt: -1 });
    res.json(clients);
  } catch (error) {
    console.error('❌ Get clients error:', error);
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/clients/:id', authMiddleware, async (req, res) => {
  try {
    const client = await Client.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    res.json(client);
  } catch (error) {
    console.error('❌ Get client error:', error);
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/clients', authMiddleware, async (req, res) => {
  try {
    const clientData = {
      ...req.body,
      userId: req.user._id,
      avatar: req.body.avatar || `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`
    };
    const client = new Client(clientData);
    const savedClient = await client.save();
    res.status(201).json(savedClient);
  } catch (error) {
    console.error('❌ Create client error:', error);
    res.status(400).json({ message: error.message });
  }
});

// --- CRITICAL FIX: Updated PUT route to use $set operator ---
app.put('/api/clients/:id', authMiddleware, async (req, res) => {
  try {
    console.log('🔄 PUT /api/clients/:id - Client:', req.params.id, 'User:', req.user._id);
    // Find the client first to ensure it exists and belongs to the user
    const existingClient = await Client.findOne({ _id: req.params.id, userId: req.user._id });
    if (!existingClient) {
      console.log('❌ Client not found for update:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }
    console.log('📝 Client found, current category:', existingClient.category);
    // --- CRITICAL FIX: Use $set operator for findOneAndUpdate ---
    // Construct the update object using $set for explicit field updates
    const updateObject = {
      $set: {
        ...req.body, // Spread all fields from the request body
        updatedAt: new Date() // Ensure the timestamp is updated
      }
    };
    // Perform the update using findOneAndUpdate with $set
    const updatedClient = await Client.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id }, // Query
      updateObject,                                // Update object using $set
      { new: true, runValidators: true }          // Options: return updated doc, run validation
    );
    if (!updatedClient) {
      // This should ideally not happen if the client was found above,
      // but good to check.
      return res.status(404).json({
        success: false,
        message: 'Client not found after update attempt'
      });
    }
    console.log('✅ Client updated successfully in DB, new category:', updatedClient.category);
    res.json({
      success: true,
      message: 'Client updated successfully',
      client: updatedClient // Send back the updated client object
    });
  } catch (error) {
    console.error('❌ Update client error:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      console.error('Validation Errors:', errors);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to update client',
      error: error.message
    });
  }
});

app.delete('/api/clients/:id', authMiddleware, async (req, res) => {
  try {
    const client = await Client.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user._id 
    });
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    console.error('❌ Delete client error:', error);
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/clients/:id/communications', authMiddleware, async (req, res) => {
  try {
    const client = await Client.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    client.communicationHistory.push({
      ...req.body,
      date: new Date()
    });
    client.lastContact = new Date();
    await client.save();
    res.status(201).json(client);
  } catch (error) {
    console.error('❌ Add communication error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'GrantFlow CRM Backend API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'production',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth/*',
      clients: '/api/clients/*',
      templates: '/api/templates/*',
      grants: {
        sources: '/api/grants/sources',
        userGrants: '/api/grants'
      },
      ai: {
        generate: '/api/generate',
        improve: '/api/improve',
        analyze: '/api/analyze',
        templates: '/api/templates/:type'
      },
      email: {
        verifyConfig: '/api/email/verify-config',
        sendVerification: '/api/auth/send-verification-email',
        verifyEmail: '/api/auth/verify-email',
        forgotPassword: '/api/auth/forgot-password',
        resetPassword: '/api/auth/reset-password'
      },
      admin: {
        setup: '/api/admin/setup',
        stats: '/api/admin/stats',
        pendingUsers: '/api/admin/pending-users',
        users: '/api/admin/users',
        approveUser: '/api/admin/users/:id/approve',
        bulkApprove: '/api/admin/users/bulk-approve',
        rejectUser: '/api/admin/users/:id/reject',
        makeAdmin: '/api/admin/users/:id/make-admin'
      },
      debug: {
        users: '/api/debug/users',
        adminCheck: '/api/debug/admin-check',
        resetAdminPassword: '/api/debug/reset-admin-password'
      },
      emergency: {
        adminReset: '/api/emergency/admin-reset'
      },
      health: '/api/health',
      test: '/api/test-connection'
    }
  });
});

// -------------------- ERROR HANDLING --------------------
app.use((err, req, res, next) => {
  console.error('🚨 Unhandled error:', err);
  res.status(500).json({ 
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  console.log(`❌ Route not found: ${req.originalUrl}`);
  res.status(404).json({ 
    success: false,
    message: 'Route not found',
    path: req.originalUrl 
  });
});

// -------------------- SERVER START --------------------
const startServer = async () => {
  try {
    // Connect to database first
    await connectDB();
    
    // 🔧 IMMEDIATELY SETUP ADMIN ACCOUNT
    console.log('🔧 Setting up admin account...');
    try {
      const adminData = {
        name: "Alex Murphy",
        email: "admin@deleuxedesign.com",
        password: "AlexMurphy",
        role: "admin",
        avatar: "https://i.pravatar.cc/150?img=1",
        approved: true,
        emailVerified: true
      };

      let adminUser = await User.findOne({ email: adminData.email });
      
      if (adminUser) {
        // Update existing admin
        adminUser.name = adminData.name;
        adminUser.role = adminData.role;
        adminUser.approved = adminData.approved;
        adminUser.avatar = adminData.avatar;
        // Only update password if it's different
        const isSamePassword = await adminUser.correctPassword(adminData.password, adminUser.password);
        if (!isSamePassword) {
          adminUser.password = adminData.password;
          console.log(`🔐 Admin password updated: ${adminData.email}`);
        }
        await adminUser.save();
        console.log(`✅ Admin account UPDATED: ${adminData.email}`);
      } else {
        // Create new admin
        adminUser = new User(adminData);
        await adminUser.save();
        console.log(`✅ Admin account CREATED: ${adminData.email}`);
      }
    } catch (adminError) {
      console.error('❌ Admin setup failed:', adminError);
    }
    
    // Continue with demo data initialization
    console.log('📦 Initializing database with demo data...');
    await createDemoUsers();
    await createDemoClients();
    await createDemoTemplates();
    await createDemoGrants();
    console.log('✅ Database initialization complete!');
    
    // Start server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log('🎯 ==========================================');
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🔗 Environment: ${process.env.NODE_ENV || 'production'}`);
      console.log(`📊 Database: ${mongoose.connection.db.databaseName}`);
      console.log(`🤖 AI Services: ${process.env.GEMINI_API_KEY ? 'Gemini Enabled' : 'AI Disabled'}`);
      console.log(`📧 Email Services: ${resend ? 'Resend Configured' : 'Email Disabled'}`);
      console.log(`⏰ Started: ${new Date().toISOString()}`);
      console.log('🎯 ==========================================');
      console.log('📋 Available endpoints:');
      console.log(`   GET  /              - API information`);
      console.log(`   GET  /api/health    - Health check`);
      console.log(`   GET  /api/grants/sources - Grant sources`);
      console.log(`   POST /api/grants    - Create grant`);
      console.log(`   POST /api/generate  - AI Content Generation`);
      console.log(`   POST /api/improve   - AI Content Improvement`);
      console.log(`   POST /api/analyze   - AI Content Analysis`);
      console.log(`   GET  /api/templates/:type - AI Writing Templates`);
      console.log(`   POST /api/auth/login - User login`);
      console.log(`   POST /api/auth/register - User registration`);
      console.log(`   GET  /api/clients   - Get all clients (auth required)`);
      console.log(`   GET  /api/templates - Get email templates`);
      console.log(`   GET  /api/users     - Get all users (auth required)`);
      console.log(`   PUT  /api/users/:id - Update user`);
      console.log(`   DELETE /api/users/:id - Delete user`);
      console.log('🔐 Demo credentials:');
      console.log('   Email: demo@grantfunds.com');
      console.log('   Password: demo123');
      console.log('🔐 Admin credentials:');
      console.log('   Email: admin@deleuxedesign.com');
      console.log('   Password: AlexMurphy');
      console.log('🐛 Debug endpoints:');
      console.log('   GET  /api/debug/users - List all users');
      console.log('   GET  /api/debug/admin-check - Check admin account');
      console.log('   POST /api/debug/reset-admin-password - Reset admin password');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('🔻 Shutting down server gracefully...');
  await mongoose.connection.close();
  console.log('✅ MongoDB connection closed.');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🔻 Server termination signal received...');
  await mongoose.connection.close();
  console.log('✅ MongoDB connection closed.');
  process.exit(0);
});

// Start the server
startServer();