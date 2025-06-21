const jwt = require('jsonwebtoken');
const config = require('../config/config');
const Admin = require('../models/Admin');

const adminAuth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('x-auth-token');

    // Check if no token
    if (!token) {
      return res.status(401).json({ 
        message: 'No token, authorization denied',
        code: 'NO_TOKEN'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret);
    
    // Check if admin exists and is active
    const admin = await Admin.findById(decoded.adminId);
    if (!admin || !admin.active) {
      return res.status(401).json({ 
        message: 'Admin not found or inactive',
        code: 'ADMIN_NOT_FOUND'
      });
    }
    
    req.admin = { 
      id: admin._id,
      email: admin.email 
    };
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
      console.error('Admin auth error:', err);
      return res.status(401).json({ 
        message: 'Token is not valid',
        code: 'TOKEN_ERROR'
      });
    }
  }
};

module.exports = adminAuth; 