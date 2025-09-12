const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod;

// Setup test database
const setupTestDB = async () => {
  // Close existing connection if any
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
  
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  
  // Override the MongoDB URI for testing
  process.env.MONGODB_URI = uri;
  process.env.NODE_ENV = 'test';
  
  await mongoose.connect(uri);
};

// Clean up test database
const teardownTestDB = async () => {
  if (mongod) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongod.stop();
  }
  
  // Reset environment
  delete process.env.MONGODB_URI;
};

// Clear all collections
const clearDatabase = async () => {
  if (mongoose.connection.readyState === 1) {
    const collections = mongoose.connection.collections;
    
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  }
};

module.exports = {
  setupTestDB,
  teardownTestDB,
  clearDatabase
};
