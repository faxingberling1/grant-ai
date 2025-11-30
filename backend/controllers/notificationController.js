const NotificationService = require('./services/NotificationService');

const notificationService = new NotificationService();

const getNotifications = async (req, res) => {
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
};

const markAsRead = async (req, res) => {
  try {
    const notification = await notificationService.markAsRead(
      req.params.id, 
      req.user.id
    );
    
    if (!notification) {
      return res.status(404).json({ 
        success: false,
        error: 'Notification not found' 
      });
    }
    
    res.json({
      success: true,
      notification
    });
  } catch (error) {
    console.error('❌ Mark notification as read error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    const result = await notificationService.markAllAsRead(req.user.id);
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
};

const deleteNotification = async (req, res) => {
  try {
    const notification = await notificationService.deleteNotification(
      req.params.id,
      req.user.id
    );
    
    if (!notification) {
      return res.status(404).json({ 
        success: false,
        error: 'Notification not found' 
      });
    }
    
    res.json({ 
      success: true,
      message: 'Notification deleted successfully' 
    });
  } catch (error) {
    console.error('❌ Delete notification error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const unreadCount = await notificationService.getUserNotifications(req.user.id, { unreadOnly: true });
    
    res.json({ 
      success: true,
      unreadCount: unreadCount.unreadCount 
    });
  } catch (error) {
    console.error('❌ Get unread count error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

const createTestNotification = async (req, res) => {
  try {
    const { type, title, message, priority } = req.body;
    
    const notification = await notificationService.createNotification({
      userId: req.user.id,
      type: type || 'system_alert',
      title: title || 'Test Notification',
      message: message || 'This is a test notification from the server',
      priority: priority || 'medium',
      data: { test: true, timestamp: new Date() }
    });
    
    res.json({
      success: true,
      message: 'Test notification created',
      notification
    });
  } catch (error) {
    console.error('❌ Create test notification error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
  createTestNotification
};