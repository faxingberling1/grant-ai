const mongoose = require('mongoose');

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
  // Core Identification
  organizationName: { type: String, required: true },
  primaryContactName: { type: String, required: true },
  titleRole: String,
  
  // Contact Information
  emailAddress: { type: String, required: true },
  phoneNumbers: String,
  additionalContactName: String,
  additionalContactTitle: String,
  additionalContactEmail: String,
  additionalContactPhone: String,
  
  // Organization Details
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
  
  // Status & Tracking
  status: { type: String, enum: ['active', 'inactive', 'prospect'], default: 'active' },
  tags: [String],
  notes: String,
  avatar: String,
  
  // Grant Metrics
  grantsSubmitted: { type: Number, default: 0 },
  grantsAwarded: { type: Number, default: 0 },
  totalFunding: { type: String, default: '$0' },
  lastContact: { type: Date, default: Date.now },
  
  // Communication History
  communicationHistory: [communicationSchema],
  
  // User association
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for performance
clientSchema.index({ userId: 1 });
clientSchema.index({ emailAddress: 1 });
clientSchema.index({ organizationName: 1 });
clientSchema.index({ status: 1 });
clientSchema.index({ tags: 1 });
clientSchema.index({ createdAt: -1 });

// Update updatedAt before saving
clientSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Client', clientSchema);