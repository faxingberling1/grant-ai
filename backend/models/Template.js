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
    default: null // For now, we'll set this to null. Add authentication later.
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

// Static method to get templates by category
templateSchema.statics.findByCategory = function(category) {
  if (category === 'all') {
    return this.find({ isActive: true }).sort({ createdAt: -1 });
  }
  return this.find({ category, isActive: true }).sort({ createdAt: -1 });
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

module.exports = mongoose.model('Template', templateSchema);