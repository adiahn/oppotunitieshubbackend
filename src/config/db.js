const mongoose = require('mongoose');
const config = require('./config');

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4
    };

    cached.promise = mongoose.connect(config.mongoURI, opts);
  }

  try {
    cached.conn = await cached.promise;
    console.log('MongoDB Connected Successfully');
  } catch (error) {
    cached.promise = null;
    console.error('MongoDB Connection Error:', error.message);
    throw error;
  }

  return cached.conn;
};

module.exports = connectDB; 