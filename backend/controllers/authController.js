// backend/controllers/authController.js
const AuthService = require('../services/AuthService');

const authService = new AuthService();

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log(`🔐 Login attempt for: ${email}`);
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Email and password are required',
        errorCode: 'MISSING_CREDENTIALS'
      });
    }

    const result = await authService.login(email, password);
    
    console.log(`✅ Login successful: ${email} (${result.user.role})`);
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    
    // Determine appropriate status code
    let statusCode = 401;
    let errorCode = 'AUTH_ERROR';
    
    if (error.message.includes('verify your email')) {
      statusCode = 403;
      errorCode = 'EMAIL_NOT_VERIFIED';
    } else if (error.message.includes('pending approval')) {
      statusCode = 403;
      errorCode = 'ACCOUNT_PENDING_APPROVAL';
    } else if (error.message.includes('deactivated')) {
      statusCode = 403;
      errorCode = 'ACCOUNT_DEACTIVATED';
    }
    
    res.status(statusCode).json({ 
      success: false,
      message: error.message,
      errorCode
    });
  }
};

const register = async (req, res) => {
  try {
    const result = await authService.register(req.body);
    
    res.status(201).json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(400).json({ 
      success: false,
      message: error.message,
      error: error.message 
    });
  }
};

const getMe = async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({ 
      success: true, 
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        emailVerified: user.emailVerified,
        approved: user.approved,
        company: user.company,
        phone: user.phone,
        timezone: user.timezone,
        notifications: user.notifications,
        lastLogin: user.lastLogin,
        // GridFS storage info
        storageStats: {
          used: user.storageUsage,
          limit: user.storageLimit,
          available: user.storageLimit - user.storageUsage,
          percentage: ((user.storageUsage / user.storageLimit) * 100).toFixed(1),
          formatted: user.storageUsageFormatted
        },
        documentCount: user.documentCount,
        documentPreferences: user.documentPreferences
      }
    });
  } catch (error) {
    console.error('❌ Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving user information'
    });
  }
};

const sendVerificationEmail = async (req, res) => {
  try {
    // This is for logged-in users to request new verification
    const result = await authService.sendVerificationEmail(req.user);
    
    res.json({
      success: true,
      message: 'Verification email sent successfully',
      data: result
    });
  } catch (error) {
    console.error('❌ Send verification email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send verification email',
      error: error.message
    });
  }
};

const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }
    
    const result = await authService.resendVerificationEmail(email);
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('❌ Resend verification email error:', error);
    res.status(400).json({
      success: false,
      message: error.message,
      error: error.message
    });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required'
      });
    }
    
    const result = await authService.verifyEmail(token);
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('❌ Verify email error:', error);
    res.status(400).json({
      success: false,
      message: error.message,
      error: error.message
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }
    
    const result = await authService.forgotPassword(email);
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('❌ Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process password reset request',
      error: error.message
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    
    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: 'Token and password are required'
      });
    }
    
    const result = await authService.resetPassword(token, password);
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('❌ Reset password error:', error);
    res.status(400).json({
      success: false,
      message: error.message,
      error: error.message
    });
  }
};

module.exports = {
  login,
  register,
  getMe,
  sendVerificationEmail,
  resendVerificationEmail,
  verifyEmail,
  forgotPassword,
  resetPassword
};