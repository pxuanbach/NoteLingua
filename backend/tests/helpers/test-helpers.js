/**
 * Test helper functions and mock data
 */

// Mock user data for testing
const mockUsers = {
  validUser: {
    email: 'john.doe@example.com',
    password: 'Password123',
    firstName: 'John',
    lastName: 'Doe'
  },
  
  adminUser: {
    email: 'admin@example.com',
    password: 'AdminPass123',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin'
  },
  
  invalidEmailUser: {
    email: 'invalid-email',
    password: 'Password123',
    firstName: 'Invalid',
    lastName: 'User'
  },
  
  weakPasswordUser: {
    email: 'weak@example.com',
    password: '123',
    firstName: 'Weak',
    lastName: 'Password'
  }
};

// Mock vocabulary data
const mockVocabs = {
  validVocab: {
    word: 'hello',
    meaning: 'A greeting',
    pronunciation_url: 'https://example.com/hello.mp3',
    tags: ['greeting', 'basic'],
    source: 'test-document',
    source_type: 'document'
  },
  
  longWordVocab: {
    word: 'a'.repeat(101), // Exceeds max length
    meaning: 'A very long word',
    source: 'test-document',
    source_type: 'document'
  }
};

// Mock document data
const mockDocuments = {
  validDocument: {
    title: 'Test Document',
    content: 'This is a test document content',
    language: 'en',
    file_type: 'txt'
  },
  
  pdfDocument: {
    title: 'PDF Test Document',
    content: 'PDF content here',
    language: 'en',
    file_type: 'pdf',
    file_path: '/uploads/test.pdf'
  }
};

// Helper function to create authenticated request headers
const getAuthHeaders = (token) => ({
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
});

// Helper function to extract token from response
const extractToken = (response) => {
  return response.body.data.token;
};

// Helper function to create test user and return token
const createTestUserAndGetToken = async (request, app, userData = mockUsers.validUser) => {
  const response = await request(app)
    .post('/api/auth/register')
    .send(userData);
  
  return extractToken(response);
};

// Helper function to generate random email
const generateRandomEmail = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `test${timestamp}${random}@example.com`;
};

// Helper function to generate test user with random email
const generateTestUser = (overrides = {}) => ({
  ...mockUsers.validUser,
  email: generateRandomEmail(),
  ...overrides
});

// Validation error messages
const errorMessages = {
  EMAIL_REQUIRED: 'Please provide a valid email',
  PASSWORD_MIN_LENGTH: 'Password must be at least 8 characters long',
  PASSWORD_COMPLEXITY: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  FIRST_NAME_LENGTH: 'First name must be between 2 and 50 characters',
  LAST_NAME_LENGTH: 'Last name must be between 2 and 50 characters',
  EMAIL_EXISTS: 'User with this email already exists',
  INVALID_CREDENTIALS: 'Invalid email or password',
  TOKEN_REQUIRED: 'No token provided',
  INVALID_TOKEN: 'Invalid token'
};

// HTTP status codes
const statusCodes = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500
};

module.exports = {
  mockUsers,
  mockVocabs,
  mockDocuments,
  getAuthHeaders,
  extractToken,
  createTestUserAndGetToken,
  generateRandomEmail,
  generateTestUser,
  errorMessages,
  statusCodes
};
