require('dotenv').config();

module.exports = {
    port: process.env.PORT || 5000,
    mongoURI: process.env.MONGO_URI || 'mongodb+srv://admin:admin@cluster0.vnwpnen.mongodb.net/opportunities-hub?retryWrites=true&w=majority',
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    nodeEnv: process.env.NODE_ENV || 'development',
    baseUrl: process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`
}; 