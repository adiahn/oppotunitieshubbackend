const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Opportunity = require('../models/Opportunity');
const adminAuth = require('../middleware/adminAuth');

// Get all opportunities (public)
router.get('/', async (req, res) => {
  try {
    const { category, search, featured } = req.query;
    let query = {};

    if (category) {
      query.category = category;
    }

    if (featured === 'true') {
      query.isFeatured = true;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { organization: { $regex: search, $options: 'i' } }
      ];
    }

    const opportunities = await Opportunity.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(req.query.limit) || 20);

    res.json(opportunities);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single opportunity (public)
router.get('/:id', async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }
    res.json(opportunity);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create opportunity (admin only)
router.post('/', [
  adminAuth,
  body('title').trim().notEmpty(),
  body('description').trim().notEmpty(),
  body('category').isIn(['scholarship', 'internship', 'job', 'fellowship', 'competition']),
  body('organization').trim().notEmpty(),
  body('location').trim().notEmpty(),
  body('deadline').isISO8601(),
  body('applicationUrl').isURL()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const opportunity = new Opportunity(req.body);
    const savedOpportunity = await opportunity.save();
    res.status(201).json(savedOpportunity);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update opportunity (admin only)
router.put('/:id', [
  adminAuth,
  body('title').optional().trim().notEmpty(),
  body('description').optional().trim().notEmpty(),
  body('category').optional().isIn(['scholarship', 'internship', 'job', 'fellowship', 'competition']),
  body('organization').optional().trim().notEmpty(),
  body('location').optional().trim().notEmpty(),
  body('deadline').optional().isISO8601(),
  body('applicationUrl').optional().isURL()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }

    Object.assign(opportunity, req.body);
    const updatedOpportunity = await opportunity.save();
    res.json(updatedOpportunity);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete opportunity (admin only)
// Delete opportunity (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }

    await Opportunity.findByIdAndDelete(req.params.id);
    res.json({ message: 'Opportunity deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 