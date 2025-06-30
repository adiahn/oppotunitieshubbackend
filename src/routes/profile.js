const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const User = require('../models/User');

// Get user profile
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/profile/basic
// @desc    Get basic profile details for the authenticated user
// @access  Private
router.get('/basic', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id, {
            name: 1,
            'profile.bio': 1,
            'profile.location': 1,
            level: 1
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({
            name: user.name,
            bio: user.profile.bio,
            location: user.profile.location,
            level: user.level
        });
    } catch (error) {
        console.error('Error fetching basic profile:', error);
        res.status(500).json({ message: 'Server error fetching basic profile' });
    }
});

// Update basic profile info
router.put('/basic', [
  auth,
  body('bio').optional().trim(),
  body('location').optional().trim(),
  body('website').optional().trim(),
  body('github').optional().trim(),
  body('linkedin').optional().trim(),
  body('phoneNumber').optional().trim(),
  body('contactEmail').optional().isEmail().withMessage('Please enter a valid contact email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { bio, location, website, github, linkedin, phoneNumber, contactEmail } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update only the fields that are provided
    if (bio !== undefined) user.profile.bio = bio;
    if (location !== undefined) user.profile.location = location;
    if (website !== undefined) user.profile.website = website;
    if (github !== undefined) user.profile.github = github;
    if (linkedin !== undefined) user.profile.linkedin = linkedin;
    if (phoneNumber !== undefined) user.profile.phoneNumber = phoneNumber;
    if (contactEmail !== undefined) user.profile.contactEmail = contactEmail;

    await user.save();
    
    // Return full user profile object
    const updatedUser = await User.findById(req.user.id).select('-password');
    res.json(updatedUser);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
});

// Add/Update skills
router.put('/skills', [
  auth,
  body('skills').isArray(),
  body('skills.*.name').trim().notEmpty(),
  body('skills.*.level').isIn(['Beginner', 'Intermediate', 'Advanced', 'Expert']),
  body('skills.*.yearsOfExperience').optional().isNumeric()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findById(req.user.id);
    user.profile.skills = req.body.skills;
    await user.save();
    
    // Return full user profile object
    const updatedUser = await User.findById(req.user.id).select('-password');
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add/Update projects
router.put('/projects', [
  auth,
  body('projects').isArray(),
  body('projects.*.title').trim().notEmpty(),
  body('projects.*.description').notEmpty(),
  body('projects.*.technologies').isArray(),
  body('projects.*.url').optional().isURL(),
  body('projects.*.startDate').optional().isISO8601(),
  body('projects.*.endDate').optional().isISO8601(),
  body('projects.*.isOngoing').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findById(req.user.id);
    user.profile.projects = req.body.projects;
    await user.save();
    
    // Return full user profile object
    const updatedUser = await User.findById(req.user.id).select('-password');
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add/Update achievements
router.put('/achievements', [
  auth,
  body('achievements').isArray(),
  body('achievements.*.title').trim().notEmpty(),
  body('achievements.*.description').notEmpty(),
  body('achievements.*.date').isISO8601(),
  body('achievements.*.issuer').optional().trim(),
  body('achievements.*.url').optional().isURL()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findById(req.user.id);
    user.profile.achievements = req.body.achievements;
    await user.save();
    
    // Return full user profile object
    const updatedUser = await User.findById(req.user.id).select('-password');
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add/Update education
router.put('/education', [
  auth,
  body('education').isArray(),
  body('education.*.institution').trim().notEmpty(),
  body('education.*.degree').trim().notEmpty(),
  body('education.*.fieldOfStudy').optional().trim(),
  body('education.*.startDate').isISO8601(),
  body('education.*.endDate').optional().isISO8601(),
  body('education.*.isOngoing').optional().isBoolean(),
  body('education.*.description').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findById(req.user.id);
    user.profile.education = req.body.education;
    await user.save();
    
    // Return full user profile object
    const updatedUser = await User.findById(req.user.id).select('-password');
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add/Update work experience
router.put('/work-experience', [
  auth,
  body('workExperience').isArray(),
  body('workExperience.*.company').trim().notEmpty(),
  body('workExperience.*.position').trim().notEmpty(),
  body('workExperience.*.startDate').isISO8601(),
  body('workExperience.*.endDate').optional().isISO8601(),
  body('workExperience.*.isOngoing').optional().isBoolean(),
  body('workExperience.*.description').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findById(req.user.id);
    user.profile.workExperience = req.body.workExperience;
    await user.save();
    
    // Return full user profile object
    const updatedUser = await User.findById(req.user.id).select('-password');
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 