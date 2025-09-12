// Test app wrapper that uses the main app.js but with test database setup
const { setupTestDB } = require('./setup');

// Setup test environment before requiring the main app
const initializeTestApp = async () => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  
  // Setup test database first
  await setupTestDB();
  
  // Now require the main app (which will use the test database URI)
  const app = require('../src/app');
  
  return app;
};

module.exports = initializeTestApp;

// Dummy test to prevent Jest error
describe('Test App Setup', () => {
  it('should initialize test app', async () => {
    const app = await initializeTestApp();
    expect(app).toBeDefined();
  });
});
