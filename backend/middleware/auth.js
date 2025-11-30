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

    // NEW: Initialize document storage if not present (backward compatibility)
    if (!user.documents) {
      user.documents = [];
      user.storageUsage = 0;
      user.documentCount = 0;
      await user.save();
      console.log(`✅ Document storage initialized for user: ${user.email}`);
    }

    // NEW: Initialize document preferences if not present
    if (!user.documentPreferences) {
      user.documentPreferences = {
        autoCategorize: true,
        defaultCategory: 'other',
        backupEnabled: true,
        versioningEnabled: true,
        allowedFileTypes: [
          'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 
          'txt', 'jpg', 'jpeg', 'png', 'gif', 'zip', 'rar'
        ]
      };
      await user.save();
      console.log(`✅ Document preferences initialized for user: ${user.email}`);
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
 * Socket.io authentication middleware - for WebSocket connections
 */
const socketAuthMiddleware = (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      console.log('❌ Socket connection rejected: No token provided');
      return next(new Error('Authentication error: No token provided'));
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach user info to socket for later use
    socket.userId = decoded.id;
    socket.user = decoded;
    
    console.log(`✅ Socket authenticated for user: ${decoded.id}`);
    next();
  } catch (error) {
    console.error('❌ Socket authentication error:', error.message);
    
    // Handle specific JWT errors for sockets
    if (error.name === 'JsonWebTokenError') {
      return next(new Error('Authentication error: Invalid token'));
    }
    
    if (error.name === 'TokenExpiredError') {
      return next(new Error('Authentication error: Token expired'));
    }
    
    return next(new Error('Authentication error: Failed to authenticate'));
  }
};

/**
 * Socket.io user validation middleware - validates user exists and is active
 */
const socketUserValidationMiddleware = async (socket, next) => {
  try {
    if (!socket.userId) {
      return next(new Error('User ID not found in socket'));
    }

    // Find user and check status
    const user = await User.findById(socket.userId).select('-password');
    
    if (!user) {
      console.log(`❌ Socket user validation failed: User ${socket.userId} not found`);
      return next(new Error('User not found'));
    }

    // Check if account is active
    if (user.active === false) {
      console.log(`❌ Socket user validation failed: User ${socket.userId} account deactivated`);
      return next(new Error('Account deactivated'));
    }

    // For non-demo users, check email verification
    if (user.email !== "demo@grantfunds.com" && !user.emailVerified) {
      console.log(`❌ Socket user validation failed: User ${socket.userId} email not verified`);
      return next(new Error('Email verification required'));
    }

    // Check if user is approved (for non-demo users)
    if (user.email !== "demo@grantfunds.com" && !user.approved) {
      console.log(`❌ Socket user validation failed: User ${socket.userId} account not approved`);
      return next(new Error('Account pending approval'));
    }

    // NEW: Initialize document storage for socket connections if needed
    if (!user.documents) {
      user.documents = [];
      user.storageUsage = 0;
      user.documentCount = 0;
      await user.save();
      console.log(`✅ Document storage initialized via socket for user: ${user.email}`);
    }

    // Attach full user object to socket for later use
    socket.userData = user;
    console.log(`✅ Socket user validation passed for user: ${user.email}`);
    next();
  } catch (error) {
    console.error('❌ Socket user validation error:', error.message);
    return next(new Error('User validation failed'));
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
        
        // NEW: Initialize document storage for optional auth if needed
        if (!user.documents) {
          user.documents = [];
          user.storageUsage = 0;
          user.documentCount = 0;
          await user.save();
        }

        req.user = user;
        req.userAuthStatus = {
          isAuthenticated: true,
          isVerified: user.emailVerified,
          isApproved: user.approved,
          isDemo: user.email === "demo@grantfunds.com",
          hasDocumentStorage: true,
          storageStats: {
            used: user.storageUsage,
            limit: user.storageLimit,
            available: user.availableStorage,
            percentage: user.getStorageUsagePercentage()
          }
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
 * NEW: Document storage middleware - validates user has document storage access
 */
const documentStorageMiddleware = async (req, res, next) => {
  try {
    // First run regular auth middleware
    await authMiddleware(req, res, () => {});

    // Ensure document storage is initialized
    if (!req.user.documents) {
      req.user.documents = [];
      req.user.storageUsage = 0;
      req.user.documentCount = 0;
      await req.user.save();
      console.log(`✅ Document storage middleware initialized for user: ${req.user.email}`);
    }

    // Check if user has reached document limit
    if (req.user.documentCount >= req.user.maxDocumentCount) {
      return res.status(403).json({
        success: false,
        message: `Document limit reached. Maximum ${req.user.maxDocumentCount} documents allowed.`,
        errorCode: 'DOCUMENT_LIMIT_REACHED',
        currentCount: req.user.documentCount,
        maxLimit: req.user.maxDocumentCount
      });
    }

    // Attach storage information to request for easy access
    req.storageInfo = {
      used: req.user.storageUsage,
      limit: req.user.storageLimit,
      available: req.user.availableStorage,
      percentage: req.user.getStorageUsagePercentage(),
      documentCount: req.user.documentCount,
      maxDocumentCount: req.user.maxDocumentCount
    };

    next();
  } catch (error) {
    console.error('🔐 Document storage middleware error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Document storage validation failed.',
      errorCode: 'DOCUMENT_STORAGE_ERROR'
    });
  }
};

/**
 * NEW: File upload validation middleware - validates file upload requests
 */
const fileUploadValidationMiddleware = async (req, res, next) => {
  try {
    // First run document storage middleware
    await documentStorageMiddleware(req, res, () => {});

    const fileSize = parseInt(req.headers['content-length']) || 0;
    
    // Check if file size exceeds user's available storage
    if (fileSize > req.storageInfo.available) {
      return res.status(413).json({
        success: false,
        message: `Insufficient storage space. Available: ${formatBytes(req.storageInfo.available)}, Required: ${formatBytes(fileSize)}`,
        errorCode: 'INSUFFICIENT_STORAGE_SPACE',
        available: req.storageInfo.available,
        required: fileSize
      });
    }

    // Check if file size is reasonable (additional safety check)
    const MAX_SINGLE_FILE_SIZE = 25 * 1024 * 1024; // 25MB
    if (fileSize > MAX_SINGLE_FILE_SIZE) {
      return res.status(413).json({
        success: false,
        message: `File size too large. Maximum allowed: ${formatBytes(MAX_SINGLE_FILE_SIZE)}`,
        errorCode: 'FILE_TOO_LARGE',
        maxSize: MAX_SINGLE_FILE_SIZE
      });
    }

    // Attach upload validation info
    req.uploadValidation = {
      maxFileSize: MAX_SINGLE_FILE_SIZE,
      availableStorage: req.storageInfo.available,
      canUpload: fileSize <= req.storageInfo.available && fileSize <= MAX_SINGLE_FILE_SIZE
    };

    next();
  } catch (error) {
    console.error('🔐 File upload validation middleware error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'File upload validation failed.',
      errorCode: 'UPLOAD_VALIDATION_ERROR'
    });
  }
};

/**
 * NEW: Document ownership middleware - validates user owns the document
 */
const documentOwnershipMiddleware = async (req, res, next) => {
  try {
    // First run regular auth middleware
    await authMiddleware(req, res, () => {});

    const documentId = req.params.documentId || req.params.id;
    
    if (!documentId) {
      return res.status(400).json({
        success: false,
        message: 'Document ID is required.',
        errorCode: 'DOCUMENT_ID_REQUIRED'
      });
    }

    // Check if document exists in user's documents
    const userDocument = req.user.documents.id(documentId);
    
    if (!userDocument) {
      // Also check in the separate Document collection if needed
      const Document = require('../models/Document');
      const document = await Document.findById(documentId);
      
      if (!document) {
        return res.status(404).json({
          success: false,
          message: 'Document not found.',
          errorCode: 'DOCUMENT_NOT_FOUND'
        });
      }

      // Check if user owns the document or has access
      if (document.userId.toString() !== req.user._id.toString()) {
        const access = document.canUserAccess && await document.canUserAccess(req.user._id);
        if (!access || !access.canAccess) {
          return res.status(403).json({
            success: false,
            message: 'Access denied. You do not have permission to access this document.',
            errorCode: 'DOCUMENT_ACCESS_DENIED'
          });
        }

        // Attach shared document info
        req.documentAccess = {
          isOwner: false,
          isShared: true,
          permission: access.permission,
          document: document
        };
      } else {
        // User owns the document
        req.documentAccess = {
          isOwner: true,
          isShared: false,
          permission: 'owner',
          document: document
        };
      }
    } else {
      // Document is in user's embedded documents
      req.documentAccess = {
        isOwner: true,
        isShared: false,
        permission: 'owner',
        document: userDocument
      };
    }

    next();
  } catch (error) {
    console.error('🔐 Document ownership middleware error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Document ownership validation failed.',
      errorCode: 'DOCUMENT_OWNERSHIP_ERROR'
    });
  }
};

/**
 * NEW: Document permission middleware - validates specific permissions
 */
const documentPermissionMiddleware = (requiredPermission = 'view') => {
  return async (req, res, next) => {
    try {
      // First run document ownership middleware
      await documentOwnershipMiddleware(req, res, () => {});

      const permissionHierarchy = {
        'view': 1,
        'download': 2,
        'edit': 3,
        'manage': 4,
        'owner': 5
      };

      const userPermissionLevel = permissionHierarchy[req.documentAccess.permission] || 0;
      const requiredPermissionLevel = permissionHierarchy[requiredPermission] || 0;

      if (userPermissionLevel < requiredPermissionLevel) {
        return res.status(403).json({
          success: false,
          message: `Insufficient permissions. Required: ${requiredPermission}, Current: ${req.documentAccess.permission}`,
          errorCode: 'INSUFFICIENT_DOCUMENT_PERMISSIONS',
          required: requiredPermission,
          current: req.documentAccess.permission
        });
      }

      next();
    } catch (error) {
      console.error('🔐 Document permission middleware error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Document permission validation failed.',
        errorCode: 'DOCUMENT_PERMISSION_ERROR'
      });
    }
  };
};

/**
 * Token verification utility function (for use in services and Socket.io)
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error(`Token verification failed: ${error.message}`);
  }
};

/**
 * User validation utility function (for use in services and Socket.io)
 */
const validateUser = async (userId) => {
  try {
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      throw new Error('User not found');
    }

    if (user.active === false) {
      throw new Error('Account deactivated');
    }

    // For non-demo users, check email verification and approval
    if (user.email !== "demo@grantfunds.com") {
      if (!user.emailVerified) {
        throw new Error('Email verification required');
      }
      if (!user.approved) {
        throw new Error('Account pending approval');
      }
    }

    // NEW: Initialize document storage if needed
    if (!user.documents) {
      user.documents = [];
      user.storageUsage = 0;
      user.documentCount = 0;
      await user.save();
    }

    return user;
  } catch (error) {
    throw new Error(`User validation failed: ${error.message}`);
  }
};

/**
 * NEW: Storage validation utility function
 */
const validateStorage = async (userId, requiredSpace) => {
  try {
    const user = await validateUser(userId);
    
    if (user.availableStorage < requiredSpace) {
      throw new Error(`Insufficient storage space. Available: ${user.availableStorage}, Required: ${requiredSpace}`);
    }

    if (user.documentCount >= user.maxDocumentCount) {
      throw new Error(`Document limit reached. Current: ${user.documentCount}, Limit: ${user.maxDocumentCount}`);
    }

    return {
      user,
      available: user.availableStorage,
      canProceed: user.availableStorage >= requiredSpace && user.documentCount < user.maxDocumentCount
    };
  } catch (error) {
    throw new Error(`Storage validation failed: ${error.message}`);
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

/**
 * NEW: Document upload rate limiting
 */
const documentUploadRateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 document uploads per windowMs
  message: {
    success: false,
    message: 'Too many document uploads. Please try again later.',
    errorCode: 'UPLOAD_RATE_LIMIT_EXCEEDED'
  }
};

/**
 * Socket connection rate limiting configuration
 */
const socketRateLimit = {
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 socket connection attempts per minute
  message: 'Too many socket connection attempts. Please try again later.'
};

/**
 * NEW: Helper function to format bytes
 */
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

module.exports = {
  authMiddleware,
  socketAuthMiddleware,
  socketUserValidationMiddleware,
  optionalAuthMiddleware,
  adminMiddleware,
  grantManagerMiddleware,
  emailVerifiedMiddleware,
  approvedAccountMiddleware,
  // NEW: Document-related middlewares
  documentStorageMiddleware,
  fileUploadValidationMiddleware,
  documentOwnershipMiddleware,
  documentPermissionMiddleware,
  // Utility functions
  verifyToken,
  validateUser,
  validateStorage,
  // Rate limiting
  authRateLimit,
  loginRateLimit,
  verificationRateLimit,
  documentUploadRateLimit,
  socketRateLimit
};