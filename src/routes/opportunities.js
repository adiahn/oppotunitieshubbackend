const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Opportunity = require('../models/Opportunity');
const adminAuth = require('../middleware/adminAuth');

router.get('/', async (req, res) => {
  try {
    const { category, search, featured, trending } = req.query;
    let query = {};

    if (category) {
      query.category = category;
    }

    if (featured === 'true') {
      query.isFeatured = true;
    }

    if (trending === 'true') {
      query.views = { $gt: 100 };
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

router.get('/:id', async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }
    opportunity.views += 1;
    await opportunity.save();
    res.json(opportunity);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', [
  adminAuth,
  body('title').trim().notEmpty(),
  body('description').trim().notEmpty(),
  body('category').isIn(['scholarship', 'internship', 'job', 'fellowship', 'competition', 'grant', 'workshop']),
  body('organization').trim().notEmpty(),
  body('location').trim().notEmpty(),
  body('deadline').isISO8601(),
  body('applicationUrl').isURL(),
  body('isTrending').optional().isBoolean()
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
  body('category').optional().isIn(['scholarship', 'internship', 'job', 'fellowship', 'competition', 'grant', 'workshop']),
  body('organization').optional().trim().notEmpty(),
  body('location').optional().trim().notEmpty(),
  body('deadline').optional().isISO8601(),
  body('applicationUrl').optional().isURL(),
  body('isTrending').optional().isBoolean()
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