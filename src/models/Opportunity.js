const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['scholarship', 'internship', 'job', 'fellowship', 'competition']
  },
  organization: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  deadline: {
    type: Date,
    required: true
  },
  requirements: [{
    type: String
  }],
  benefits: [{
    type: String
  }],
  applicationUrl: {
    type: String,
    required: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'closed'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
opportunitySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Opportunity', opportunitySchema); 