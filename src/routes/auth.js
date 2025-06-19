const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generateAvatarData } = require('../utils/avatarUtils');
const auth = require('../middleware/auth');

// Register route
router.post('/register', [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('name').notEmpty().withMessage('Name is required')
], async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Generate avatar data
    const avatarData = generateAvatarData(name);

    // Create new user
    user = new User({
      email,
      password,
      name,
      profile: {
        avatar: avatarData
      }
    });

    await user.save();

    // Create JWT token with 7 days expiration
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        profile: {
          avatar: user.profile.avatar
        }
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login route
router.post('/login', [
  body('email').isEmail().withMessage('Please enter a valid email'),
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
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create JWT token with 7 days expiration
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        profile: {
          avatar: user.profile.avatar
        }
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
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
        name: user.name,
        profile: {
          avatar: user.profile.avatar
        }
      }
    });
  } catch (error) {
    console.error('Token validation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user and invalidate token
// @access  Private
router.post('/logout', auth, async (req, res) => {
  try {
    // Get the token from the request header
    const token = req.header('x-auth-token');
    
    // Add token to blacklist (you can use Redis or a simple in-memory store)
    // For now, we'll use a simple approach - you can enhance this later
    if (token) {
      // You could store this in Redis or a database for production
      // For now, we'll just return success and let the frontend handle cleanup
      console.log(`Token logged out: ${token.substring(0, 20)}...`);
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