const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'meeting_reminder',
      'grant_deadline',
      'client_communication',
      'submission_status',
      'system_alert',
      'ai_completion',
      'email_sent',
      'collaboration',
      'info',
      'success',
      'warning',
      'error'
    ],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  actionUrl: {
    type: String,
    trim: true,
    default: ''
  },
  expiresAt: {
    type: Date
  },
  // New fields for enhanced functionality
  category: {
    type: String,
    enum: ['meetings', 'grants', 'system', 'clients', 'submissions', 'general'],
    default: 'general'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  source: {
    type: String,
    enum: ['system', 'user', 'ai', 'integration', 'admin'],
    default: 'system'
  },
  icon: {
    type: String,
    trim: true,
    default: ''
  },
  color: {
    type: String,
    trim: true,
    default: ''
  },
  // For grouping related notifications
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  // For tracking notification interactions
  interactedAt: {
    type: Date,
    default: null
  },
  interactionType: {
    type: String,
    enum: ['clicked', 'dismissed', 'archived', null],
    default: null
  },
  // For scheduled notifications
  scheduledFor: {
    type: Date,
    default: null
  },
  isScheduled: {
    type: Boolean,
    default: false
  },
  // For notification templates
  templateId: {
    type: String,
    trim: true,
    default: ''
  },
  // For tracking delivery status
  deliveryStatus: {
    type: String,
    enum: ['pending', 'delivered', 'failed', 'seen'],
    default: 'pending'
  },
  deliveredAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  },
  toObject: {
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Index for efficient queries
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
notificationSchema.index({ userId: 1, type: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, category: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, priority: 1, createdAt: -1 });
notificationSchema.index({ scheduledFor: 1 });
notificationSchema.index({ groupId: 1 });
notificationSchema.index({ deliveryStatus: 1 });

// Virtual for isExpired
notificationSchema.virtual('isExpired').get(function() {
  if (!this.expiresAt) return false;
  return this.expiresAt < new Date();
});

// Virtual for isActive (not expired and not read)
notificationSchema.virtual('isActive').get(function() {
  return !this.isRead && !this.isExpired;
});

// Virtual for age in minutes
notificationSchema.virtual('ageInMinutes').get(function() {
  return Math.floor((new Date() - this.createdAt) / (1000 * 60));
});

// Virtual for age in hours
notificationSchema.virtual('ageInHours').get(function() {
  return Math.floor((new Date() - this.createdAt) / (1000 * 60 * 60));
});

// Virtual for formatted time
notificationSchema.virtual('formattedTime').get(function() {
  const now = new Date();
  const diffInMinutes = Math.floor((now - this.createdAt) / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return this.createdAt.toLocaleDateString();
});

// Pre-save middleware to set category based on type if not provided
notificationSchema.pre('save', function(next) {
  if (!this.category) {
    const typeToCategoryMap = {
      'meeting_reminder': 'meetings',
      'grant_deadline': 'grants',
      'client_communication': 'clients',
      'submission_status': 'submissions',
      'system_alert': 'system',
      'ai_completion': 'system',
      'email_sent': 'clients',
      'collaboration': 'submissions',
      'info': 'general',
      'success': 'general',
      'warning': 'system',
      'error': 'system'
    };
    
    this.category = typeToCategoryMap[this.type] || 'general';
  }

  // Set default icon based on type if not provided
  if (!this.icon) {
    const typeToIconMap = {
      'meeting_reminder': 'fas fa-calendar-alt',
      'grant_deadline': 'fas fa-clock',
      'client_communication': 'fas fa-comments',
      'submission_status': 'fas fa-paper-plane',
      'system_alert': 'fas fa-exclamation-triangle',
      'ai_completion': 'fas fa-robot',
      'email_sent': 'fas fa-envelope',
      'collaboration': 'fas fa-users',
      'info': 'fas fa-info-circle',
      'success': 'fas fa-check-circle',
      'warning': 'fas fa-exclamation-triangle',
      'error': 'fas fa-exclamation-circle'
    };
    
    this.icon = typeToIconMap[this.type] || 'fas fa-bell';
  }

  // Set default color based on priority if not provided
  if (!this.color) {
    const priorityToColorMap = {
      'low': '#10b981',      // green
      'medium': '#3b82f6',   // blue
      'high': '#f59e0b',     // amber
      'urgent': '#ef4444'    // red
    };
    
    this.color = priorityToColorMap[this.priority] || '#3b82f6';
  }

  // Update delivery status when notification is created
  if (this.isNew) {
    this.deliveryStatus = 'delivered';
    this.deliveredAt = new Date();
  }

  next();
});

// Static method to create notification and emit via socket
notificationSchema.statics.createAndEmit = async function(notificationData, io) {
  try {
    const notification = new this(notificationData);
    await notification.save();
    
    if (io) {
      const userRoom = `user:${notificationData.userId.toString()}`;
      io.to(userRoom).emit('notification:new', notification);
      console.log(`📢 Emitted new notification to user ${notificationData.userId}`);
    }
    
    return notification;
  } catch (error) {
    console.error('❌ Error creating and emitting notification:', error);
    throw error;
  }
};

// Static method to mark notification as read and emit update
notificationSchema.statics.markAsReadAndEmit = async function(notificationId, userId, io) {
  try {
    const notification = await this.findOneAndUpdate(
      { _id: notificationId, userId },
      { 
        isRead: true,
        interactedAt: new Date(),
        interactionType: 'clicked'
      },
      { new: true }
    );

    if (notification && io) {
      const userRoom = `user:${userId.toString()}`;
      io.to(userRoom).emit('notification:update', notification);
      console.log(`📢 Emitted notification update for user ${userId}`);
    }

    return notification;
  } catch (error) {
    console.error('❌ Error marking notification as read and emitting:', error);
    throw error;
  }
};

// Static method to mark all notifications as read for user and emit
notificationSchema.statics.markAllAsReadAndEmit = async function(userId, io) {
  try {
    const result = await this.updateMany(
      { userId, isRead: false },
      { 
        isRead: true,
        interactedAt: new Date(),
        interactionType: 'clicked'
      }
    );

    if (result.modifiedCount > 0 && io) {
      const userRoom = `user:${userId.toString()}`;
      io.to(userRoom).emit('notification:markAllRead');
      console.log(`📢 Emitted mark all read for user ${userId}`);
    }

    return result;
  } catch (error) {
    console.error('❌ Error marking all notifications as read and emitting:', error);
    throw error;
  }
};

// Static method to get user notifications with pagination and filtering
notificationSchema.statics.getUserNotifications = async function(userId, options = {}) {
  try {
    const {
      limit = 50,
      page = 1,
      unreadOnly = false,
      type,
      category,
      priority,
      startDate,
      endDate
    } = options;

    const skip = (page - 1) * limit;
    const query = { userId };

    if (unreadOnly) query.isRead = false;
    if (type) query.type = type;
    if (category) query.category = category;
    if (priority) query.priority = priority;
    
    // Date range filtering
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const notifications = await this.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await this.countDocuments(query);
    const unreadCount = await this.countDocuments({ userId, isRead: false });

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      unreadCount
    };
  } catch (error) {
    console.error('❌ Error getting user notifications:', error);
    throw error;
  }
};

// Static method to get notification statistics for user
notificationSchema.statics.getUserStats = async function(userId) {
  try {
    const total = await this.countDocuments({ userId });
    const unreadCount = await this.countDocuments({ userId, isRead: false });
    
    const typeStats = await this.aggregate([
      { $match: { userId } },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    const priorityStats = await this.aggregate([
      { $match: { userId } },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    const categoryStats = await this.aggregate([
      { $match: { userId } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentActivity = await this.countDocuments({
      userId,
      createdAt: { $gte: sevenDaysAgo }
    });

    return {
      total,
      unread: unreadCount,
      read: total - unreadCount,
      byType: typeStats,
      byPriority: priorityStats,
      byCategory: categoryStats,
      recentActivity
    };
  } catch (error) {
    console.error('❌ Error getting user notification stats:', error);
    throw error;
  }
};

// Instance method to mark as read
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.interactedAt = new Date();
  this.interactionType = 'clicked';
  return this.save();
};

// Instance method to mark as dismissed
notificationSchema.methods.markAsDismissed = function() {
  this.isRead = true;
  this.interactedAt = new Date();
  this.interactionType = 'dismissed';
  return this.save();
};

// Instance method to get formatted data for frontend
notificationSchema.methods.toFrontendFormat = function() {
  return {
    id: this._id,
    userId: this.userId,
    type: this.type,
    title: this.title,
    message: this.message,
    data: this.data,
    priority: this.priority,
    isRead: this.isRead,
    actionUrl: this.actionUrl,
    category: this.category,
    icon: this.icon,
    color: this.color,
    createdAt: this.createdAt,
    formattedTime: this.formattedTime,
    isExpired: this.isExpired,
    isActive: this.isActive
  };
};

// Static method to cleanup expired notifications
notificationSchema.statics.cleanupExpired = async function() {
  try {
    const result = await this.deleteMany({
      expiresAt: { $lt: new Date() }
    });
    
    console.log(`🧹 Cleaned up ${result.deletedCount} expired notifications`);
    return result;
  } catch (error) {
    console.error('❌ Error cleaning up expired notifications:', error);
    throw error;
  }
};

module.exports = mongoose.model('Notification', notificationSchema);