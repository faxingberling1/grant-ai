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

// ===== INDEXES FOR PERFORMANCE =====
clientSchema.index({ userId: 1, organizationName: 1 });
clientSchema.index({ userId: 1, category: 1 });
clientSchema.index({ userId: 1, status: 1 });
clientSchema.index({ userId: 1, priority: 1 });
clientSchema.index({ userId: 1, createdAt: -1 });
clientSchema.index({ userId: 1, nextFollowUp: 1 });

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

module.exports = mongoose.model('Client', clientSchema);