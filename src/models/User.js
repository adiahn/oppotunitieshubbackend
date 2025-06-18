const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { generateAvatarData } = require('../utils/avatarUtils');

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
  xp: {
    type: Number,
    default: 0,
    min: 0
  },
  level: {
    type: String,
    enum: ['Newcomer', 'Explorer', 'Contributor', 'Collaborator', 'Achiever', 'Expert', 'Legend'],
    default: 'Newcomer'
  },
  stars: {
    type: Number,
    default: 1,
    min: 1,
    max: 7
  },
  streak: {
    current: {
      type: Number,
      default: 0,
      min: 0
    },
    longest: {
      type: Number,
      default: 0,
      min: 0
    },
    lastCheckIn: {
      type: Date,
      default: null
    }
  },
  profile: {
    avatar: {
      initials: {
        type: String,
        required: true
      },
      backgroundColor: {
        type: String,
        required: true
      }
    },
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
    phoneNumber: {
      type: String,
      trim: true
    },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
      validate: {
        validator: function(v) {
          return /^\S+@\S+\.\S+$/.test(v); // Basic email format validation
        },
        message: props => `${props.value} is not a valid email address!`
      }
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
  if (this.isModified('name')) {
    const avatarData = generateAvatarData(this.name);
    this.profile.avatar = avatarData;
  }
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Helper method to update level based on XP
userSchema.methods.updateLevel = function() {
  const xpThresholds = {
    20: { level: 'Explorer', stars: 2 },
    50: { level: 'Contributor', stars: 3 },
    100: { level: 'Collaborator', stars: 4 },
    200: { level: 'Achiever', stars: 5 },
    400: { level: 'Expert', stars: 6 },
    700: { level: 'Legend', stars: 7 }
  };

  // Sort thresholds in descending order to check highest applicable level first
  const sortedThresholds = Object.entries(xpThresholds)
    .sort(([a], [b]) => Number(b) - Number(a));

  // Find the highest threshold that the user's XP meets
  for (const [threshold, { level, stars }] of sortedThresholds) {
    if (this.xp >= Number(threshold)) {
      this.level = level;
      this.stars = stars;
      break;
    }
  }
};

// Method to handle daily check-in
userSchema.methods.handleDailyCheckIn = async function() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // If this is the first check-in
  if (!this.streak.lastCheckIn) {
    this.streak.current = 1;
    this.streak.longest = 1;
    this.xp += 2;
    this.streak.lastCheckIn = now;
    await this.updateLevel();
    return { success: true, message: 'First check-in completed!' };
  }

  const lastCheckIn = new Date(this.streak.lastCheckIn);
  const lastCheckInDate = new Date(lastCheckIn.getFullYear(), lastCheckIn.getMonth(), lastCheckIn.getDate());
  const daysDifference = Math.floor((today - lastCheckInDate) / (1000 * 60 * 60 * 24));

  // If already checked in today
  if (daysDifference === 0) {
    return { success: false, message: 'Already checked in today.' };
  }

  // If checked in yesterday, increment streak
  if (daysDifference === 1) {
    this.streak.current += 1;
    if (this.streak.current > this.streak.longest) {
      this.streak.longest = this.streak.current;
    }
  } else {
    // Streak broken
    this.streak.current = 1;
  }

  this.xp += 2;
  this.streak.lastCheckIn = now;
  await this.updateLevel();
  
  return { 
    success: true, 
    message: daysDifference === 1 ? 'Streak continued!' : 'New streak started!' 
  };
};

const User = mongoose.model('User', userSchema);

module.exports = User; 