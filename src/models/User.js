const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const skillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    required: true
  },
  yearsOfExperience: {
    type: Number,
    min: 0
  }
});

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  technologies: [{
    type: String,
    trim: true
  }],
  url: {
    type: String,
    trim: true
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  isOngoing: {
    type: Boolean,
    default: false
  }
});

const achievementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  issuer: {
    type: String,
    trim: true
  },
  url: {
    type: String,
    trim: true
  }
});

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  profile: {
    bio: {
      type: String,
      trim: true
    },
    location: {
      type: String,
      trim: true
    },
    website: {
      type: String,
      trim: true
    },
    github: {
      type: String,
      trim: true
    },
    linkedin: {
      type: String,
      trim: true
    },
    skills: [skillSchema],
    projects: [projectSchema],
    achievements: [achievementSchema],
    education: [{
      institution: {
        type: String,
        required: true,
        trim: true
      },
      degree: {
        type: String,
        required: true,
        trim: true
      },
      fieldOfStudy: {
        type: String,
        trim: true
      },
      startDate: {
        type: Date,
        required: true
      },
      endDate: {
        type: Date
      },
      isOngoing: {
        type: Boolean,
        default: false
      },
      description: {
        type: String,
        trim: true
      }
    }],
    workExperience: [{
      company: {
        type: String,
        required: true,
        trim: true
      },
      position: {
        type: String,
        required: true,
        trim: true
      },
      startDate: {
        type: Date,
        required: true
      },
      endDate: {
        type: Date
      },
      isOngoing: {
        type: Boolean,
        default: false
      },
      description: {
        type: String,
        trim: true
      }
    }]
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

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Update the updatedAt timestamp before saving
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User; 