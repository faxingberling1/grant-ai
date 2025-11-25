// backend/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Main authentication middleware - requires valid token and verified email
 */
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'Access denied. No token provided.',
        errorCode: 'NO_TOKEN'
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user and exclude password
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found. Please log in again.',
        errorCode: 'USER_NOT_FOUND'
      });
    }

    // Check if account is active
    if (user.active === false) {
      return res.status(403).json({
        success: false,
        message: 'Account has been deactivated. Please contact support.',
        errorCode: 'ACCOUNT_DEACTIVATED'
      });
    }

    // For non-demo users, check email verification
    if (user.email !== "demo@grantfunds.com" && !user.emailVerified) {
      return res.status(403).json({
        success: false,
        message: 'Email verification required. Please verify your email to access this resource.',
        errorCode: 'EMAIL_VERIFICATION_REQUIRED',
        requiresVerification: true
      });
    }

    // Check if user is approved (for non-demo users)
    if (user.email !== "demo@grantfunds.com" && !user.approved) {
      return res.status(403).json({
        success: false,
        message: 'Account pending approval. Please wait for administrator approval.',
        errorCode: 'ACCOUNT_PENDING_APPROVAL'
      });
    }

    // Attach full user object to request
    req.user = user;
    
    next();
  } catch (error) {
    console.error('🔐 Auth middleware error:', error.message);
    
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
    
    // Generic authentication error
    return res.status(401).json({ 
      success: false,
      message: 'Authentication failed. Please log in again.',
      errorCode: 'AUTH_FAILED'
    });
  }
};

/**
 * Optional auth middleware - attaches user if token is valid, but doesn't require it
 */
const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (user && user.active !== false) {
        // For optional auth, we still attach the user even if not fully verified
        // but we add verification status for the frontend to handle
        req.user = user;
        req.userAuthStatus = {
          isAuthenticated: true,
          isVerified: user.emailVerified,
          isApproved: user.approved,
          isDemo: user.email === "demo@grantfunds.com"
        };
      }
    }
    
    next();
  } catch (error) {
    // For optional auth, we ignore token errors and continue without user
    console.log('🔐 Optional auth - Token error (ignored):', error.message);
    next();
  }
};

/**
 * Admin role middleware - requires admin privileges
 */
const adminMiddleware = async (req, res, next) => {
  try {
    // First run regular auth middleware
    await authMiddleware(req, res, () => {});

    // Check if user has admin role
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'Admin')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Administrator privileges required.',
        errorCode: 'ADMIN_ACCESS_REQUIRED'
      });
    }

    next();
  } catch (error) {
    console.error('🔐 Admin middleware error:', error.message);
    return res.status(403).json({
      success: false,
      message: 'Administrator access required.',
      errorCode: 'ADMIN_ACCESS_REQUIRED'
    });
  }
};

/**
 * Grant Manager role middleware - requires Grant Manager or Admin privileges
 */
const grantManagerMiddleware = async (req, res, next) => {
  try {
    // First run regular auth middleware
    await authMiddleware(req, res, () => {});

    // Check if user has Grant Manager or Admin role
    const allowedRoles = ['admin', 'Admin', 'Grant Manager', 'grant_manager'];
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Grant Manager privileges required.',
        errorCode: 'GRANT_MANAGER_ACCESS_REQUIRED'
      });
    }

    next();
  } catch (error) {
    console.error('🔐 Grant Manager middleware error:', error.message);
    return res.status(403).json({
      success: false,
      message: 'Grant Manager access required.',
      errorCode: 'GRANT_MANAGER_ACCESS_REQUIRED'
    });
  }
};

/**
 * Email verification middleware - requires verified email (separate from main auth)
 */
const emailVerifiedMiddleware = async (req, res, next) => {
  try {
    // First run regular auth middleware
    await authMiddleware(req, res, () => {});

    // Skip verification check for demo account
    if (req.user.email === "demo@grantfunds.com") {
      return next();
    }

    // Check if email is verified
    if (!req.user.emailVerified) {
      return res.status(403).json({
        success: false,
        message: 'Email verification required to access this feature.',
        errorCode: 'EMAIL_VERIFICATION_REQUIRED',
        requiresVerification: true
      });
    }

    next();
  } catch (error) {
    console.error('🔐 Email verification middleware error:', error.message);
    return res.status(403).json({
      success: false,
      message: 'Email verification required.',
      errorCode: 'EMAIL_VERIFICATION_REQUIRED'
    });
  }
};

/**
 * Account approval middleware - requires approved account (separate from main auth)
 */
const approvedAccountMiddleware = async (req, res, next) => {
  try {
    // First run regular auth middleware
    await authMiddleware(req, res, () => {});

    // Skip approval check for demo account
    if (req.user.email === "demo@grantfunds.com") {
      return next();
    }

    // Check if account is approved
    if (!req.user.approved) {
      return res.status(403).json({
        success: false,
        message: 'Account approval required to access this feature.',
        errorCode: 'ACCOUNT_APPROVAL_REQUIRED'
      });
    }

    next();
  } catch (error) {
    console.error('🔐 Account approval middleware error:', error.message);
    return res.status(403).json({
      success: false,
      message: 'Account approval required.',
      errorCode: 'ACCOUNT_APPROVAL_REQUIRED'
    });
  }
};

/**
 * Rate limiting helper for auth endpoints
 */
const authRateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again later.',
    errorCode: 'RATE_LIMIT_EXCEEDED'
  }
};

/**
 * Login-specific rate limiting (more restrictive)
 */
const loginRateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // limit each IP to 3 login attempts per windowMs
  message: {
    success: false,
    message: 'Too many login attempts. Please try again later.',
    errorCode: 'LOGIN_RATE_LIMIT_EXCEEDED'
  }
};

/**
 * Verification-specific rate limiting
 */
const verificationRateLimit = {
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 verification requests per hour
  message: {
    success: false,
    message: 'Too many verification requests. Please try again later.',
    errorCode: 'VERIFICATION_RATE_LIMIT_EXCEEDED'
  }
};

module.exports = {
  authMiddleware,
  optionalAuthMiddleware,
  adminMiddleware,
  grantManagerMiddleware,
  emailVerifiedMiddleware,
  approvedAccountMiddleware,
  authRateLimit,
  loginRateLimit,
  verificationRateLimit
};