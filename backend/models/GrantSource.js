const mongoose = require('mongoose');

const grantSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Grant title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  amount: {
    type: String,
    required: [true, 'Grant amount is required']
  },
  deadline: {
    type: Date,
    required: [true, 'Grant deadline is required']
  },
  category: {
    type: String,
    required: [true, 'Grant category is required'],
    enum: ['Education', 'Healthcare', 'Environment', 'Arts & Culture', 'Social Justice', 'STEM Education', 'Clean Energy', 'Other']
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'completed'],
    default: 'active'
  },
  eligibility: {
    type: String,
    trim: true
  },
  focusAreas: [{
    type: String,
    trim: true
  }],
  applicationProcess: {
    type: String,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

const grantSourceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Grant source name is required'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Grant source type is required'],
    enum: ['government', 'private_foundation', 'community_foundation', 'corporate', 'other']
  },
  category: {
    type: String,
    required: [true, 'Grant source category is required'],
    enum: ['Education', 'Healthcare', 'Environment', 'Arts & Culture', 'Social Justice', 'STEM Education', 'Clean Energy', 'Other']
  },
  description: {
    type: String,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  contact: {
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      trim: true
    }
  },
  eligibility: {
    type: String,
    trim: true
  },
  focusAreas: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'researching'],
    default: 'active'
  },
  tags: [{
    type: String,
    trim: true
  }],
  grants: [grantSchema],
  notes: {
    type: String,
    trim: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
grantSourceSchema.index({ userId: 1, name: 1 });
grantSourceSchema.index({ userId: 1, type: 1 });
grantSourceSchema.index({ userId: 1, category: 1 });
grantSourceSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('GrantSource', grantSourceSchema);