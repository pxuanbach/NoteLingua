const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/notelingua';

// Connection options với retry và monitoring
const connectionOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
  retryWrites: true,
  retryReads: true,
  // Improve connection reliability
  heartbeatFrequencyMS: 10000, // Check connection every 10 seconds
};

let isConnected = false;
let connectionAttempts = 0;
const MAX_CONNECTION_ATTEMPTS = 10;

const connectWithRetry = async () => {
  try {
    if (isConnected) {
      console.log('✅ MongoDB is already connected');
      return;
    }

    connectionAttempts++;
    console.log(`🔄 Attempting to connect to MongoDB (attempt ${connectionAttempts})...`);

    await mongoose.connect(MONGODB_URI, connectionOptions);

    isConnected = true;
    connectionAttempts = 0;
    console.log('✅ Successfully connected to MongoDB');

  } catch (error) {
    console.error(`❌ MongoDB connection attempt ${connectionAttempts} failed:`, error.message);

    if (connectionAttempts < MAX_CONNECTION_ATTEMPTS) {
      console.log(`⏳ Retrying connection in 5 seconds...`);
      setTimeout(connectWithRetry, 5000);
    } else {
      console.error('💥 Max connection attempts reached. Giving up.');
      process.exit(1);
    }
  }
};

const setupConnectionListeners = () => {
  mongoose.connection.on('connected', () => {
    isConnected = true;
    console.log('📡 MongoDB connected');
  });

  mongoose.connection.on('error', (err) => {
    isConnected = false;
    console.error('❌ MongoDB connection error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    isConnected = false;
    console.log('📡 MongoDB disconnected');

    // Auto-reconnect after disconnection
    if (process.env.NODE_ENV !== 'test') {
      console.log('🔄 Attempting to reconnect to MongoDB...');
      setTimeout(connectWithRetry, 1000);
    }
  });

  mongoose.connection.on('reconnected', () => {
    isConnected = true;
    console.log('✅ MongoDB reconnected');
  });

  mongoose.connection.on('reconnectFailed', () => {
    console.error('❌ MongoDB reconnection failed');
  });

  // Handle application termination
  process.on('SIGINT', async () => {
    console.log('📡 Received SIGINT, closing MongoDB connection...');
    await mongoose.connection.close();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('📡 Received SIGTERM, closing MongoDB connection...');
    await mongoose.connection.close();
    process.exit(0);
  });
};

const disconnect = async () => {
  try {
    await mongoose.connection.close();
    isConnected = false;
    console.log('✅ MongoDB disconnected successfully');
  } catch (error) {
    console.error('❌ Error disconnecting from MongoDB:', error);
  }
};

const getConnectionStatus = () => {
  return {
    isConnected,
    readyState: mongoose.connection.readyState,
    name: mongoose.connection.name,
    host: mongoose.connection.host,
    port: mongoose.connection.port,
  };
};

module.exports = {
  MONGODB_URI,
  connectWithRetry,
  setupConnectionListeners,
  disconnect,
  getConnectionStatus,
  isConnected: () => isConnected,
};
