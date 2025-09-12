const jwt = require('jsonwebtoken');
const User = require('../models/users.model');
const { JWT_SECRET } = require('../config/auth.config');

// JWT Token verification
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
};

// Middleware to authenticate JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Access Denied',
        message: 'No token provided'
      });
    }

    const decoded = verifyToken(token);
    
    // Check if user still exists and is active
    const user = await User.findById(decoded.userId).select('-password_hash');
    if (!user) {
      return res.status(401).json({
        error: 'Access Denied',
        message: 'User not found'
      });
    }

    // Check if user account is active
    if (!user.isActive) {
      return res.status(403).json({
        error: 'Account Deactivated',
        message: 'Your account has been deactivated. Please contact support.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({
      error: 'Invalid Token',
      message: error.message
    });
  }
};

// Middleware to check user roles
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Access Denied',
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRoles
};
