const express = require('express');
const router = express.Router();
const User = require('../models/User');

// @route   GET /api/community/leaderboard
// @desc    Get all users sorted by level/stars for community page
// @access  Public
router.get('/leaderboard', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const totalUsers = await User.countDocuments();

    // Get users sorted by stars (descending) and then by XP (descending)
    const users = await User.find({}, {
      name: 1,
      level: 1,
      stars: 1,
      xp: 1,
      'profile.bio': 1,
      'profile.location': 1,
      'profile.skills': 1,
      'profile.github': 1,
      'profile.linkedin': 1
    })
    .sort({ stars: -1, xp: -1 })
    .skip(skip)
    .limit(limit);

    res.json({
      users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit),
        totalUsers,
        hasMore: skip + users.length < totalUsers
      }
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ message: 'Server error while fetching leaderboard data' });
  }
});

router.get('/search', async (req, res) => {
  try {
    const { q: searchQuery, page = 1, limit = 10 } = req.query;
    
    if (!searchQuery || searchQuery.trim() === '') {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const searchRegex = new RegExp(searchQuery.trim(), 'i'); // Case-insensitive search

    // Get total count for pagination
    const totalUsers = await User.countDocuments({
      name: searchRegex
    });

    // Search users by name
    const users = await User.find({
      name: searchRegex
    }, {
      name: 1,
      level: 1,
      stars: 1,
      xp: 1,
      'profile.bio': 1,
      'profile.location': 1,
      'profile.skills': 1,
      'profile.github': 1,
      'profile.linkedin': 1
    })
    .sort({ stars: -1, xp: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    res.json({
      users,
      searchQuery: searchQuery.trim(),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalUsers / parseInt(limit)),
        totalUsers,
        hasMore: skip + users.length < totalUsers
      }
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Server error while searching users' });
  }
});

// @route   GET /api/community/profile/:userId
// @desc    Get detailed user profile for community view
// @access  Public
router.get('/profile/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId, {
      password: 0,
      email: 0,
      // Exclude sensitive information
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('User profile fetch error:', error);
    res.status(500).json({ message: 'Server error while fetching user profile' });
  }
});

module.exports = router; 