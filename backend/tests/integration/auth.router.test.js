const request = require('supertest');
const User = require('../../src/models/users.model');
const { teardownTestDB, clearDatabase } = require('../setup');
const initializeTestApp = require('../app.test');

describe('Auth Routes Integration Tests', () => {
  let app;

  beforeAll(async () => {
    app = await initializeTestApp();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  beforeEach(async () => {
    await clearDatabase();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user with valid data', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Password123',
        firstName: 'John',
        lastName: 'Doe'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('access_token');
      expect(response.body.data).toHaveProperty('refresh_token');
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user).not.toHaveProperty('password_hash');
    });

    it('should return 400 for invalid email format', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'Password123',
        firstName: 'John',
        lastName: 'Doe'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation Error');
      expect(response.body).toHaveProperty('details');
      expect(response.body.details).toBeInstanceOf(Array);
    });

    it('should return 400 for weak password', async () => {
      const userData = {
        email: 'test@example.com',
        password: '123',
        firstName: 'John',
        lastName: 'Doe'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation Error');
      expect(response.body.details.some(detail => 
        detail.msg.includes('Password must be at least 8 characters')
      )).toBe(true);
    });

    it('should return 400 for missing required fields', async () => {
      const userData = {
        email: 'test@example.com'
        // Missing password, firstName, lastName
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation Error');
    });

    it('should return 400 when email already exists', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Password123',
        firstName: 'John',
        lastName: 'Doe'
      };

      // Register first user
      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Try to register with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Registration Failed');
      expect(response.body.message).toContain('already exists');
    });

    it('should normalize email to lowercase', async () => {
      const userData = {
        email: 'TEST@EXAMPLE.COM',
        password: 'Password123',
        firstName: 'John',
        lastName: 'Doe'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.data.user.email).toBe('test@example.com');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user before each login test
      const userData = {
        email: 'test@example.com',
        password: 'Password123',
        firstName: 'John',
        lastName: 'Doe'
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData);
    });

    it('should login with valid credentials', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'Password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('access_token');
      expect(response.body.data).toHaveProperty('refresh_token');
      expect(response.body.data.user.email).toBe(credentials.email);
    });

    it('should return 400 for invalid email format', async () => {
      const credentials = {
        email: 'invalid-email',
        password: 'Password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation Error');
    });

    it('should return 401 for non-existent email', async () => {
      const credentials = {
        email: 'nonexistent@example.com',
        password: 'Password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Login Failed');
      expect(response.body.message).toContain('Invalid email or password');
    });

    it('should return 401 for wrong password', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'WrongPassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Login Failed');
      expect(response.body.message).toContain('Invalid email or password');
    });

    it('should return 400 for missing password', async () => {
      const credentials = {
        email: 'test@example.com'
        // Missing password
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation Error');
    });

    it('should handle case insensitive email login', async () => {
      const credentials = {
        email: 'TEST@EXAMPLE.COM',
        password: 'Password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(200);

      expect(response.body.data.user.email).toBe('test@example.com');
    });

    it('should return 401 for deactivated user login', async () => {
      // First deactivate the user
      await User.findOneAndUpdate(
        { email: 'test@example.com' }, 
        { isActive: false }
      );

      const credentials = {
        email: 'test@example.com',
        password: 'Password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Login Failed');
      expect(response.body.message).toContain('Account has been deactivated');
    });
  });

  describe('POST /api/auth/logout', () => {
    let authToken;

    beforeEach(async () => {
      // Register and login to get auth token
      const userData = {
        email: 'test@example.com',
        password: 'Password123',
        firstName: 'John',
        lastName: 'Doe'
      };

      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(userData);

      authToken = registerResponse.body.data.access_token;
    });

    it('should logout with valid token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.message).toContain('Logout successful');
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Access Denied');
      expect(response.body.message).toContain('No token provided');
    });

    it('should return 403 with invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', 'Bearer invalid-token')
        .expect(403);

      expect(response.body).toHaveProperty('error', 'Invalid Token');
    });

    it('should return 403 for deactivated user with valid token', async () => {
      // First deactivate the user
      await User.findOneAndUpdate(
        { email: 'test@example.com' }, 
        { isActive: false }
      );

      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('error', 'Account Deactivated');
      expect(response.body.message).toContain('Your account has been deactivated');
    });
  });

  describe('PUT /api/auth/change-password', () => {
    let authToken;
    const originalPassword = 'Password123';

    beforeEach(async () => {
      // Register and login to get auth token
      const userData = {
        email: 'test@example.com',
        password: originalPassword,
        firstName: 'John',
        lastName: 'Doe'
      };

      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(userData);

      authToken = registerResponse.body.data.access_token;
    });

    it('should change password with valid data', async () => {
      const passwordData = {
        currentPassword: originalPassword,
        newPassword: 'NewPassword123'
      };

      const response = await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send(passwordData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.message).toContain('Password changed successfully');
    });

    it('should return 400 for missing current password', async () => {
      const passwordData = {
        newPassword: 'NewPassword123'
        // Missing currentPassword
      };

      const response = await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send(passwordData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation Error');
    });

    it('should return 400 for weak new password', async () => {
      const passwordData = {
        currentPassword: originalPassword,
        newPassword: '123'
      };

      const response = await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send(passwordData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation Error');
    });

    it('should return 401 without token', async () => {
      const passwordData = {
        currentPassword: originalPassword,
        newPassword: 'NewPassword123'
      };

      const response = await request(app)
        .put('/api/auth/change-password')
        .send(passwordData)
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Access Denied');
    });

    it('should return 403 for deactivated user trying to change password', async () => {
      // First deactivate the user
      await User.findOneAndUpdate(
        { email: 'test@example.com' }, 
        { isActive: false }
      );

      const passwordData = {
        currentPassword: originalPassword,
        newPassword: 'NewPassword123'
      };

      const response = await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send(passwordData)
        .expect(403);

      expect(response.body).toHaveProperty('error', 'Account Deactivated');
      expect(response.body.message).toContain('Your account has been deactivated');
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    beforeEach(async () => {
      // Create a test user
      const userData = {
        email: 'test@example.com',
        password: 'Password123',
        firstName: 'John',
        lastName: 'Doe'
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData);
    });

    it('should accept valid email for password reset', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'test@example.com' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.message).toContain('Password reset instructions sent to your email');
    });

    it('should return success even for non-existent email (security)', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      // Should return generic message for security
    });

    it('should return 400 for invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'invalid-email' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation Error');
    });

    it('should return 400 for missing email', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation Error');
    });
  });

  describe('POST /api/auth/reset-password', () => {
    it('should return 400 for missing token', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({ newPassword: 'NewPassword123' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation Error');
    });

    it('should return 400 for weak new password', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({ 
          token: 'some-token', 
          newPassword: '123' 
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation Error');
    });

    it('should return 400 for invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({ 
          token: 'invalid-token', 
          newPassword: 'NewPassword123' 
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Reset Password Failed');
    });
  });

  describe('POST /api/auth/refresh-token', () => {
    let authToken, refreshToken;

    beforeEach(async () => {
      // Register and login to get auth token
      const userData = {
        email: 'test@example.com',
        password: 'Password123',
        firstName: 'John',
        lastName: 'Doe'
      };

      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(userData);

      authToken = registerResponse.body.data.access_token;
      refreshToken = registerResponse.body.data.refresh_token;
    });

    it('should refresh token with valid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh-token')
        .send({ refresh_token: refreshToken })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('access_token');
      expect(response.body.data).toHaveProperty('refresh_token');
    });

    it('should return 400 without refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh-token')
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation Error');
    });

    it('should return 401 with invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh-token')
        .send({ refresh_token: 'invalid_token' })
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Token Refresh Failed');
    });
  });
});
