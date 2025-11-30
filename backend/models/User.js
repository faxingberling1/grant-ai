// backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false // Ensures password is never returned in queries by default
  },
  avatar: {
    type: String,
    default: function() {
      // Generate unique default avatar
      const idHash = this._id ? this._id.toString().hashCode() : Math.floor(Math.random() * 70);
      return `https://i.pravatar.cc/150?img=${Math.abs(idHash) % 70}`;
    }
  },
  
  // Approval and Verification Fields
  approved: {
    type: Boolean,
    default: false
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    select: false // Don't return in queries by default
  },
  emailVerificationExpires: {
    type: Date,
    select: false // Don't return in queries by default
  },
  
  role: {
    type: String,
    enum: {
      values: ['user', 'admin', 'Grant Manager'],
      message: 'Role must be one of: user, admin, or Grant Manager'
    },
    default: 'user'
  },
  
  // Additional profile fields
  company: {
    type: String,
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  phone: {
    type: String,
    trim: true
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  
  // Preferences
  notifications: {
    email: { type: Boolean, default: true },
    reminders: { type: Boolean, default: true }
  },
  
  // Account status
  active: {
    type: Boolean,
    default: true
  },
  
  lastLogin: {
    type: Date
  },

  // Document Storage Fields - NEW
  documents: [{
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      auto: true
    },
    filename: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    fileSize: {
      type: Number,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: ['proposals', 'financial', 'guidelines', 'planning', 'reports', 'templates', 'other'],
      default: 'other'
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    storagePath: {
      type: String,
      required: true
    },
    uploadDate: {
      type: Date,
      default: Date.now
    },
    lastAccessed: {
      type: Date,
      default: Date.now
    },
    isPublic: {
      type: Boolean,
      default: false
    },
    tags: [{
      type: String,
      trim: true,
      maxlength: [50, 'Tag cannot exceed 50 characters']
    }],
    version: {
      type: Number,
      default: 1
    },
    parentDocument: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User.documents',
      default: null
    }
  }],

  // Document Storage Limits and Usage - NEW
  storageUsage: {
    type: Number,
    default: 0 // in bytes
  },
  storageLimit: {
    type: Number,
    default: 100 * 1024 * 1024 // 100MB default limit in bytes
  },
  documentCount: {
    type: Number,
    default: 0
  },
  maxDocumentCount: {
    type: Number,
    default: 1000 // Maximum number of documents allowed
  },

  // Document Preferences - NEW
  documentPreferences: {
    autoCategorize: {
      type: Boolean,
      default: true
    },
    defaultCategory: {
      type: String,
      enum: ['proposals', 'financial', 'guidelines', 'planning', 'reports', 'templates', 'other'],
      default: 'other'
    },
    backupEnabled: {
      type: Boolean,
      default: true
    },
    versioningEnabled: {
      type: Boolean,
      default: true
    },
    allowedFileTypes: [{
      type: String,
      enum: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'jpg', 'jpeg', 'png', 'gif', 'zip', 'rar']
    }]
  }

}, {
  timestamps: true // Adds createdAt and updatedAt
});

// Indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ emailVerificationToken: 1 });
userSchema.index({ emailVerificationExpires: 1 });
userSchema.index({ role: 1 });
userSchema.index({ approved: 1 });
userSchema.index({ emailVerified: 1 });

// NEW: Indexes for document queries
userSchema.index({ 'documents.category': 1 });
userSchema.index({ 'documents.uploadDate': 1 });
userSchema.index({ 'documents.tags': 1 });
userSchema.index({ 'documents.isPublic': 1 });

// Hash password before saving (only if modified)
userSchema.pre('save', async function(next) {
  // Only hash if password is modified (or new user)
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Update updatedAt timestamp before saving
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// NEW: Update document count and storage usage before saving
userSchema.pre('save', function(next) {
  if (this.isModified('documents')) {
    this.documentCount = this.documents.length;
    this.storageUsage = this.documents.reduce((total, doc) => total + (doc.fileSize || 0), 0);
  }
  next();
});

// Instance method to compare passwords (for login)
userSchema.methods.correctPassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to generate email verification token
userSchema.methods.generateVerificationToken = function() {
  // Generate random token
  this.emailVerificationToken = crypto.randomBytes(32).toString('hex');
  // Set expiration to 24 hours from now
  this.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return this.emailVerificationToken;
};

// Instance method to verify email
userSchema.methods.verifyEmail = function() {
  this.emailVerified = true;
  this.emailVerificationToken = undefined;
  this.emailVerificationExpires = undefined;
  this.approved = true; // Auto-approve after email verification
  return this;
};

// Instance method to check if verification token is valid
userSchema.methods.isVerificationTokenValid = function() {
  return this.emailVerificationExpires && this.emailVerificationExpires > new Date();
};

// Instance method to update last login
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

// NEW: Instance methods for document management
userSchema.methods.addDocument = function(documentData) {
  this.documents.push(documentData);
  return this.save();
};

userSchema.methods.removeDocument = function(documentId) {
  const documentIndex = this.documents.findIndex(doc => doc._id.toString() === documentId);
  if (documentIndex > -1) {
    this.documents.splice(documentIndex, 1);
    return this.save();
  }
  throw new Error('Document not found');
};

userSchema.methods.updateDocument = function(documentId, updates) {
  const document = this.documents.id(documentId);
  if (document) {
    Object.assign(document, updates);
    document.lastAccessed = new Date();
    return this.save();
  }
  throw new Error('Document not found');
};

userSchema.methods.getDocument = function(documentId) {
  const document = this.documents.id(documentId);
  if (document) {
    document.lastAccessed = new Date();
    this.save(); // Update last accessed time
    return document;
  }
  return null;
};

userSchema.methods.getDocumentsByCategory = function(category) {
  return this.documents.filter(doc => doc.category === category);
};

userSchema.methods.getDocumentsByTag = function(tag) {
  return this.documents.filter(doc => doc.tags.includes(tag));
};

userSchema.methods.hasStorageSpace = function(fileSize) {
  return (this.storageUsage + fileSize) <= this.storageLimit;
};

userSchema.methods.canUploadMoreDocuments = function() {
  return this.documentCount < this.maxDocumentCount;
};

userSchema.methods.getStorageUsagePercentage = function() {
  return (this.storageUsage / this.storageLimit) * 100;
};

// Static method to find user by verification token
userSchema.statics.findByVerificationToken = function(token) {
  return this.findOne({
    emailVerificationToken: token,
    emailVerificationExpires: { $gt: new Date() }
  }).select('+emailVerificationToken +emailVerificationExpires');
};

// Static method to find user by email (including password for auth)
userSchema.statics.findByEmail = function(email, includePassword = false) {
  const query = this.findOne({ email: email.toLowerCase().trim() });
  if (includePassword) {
    return query.select('+password');
  }
  return query;
};

// Static method to check if email exists
userSchema.statics.emailExists = async function(email) {
  const user = await this.findOne({ email: email.toLowerCase().trim() });
  return !!user;
};

// NEW: Static method to find users with large storage usage
userSchema.statics.findUsersWithHighStorageUsage = function(thresholdPercentage = 80) {
  return this.find({
    $expr: {
      $gte: [
        { $multiply: [{ $divide: ['$storageUsage', '$storageLimit'] }, 100] },
        thresholdPercentage
      ]
    }
  });
};

// Virtual for user status
userSchema.virtual('status').get(function() {
  if (!this.emailVerified) return 'pending_verification';
  if (!this.approved) return 'pending_approval';
  if (!this.active) return 'inactive';
  return 'active';
});

// Virtual for isDemo (check if demo account)
userSchema.virtual('isDemo').get(function() {
  return this.email === 'demo@grantfunds.com';
});

// NEW: Virtuals for document management
userSchema.virtual('availableStorage').get(function() {
  return this.storageLimit - this.storageUsage;
});

userSchema.virtual('storageUsageFormatted').get(function() {
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  return {
    used: formatBytes(this.storageUsage),
    total: formatBytes(this.storageLimit),
    available: formatBytes(this.availableStorage),
    percentage: this.getStorageUsagePercentage().toFixed(1)
  };
});

// Transform output to remove sensitive fields
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.emailVerificationToken;
  delete user.emailVerificationExpires;
  return user;
};

// Generate a numeric hash from string (for deterministic avatar)
String.prototype.hashCode = function() {
  let hash = 0;
  if (this.length === 0) return hash;
  for (let i = 0; i < this.length; i++) {
    const char = this.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash;
};

// Add hashCode method to ObjectId for avatar generation
mongoose.Types.ObjectId.prototype.hashCode = function() {
  return this.toString().hashCode();
};

module.exports = mongoose.model('User', userSchema);