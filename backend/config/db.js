const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Get MongoDB URI from environment variables, fallback to localhost for development
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/vishai';
    
    // Log connection attempt (but not the full URI for security)
    console.log(`Attempting MongoDB connection to ${mongoUri.split('@').pop()}`);
    
    await mongoose.connect(mongoUri);
    
    // Log successful connection
    console.log('✅ MongoDB connected successfully to', 
      mongoUri.includes('mongodb+srv') ? 'Atlas cluster' : 'local database'
    );
  } catch (error) {
    // Enhanced error logging
    console.error('❌ MongoDB connection failed:');
    console.error('Error:', error.message);
    console.error('Make sure:');
    console.error('1. MongoDB is running locally (for development)');
    console.error('2. MONGO_URI environment variable is set (for production)');
    console.error('3. IP address is whitelisted in MongoDB Atlas');
    process.exit(1);
  }
};

module.exports = connectDB;