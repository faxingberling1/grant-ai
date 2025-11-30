const User = require('../models/User');
const EmailService = require('../services/emailService');
const NotificationService = require('../services/notificationService');
const Grant = require('../models/Grant');
const Document = require('../models/Document');

// FIX: Use different variable names for instances
const emailServiceInstance = new EmailService();
const notificationServiceInstance = NotificationService; // If it's an object, use directly

const getPendingUsers = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    
    let query = { 
      approved: false,
      role: { $ne: 'admin' }
    };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { organization: { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await User.countDocuments(query);
    
    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('❌ Get pending users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending users',
      error: error.message
    });
  }
};

const getAdminStats = async (req, res) => {
  try {
    // User statistics
    const totalUsers = await User.countDocuments();
    const pendingUsers = await User.countDocuments({ approved: false });
    const approvedUsers = await User.countDocuments({ approved: true });
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const activeUsers = await User.countDocuments({ active: true });
    
    // Grant statistics
    const totalGrants = await Grant.countDocuments();
    const draftGrants = await Grant.countDocuments({ status: 'draft' });
    const submittedGrants = await Grant.countDocuments({ status: 'submitted' });
    const approvedGrants = await Grant.countDocuments({ status: 'approved' });
    const rejectedGrants = await Grant.countDocuments({ status: 'rejected' });
    
    // Document statistics
    const totalDocuments = await Document.countDocuments();
    const totalStorageUsed = await User.aggregate([
      { $group: { _id: null, totalStorage: { $sum: '$storageUsage' } } }
    ]);
    
    // Recent activity
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentRegistrations = await User.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });
    
    const recentGrants = await Grant.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });
    
    // User growth (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });
    
    res.json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          pending: pendingUsers,
          approved: approvedUsers,
          admin: adminUsers,
          active: activeUsers,
          recentRegistrations,
          newThisMonth: newUsersThisMonth
        },
        grants: {
          total: totalGrants,
          draft: draftGrants,
          submitted: submittedGrants,
          approved: approvedGrants,
          rejected: rejectedGrants,
          recent: recentGrants
        },
        documents: {
          total: totalDocuments,
          totalStorageUsed: totalStorageUsed[0]?.totalStorage || 0
        }
      }
    });
  } catch (error) {
    console.error('❌ Get admin stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin statistics',
      error: error.message
    });
  }
};

const approveUser = async (req, res) => {
  try {
    const userId = req.params.id;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (user.approved) {
      return res.status(400).json({
        success: false,
        message: 'User is already approved'
      });
    }
    
    user.approved = true;
    user.approvedAt = new Date();
    user.approvedBy = req.user._id;
    await user.save();
    
    console.log(`✅ User approved: ${user.email} by admin: ${req.user.email}`);
    
    // Create notification for the user
    if (notificationServiceInstance && notificationServiceInstance.createAccountApprovalNotification) {
      await notificationServiceInstance.createAccountApprovalNotification(userId);
    } else {
      console.warn('⚠️ Notification service not available for account approval');
    }
    
    // Send approval email
    if (emailServiceInstance.resend) {
      try {
        await emailServiceInstance.sendApprovalEmail(user);
        console.log(`📧 Approval email sent to: ${user.email}`);
      } catch (emailError) {
        console.warn('⚠️ Failed to send approval email:', emailError.message);
      }
    }
    
    res.json({
      success: true,
      message: 'User approved successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        approved: user.approved,
        approvedAt: user.approvedAt
      }
    });
  } catch (error) {
    console.error('❌ Approve user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve user',
      error: error.message
    });
  }
};

const bulkApproveUsers = async (req, res) => {
  try {
    const { userIds } = req.body;
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'User IDs array is required'
      });
    }
    
    const usersToApprove = await User.find({
      _id: { $in: userIds },
      approved: false
    });
    
    if (usersToApprove.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No pending users found to approve'
      });
    }
    
    const updateResult = await User.updateMany(
      { _id: { $in: usersToApprove.map(u => u._id) } },
      { 
        $set: { 
          approved: true,
          approvedAt: new Date(),
          approvedBy: req.user._id
        } 
      }
    );
    
    console.log(`✅ Bulk approved ${updateResult.modifiedCount} users by admin: ${req.user.email}`);
    
    // Send emails and notifications
    if (emailServiceInstance.resend) {
      for (const user of usersToApprove) {
        try {
          await emailServiceInstance.sendApprovalEmail(user);
          console.log(`📧 Approval email sent to: ${user.email}`);
        } catch (emailError) {
          console.warn(`⚠️ Failed to send approval email to ${user.email}:`, emailError.message);
        }
      }
    }
    
    for (const user of usersToApprove) {
      if (notificationServiceInstance && notificationServiceInstance.createAccountApprovalNotification) {
        await notificationServiceInstance.createAccountApprovalNotification(user._id);
      }
    }
    
    res.json({
      success: true,
      message: `Successfully approved ${updateResult.modifiedCount} users`,
      approvedCount: updateResult.modifiedCount
    });
  } catch (error) {
    console.error('❌ Bulk approve users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bulk approve users',
      error: error.message
    });
  }
};

const rejectUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { reason } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (user.approved) {
      return res.status(400).json({
        success: false,
        message: 'Cannot reject an approved user'
      });
    }
    
    const rejectionInfo = {
      email: user.email,
      name: user.name,
      rejectedAt: new Date(),
      rejectedBy: req.user._id,
      reason: reason || 'No reason provided'
    };
    
    console.log(`❌ User rejected: ${user.email} by admin: ${req.user.email}`, { reason });
    
    await User.findByIdAndDelete(userId);
    
    // Send rejection email if reason provided
    if (emailServiceInstance.resend && reason) {
      try {
        await emailServiceInstance.sendNotificationEmail(
          { email: user.email, name: user.name },
          'Account Registration Update - Grant Funds',
          `
            <p>Dear ${user.name},</p>
            <p>Thank you for your interest in Grant Funds. After reviewing your registration, we're unable to approve your account at this time.</p>
            <p><strong>Reason:</strong> ${reason}</p>
            <p>If you believe this was a mistake or would like to discuss further, please contact our support team.</p>
            <p>Best regards,<br><strong>The Grant Funds Team</strong></p>
          `
        );
        console.log(`📧 Rejection email sent to: ${user.email}`);
      } catch (emailError) {
        console.warn('⚠️ Failed to send rejection email:', emailError.message);
      }
    }
    
    res.json({
      success: true,
      message: 'User rejected successfully',
      rejection: rejectionInfo
    });
  } catch (error) {
    console.error('❌ Reject user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject user',
      error: error.message
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const { 
      search, 
      status,
      role,
      page = 1, 
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    let query = {};
    
    if (status === 'pending') {
      query.approved = false;
    } else if (status === 'approved') {
      query.approved = true;
    } else if (status === 'active') {
      query.active = true;
    } else if (status === 'inactive') {
      query.active = false;
    }
    
    if (role && role !== 'all') {
      query.role = role;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { organization: { $regex: search, $options: 'i' } }
      ];
    }
    
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const users = await User.find(query)
      .select('-password')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('approvedBy', 'name email');
    
    const total = await User.countDocuments(query);
    
    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('❌ Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
};

const makeUserAdmin = async (req, res) => {
  try {
    const userId = req.params.id;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'User is already an admin'
      });
    }
    
    user.role = 'admin';
    user.approved = true;
    user.approvedAt = new Date();
    user.approvedBy = req.user._id;
    await user.save();
    
    console.log(`👑 User promoted to admin: ${user.email} by admin: ${req.user.email}`);
    
    res.json({
      success: true,
      message: 'User promoted to admin successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        approved: user.approved
      }
    });
  } catch (error) {
    console.error('❌ Make user admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to make user admin',
      error: error.message
    });
  }
};

// NEW: Deactivate user account
const deactivateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { reason } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (!user.active) {
      return res.status(400).json({
        success: false,
        message: 'User account is already deactivated'
      });
    }
    
    user.active = false;
    user.deactivatedAt = new Date();
    user.deactivatedBy = req.user._id;
    user.deactivationReason = reason;
    await user.save();
    
    console.log(`🔒 User deactivated: ${user.email} by admin: ${req.user.email}`, { reason });
    
    res.json({
      success: true,
      message: 'User account deactivated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        active: user.active,
        deactivatedAt: user.deactivatedAt
      }
    });
  } catch (error) {
    console.error('❌ Deactivate user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to deactivate user',
      error: error.message
    });
  }
};

// NEW: Activate user account
const activateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (user.active) {
      return res.status(400).json({
        success: false,
        message: 'User account is already active'
      });
    }
    
    user.active = true;
    user.activatedAt = new Date();
    user.activatedBy = req.user._id;
    await user.save();
    
    console.log(`🔓 User activated: ${user.email} by admin: ${req.user.email}`);
    
    res.json({
      success: true,
      message: 'User account activated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        active: user.active,
        activatedAt: user.activatedAt
      }
    });
  } catch (error) {
    console.error('❌ Activate user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to activate user',
      error: error.message
    });
  }
};

// NEW: Get system-wide statistics
const getSystemStats = async (req, res) => {
  try {
    // Database statistics
    const dbStats = await User.db.db.stats();
    
    // Collection counts
    const userCount = await User.countDocuments();
    const grantCount = await Grant.countDocuments();
    const documentCount = await Document.countDocuments();
    
    // Storage usage
    const storageStats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalStorage: { $sum: '$storageUsage' },
          avgStorage: { $avg: '$storageUsage' },
          maxStorage: { $max: '$storageUsage' }
        }
      }
    ]);
    
    // User activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const activeUsersCount = await User.countDocuments({
      lastActive: { $gte: thirtyDaysAgo }
    });
    
    res.json({
      success: true,
      systemStats: {
        database: {
          collections: dbStats.collections,
          objects: dbStats.objects,
          dataSize: dbStats.dataSize,
          storageSize: dbStats.storageSize
        },
        application: {
          users: userCount,
          grants: grantCount,
          documents: documentCount
        },
        storage: storageStats[0] || { totalStorage: 0, avgStorage: 0, maxStorage: 0 },
        activity: {
          activeUsers: activeUsersCount,
          activityRate: (activeUsersCount / userCount * 100).toFixed(2)
        }
      }
    });
  } catch (error) {
    console.error('❌ Get system stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system statistics',
      error: error.message
    });
  }
};

// NEW: Send bulk notification to users
const sendBulkNotification = async (req, res) => {
  try {
    const { title, message, userType, userIds } = req.body;
    
    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Title and message are required'
      });
    }
    
    let query = {};
    if (userType === 'all') {
      query = { approved: true, active: true };
    } else if (userType === 'pending') {
      query = { approved: false };
    } else if (userType === 'admins') {
      query = { role: 'admin' };
    } else if (userType === 'specific' && userIds) {
      query = { _id: { $in: userIds } };
    }
    
    const users = await User.find(query).select('_id');
    const userIdList = users.map(user => user._id);
    
    let notificationCount = 0;
    for (const userId of userIdList) {
      try {
        if (notificationServiceInstance && notificationServiceInstance.createNotification) {
          await notificationServiceInstance.createNotification({
            userId: userId,
            type: 'admin_announcement',
            title: title,
            message: message,
            priority: 'high',
            data: {
              sentBy: req.user._id,
              sentAt: new Date(),
              bulkNotification: true
            }
          });
          notificationCount++;
        }
      } catch (error) {
        console.warn(`⚠️ Failed to create notification for user ${userId}:`, error.message);
      }
    }
    
    console.log(`📢 Admin ${req.user.email} sent bulk notification to ${notificationCount} users`);
    
    res.json({
      success: true,
      message: `Notification sent to ${notificationCount} users successfully`,
      sentCount: notificationCount
    });
  } catch (error) {
    console.error('❌ Send bulk notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send bulk notification',
      error: error.message
    });
  }
};

module.exports = {
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
};