// backend/middleware/admin.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config');

const adminMiddleware = async (req, res, next) => {
  try {
    // Get token from authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'No token provided. Please include a Bearer token in the Authorization header.',
        errorCode: 'NO_TOKEN'
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token format.',
        errorCode: 'INVALID_TOKEN_FORMAT'
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, config.jwtSecret || process.env.JWT_SECRET);
    
    // Find user and exclude password
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found. The account may have been deleted.',
        errorCode: 'USER_NOT_FOUND'
      });
    }

    // Check if user is active
    if (user.active === false) {
      return res.status(403).json({ 
        success: false, 
        message: 'Admin account has been deactivated. Please contact system administrator.',
        errorCode: 'ACCOUNT_DEACTIVATED'
      });
    }

    // Check if user has admin role and is approved
    const isAdmin = user.role === 'admin' || user.role === 'Admin';
    if (!isAdmin || !user.approved) {
      return res.status(403).json({ 
        success: false, 
        message: 'Administrator access required. You need admin privileges to access this resource.',
        errorCode: 'ADMIN_ACCESS_REQUIRED',
        userRole: user.role,
        isApproved: user.approved
      });
    }

    // For non-demo admin users, check email verification
    if (user.email !== "demo@grantfunds.com" && !user.emailVerified) {
      return res.status(403).json({
        success: false,
        message: 'Email verification required for admin access.',
        errorCode: 'EMAIL_VERIFICATION_REQUIRED',
        requiresVerification: true
      });
    }

    // Attach user to request
    req.user = user;
    
    console.log(`✅ Admin access granted to: ${user.email} (${user.role})`);
    next();
  } catch (error) {
    console.error('🔐 Admin middleware error:', error.message);
    
    // Handle specific JWT errors
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token. Please log in again.',
        errorCode: 'INVALID_TOKEN'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired. Please log in again.',
        errorCode: 'TOKEN_EXPIRED'
      });
    }

    // Handle database errors
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format.',
        errorCode: 'INVALID_USER_ID'
      });
    }
    
    // Generic error
    return res.status(500).json({ 
      success: false, 
      message: 'Authentication failed. Please try again.',
      errorCode: 'AUTH_FAILED'
    });
  }
};

module.exports = adminMiddleware;