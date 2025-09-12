// Load and parse database environment variables
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/notelingua';
const MONGODB_TEST_URI = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/notelingua_test';

module.exports = {
  MONGODB_URI,
  MONGODB_TEST_URI
};
