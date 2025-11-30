const mongoose = require('mongoose');

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

grantSchema.index({ category: 1, status: 1, deadline: 1 });
grantSchema.index({ title: 'text', funder: 'text', description: 'text' });
grantSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Grant', grantSchema);