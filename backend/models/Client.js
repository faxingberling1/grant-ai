// Grant-AI\backend\models\Client.js
const mongoose = require('mongoose');

const communicationSchema = new mongoose.Schema({
  id: String,
  type: {
    type: String,
    enum: ['email', 'call', 'meeting', 'note', 'task'],
    required: true
  },
  direction: {
    type: String,
    enum: ['incoming', 'outgoing'],
    required: true
  },
  subject: String,
  content: String,
  preview: String,
  status: {
    type: String,
    enum: ['sent', 'received', 'scheduled', 'completed', 'cancelled'],
    default: 'sent'
  },
  important: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  createdBy: String
});

// NEW: Document schema for client-specific documents
const clientDocumentSchema = new mongoose.Schema({
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
    enum: ['proposals', 'financial', 'guidelines', 'planning', 'reports', 'templates', 'grants', 'contracts', 'other'],
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
  isShared: {
    type: Boolean,
    default: false
  },
  sharedWith: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    permission: {
      type: String,
      enum: ['view', 'edit', 'download'],
      default: 'view'
    },
    sharedAt: {
      type: Date,
      default: Date.now
    }
  }],
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
    ref: 'Client.documents',
    default: null
  },
  grantRelated: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Grant',
    default: null
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

const clientSchema = new mongoose.Schema({
  // User association - THIS IS CRITICAL
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // ===== BASIC INFORMATION =====
  organizationName: {
    type: String,
    required: [true, 'Organization name is required'],
    trim: true,
    maxlength: [200, 'Organization name cannot exceed 200 characters']
  },
  primaryContactName: {
    type: String,
    required: [true, 'Primary contact name is required'],
    trim: true,
    maxlength: [100, 'Primary contact name cannot exceed 100 characters']
  },
  titleRole: {
    type: String,
    trim: true,
    maxlength: [100, 'Title/role cannot exceed 100 characters']
  },
  emailAddress: {
    type: String,
    required: [true, 'Email address is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
  },
  phoneNumbers: {
    type: String,
    trim: true,
    maxlength: [50, 'Phone number cannot exceed 50 characters']
  },
  
  // ===== ADDITIONAL CONTACT INFORMATION =====
  additionalContactName: {
    type: String,
    trim: true,
    maxlength: [100, 'Additional contact name cannot exceed 100 characters']
  },
  additionalContactTitle: {
    type: String,
    trim: true,
    maxlength: [100, 'Additional contact title cannot exceed 100 characters']
  },
  additionalContactEmail: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
  },
  additionalContactPhone: {
    type: String,
    trim: true,
    maxlength: [50, 'Additional contact phone cannot exceed 50 characters']
  },
  
  // ===== ORGANIZATION DETAILS =====
  mailingAddress: {
    type: String,
    trim: true,
    maxlength: [500, 'Mailing address cannot exceed 500 characters']
  },
  website: {
    type: String,
    trim: true,
    maxlength: [200, 'Website URL cannot exceed 200 characters']
  },
  socialMediaLinks: [{
    platform: {
      type: String,
      required: true,
      enum: ['LinkedIn', 'Twitter', 'Facebook', 'Instagram', 'YouTube', 'TikTok', 'Pinterest', 'Snapchat', 'Reddit', 'Other']
    },
    url: {
      type: String,
      required: true,
      trim: true
    }
  }],
  taxIdEIN: {
    type: String,
    trim: true,
    maxlength: [20, 'Tax ID/EIN cannot exceed 20 characters']
  },
  organizationType: {
    type: String,
    enum: [
      'Nonprofit 501(c)(3)',
      'Nonprofit 501(c)(4)',
      'Nonprofit 501(c)(6)',
      'Government Agency',
      'Educational Institution',
      'For-Profit Corporation',
      'Small Business',
      'Startup',
      'Community Organization',
      'Religious Organization',
      'Foundation',
      'Other'
    ],
    default: 'Nonprofit 501(c)(3)'
  },
  missionStatement: {
    type: String,
    trim: true,
    maxlength: [1000, 'Mission statement cannot exceed 1000 characters']
  },
  focusAreas: [{
    type: String,
    trim: true,
    maxlength: [100, 'Focus area cannot exceed 100 characters']
  }],
  serviceArea: {
    type: String,
    trim: true,
    maxlength: [200, 'Service area cannot exceed 200 characters']
  },
  annualBudget: {
    type: String,
    enum: [
      'Under $100,000',
      '$100,000 - $500,000',
      '$500,000 - $1,000,000',
      '$1,000,000 - $5,000,000',
      '$5,000,000 - $10,000,000',
      'Over $10,000,000'
    ]
  },
  staffCount: {
    type: String,
    enum: [
      '1-5',
      '6-10',
      '11-25',
      '26-50',
      '51-100',
      '101-250',
      '251-500',
      '501-1000',
      'Over 1000'
    ]
  },
  
  // ===== CATEGORY & GRANT ALIGNMENT FIELDS =====
  category: {
    type: String,
    trim: true,
    enum: [
      'Education',
      'Healthcare',
      'Environment',
      'Arts & Culture',
      'Social Justice',
      'STEM Education',
      'Clean Energy',
      'Other'
    ],
    default: 'Other'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  referralSource: {
    type: String,
    trim: true,
    enum: [
      'Referral from Existing Client',
      'Website Inquiry',
      'Conference/Event',
      'Social Media',
      'Partner Organization',
      'Online Search',
      'Advertising',
      'Other'
    ]
  },
  grantPotential: {
    type: String,
    trim: true,
    enum: [
      'Under $10,000',
      '$10,000 - $50,000',
      '$50,000 - $100,000',
      '$100,000 - $250,000',
      '$250,000 - $500,000',
      '$500,000 - $1,000,000',
      'Over $1,000,000'
    ]
  },
  nextFollowUp: {
    type: Date,
    validate: {
      validator: function(value) {
        // Allow null/undefined or dates in the future
        return !value || value > new Date();
      },
      message: 'Next follow-up date must be in the future'
    }
  },
  fundingAreas: [{
    type: String,
    trim: true,
    maxlength: [100, 'Funding area cannot exceed 100 characters']
  }],
  grantSources: [{
    type: String,
    trim: true
  }],
  
  // ===== GRANT INFORMATION =====
  grantsSubmitted: {
    type: Number,
    default: 0,
    min: [0, 'Grants submitted cannot be negative']
  },
  grantsAwarded: {
    type: Number,
    default: 0,
    min: [0, 'Grants awarded cannot be negative'],
    validate: {
      validator: function(value) {
        return value <= this.grantsSubmitted;
      },
      message: 'Grants awarded cannot exceed grants submitted'
    }
  },
  totalFunding: {
    type: String,
    trim: true
  },
  
  // ===== STATUS & TRACKING =====
  status: {
    type: String,
    enum: ['active', 'inactive', 'prospect'],
    default: 'active'
  },
  lastContact: {
    type: Date,
    validate: {
      validator: function(value) {
        // Allow null/undefined or dates not in the future
        return !value || value <= new Date();
      },
      message: 'Last contact date cannot be in the future'
    }
  },
  
  // ===== COMMUNICATION HISTORY =====
  communicationHistory: [communicationSchema],
  
  // ===== CLIENT DOCUMENTS - NEW =====
  documents: [clientDocumentSchema],
  
  // ===== DOCUMENT STORAGE STATS - NEW =====
  documentStats: {
    totalDocuments: {
      type: Number,
      default: 0
    },
    totalStorageUsed: {
      type: Number,
      default: 0
    },
    lastDocumentUpload: {
      type: Date
    },
    documentCategories: {
      proposals: { type: Number, default: 0 },
      financial: { type: Number, default: 0 },
      guidelines: { type: Number, default: 0 },
      planning: { type: Number, default: 0 },
      reports: { type: Number, default: 0 },
      templates: { type: Number, default: 0 },
      grants: { type: Number, default: 0 },
      contracts: { type: Number, default: 0 },
      other: { type: Number, default: 0 }
    }
  },
  
  // ===== ADDITIONAL FIELDS =====
  avatar: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [5000, 'Notes cannot exceed 5000 characters']
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }],
  
  // ===== SYSTEM FIELDS =====
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  // Add timestamps and toJSON transformation
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// ===== VIRTUAL FIELDS =====
clientSchema.virtual('successRate').get(function() {
  if (this.grantsSubmitted === 0) return 0;
  return Math.round((this.grantsAwarded / this.grantsSubmitted) * 100);
});

clientSchema.virtual('daysSinceLastContact').get(function() {
  if (!this.lastContact) return null;
  const today = new Date();
  const lastContact = new Date(this.lastContact);
  const diffTime = Math.abs(today - lastContact);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

clientSchema.virtual('isOverdueForFollowUp').get(function() {
  if (!this.nextFollowUp) return false;
  return new Date() > new Date(this.nextFollowUp);
});

// NEW: Virtual for document statistics
clientSchema.virtual('documentUsage').get(function() {
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  return {
    totalDocuments: this.documentStats.totalDocuments,
    totalStorageUsed: formatBytes(this.documentStats.totalStorageUsed),
    lastUpload: this.documentStats.lastDocumentUpload,
    categories: this.documentStats.documentCategories
  };
});

// ===== INDEXES FOR PERFORMANCE =====
clientSchema.index({ userId: 1, organizationName: 1 });
clientSchema.index({ userId: 1, category: 1 });
clientSchema.index({ userId: 1, status: 1 });
clientSchema.index({ userId: 1, priority: 1 });
clientSchema.index({ userId: 1, createdAt: -1 });
clientSchema.index({ userId: 1, nextFollowUp: 1 });

// NEW: Indexes for document queries
clientSchema.index({ 'documents.category': 1 });
clientSchema.index({ 'documents.uploadDate': 1 });
clientSchema.index({ 'documents.tags': 1 });
clientSchema.index({ 'documents.grantRelated': 1 });
clientSchema.index({ 'documents.uploadedBy': 1 });

// ===== MIDDLEWARE =====
// Update the updatedAt field before saving
clientSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Ensure arrays are properly formatted
  if (this.focusAreas) {
    this.focusAreas = this.focusAreas.filter(area => area && area.trim() !== '');
  }
  if (this.tags) {
    this.tags = this.tags.filter(tag => tag && tag.trim() !== '');
  }
  if (this.fundingAreas) {
    this.fundingAreas = this.fundingAreas.filter(area => area && area.trim() !== '');
  }
  if (this.grantSources) {
    this.grantSources = this.grantSources.filter(source => source && source.toString().trim() !== '');
  }
  
  // NEW: Update document statistics
  if (this.isModified('documents')) {
    this.updateDocumentStats();
  }
  
  next();
});

// Validation for grant sources (ensure they're valid ObjectIds if referencing grant sources)
clientSchema.pre('save', function(next) {
  if (this.grantSources && this.grantSources.length > 0) {
    const invalidSources = this.grantSources.filter(source => 
      !mongoose.Types.ObjectId.isValid(source) && typeof source !== 'string'
    );
    if (invalidSources.length > 0) {
      return next(new Error('Invalid grant source IDs found'));
    }
  }
  next();
});

// ===== STATIC METHODS =====
clientSchema.statics.findByCategory = function(userId, category) {
  return this.find({ userId, category });
};

clientSchema.statics.findActiveClients = function(userId) {
  return this.find({ userId, status: 'active' });
};

clientSchema.statics.findByPriority = function(userId, priority) {
  return this.find({ userId, priority });
};

clientSchema.statics.getCategoryStats = function(userId) {
  return this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        active: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
        },
        totalFunding: { $sum: { $toDouble: { $substr: ['$totalFunding', 1, -1] } } },
        totalGrantsSubmitted: { $sum: '$grantsSubmitted' },
        totalGrantsAwarded: { $sum: '$grantsAwarded' }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

// NEW: Static methods for document management
clientSchema.statics.findClientsWithDocuments = function(userId) {
  return this.find({ 
    userId, 
    'documentStats.totalDocuments': { $gt: 0 } 
  });
};

clientSchema.statics.getDocumentStatsByUser = function(userId) {
  return this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalClients: { $sum: 1 },
        clientsWithDocuments: {
          $sum: { $cond: [{ $gt: ['$documentStats.totalDocuments', 0] }, 1, 0] }
        },
        totalDocuments: { $sum: '$documentStats.totalDocuments' },
        totalStorageUsed: { $sum: '$documentStats.totalStorageUsed' },
        averageDocumentsPerClient: { $avg: '$documentStats.totalDocuments' }
      }
    }
  ]);
};

// ===== INSTANCE METHODS =====
clientSchema.methods.addCommunication = function(communicationData) {
  this.communicationHistory.push({
    ...communicationData,
    id: new mongoose.Types.ObjectId().toString(),
    createdAt: new Date()
  });
  this.lastContact = new Date();
  return this.save();
};

clientSchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus;
  return this.save();
};

clientSchema.methods.addTag = function(tag) {
  if (!this.tags.includes(tag)) {
    this.tags.push(tag);
  }
  return this.save();
};

clientSchema.methods.removeTag = function(tag) {
  this.tags = this.tags.filter(t => t !== tag);
  return this.save();
};

// NEW: Instance methods for document management
clientSchema.methods.addDocument = function(documentData) {
  const newDocument = {
    ...documentData,
    _id: new mongoose.Types.ObjectId(),
    uploadDate: new Date(),
    lastAccessed: new Date()
  };
  
  this.documents.push(newDocument);
  return this.save();
};

clientSchema.methods.removeDocument = function(documentId) {
  const documentIndex = this.documents.findIndex(doc => doc._id.toString() === documentId);
  if (documentIndex > -1) {
    this.documents.splice(documentIndex, 1);
    return this.save();
  }
  throw new Error('Document not found');
};

clientSchema.methods.updateDocument = function(documentId, updates) {
  const document = this.documents.id(documentId);
  if (document) {
    Object.assign(document, updates);
    document.lastAccessed = new Date();
    return this.save();
  }
  throw new Error('Document not found');
};

clientSchema.methods.getDocument = function(documentId) {
  const document = this.documents.id(documentId);
  if (document) {
    document.lastAccessed = new Date();
    this.save(); // Update last accessed time
    return document;
  }
  return null;
};

clientSchema.methods.getDocumentsByCategory = function(category) {
  return this.documents.filter(doc => doc.category === category);
};

clientSchema.methods.getDocumentsByGrant = function(grantId) {
  return this.documents.filter(doc => doc.grantRelated && doc.grantRelated.toString() === grantId);
};

clientSchema.methods.updateDocumentStats = function() {
  const totalDocuments = this.documents.length;
  const totalStorageUsed = this.documents.reduce((total, doc) => total + (doc.fileSize || 0), 0);
  
  // Calculate category counts
  const categoryCounts = {
    proposals: 0,
    financial: 0,
    guidelines: 0,
    planning: 0,
    reports: 0,
    templates: 0,
    grants: 0,
    contracts: 0,
    other: 0
  };
  
  this.documents.forEach(doc => {
    if (categoryCounts.hasOwnProperty(doc.category)) {
      categoryCounts[doc.category]++;
    } else {
      categoryCounts.other++;
    }
  });
  
  this.documentStats = {
    totalDocuments,
    totalStorageUsed,
    lastDocumentUpload: this.documents.length > 0 ? 
      new Date(Math.max(...this.documents.map(d => new Date(d.uploadDate)))) : 
      null,
    documentCategories: categoryCounts
  };
  
  return this;
};

clientSchema.methods.shareDocument = function(documentId, userId, permission = 'view') {
  const document = this.documents.id(documentId);
  if (document) {
    // Remove existing share if it exists
    document.sharedWith = document.sharedWith.filter(share => 
      share.userId.toString() !== userId.toString()
    );
    
    // Add new share
    document.sharedWith.push({
      userId,
      permission,
      sharedAt: new Date()
    });
    
    document.isShared = document.sharedWith.length > 0;
    return this.save();
  }
  throw new Error('Document not found');
};

clientSchema.methods.unshareDocument = function(documentId, userId) {
  const document = this.documents.id(documentId);
  if (document) {
    document.sharedWith = document.sharedWith.filter(share => 
      share.userId.toString() !== userId.toString()
    );
    
    document.isShared = document.sharedWith.length > 0;
    return this.save();
  }
  throw new Error('Document not found');
};

// ===== QUERY HELPERS =====
clientSchema.query.byUser = function(userId) {
  return this.where({ userId });
};

clientSchema.query.byStatus = function(status) {
  return this.where({ status });
};

clientSchema.query.byCategory = function(category) {
  return this.where({ category });
};

clientSchema.query.byPriority = function(priority) {
  return this.where({ priority });
};

clientSchema.query.search = function(searchTerm) {
  if (!searchTerm) return this;
  
  const regex = new RegExp(searchTerm, 'i');
  return this.or([
    { organizationName: regex },
    { primaryContactName: regex },
    { emailAddress: regex },
    { category: regex },
    { tags: regex },
    { focusAreas: regex },
    { missionStatement: regex },
    { serviceArea: regex }
  ]);
};

// NEW: Query helpers for documents
clientSchema.query.withDocuments = function() {
  return this.where('documentStats.totalDocuments').gt(0);
};

clientSchema.query.byDocumentCategory = function(category) {
  return this.where('documents.category', category);
};

clientSchema.query.hasGrantDocuments = function(grantId) {
  return this.where('documents.grantRelated', grantId);
};

module.exports = mongoose.model('Client', clientSchema);