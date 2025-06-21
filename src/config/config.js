require('dotenv').config();

// Validate required environment variables
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars.join(', '));
  console.error('Please create a .env file with the required variables.');
  process.exit(1);
}

module.exports = {
    port: process.env.PORT || 5000,
    mongoURI: process.env.MONGO_URI,
    jwtSecret: process.env.JWT_SECRET,
    nodeEnv: process.env.NODE_ENV || 'development',
    baseUrl: process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`,
    // Security configurations
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '3d',
    refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d',
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
    // Rate limiting
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX) || 100, // requests per window
    // Password policy
    minPasswordLength: parseInt(process.env.MIN_PASSWORD_LENGTH) || 8,
    requirePasswordComplexity: process.env.REQUIRE_PASSWORD_COMPLEXITY === 'true' || false
}; 