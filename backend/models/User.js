const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    // Check for token in Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false,
        message: 'No token provided. Access denied.' 
      });
    }

    // Extract token
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token format.' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
    
    // Find user and exclude password
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found. Token is invalid.' 
      });
    }

    // Attach user to request object
    req.user = user;
    next();
    
  } catch (error) {
    console.error('Auth middleware error:', error);

    // Handle specific JWT errors
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token.' 
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: 'Token has expired. Please login again.' 
      });
    }

    // Generic error response
    res.status(500).json({ 
      success: false,
      message: 'Authentication failed.' 
    });
  }
};

// Admin role middleware (for future use)
const adminMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false,
      message: 'Authentication required.' 
    });
  }

  // You can customize role checks based on your needs
  if (!['admin', 'Grant Manager'].includes(req.user.role)) {
    return res.status(403).json({ 
      success: false,
      message: 'Access denied. Admin privileges required.' 
    });
  }

  next();
};

// Optional auth middleware (for routes where auth is optional)
const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
        const user = await User.findById(decoded.id).select('-password');
        
        if (user) {
          req.user = user;
        }
      }
    }
    
    next();
  } catch (error) {
    // Continue without user for optional auth
    next();
  }
};

module.exports = {
  authMiddleware,
  adminMiddleware,
  optionalAuthMiddleware
};