const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  date: {
    type: String, // Stored as YYYY-MM-DD
    required: true
  },
  time: {
    type: String, // Stored as HH:MM
    required: true
  },
  duration: {
    type: Number,
    required: true,
    default: 60
  },
  type: {
    type: String,
    enum: ['client', 'internal', 'grant', 'planning'],
    default: 'client'
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client'
  },
  clientName: {
    type: String
  },
  participants: [{
    type: String
  }],
  agenda: [{
    type: String
  }],
  location: {
    type: String,
    enum: ['virtual', 'office', 'client-site', 'other'],
    default: 'virtual'
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'],
    default: 'scheduled'
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Index for efficient querying
meetingSchema.index({ user: 1, date: 1, time: 1 });
meetingSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model('Meeting', meetingSchema);