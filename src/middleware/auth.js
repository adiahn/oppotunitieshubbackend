const jwt = require('jsonwebtoken');
const config = require('../config/config');
const User = require('../models/User');
const { isTokenExpired } = require('../utils/tokenUtils');

// Simple in-memory blacklist (use Redis in production)
const tokenBlacklist = new Set();

// Add token to blacklist
const blacklistToken = (token) => {
  tokenBlacklist.add(token);
};

// Check if token is blacklisted
const isTokenBlacklisted = (token) => {
  return tokenBlacklist.has(token);
};

const auth = async (req, res, next) => {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ 
      message: 'No token, authorization denied',
      code: 'NO_TOKEN'
    });
  }

  // Check if token is blacklisted
  if (isTokenBlacklisted(token)) {
    return res.status(401).json({ 
      message: 'Token has been invalidated',
      code: 'TOKEN_INVALIDATED'
    });
  }

  // Check if token is expired
  if (isTokenExpired(token)) {
    return res.status(401).json({ 
      message: 'Token expired',
      code: 'TOKEN_EXPIRED'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret);
    
    // Get user from database
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({ 
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }
    
    req.user = { id: user._id };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    } else if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Token is not valid',
        code: 'INVALID_TOKEN'
      });
    } else {
      return res.status(401).json({ 
        message: 'Token is not valid',
        code: 'TOKEN_ERROR'
      });
    }
  }
};

module.exports = { auth, blacklistToken, isTokenBlacklisted }; 