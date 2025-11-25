// backend/models/EmailVerification.js
const mongoose = require('mongoose');
const crypto = require('crypto');

const emailVerificationSchema = new mongoose.Schema({
  // Reference to the user
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  
  // Email being verified
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    index: true
  },
  
  // Verification token
  token: {
    type: String,
    required: [true, 'Verification token is required'],
    unique: true,
    index: true
  },
  
  // Token type for future extensibility (email verification, password reset, etc.)
  type: {
    type: String,
    enum: {
      values: ['email_verification', 'password_reset', 'email_change'],
      message: 'Token type must be one of: email_verification, password_reset, email_change'
    },
    default: 'email_verification'
  },
  
  // Expiration timestamp
  expiresAt: {
    type: Date,
    required: [true, 'Expiration date is required'],
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    index: true
  },
  
  // Track usage
  used: {
    type: Boolean,
    default: false
  },
  usedAt: {
    type: Date
  },
  
  // Track attempts for security
  verificationAttempts: {
    type: Number,
    default: 0,
    min: 0,
    max: 5 // Maximum 5 attempts
  },
  lastAttemptAt: {
    type: Date
  },
  
  // IP address and user agent for security logging
  createdFromIP: {
    type: String,
    trim: true
  },
  createdFromUserAgent: {
    type: String,
    trim: true
  },
  
  // Additional metadata
  metadata: {
    browser: String,
    os: String,
    device: String
  }
}, {
  timestamps: true // Adds createdAt and updatedAt
});

// Compound indexes for better query performance
emailVerificationSchema.index({ userId: 1, type: 1 });
emailVerificationSchema.index({ email: 1, type: 1 });
emailVerificationSchema.index({ token: 1, type: 1 });
emailVerificationSchema.index({ expiresAt: 1, used: 1 });
emailVerificationSchema.index({ createdAt: 1 });

// Index for TTL (Time To Live) - auto-delete expired tokens
emailVerificationSchema.index({ expiresAt: 1 }, { 
  expireAfterSeconds: 0, // Delete immediately when expiresAt is reached
  background: true 
});

// Pre-save middleware to set default expiration if not provided
emailVerificationSchema.pre('save', function(next) {
  if (!this.expiresAt) {
    this.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  }
  next();
});

// Pre-save middleware to update timestamps
emailVerificationSchema.pre('save', function(next) {
  if (this.isModified('used') && this.used && !this.usedAt) {
    this.usedAt = new Date();
  }
  if (this.isModified('verificationAttempts')) {
    this.lastAttemptAt = new Date();
  }
  next();
});

// Static method to create a new verification token
emailVerificationSchema.statics.createVerification = async function(userId, email, options = {}) {
  try {
    // Generate secure random token
    const token = crypto.randomBytes(32).toString('hex');
    
    // Set expiration (default 24 hours, configurable)
    const expiresAt = options.expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000);
    
    // Create verification record
    const verificationData = {
      userId,
      email: email.toLowerCase().trim(),
      token,
      type: 'email_verification',
      expiresAt,
      createdFromIP: options.ip,
      createdFromUserAgent: options.userAgent,
      metadata: options.metadata || {}
    };
    
    const verification = new this(verificationData);
    await verification.save();
    
    return verification;
  } catch (error) {
    // Handle duplicate token (extremely rare with crypto.randomBytes)
    if (error.code === 11000 && error.keyPattern && error.keyPattern.token) {
      // Recursively retry with new token
      return this.createVerification(userId, email, options);
    }
    throw error;
  }
};

// Static method to find valid verification token
emailVerificationSchema.statics.findValidToken = function(token, type = 'email_verification') {
  return this.findOne({
    token,
    type,
    used: false,
    expiresAt: { $gt: new Date() },
    verificationAttempts: { $lt: 5 } // Not exceeded max attempts
  }).populate('userId', 'name email avatar emailVerified approved');
};

// Static method to mark token as used
emailVerificationSchema.statics.markAsUsed = function(token) {
  return this.findOneAndUpdate(
    { token },
    { 
      used: true,
      usedAt: new Date(),
      verificationAttempts: 0 // Reset attempts on successful verification
    },
    { new: true }
  );
};

// Static method to increment verification attempts
emailVerificationSchema.statics.incrementAttempts = function(token) {
  return this.findOneAndUpdate(
    { token },
    { 
      $inc: { verificationAttempts: 1 },
      lastAttemptAt: new Date()
    },
    { new: true }
  );
};

// Static method to get active verifications for a user
emailVerificationSchema.statics.getActiveVerifications = function(userId, type = 'email_verification') {
  return this.find({
    userId,
    type,
    used: false,
    expiresAt: { $gt: new Date() }
  }).sort({ createdAt: -1 });
};

// Static method to invalidate all previous verifications for a user
emailVerificationSchema.statics.invalidatePreviousVerifications = function(userId, type = 'email_verification') {
  return this.updateMany(
    {
      userId,
      type,
      used: false,
      expiresAt: { $gt: new Date() }
    },
    {
      used: true,
      usedAt: new Date()
    }
  );
};

// Static method to clean up expired tokens (manual cleanup if needed)
emailVerificationSchema.statics.cleanupExpired = function() {
  return this.deleteMany({
    expiresAt: { $lt: new Date() }
  });
};

// Static method to get verification stats
emailVerificationSchema.statics.getStats = function(days = 30) {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          type: '$type',
          used: '$used'
        },
        count: { $sum: 1 },
        lastCreated: { $max: '$createdAt' }
      }
    },
    {
      $group: {
        _id: '$_id.type',
        total: { $sum: '$count' },
        used: {
          $sum: {
            $cond: [{ $eq: ['$_id.used', true] }, '$count', 0]
          }
        },
        unused: {
          $sum: {
            $cond: [{ $eq: ['$_id.used', false] }, '$count', 0]
          }
        }
      }
    }
  ]);
};

// Instance method to check if token is expired
emailVerificationSchema.methods.isExpired = function() {
  return this.expiresAt < new Date();
};

// Instance method to check if token is valid (not used, not expired, within attempt limits)
emailVerificationSchema.methods.isValid = function() {
  return !this.used && 
         !this.isExpired() && 
         this.verificationAttempts < 5;
};

// Instance method to get time remaining in milliseconds
emailVerificationSchema.methods.getTimeRemaining = function() {
  return Math.max(0, this.expiresAt - new Date());
};

// Instance method to get time remaining in human readable format
emailVerificationSchema.methods.getTimeRemainingHuman = function() {
  const ms = this.getTimeRemaining();
  if (ms === 0) return 'expired';
  
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

// Instance method to safely increment attempts
emailVerificationSchema.methods.incrementAttempts = function() {
  this.verificationAttempts += 1;
  this.lastAttemptAt = new Date();
  return this.save();
};

// Instance method to mark as used
emailVerificationSchema.methods.markAsUsed = function() {
  this.used = true;
  this.usedAt = new Date();
  this.verificationAttempts = 0; // Reset attempts
  return this.save();
};

// Virtual for token status
emailVerificationSchema.virtual('status').get(function() {
  if (this.used) return 'used';
  if (this.isExpired()) return 'expired';
  if (this.verificationAttempts >= 5) return 'max_attempts_exceeded';
  return 'active';
});

// Transform output for API responses (exclude sensitive fields)
emailVerificationSchema.methods.toJSON = function() {
  const verification = this.toObject();
  
  // Remove sensitive fields from API responses
  delete verification.token;
  delete verification.createdFromIP;
  delete verification.createdFromUserAgent;
  
  return verification;
};

// Pre-remove middleware (if needed for cleanup)
emailVerificationSchema.pre('remove', function(next) {
  console.log(`🗑️  Email verification token removed for user: ${this.userId}`);
  next();
});

module.exports = mongoose.model('EmailVerification', emailVerificationSchema);