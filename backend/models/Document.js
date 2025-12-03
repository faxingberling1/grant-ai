// backend/models/Document.js
const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  // ===== GRIDFS SPECIFIC FIELDS =====
  gridfsFileId: {
    type: mongoose.Schema.Types.ObjectId,
    index: true
  },
  gridfsFilename: {
    type: String,
    trim: true,
    maxlength: [255, 'GridFS filename cannot exceed 255 characters']
  },
  
  // ===== DOCUMENT IDENTIFICATION =====
  filename: {
    type: String,
    required: [true, 'Filename is required'],
    trim: true,
    maxlength: [255, 'Filename cannot exceed 255 characters']
  },
  originalName: {
    type: String,
    required: [true, 'Original filename is required'],
    trim: true,
    maxlength: [255, 'Original filename cannot exceed 255 characters']
  },
  fileExtension: {
    type: String,
    required: true,
    trim: true,
    maxlength: [10, 'File extension cannot exceed 10 characters']
  },
  
  // ===== FILE METADATA =====
  fileSize: {
    type: Number, // in bytes
    required: [true, 'File size is required'],
    min: [1, 'File size must be at least 1 byte']
  },
  mimeType: {
    type: String,
    required: [true, 'MIME type is required'],
    trim: true
  },
  storagePath: {
    type: String,
    trim: true,
    default: null // Will be null for GridFS
  },
  storageProvider: {
    type: String,
    enum: ['local', 'aws-s3', 'google-cloud', 'azure-blob', 'gridfs'],
    default: 'gridfs' // Changed default to gridfs
  },
  checksum: {
    type: String,
    trim: true
  },
  
  // ===== OWNERSHIP & PERMISSIONS =====
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    index: true
  },
  grantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Grant',
    index: true
  },
  
  // ===== DOCUMENT CATEGORIZATION =====
  category: {
    type: String,
    enum: [
      'proposals',
      'financial',
      'guidelines',
      'planning',
      'reports',
      'templates',
      'grants',
      'contracts',
      'meeting-notes',
      'communication',
      'research',
      'presentations',
      'budgets',
      'other'
    ],
    default: 'other',
    index: true
  },
  subcategory: {
    type: String,
    trim: true,
    maxlength: [100, 'Subcategory cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }],
  
  // ===== ACCESS CONTROL & SHARING =====
  visibility: {
    type: String,
    enum: ['private', 'shared', 'public'],
    default: 'private'
  },
  sharedWith: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    permission: {
      type: String,
      enum: ['view', 'download', 'edit', 'manage'],
      default: 'view'
    },
    sharedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    sharedAt: {
      type: Date,
      default: Date.now
    },
    expiresAt: Date
  }],
  accessPassword: {
    type: String,
    select: false
  },
  isEncrypted: {
    type: Boolean,
    default: false
  },
  
  // ===== VERSION CONTROL =====
  version: {
    type: Number,
    default: 1
  },
  parentDocument: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  },
  versionHistory: [{
    version: {
      type: Number,
      required: true
    },
    filename: String,
    fileSize: Number,
    storagePath: String,
    gridfsFileId: mongoose.Schema.Types.ObjectId,
    gridfsFilename: String,
    storageProvider: String,
    changes: {
      type: String,
      maxlength: [500, 'Change description cannot exceed 500 characters']
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isLatestVersion: {
    type: Boolean,
    default: true
  },
  
  // ===== DOCUMENT PROPERTIES =====
  documentType: {
    type: String,
    enum: [
      'proposal',
      'application',
      'budget',
      'report',
      'contract',
      'agreement',
      'presentation',
      'spreadsheet',
      'word-doc',
      'pdf',
      'image',
      'video',
      'audio',
      'archive',
      'other'
    ],
    default: 'other'
  },
  pageCount: {
    type: Number,
    min: 0
  },
  wordCount: {
    type: Number,
    min: 0
  },
  dimensions: {
    width: Number,
    height: Number,
    unit: {
      type: String,
      enum: ['px', 'in', 'cm', 'mm'],
      default: 'px'
    }
  },
  duration: Number, // for audio/video files in seconds
  
  // ===== STATUS & WORKFLOW =====
  status: {
    type: String,
    enum: [
      'draft',
      'in-review',
      'approved',
      'rejected',
      'archived',
      'deleted'
    ],
    default: 'draft'
  },
  workflowStage: {
    type: String,
    trim: true,
    maxlength: [100, 'Workflow stage cannot exceed 100 characters']
  },
  reviewStatus: {
    reviewed: {
      type: Boolean,
      default: false
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: Date,
    reviewNotes: String
  },
  
  // ===== SECURITY & COMPLIANCE =====
  sensitivityLevel: {
    type: String,
    enum: ['public', 'internal', 'confidential', 'restricted'],
    default: 'internal'
  },
  retentionPolicy: {
    type: String,
    enum: ['standard', 'extended', 'permanent'],
    default: 'standard'
  },
  retentionExpiresAt: Date,
  isBackedUp: {
    type: Boolean,
    default: false
  },
  backupLocations: [String],
  
  // ===== USAGE ANALYTICS =====
  downloadCount: {
    type: Number,
    default: 0,
    min: 0
  },
  viewCount: {
    type: Number,
    default: 0,
    min: 0
  },
  shareCount: {
    type: Number,
    default: 0,
    min: 0
  },
  lastAccessed: {
    type: Date,
    default: Date.now
  },
  lastAccessedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastModified: {
    type: Date,
    default: Date.now
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // ===== SYSTEM METADATA =====
  uploadSource: {
    type: String,
    enum: ['web-upload', 'email-attachment', 'api', 'mobile', 'sync'],
    default: 'web-upload'
  },
  uploadIp: String,
  userAgent: String,
  
  // ===== RELATIONSHIPS =====
  relatedDocuments: [{
    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      required: true
    },
    relationship: {
      type: String,
      enum: ['attachment', 'reference', 'supplement', 'translation', 'previous-version'],
      required: true
    },
    description: String
  }],
  
  // ===== CUSTOM FIELDS =====
  customFields: mongoose.Schema.Types.Mixed,
  
  // ===== SYSTEM TIMESTAMPS =====
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  deletedAt: Date

}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      delete ret.accessPassword;
      // Hide GridFS internal fields if not needed
      if (ret.storageProvider !== 'gridfs') {
        delete ret.gridfsFileId;
        delete ret.gridfsFilename;
      }
      return ret;
    }
  }
});

// ===== VIRTUAL FIELDS =====
documentSchema.virtual('fileSizeFormatted').get(function() {
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  return formatBytes(this.fileSize);
});

documentSchema.virtual('downloadUrl').get(function() {
  if (this.storageProvider === 'gridfs' && this.gridfsFileId) {
    return `/api/documents/${this._id}/download`;
  } else if (this.storagePath) {
    return this.storagePath;
  }
  return null;
});

documentSchema.virtual('previewUrl').get(function() {
  if (this.storageProvider === 'gridfs' && this.gridfsFileId) {
    return `/api/documents/${this._id}/preview`;
  }
  return null;
});

documentSchema.virtual('thumbnailUrl').get(function() {
  if (this.storageProvider === 'gridfs' && this.gridfsFileId && this.isImage) {
    return `/api/documents/${this._id}/thumbnail`;
  }
  return null;
});

documentSchema.virtual('isImage').get(function() {
  return this.mimeType.startsWith('image/');
});

documentSchema.virtual('isPdf').get(function() {
  return this.mimeType === 'application/pdf';
});

documentSchema.virtual('isText').get(function() {
  return this.mimeType.startsWith('text/') || 
         this.mimeType.includes('word') || 
         this.mimeType.includes('document');
});

documentSchema.virtual('isSpreadsheet').get(function() {
  return this.mimeType.includes('spreadsheet') || 
         this.mimeType.includes('excel');
});

documentSchema.virtual('isPresentation').get(function() {
  return this.mimeType.includes('presentation') || 
         this.mimeType.includes('powerpoint');
});

documentSchema.virtual('isArchived').get(function() {
  return this.status === 'archived';
});

documentSchema.virtual('isDeleted').get(function() {
  return this.status === 'deleted';
});

documentSchema.virtual('daysSinceUpload').get(function() {
  const today = new Date();
  const uploadDate = new Date(this.createdAt);
  const diffTime = Math.abs(today - uploadDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

documentSchema.virtual('hasGridfsFile').get(function() {
  return this.storageProvider === 'gridfs' && this.gridfsFileId;
});

// ===== INDEXES FOR PERFORMANCE =====
documentSchema.index({ userId: 1, createdAt: -1 });
documentSchema.index({ userId: 1, category: 1 });
documentSchema.index({ userId: 1, status: 1 });
documentSchema.index({ clientId: 1 });
documentSchema.index({ grantId: 1 });
documentSchema.index({ filename: 'text', description: 'text', tags: 'text' });
documentSchema.index({ mimeType: 1 });
documentSchema.index({ 'sharedWith.userId': 1 });
documentSchema.index({ visibility: 1 });
documentSchema.index({ retentionExpiresAt: 1 });
documentSchema.index({ lastAccessed: -1 });
documentSchema.index({ fileSize: -1 });
documentSchema.index({ downloadCount: -1 });
documentSchema.index({ storageProvider: 1 });
documentSchema.index({ gridfsFileId: 1 });

// ===== MIDDLEWARE =====
documentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Set file extension from original name
  if (this.originalName && !this.fileExtension) {
    const parts = this.originalName.split('.');
    if (parts.length > 1) {
      this.fileExtension = parts.pop().toLowerCase();
    }
  }
  
  // Set document type based on MIME type
  if (this.mimeType && !this.documentType) {
    if (this.mimeType.startsWith('image/')) {
      this.documentType = 'image';
    } else if (this.mimeType === 'application/pdf') {
      this.documentType = 'pdf';
    } else if (this.mimeType.includes('word') || this.mimeType.includes('document')) {
      this.documentType = 'word-doc';
    } else if (this.mimeType.includes('spreadsheet') || this.mimeType.includes('excel')) {
      this.documentType = 'spreadsheet';
    } else if (this.mimeType.includes('presentation') || this.mimeType.includes('powerpoint')) {
      this.documentType = 'presentation';
    } else if (this.mimeType.startsWith('video/')) {
      this.documentType = 'video';
    } else if (this.mimeType.startsWith('audio/')) {
      this.documentType = 'audio';
    } else if (this.mimeType.includes('zip') || this.mimeType.includes('archive')) {
      this.documentType = 'archive';
    }
  }
  
  // Set filename if not provided
  if (!this.filename && this.originalName) {
    this.filename = this.originalName;
  }
  
  // For GridFS, storagePath is not required
  if (this.storageProvider === 'gridfs') {
    this.storagePath = null;
  }
  
  // Update visibility based on sharing
  if (this.sharedWith && this.sharedWith.length > 0) {
    this.visibility = 'shared';
  }
  
  // Clean up arrays
  if (this.tags) {
    this.tags = this.tags.filter(tag => tag && tag.trim() !== '');
  }
  
  // If deleted, mark deletedAt
  if (this.status === 'deleted' && !this.deletedAt) {
    this.deletedAt = new Date();
  }
  
  next();
});

// ===== STATIC METHODS =====
documentSchema.statics.findByUser = function(userId, options = {}) {
  const query = this.find({ userId });
  
  if (options.category) {
    query.where('category', options.category);
  }
  
  if (options.status) {
    query.where('status', options.status);
  }
  
  if (options.clientId) {
    query.where('clientId', options.clientId);
  }
  
  if (options.grantId) {
    query.where('grantId', options.grantId);
  }
  
  if (options.search) {
    query.or([
      { filename: new RegExp(options.search, 'i') },
      { originalName: new RegExp(options.search, 'i') },
      { description: new RegExp(options.search, 'i') },
      { tags: new RegExp(options.search, 'i') }
    ]);
  }
  
  // Exclude deleted documents by default
  if (options.includeDeleted !== true) {
    query.where('status').ne('deleted');
  }
  
  return query;
};

documentSchema.statics.getStorageStats = function(userId) {
  return this.aggregate([
    { 
      $match: { 
        userId: new mongoose.Types.ObjectId(userId),
        status: { $ne: 'deleted' }
      } 
    },
    {
      $group: {
        _id: null,
        totalDocuments: { $sum: 1 },
        totalStorageUsed: { $sum: '$fileSize' },
        averageFileSize: { $avg: '$fileSize' },
        largestFile: { $max: '$fileSize' },
        byCategory: {
          $push: {
            category: '$category',
            fileSize: '$fileSize'
          }
        },
        byType: {
          $push: {
            documentType: '$documentType',
            fileSize: '$fileSize'
          }
        },
        byStorageProvider: {
          $push: {
            provider: '$storageProvider',
            fileSize: '$fileSize'
          }
        }
      }
    }
  ]);
};

documentSchema.statics.findSharedWithUser = function(userId) {
  return this.find({
    $or: [
      { 'sharedWith.userId': userId },
      { visibility: 'public' }
    ],
    status: { $ne: 'deleted' }
  });
};

documentSchema.statics.findExpiringRetention = function(days = 30) {
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + days);
  
  return this.find({
    retentionExpiresAt: { $lte: expirationDate },
    status: { $ne: 'deleted' }
  });
};

documentSchema.statics.getPopularDocuments = function(userId, limit = 10) {
  return this.find({ 
    userId,
    status: { $ne: 'deleted' }
  })
    .sort({ downloadCount: -1, viewCount: -1 })
    .limit(limit);
};

// New static method for GridFS documents
documentSchema.statics.findGridFSDocuments = function(userId, options = {}) {
  const query = this.find({ 
    userId,
    storageProvider: 'gridfs',
    status: { $ne: 'deleted' }
  });
  
  if (options.gridfsFileId) {
    query.where('gridfsFileId', options.gridfsFileId);
  }
  
  return query;
};

// ===== INSTANCE METHODS =====
documentSchema.methods.incrementViewCount = function() {
  this.viewCount += 1;
  this.lastAccessed = new Date();
  return this.save();
};

documentSchema.methods.incrementDownloadCount = function() {
  this.downloadCount += 1;
  this.lastAccessed = new Date();
  return this.save();
};

documentSchema.methods.addToVersionHistory = function(versionData) {
  const historyEntry = {
    version: this.version,
    filename: this.filename,
    fileSize: this.fileSize,
    storagePath: this.storagePath,
    gridfsFileId: this.gridfsFileId,
    gridfsFilename: this.gridfsFilename,
    storageProvider: this.storageProvider,
    changes: versionData.changes || '',
    createdBy: versionData.createdBy || this.userId,
    createdAt: new Date()
  };
  
  this.versionHistory.push(historyEntry);
  return this.save();
};

documentSchema.methods.createNewVersion = function(newDocumentData) {
  // Archive current version
  this.isLatestVersion = false;
  this.status = 'archived';
  
  // Add current version to history
  this.addToVersionHistory({
    changes: 'New version created',
    createdBy: newDocumentData.userId || this.userId
  });
  
  // Create new version
  const newVersion = this.toObject();
  delete newVersion._id;
  delete newVersion.versionHistory;
  
  Object.assign(newVersion, newDocumentData, {
    parentDocument: this._id,
    version: this.version + 1,
    isLatestVersion: true,
    status: 'draft',
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  return newVersion;
};

documentSchema.methods.canUserAccess = function(userId) {
  // User owns the document
  if (this.userId.toString() === userId.toString()) {
    return { canAccess: true, permission: 'owner' };
  }
  
  // Document is public
  if (this.visibility === 'public') {
    return { canAccess: true, permission: 'view' };
  }
  
  // Check shared access
  const sharedAccess = this.sharedWith.find(share => 
    share.userId.toString() === userId.toString()
  );
  
  if (sharedAccess) {
    // Check if share has expired
    if (sharedAccess.expiresAt && new Date() > sharedAccess.expiresAt) {
      return { canAccess: false, reason: 'Share expired' };
    }
    
    return { 
      canAccess: true, 
      permission: sharedAccess.permission,
      expiresAt: sharedAccess.expiresAt 
    };
  }
  
  return { canAccess: false };
};

documentSchema.methods.shareWithUser = function(targetUserId, permission = 'view', sharedByUserId, expiresAt = null) {
  // Remove existing share if it exists
  this.sharedWith = this.sharedWith.filter(share => 
    share.userId.toString() !== targetUserId.toString()
  );
  
  // Add new share
  this.sharedWith.push({
    userId: targetUserId,
    permission,
    sharedBy: sharedByUserId,
    sharedAt: new Date(),
    expiresAt
  });
  
  this.visibility = 'shared';
  this.shareCount = this.sharedWith.length;
  
  return this.save();
};

documentSchema.methods.removeShare = function(targetUserId) {
  this.sharedWith = this.sharedWith.filter(share => 
    share.userId.toString() !== targetUserId.toString()
  );
  
  this.shareCount = this.sharedWith.length;
  this.visibility = this.sharedWith.length > 0 ? 'shared' : 'private';
  
  return this.save();
};

documentSchema.methods.softDelete = function() {
  this.status = 'deleted';
  this.deletedAt = new Date();
  return this.save();
};

documentSchema.methods.restore = function() {
  this.status = 'draft';
  this.deletedAt = null;
  return this.save();
};

documentSchema.methods.getRelatedDocuments = function(relationshipType = null) {
  if (!relationshipType) {
    return this.relatedDocuments;
  }
  
  return this.relatedDocuments.filter(rel => rel.relationship === relationshipType);
};

// New instance methods for GridFS
documentSchema.methods.getGridFSInfo = async function() {
  if (this.storageProvider !== 'gridfs' || !this.gridfsFileId) {
    return null;
  }
  
  try {
    const gridfsService = require('../services/gridfsService');
    return await gridfsService.getFileInfo(this.gridfsFileId);
  } catch (error) {
    console.error('Error getting GridFS info:', error);
    return null;
  }
};

documentSchema.methods.hasValidGridFSFile = async function() {
  if (this.storageProvider !== 'gridfs' || !this.gridfsFileId) {
    return false;
  }
  
  try {
    const gridfsService = require('../services/gridfsService');
    return await gridfsService.fileExists(this.gridfsFileId);
  } catch (error) {
    console.error('Error checking GridFS file:', error);
    return false;
  }
};

// ===== QUERY HELPERS =====
documentSchema.query.byUser = function(userId) {
  return this.where({ userId });
};

documentSchema.query.byClient = function(clientId) {
  return this.where({ clientId });
};

documentSchema.query.byGrant = function(grantId) {
  return this.where({ grantId });
};

documentSchema.query.byCategory = function(category) {
  return this.where({ category });
};

documentSchema.query.byType = function(documentType) {
  return this.where({ documentType });
};

documentSchema.query.byStatus = function(status) {
  return this.where({ status });
};

documentSchema.query.byStorageProvider = function(provider) {
  return this.where({ storageProvider: provider });
};

documentSchema.query.search = function(searchTerm) {
  if (!searchTerm) return this;
  
  const regex = new RegExp(searchTerm, 'i');
  return this.or([
    { filename: regex },
    { originalName: regex },
    { description: regex },
    { tags: regex }
  ]);
};

documentSchema.query.recent = function(days = 7) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return this.where('createdAt').gte(date);
};

documentSchema.query.largeFiles = function(sizeInMB = 10) {
  const sizeInBytes = sizeInMB * 1024 * 1024;
  return this.where('fileSize').gte(sizeInBytes);
};

documentSchema.query.active = function() {
  return this.where('status').ne('deleted');
};

documentSchema.query.gridfsOnly = function() {
  return this.where('storageProvider', 'gridfs');
};

// Export the model
module.exports = mongoose.model('Document', documentSchema);