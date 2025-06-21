require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss');
const config = require('./config/config');
const connectDB = require('./config/db');
const { generalLimiter } = require('./middleware/rateLimiter');

const opportunityRoutes = require('./routes/opportunities');
const adminAuthRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const userRoutes = require('./routes/users');
const communityRoutes = require('./routes/community');

const app = express();

// Connect to MongoDB
connectDB();

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// Prevent parameter pollution
app.use(hpp());

// Sanitize data
app.use(mongoSanitize());

// Prevent XSS attacks - custom middleware
app.use((req, res, next) => {
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = xss(req.body[key]);
      }
    });
  }
  next();
});

// Rate limiting
app.use(generalLimiter);

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Routes
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/admin', adminAuthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/users', userRoutes);
app.use('/api/community', communityRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    message: 'Route not found',
    code: 'ROUTE_NOT_FOUND'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Don't leak error details in production
  const message = config.nodeEnv === 'production' 
    ? 'Something went wrong!' 
    : err.message;
  
  res.status(err.status || 500).json({ 
    message,
    code: err.code || 'INTERNAL_SERVER_ERROR',
    ...(config.nodeEnv === 'development' && { stack: err.stack })
  });
});

// Start server
app.listen(config.port, () => {
  console.log(`🚀 Server is running on port ${config.port} in ${config.nodeEnv} mode`);
  console.log(`📊 Health check available at http://localhost:${config.port}/health`);
}); 