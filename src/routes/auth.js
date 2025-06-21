const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const { auth, blacklistToken } = require('../middleware/auth');
const { authLimiter, registrationLimiter } = require('../middleware/rateLimiter');
const { validatePassword } = require('../utils/passwordUtils');
const { 
  generateAccessToken, 
  generateRefreshToken, 
  verifyAccessToken,
  isTokenExpired 
} = require('../utils/tokenUtils');

// Register route with rate limiting and password validation
router.post('/register', [
  registrationLimiter,
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters')
], async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name } = req.body;

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ 
        message: 'Password does not meet security requirements',
        errors: passwordValidation.errors 
      });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ 
        message: 'User already exists',
        code: 'USER_EXISTS'
      });
    }

    // Create new user
    user = new User({
      email,
      password,
      name
    });

    await user.save();

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token to database
    const refreshTokenDoc = new RefreshToken({
      token: refreshToken,
      userId: user._id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    });
    await refreshTokenDoc.save();

    res.status(201).json({
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: 'Server error during registration',
      code: 'REGISTRATION_ERROR'
    });
  }
});

// Login route with rate limiting
router.post('/login', [
  authLimiter,
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('password').exists().withMessage('Password is required')
], async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ 
        message: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ 
        message: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token to database
    const refreshTokenDoc = new RefreshToken({
      token: refreshToken,
      userId: user._id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    });
    await refreshTokenDoc.save();

    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Server error during login',
      code: 'LOGIN_ERROR'
    });
  }
});

// @route   POST /api/auth/refresh
// @desc    Refresh access token using refresh token
// @access  Public
router.post('/refresh', [
  body('refreshToken').notEmpty().withMessage('Refresh token is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { refreshToken } = req.body;

    // Find refresh token in database
    const refreshTokenDoc = await RefreshToken.findOne({
      token: refreshToken,
      isRevoked: false
    });

    if (!refreshTokenDoc) {
      return res.status(401).json({ 
        message: 'Invalid refresh token',
        code: 'INVALID_REFRESH_TOKEN'
      });
    }

    // Check if refresh token is expired
    if (refreshTokenDoc.expiresAt < new Date()) {
      return res.status(401).json({ 
        message: 'Refresh token expired',
        code: 'REFRESH_TOKEN_EXPIRED'
      });
    }

    // Get user
    const user = await User.findById(refreshTokenDoc.userId);
    if (!user) {
      return res.status(401).json({ 
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(user._id);

    res.json({
      accessToken: newAccessToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ message: 'Server error during token refresh' });
  }
});

// @route   POST /api/auth/revoke-refresh
// @desc    Revoke a refresh token (logout from specific device)
// @access  Private
router.post('/revoke-refresh', auth, [
  body('refreshToken').notEmpty().withMessage('Refresh token is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { refreshToken } = req.body;

    // Find and revoke refresh token
    const refreshTokenDoc = await RefreshToken.findOne({
      token: refreshToken,
      userId: req.user.id
    });

    if (refreshTokenDoc) {
      refreshTokenDoc.isRevoked = true;
      await refreshTokenDoc.save();
    }

    res.json({ message: 'Refresh token revoked successfully' });
  } catch (error) {
    console.error('Token revocation error:', error);
    res.status(500).json({ message: 'Server error during token revocation' });
  }
});

// @route   GET /api/auth/validate
// @desc    Validate token and return user data
// @access  Private
router.get('/validate', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Token validation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user and invalidate tokens
// @access  Private
router.post('/logout', auth, [
  body('refreshToken').optional()
], async (req, res) => {
  try {
    // Get the access token from the request header
    const accessToken = req.header('x-auth-token');
    
    // Add access token to blacklist
    if (accessToken) {
      blacklistToken(accessToken);
      console.log(`Access token logged out: ${accessToken.substring(0, 20)}...`);
    }

    // Revoke refresh token if provided
    const { refreshToken } = req.body;
    if (refreshToken) {
      const refreshTokenDoc = await RefreshToken.findOne({
        token: refreshToken,
        userId: req.user.id
      });

      if (refreshTokenDoc) {
        refreshTokenDoc.isRevoked = true;
        await refreshTokenDoc.save();
        console.log(`Refresh token revoked: ${refreshToken.substring(0, 20)}...`);
      }
    }
    
    res.json({ 
      message: 'Logged out successfully',
      success: true 
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error during logout' });
  }
});

module.exports = router; 