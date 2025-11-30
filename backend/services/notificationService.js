const Notification = require('../models/Notification');

class NotificationService {
  // Create a new notification
  async createNotification(notificationData) {
    try {
      console.log('📝 Creating notification:', notificationData);
      const notification = new Notification(notificationData);
      await notification.save();
      
      // Emit real-time event
      this.emitNotification(notification);
      
      console.log('✅ Notification created successfully:', notification._id);
      return notification;
    } catch (error) {
      console.error('❌ Failed to create notification:', error);
      throw new Error(`Failed to create notification: ${error.message}`);
    }
  }

  // Get user notifications
  async getUserNotifications(userId, options = {}) {
    try {
      const { limit = 50, page = 1, unreadOnly = false } = options;
      const skip = (page - 1) * limit;

      const query = { userId };
      if (unreadOnly) {
        query.isRead = false;
      }

      const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name email');

      const total = await Notification.countDocuments(query);
      const unreadCount = await Notification.countDocuments({ 
        userId, 
        isRead: false 
      });

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
  }

  // Mark notification as read
  async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, userId },
        { isRead: true },
        { new: true }
      );
      
      if (notification) {
        this.emitNotificationUpdate(notification);
      }
      
      return notification;
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
      throw error;
    }
  }

  // Mark all notifications as read
  async markAllAsRead(userId) {
    try {
      const result = await Notification.updateMany(
        { userId, isRead: false },
        { isRead: true }
      );

      if (result.modifiedCount > 0) {
        this.emitBulkNotificationUpdate(userId);
      }

      return result;
    } catch (error) {
      console.error('❌ Error marking all notifications as read:', error);
      throw error;
    }
  }

  // Delete notification
  async deleteNotification(notificationId, userId) {
    try {
      const notification = await Notification.findOneAndDelete({
        _id: notificationId,
        userId
      });

      if (notification) {
        this.emitNotificationDelete(notification);
      }

      return notification;
    } catch (error) {
      console.error('❌ Error deleting notification:', error);
      throw error;
    }
  }

  // Create client notification
  async createClientNotification(userId, clientName, clientId) {
    return this.createNotification({
      userId,
      type: 'client_communication',
      title: 'New Client Added',
      message: `Successfully added ${clientName} to your client list`,
      data: { clientId, clientName },
      actionUrl: `/clients/${clientId}`,
      priority: 'medium'
    });
  }

  // Create AI completion notification
  async createAICompletionNotification(userId, documentTitle) {
    return this.createNotification({
      userId,
      type: 'ai_completion',
      title: 'AI Writing Complete',
      message: `Your document "${documentTitle}" has been generated`,
      data: { documentTitle },
      priority: 'medium'
    });
  }

  // Create grant deadline notification
  async createGrantDeadlineNotification(userId, grantTitle, grantId, daysUntilDeadline) {
    return this.createNotification({
      userId,
      type: 'grant_deadline',
      title: 'Grant Deadline Approaching',
      message: `Grant "${grantTitle}" deadline in ${daysUntilDeadline} days`,
      data: { grantId, grantTitle, daysUntilDeadline },
      actionUrl: `/grants/${grantId}`,
      priority: daysUntilDeadline <= 3 ? 'urgent' : 'high'
    });
  }

  // ============ NEW ENHANCED METHODS ============

  // Create meeting reminder notification
  async createMeetingReminderNotification(userId, meetingTitle, meetingTime, meetingId) {
    return this.createNotification({
      userId,
      type: 'meeting_reminder',
      title: 'Meeting Reminder',
      message: `Upcoming meeting: ${meetingTitle} at ${meetingTime}`,
      data: { meetingId, meetingTitle, meetingTime },
      actionUrl: `/dashboard/meetings/${meetingId}`,
      priority: 'high',
      category: 'meetings'
    });
  }

  // Create system alert notification
  async createSystemAlertNotification(userId, title, message, priority = 'medium') {
    return this.createNotification({
      userId,
      type: 'system_alert',
      title,
      message,
      priority,
      category: 'system'
    });
  }

  // Create email sent notification
  async createEmailSentNotification(userId, recipient, subject) {
    return this.createNotification({
      userId,
      type: 'email_sent',
      title: 'Email Sent Successfully',
      message: `Email to ${recipient}: ${subject}`,
      data: { recipient, subject },
      priority: 'low',
      category: 'clients'
    });
  }

  // Create collaboration notification
  async createCollaborationNotification(userId, collaboratorName, documentTitle, documentId) {
    return this.createNotification({
      userId,
      type: 'collaboration',
      title: 'Collaboration Update',
      message: `${collaboratorName} updated "${documentTitle}"`,
      data: { collaboratorName, documentTitle, documentId },
      actionUrl: `/dashboard/ai-writing/${documentId}`,
      priority: 'medium',
      category: 'submissions'
    });
  }

  // Create submission status notification
  async createSubmissionStatusNotification(userId, grantTitle, status, submissionId) {
    return this.createNotification({
      userId,
      type: 'submission_status',
      title: 'Submission Status Update',
      message: `Grant submission "${grantTitle}" is now ${status}`,
      data: { grantTitle, status, submissionId },
      actionUrl: `/dashboard/submissions/${submissionId}`,
      priority: 'medium',
      category: 'submissions'
    });
  }

  // Get notification statistics for user
  async getUserNotificationStats(userId) {
    try {
      const total = await Notification.countDocuments({ userId });
      const unreadCount = await Notification.countDocuments({ 
        userId, 
        isRead: false 
      });

      // Count by type
      const typeStats = await Notification.aggregate([
        { $match: { userId } },
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ]);

      // Count by priority
      const priorityStats = await Notification.aggregate([
        { $match: { userId } },
        { $group: { _id: '$priority', count: { $sum: 1 } } }
      ]);

      // Recent activity (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const recentActivity = await Notification.countDocuments({
        userId,
        createdAt: { $gte: sevenDaysAgo }
      });

      return {
        total,
        unread: unreadCount,
        read: total - unreadCount,
        byType: typeStats,
        byPriority: priorityStats,
        recentActivity
      };
    } catch (error) {
      console.error('❌ Error getting notification stats:', error);
      throw error;
    }
  }

  // Get filtered notifications by type/category
  async getFilteredNotifications(userId, filter = 'all', options = {}) {
    try {
      const { limit = 50, page = 1 } = options;
      const skip = (page - 1) * limit;

      let query = { userId };

      switch (filter) {
        case 'unread':
          query.isRead = false;
          break;
        case 'meetings':
          query.$or = [
            { type: 'meeting_reminder' },
            { category: 'meetings' }
          ];
          break;
        case 'grants':
          query.$or = [
            { type: 'grant_deadline' },
            { category: 'grants' }
          ];
          break;
        case 'system':
          query.$or = [
            { type: 'system_alert' },
            { category: 'system' }
          ];
          break;
        case 'clients':
          query.$or = [
            { type: 'client_communication' },
            { category: 'clients' }
          ];
          break;
        // 'all' case - no additional filters
      }

      const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Notification.countDocuments(query);
      const unreadCount = await Notification.countDocuments({ 
        userId, 
        isRead: false 
      });

      return {
        notifications,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        unreadCount,
        filter
      };
    } catch (error) {
      console.error('❌ Error getting filtered notifications:', error);
      throw error;
    }
  }

  // Clear all notifications for user
  async clearAllNotifications(userId) {
    try {
      const result = await Notification.deleteMany({ userId });

      if (result.deletedCount > 0) {
        this.emitClearAllNotifications(userId);
      }

      return result;
    } catch (error) {
      console.error('❌ Error clearing all notifications:', error);
      throw error;
    }
  }

  // Create multiple notifications in batch
  async createBatchNotifications(notificationsData) {
    try {
      const notifications = await Notification.insertMany(notificationsData);
      
      // Emit real-time events for each notification
      notifications.forEach(notification => {
        this.emitNotification(notification);
      });

      console.log(`✅ Created ${notifications.length} notifications in batch`);
      return notifications;
    } catch (error) {
      console.error('❌ Error creating batch notifications:', error);
      throw error;
    }
  }

  // Get recent notifications (last 24 hours)
  async getRecentNotifications(userId, hours = 24) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setHours(cutoffDate.getHours() - hours);

      const notifications = await Notification.find({
        userId,
        createdAt: { $gte: cutoffDate }
      })
      .sort({ createdAt: -1 })
      .limit(100);

      return notifications;
    } catch (error) {
      console.error('❌ Error getting recent notifications:', error);
      throw error;
    }
  }

  // ============ ENHANCED EMITTER METHODS ============

  // Emit real-time events
  emitNotification(notification) {
    try {
      if (global.io) {
        const userRoom = `user:${notification.userId.toString()}`;
        global.io.to(userRoom).emit('notification:new', notification);
        console.log(`📢 Real-time notification sent to user ${notification.userId} in room ${userRoom}`);
      } else {
        console.log('⚠️ WebSocket not available for real-time notification');
      }
    } catch (error) {
      console.error('❌ Error emitting notification:', error);
    }
  }

  emitNotificationUpdate(notification) {
    try {
      if (global.io) {
        const userRoom = `user:${notification.userId.toString()}`;
        global.io.to(userRoom).emit('notification:update', notification);
        console.log(`📢 Notification update sent to user ${notification.userId}`);
      }
    } catch (error) {
      console.error('❌ Error emitting notification update:', error);
    }
  }

  emitNotificationDelete(notification) {
    try {
      if (global.io) {
        const userRoom = `user:${notification.userId.toString()}`;
        global.io.to(userRoom).emit('notification:delete', {
          notificationId: notification._id
        });
        console.log(`📢 Notification delete sent to user ${notification.userId}`);
      }
    } catch (error) {
      console.error('❌ Error emitting notification delete:', error);
    }
  }

  emitBulkNotificationUpdate(userId) {
    try {
      if (global.io) {
        const userRoom = `user:${userId.toString()}`;
        global.io.to(userRoom).emit('notification:markAllRead');
        console.log(`📢 Bulk notification update sent to user ${userId}`);
      }
    } catch (error) {
      console.error('❌ Error emitting bulk notification update:', error);
    }
  }

  emitClearAllNotifications(userId) {
    try {
      if (global.io) {
        const userRoom = `user:${userId.toString()}`;
        global.io.to(userRoom).emit('notification:clearAll');
        console.log(`📢 Clear all notifications sent to user ${userId}`);
      }
    } catch (error) {
      console.error('❌ Error emitting clear all notifications:', error);
    }
  }

  // Check if user has WebSocket connection
  isUserConnected(userId) {
    try {
      if (!global.io) return false;
      
      const userRoom = `user:${userId.toString()}`;
      const room = global.io.sockets.adapter.rooms.get(userRoom);
      return room ? room.size > 0 : false;
    } catch (error) {
      console.error('❌ Error checking user connection:', error);
      return false;
    }
  }

  // Get connected users count
  getConnectedUsersCount() {
    try {
      if (!global.io) return 0;
      return global.io.engine.clientsCount;
    } catch (error) {
      console.error('❌ Error getting connected users count:', error);
      return 0;
    }
  }
}

module.exports = new NotificationService();