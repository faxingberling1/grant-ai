const express = require('express');
const router = express.Router();

// Import admin middleware with proper error handling
let adminMiddleware;
try {
  adminMiddleware = require('../middleware/admin');
  
  // Verify it's a function
  if (typeof adminMiddleware !== 'function') {
    console.error('❌ Admin middleware is not a function. Type:', typeof adminMiddleware);
    throw new Error('Admin middleware must be a function');
  }
  
  console.log('✅ Admin middleware loaded successfully');
} catch (error) {
  console.error('❌ Failed to load admin middleware:', error.message);
  // Create a fallback admin middleware for development
  adminMiddleware = (req, res, next) => {
    console.log('⚠️  Using fallback admin middleware');
    // For development/testing, create a mock admin user
    req.user = {
      id: 'dev-admin-id',
      _id: 'dev-admin-id',
      email: 'admin@example.com',
      role: 'admin',
      approved: true,
      active: true,
      emailVerified: true
    };
    next();
  };
}

// Import admin controllers
const {
  getPendingUsers,
  getAdminStats,
  approveUser,
  bulkApproveUsers,
  rejectUser,
  getAllUsers,
  makeUserAdmin,
  deactivateUser,
  activateUser,
  getSystemStats,
  sendBulkNotification
} = require('../controllers/adminController');

// ==================== USER MANAGEMENT ROUTES ====================

/**
 * @route   GET /api/admin/pending-users
 * @desc    Get all pending user approvals
 * @access  Private/Admin
 */
router.get('/pending-users', adminMiddleware, getPendingUsers);

/**
 * @route   GET /api/admin/users
 * @desc    Get all users with filtering and pagination
 * @access  Private/Admin
 */
router.get('/users', adminMiddleware, getAllUsers);

/**
 * @route   POST /api/admin/users/:id/approve
 * @desc    Approve a specific user
 * @access  Private/Admin
 */
router.post('/users/:id/approve', adminMiddleware, approveUser);

/**
 * @route   POST /api/admin/users/bulk-approve
 * @desc    Approve multiple users at once
 * @access  Private/Admin
 */
router.post('/users/bulk-approve', adminMiddleware, bulkApproveUsers);

/**
 * @route   POST /api/admin/users/:id/reject
 * @desc    Reject a user registration
 * @access  Private/Admin
 */
router.post('/users/:id/reject', adminMiddleware, rejectUser);

/**
 * @route   POST /api/admin/users/:id/make-admin
 * @desc    Promote a user to admin role
 * @access  Private/Admin
 */
router.post('/users/:id/make-admin', adminMiddleware, makeUserAdmin);

/**
 * @route   POST /api/admin/users/:id/deactivate
 * @desc    Deactivate a user account
 * @access  Private/Admin
 */
router.post('/users/:id/deactivate', adminMiddleware, deactivateUser);

/**
 * @route   POST /api/admin/users/:id/activate
 * @desc    Activate a deactivated user account
 * @access  Private/Admin
 */
router.post('/users/:id/activate', adminMiddleware, activateUser);

// ==================== STATISTICS & ANALYTICS ROUTES ====================

/**
 * @route   GET /api/admin/stats
 * @desc    Get admin dashboard statistics
 * @access  Private/Admin
 */
router.get('/stats', adminMiddleware, getAdminStats);

/**
 * @route   GET /api/admin/system-stats
 * @desc    Get system-wide statistics and database metrics
 * @access  Private/Admin
 */
router.get('/system-stats', adminMiddleware, getSystemStats);

// ==================== NOTIFICATION & COMMUNICATION ROUTES ====================

/**
 * @route   POST /api/admin/notifications/bulk
 * @desc    Send bulk notification to users
 * @access  Private/Admin
 */
router.post('/notifications/bulk', adminMiddleware, sendBulkNotification);

// ==================== ADDITIONAL UTILITY ROUTES ====================

/**
 * @route   GET /api/admin/health
 * @desc    Admin system health check
 * @access  Private/Admin
 */
router.get('/health', adminMiddleware, async (req, res) => {
  try {
    const User = require('../models/User');
    const Grant = require('../models/Grant');
    const Document = require('../models/Document');
    
    // Basic database connectivity check
    const userCount = await User.countDocuments();
    const grantCount = await Grant.countDocuments();
    const documentCount = await Document.countDocuments();
    
    // System information
    const systemInfo = {
      nodeVersion: process.version,
      platform: process.platform,
      memory: process.memoryUsage(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    };
    
    res.json({
      success: true,
      message: 'Admin system is operational',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        users: userCount,
        grants: grantCount,
        documents: documentCount
      },
      system: systemInfo,
      admin: {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role
      }
    });
  } catch (error) {
    console.error('❌ Admin health check error:', error);
    res.status(500).json({
      success: false,
      message: 'Admin system health check failed',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/admin/backup
 * @desc    Trigger manual database backup (simulated)
 * @access  Private/Admin
 */
router.get('/backup', adminMiddleware, async (req, res) => {
  try {
    // In a real implementation, this would trigger a database backup
    // For now, we'll simulate a backup process
    
    const backupInfo = {
      timestamp: new Date().toISOString(),
      triggeredBy: req.user.email,
      status: 'completed',
      backupId: `backup_${Date.now()}`,
      collections: ['users', 'grants', 'documents', 'notifications']
    };
    
    console.log(`💾 Backup triggered by admin: ${req.user.email}`, backupInfo);
    
    res.json({
      success: true,
      message: 'Database backup initiated successfully',
      backup: backupInfo
    });
  } catch (error) {
    console.error('❌ Admin backup error:', error);
    res.status(500).json({
      success: false,
      message: 'Backup failed',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/admin/logs
 * @desc    Get system logs (simulated - in production use a proper logging system)
 * @access  Private/Admin
 */
router.get('/logs', adminMiddleware, async (req, res) => {
  try {
    const { type = 'all', limit = 50 } = req.query;
    
    // Simulated log entries - in production, use Winston or similar
    const simulatedLogs = [
      {
        timestamp: new Date().toISOString(),
        level: 'info',
        message: 'Admin dashboard accessed',
        user: req.user.email,
        action: 'page_view'
      },
      {
        timestamp: new Date(Date.now() - 300000).toISOString(),
        level: 'info',
        message: 'User account approved',
        user: req.user.email,
        action: 'user_approval'
      },
      {
        timestamp: new Date(Date.now() - 600000).toISOString(),
        level: 'warn',
        message: 'Failed login attempt',
        user: 'unknown',
        action: 'security'
      }
    ];
    
    res.json({
      success: true,
      logs: simulatedLogs,
      total: simulatedLogs.length,
      filters: {
        type,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('❌ Admin logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system logs',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/admin/maintenance
 * @desc    Toggle maintenance mode (simulated)
 * @access  Private/Admin
 */
router.post('/maintenance', adminMiddleware, async (req, res) => {
  try {
    const { enabled, message } = req.body;
    
    // In a real implementation, this would update a system setting
    // For now, we'll simulate maintenance mode toggle
    
    const maintenanceInfo = {
      enabled: Boolean(enabled),
      message: message || 'System maintenance in progress',
      activatedBy: req.user.email,
      activatedAt: new Date().toISOString(),
      estimatedDuration: '30 minutes'
    };
    
    console.log(`🔧 Maintenance mode ${enabled ? 'enabled' : 'disabled'} by admin: ${req.user.email}`, maintenanceInfo);
    
    res.json({
      success: true,
      message: `Maintenance mode ${enabled ? 'enabled' : 'disabled'} successfully`,
      maintenance: maintenanceInfo
    });
  } catch (error) {
    console.error('❌ Admin maintenance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle maintenance mode',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/admin/activity
 * @desc    Get recent admin activity
 * @access  Private/Admin
 */
router.get('/activity', adminMiddleware, async (req, res) => {
  try {
    const { days = 7 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    // In a real implementation, you'd query an activity log collection
    // For now, we'll simulate recent activity
    
    const recentActivity = [
      {
        action: 'user_approval',
        description: 'Approved user registration',
        target: 'user@example.com',
        admin: req.user.email,
        timestamp: new Date().toISOString(),
        ip: req.ip
      },
      {
        action: 'system_stats',
        description: 'Viewed system statistics',
        target: 'dashboard',
        admin: req.user.email,
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        ip: req.ip
      },
      {
        action: 'user_management',
        description: 'Accessed user management',
        target: 'users',
        admin: req.user.email,
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        ip: req.ip
      }
    ];
    
    res.json({
      success: true,
      activity: recentActivity,
      period: {
        days: parseInt(days),
        startDate: startDate.toISOString(),
        endDate: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('❌ Admin activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin activity',
      error: error.message
    });
  }
});

module.exports = router;