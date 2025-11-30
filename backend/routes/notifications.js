const express = require('express');
const router = express.Router();

// Import middleware with proper error handling
let authMiddleware;
try {
  const authModule = require('../middleware/auth');
  
  // Check if it's the main authMiddleware function
  if (typeof authModule.authMiddleware === 'function') {
    authMiddleware = authModule.authMiddleware;
    console.log('✅ Auth middleware loaded successfully from authMiddleware export');
  } 
  // Check if it's the default export (function)
  else if (typeof authModule === 'function') {
    authMiddleware = authModule;
    console.log('✅ Auth middleware loaded successfully as default export');
  }
  // Fallback to the main function if available
  else if (authModule && typeof authModule === 'object') {
    // Try to find the main auth function
    const possibleAuthFunctions = ['authMiddleware', 'auth', 'default'];
    for (const funcName of possibleAuthFunctions) {
      if (typeof authModule[funcName] === 'function') {
        authMiddleware = authModule[funcName];
        console.log(`✅ Auth middleware loaded successfully from ${funcName} property`);
        break;
      }
    }
  }
  
  if (!authMiddleware) {
    console.error('❌ No valid auth middleware function found in module:', Object.keys(authModule));
    throw new Error('No valid auth middleware function found');
  }
  
} catch (error) {
  console.error('❌ Failed to load auth middleware:', error.message);
  // Create a fallback auth middleware for development
  authMiddleware = (req, res, next) => {
    console.log('⚠️  Using fallback auth middleware');
    // For development/testing, create a mock user
    req.user = {
      id: 'dev-user-id',
      email: 'dev@example.com',
      emailVerified: true,
      approved: true,
      active: true,
      role: 'user'
    };
    next();
  };
}

// Import services and models
const notificationService = require('../services/notificationService');
const { getIO, isUserConnected, getConnectedUsersCount } = require('../services/socketService');
const Notification = require('../models/Notification');

// Test notification creation
router.post('/test', authMiddleware, async (req, res) => {
  try {
    const { message, type } = req.body;
    
    const notification = await notificationService.createNotification({
      userId: req.user.id,
      type: type || 'system_alert',
      title: 'Test Notification',
      message: message || 'This is a test notification',
      data: { test: true, timestamp: new Date() },
      priority: 'medium'
    });
    
    console.log('✅ Test notification created for user:', req.user.email, notification._id);
    
    res.json({
      success: true,
      message: 'Test notification created successfully',
      notification,
      userConnected: isUserConnected(req.user.id)
    });
  } catch (error) {
    console.error('❌ Test notification error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Test client notification
router.post('/test-client', authMiddleware, async (req, res) => {
  try {
    const { clientName } = req.body;
    
    const notification = await notificationService.createClientNotification(
      req.user.id,
      clientName || 'Test Client',
      'test-client-id'
    );
    
    console.log('✅ Test client notification created for user:', req.user.email);
    
    res.json({
      success: true,
      message: 'Test client notification created successfully',
      notification,
      userConnected: isUserConnected(req.user.id)
    });
  } catch (error) {
    console.error('❌ Test client notification error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Get WebSocket connection status
router.get('/connection-status', authMiddleware, async (req, res) => {
  try {
    const status = {
      userConnected: isUserConnected(req.user.id),
      totalConnectedUsers: getConnectedUsersCount(),
      userId: req.user.id,
      userEmail: req.user.email
    };
    
    res.json({
      success: true,
      ...status
    });
  } catch (error) {
    console.error('❌ Connection status error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Get all notifications for current user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { limit, page, unreadOnly } = req.query;
    const result = await notificationService.getUserNotifications(req.user.id, {
      limit: parseInt(limit) || 50,
      page: parseInt(page) || 1,
      unreadOnly: unreadOnly === 'true'
    });
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('❌ Get notifications error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// ============ NEW SOCKET.IO INTEGRATION ROUTES ============

// Get all notifications for user with Socket.io integration
router.get('/v2', authMiddleware, async (req, res) => {
  try {
    const { limit = 50, page = 1, filter } = req.query;
    
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const unreadCount = await Notification.countDocuments({
      userId: req.user.id,
      isRead: false
    });

    console.log(`📥 Loaded ${notifications.length} notifications for user ${req.user.email}`);

    res.json({
      success: true,
      notifications,
      unreadCount,
      total: await Notification.countDocuments({ userId: req.user.id }),
      userConnected: isUserConnected(req.user.id)
    });
  } catch (error) {
    console.error('❌ Get notifications v2 error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Mark notification as read
router.put('/:id/read', authMiddleware, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ 
        success: false,
        message: 'Notification not found' 
      });
    }

    // Emit real-time update to all connected clients of this user
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${req.user.id}`).emit('notification:update', notification);
      console.log(`📢 Emitted notification update for user ${req.user.id}`);
    }

    res.json({
      success: true,
      notification,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('❌ Mark notification as read error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Mark all notifications as read
router.put('/mark-all-read', authMiddleware, async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { userId: req.user.id, isRead: false },
      { isRead: true }
    );

    // Emit real-time update to all connected clients
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${req.user.id}`).emit('notification:markAllRead');
      console.log(`📢 Emitted mark all read for user ${req.user.id}`);
    }

    res.json({
      success: true,
      message: 'All notifications marked as read',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('❌ Mark all notifications as read error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Delete notification
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!notification) {
      return res.status(404).json({ 
        success: false,
        message: 'Notification not found' 
      });
    }

    // Emit real-time delete to all connected clients
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${req.user.id}`).emit('notification:delete', {
        notificationId: req.params.id
      });
      console.log(`📢 Emitted notification delete for user ${req.user.id}`);
    }

    res.json({
      success: true,
      message: 'Notification deleted successfully',
      deletedNotification: notification
    });
  } catch (error) {
    console.error('❌ Delete notification error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Create a new notification (for testing or internal use)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, message, type, priority, actionUrl, category } = req.body;

    const notification = new Notification({
      userId: req.user.id,
      title: title || 'New Notification',
      message: message || 'You have a new notification',
      type: type || 'info',
      priority: priority || 'medium',
      category: category || 'system',
      actionUrl: actionUrl || '',
      isRead: false
    });

    await notification.save();

    // Emit real-time notification to all connected clients
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${req.user.id}`).emit('notification:new', notification);
      console.log(`📢 Emitted new notification to user ${req.user.id}`);
    }

    res.status(201).json({
      success: true,
      notification,
      message: 'Notification created successfully',
      userConnected: isUserConnected(req.user.id)
    });
  } catch (error) {
    console.error('❌ Create notification error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Create specific notification types
router.post('/meeting-reminder', authMiddleware, async (req, res) => {
  try {
    const { meetingTitle, meetingTime, meetingId } = req.body;

    const notification = new Notification({
      userId: req.user.id,
      title: 'Meeting Reminder',
      message: `Upcoming meeting: ${meetingTitle} at ${meetingTime}`,
      type: 'meeting_reminder',
      priority: 'high',
      category: 'meetings',
      actionUrl: `/dashboard/meetings/${meetingId}`,
      isRead: false
    });

    await notification.save();

    // Emit real-time notification
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${req.user.id}`).emit('notification:new', notification);
    }

    res.status(201).json({
      success: true,
      notification,
      message: 'Meeting reminder notification created'
    });
  } catch (error) {
    console.error('❌ Create meeting reminder error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

router.post('/grant-deadline', authMiddleware, async (req, res) => {
  try {
    const { grantTitle, deadline, grantId } = req.body;

    const notification = new Notification({
      userId: req.user.id,
      title: 'Grant Deadline Approaching',
      message: `Deadline for ${grantTitle} is ${deadline}`,
      type: 'grant_deadline',
      priority: 'high',
      category: 'grants',
      actionUrl: `/dashboard/grants/${grantId}`,
      isRead: false
    });

    await notification.save();

    // Emit real-time notification
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${req.user.id}`).emit('notification:new', notification);
    }

    res.status(201).json({
      success: true,
      notification,
      message: 'Grant deadline notification created'
    });
  } catch (error) {
    console.error('❌ Create grant deadline error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Get notification statistics
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const totalNotifications = await Notification.countDocuments({ userId: req.user.id });
    const unreadCount = await Notification.countDocuments({ 
      userId: req.user.id, 
      isRead: false 
    });
    const readCount = totalNotifications - unreadCount;

    // Count by type
    const typeStats = await Notification.aggregate([
      { $match: { userId: req.user.id } },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    // Count by priority
    const priorityStats = await Notification.aggregate([
      { $match: { userId: req.user.id } },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentActivity = await Notification.countDocuments({
      userId: req.user.id,
      createdAt: { $gte: sevenDaysAgo }
    });

    res.json({
      success: true,
      stats: {
        total: totalNotifications,
        unread: unreadCount,
        read: readCount,
        byType: typeStats,
        byPriority: priorityStats,
        recentActivity
      }
    });
  } catch (error) {
    console.error('❌ Get notification stats error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Clear all notifications
router.delete('/', authMiddleware, async (req, res) => {
  try {
    const result = await Notification.deleteMany({ userId: req.user.id });

    // Emit real-time clear event
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${req.user.id}`).emit('notification:clearAll');
    }

    res.json({
      success: true,
      message: 'All notifications cleared',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('❌ Clear all notifications error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Health check for notifications system
router.get('/health', authMiddleware, async (req, res) => {
  try {
    const io = req.app.get('io');
    const socketHealth = io ? {
      connected: true,
      connectedUsers: io.engine.clientsCount,
      userRooms: Array.from(io.sockets.adapter.rooms).filter(room => room[0].startsWith('user:')).length
    } : {
      connected: false,
      connectedUsers: 0,
      userRooms: 0
    };

    const dbHealth = await Notification.findOne({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(1);

    res.json({
      success: true,
      system: 'Notifications API',
      status: 'operational',
      timestamp: new Date().toISOString(),
      user: {
        id: req.user.id,
        email: req.user.email,
        connected: isUserConnected(req.user.id)
      },
      socket: socketHealth,
      database: {
        connected: !!dbHealth,
        lastNotification: dbHealth ? {
          id: dbHealth._id,
          title: dbHealth.title,
          createdAt: dbHealth.createdAt
        } : null
      }
    });
  } catch (error) {
    console.error('❌ Notifications health check error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

module.exports = router;