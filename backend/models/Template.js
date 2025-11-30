const mongoose = require('mongoose');

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
      values: ['proposal', 'followup', 'meeting', 'thankyou', 'reminder', 'newsletter', 'fundraising', 'notification', 'other'],
      message: 'Category must be one of: proposal, followup, meeting, thankyou, reminder, newsletter, fundraising, notification, other'
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
  // NEW: Mark as system template available to all users
  isSystemTemplate: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return !this.isSystemTemplate; // Only required for non-system templates
    }
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
templateSchema.index({ isSystemTemplate: 1, isActive: 1 });
templateSchema.index({ title: 'text', description: 'text', subject: 'text' });
templateSchema.index({ createdBy: 1 });
templateSchema.index({ isSystemTemplate: 1, category: 1 });

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

// Virtual to check if template can be edited
templateSchema.virtual('canEdit').get(function() {
  return !this.isSystemTemplate; // Only non-system templates can be edited by regular users
});

// Middleware to update preview if content changes
templateSchema.pre('save', function(next) {
  if (this.isModified('content') && this.content) {
    this.preview = this.content.substring(0, 100) + (this.content.length > 100 ? '...' : '');
  }
  
  // Auto-populate variables from content if not provided
  if (this.isModified('content') && (!this.variables || this.variables.length === 0)) {
    const variableRegex = /\[(.*?)\]/g;
    const matches = this.content.match(variableRegex);
    if (matches) {
      this.variables = [...new Set(matches)]; // Remove duplicates
    }
  }
  
  next();
});

// Static method to get templates by category
templateSchema.statics.findByCategory = function(category, includeSystem = true) {
  let query = { isActive: true };
  
  if (category !== 'all') {
    query.category = category;
  }
  
  if (!includeSystem) {
    query.isSystemTemplate = false;
  }
  
  return this.find(query).sort({ isSystemTemplate: -1, createdAt: -1 });
};

// Static method to get system templates
templateSchema.statics.getSystemTemplates = function(category = 'all') {
  let query = { isActive: true, isSystemTemplate: true };
  
  if (category !== 'all') {
    query.category = category;
  }
  
  return this.find(query).sort({ category: 1, title: 1 });
};

// Static method to get user templates
templateSchema.statics.getUserTemplates = function(userId, category = 'all') {
  let query = { 
    isActive: true, 
    isSystemTemplate: false,
    createdBy: userId 
  };
  
  if (category !== 'all') {
    query.category = category;
  }
  
  return this.find(query).sort({ createdAt: -1 });
};

// Static method to get all templates for a user (system + user templates)
templateSchema.statics.getAllTemplatesForUser = function(userId, category = 'all') {
  let categoryQuery = {};
  
  if (category !== 'all') {
    categoryQuery.category = category;
  }
  
  return this.find({
    isActive: true,
    $or: [
      { isSystemTemplate: true }, // System templates
      { isSystemTemplate: false, createdBy: userId } // User's own templates
    ],
    ...categoryQuery
  }).sort({ isSystemTemplate: -1, createdAt: -1 });
};

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

// Static method to create system template (admin only)
templateSchema.statics.createSystemTemplate = async function(templateData) {
  const template = new this({
    ...templateData,
    isSystemTemplate: true,
    createdBy: null // System templates don't belong to any specific user
  });
  
  return template.save();
};

// Static method to check if user can modify template
templateSchema.statics.canUserModify = function(templateId, userId, isAdmin = false) {
  return this.findOne({
    _id: templateId,
    isActive: true,
    $or: [
      { createdBy: userId, isSystemTemplate: false }, // User's own non-system templates
      { isSystemTemplate: true, createdBy: userId }, // User's system templates (if any)
      { isSystemTemplate: true, isAdmin: true } // Admins can modify any system template
    ]
  });
};

module.exports = mongoose.model('Template', templateSchema);