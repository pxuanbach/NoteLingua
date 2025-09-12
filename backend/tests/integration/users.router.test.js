const request = require('supertest');
const User = require('../../src/models/users.model');
const { teardownTestDB, clearDatabase } = require('../setup');
const initializeTestApp = require('../app.test');

describe('Users Routes Integration Tests', () => {
  let app;
  let userToken;
  let adminToken;
  let userId;
  let adminId;

  beforeAll(async () => {
    app = await initializeTestApp();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  beforeEach(async () => {
    await clearDatabase();

    // Create a regular user
    const userData = {
      email: 'user@example.com',
      password: 'Password123',
      firstName: 'John',
      lastName: 'Doe'
    };

    const userResponse = await request(app)
      .post('/api/auth/register')
      .send(userData);

    userToken = userResponse.body.data.access_token;
    userId = userResponse.body.data.user.id;

    // Create an admin user
    const adminData = {
      email: 'admin@example.com',
      password: 'Password123',
      firstName: 'Admin',
      lastName: 'User'
    };

    const adminResponse = await request(app)
      .post('/api/auth/register')
      .send(adminData);

    adminToken = adminResponse.body.data.access_token;
    adminId = adminResponse.body.data.user.id;

    // Update admin user role to admin
    await User.findByIdAndUpdate(adminId, { role: 'admin' });
  });

  describe('GET /api/users/profile', () => {
    it('should get user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data.email).toBe('user@example.com');
      expect(response.body.data.firstName).toBe('John');
      expect(response.body.data.lastName).toBe('Doe');
      expect(response.body.data).not.toHaveProperty('password_hash');
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Access Denied');
    });
  });

  describe('PUT /api/users/profile', () => {
    it('should update user profile with valid data', async () => {
      const updateData = {
        firstName: 'Jane',
        lastName: 'Smith',
        phoneNumber: '+1234567890'
      };

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.message).toContain('Profile updated successfully');
    });

    it('should not allow regular user to update email', async () => {
      const updateData = {
        email: 'newemail@example.com',
        firstName: 'Jane'
      };

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect(403);

      expect(response.body).toHaveProperty('error', 'Forbidden');
      expect(response.body.message).toContain('Only administrators can update email addresses');
    });

    it('should return 400 for invalid phone number', async () => {
      const updateData = {
        phoneNumber: 'invalid-phone'
      };

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation Error');
    });

    it('should return 401 without token', async () => {
      const updateData = {
        firstName: 'Jane'
      };

      const response = await request(app)
        .put('/api/users/profile')
        .send(updateData)
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Access Denied');
    });
  });

  describe('PUT /api/users/deactivate', () => {
    it('should deactivate user account', async () => {
      const response = await request(app)
        .put('/api/users/deactivate')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.message).toContain('Account deactivated successfully');
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .put('/api/users/deactivate')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Access Denied');
    });

    it('should prevent access after deactivation', async () => {
      // First deactivate the account
      await request(app)
        .put('/api/users/deactivate')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      // Try to access profile with the same token
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('error', 'Account Deactivated');
      expect(response.body.message).toContain('Your account has been deactivated');
    });
  });

  describe('Admin Routes', () => {
    describe('GET /api/users', () => {
      it('should get all users for admin', async () => {
        const response = await request(app)
          .get('/api/users')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toHaveProperty('users');
        expect(response.body.data).toHaveProperty('pagination');
        expect(Array.isArray(response.body.data.users)).toBe(true);
      });

      it('should return 403 for regular user', async () => {
        const response = await request(app)
          .get('/api/users')
          .set('Authorization', `Bearer ${userToken}`)
          .expect(403);

        expect(response.body).toHaveProperty('error', 'Forbidden');
      });

      it('should support pagination', async () => {
        const response = await request(app)
          .get('/api/users?page=1&limit=10')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
      });

      it('should support role filtering', async () => {
        const response = await request(app)
          .get('/api/users?role=admin')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
      });

      it('should support isActive filtering', async () => {
        // Deactivate the regular user
        await User.findByIdAndUpdate(userId, { isActive: false });

        // Test filtering for active users only
        const activeResponse = await request(app)
          .get('/api/users?isActive=true')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(activeResponse.body).toHaveProperty('success', true);
        expect(activeResponse.body.data.users.every(user => user.isActive === true)).toBe(true);

        // Test filtering for inactive users only
        const inactiveResponse = await request(app)
          .get('/api/users?isActive=false')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(inactiveResponse.body).toHaveProperty('success', true);
        expect(inactiveResponse.body.data.users.every(user => user.isActive === false)).toBe(true);
      });
    });

    describe('GET /api/users/:id', () => {
      it('should get user by ID for admin', async () => {
        const response = await request(app)
          .get(`/api/users/${userId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body.data.email).toBe('user@example.com');
      });

      it('should return 403 for regular user', async () => {
        const response = await request(app)
          .get(`/api/users/${userId}`)
          .set('Authorization', `Bearer ${userToken}`)
          .expect(403);

        expect(response.body).toHaveProperty('error', 'Forbidden');
      });
    });

    describe('PUT /api/users/:id', () => {
      it('should update user by ID for admin', async () => {
        const updateData = {
          firstName: 'Updated',
          lastName: 'Name',
          email: 'updated@example.com',
          role: 'admin'
        };

        const response = await request(app)
          .put(`/api/users/${userId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send(updateData)
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body.message).toContain('User updated successfully');
      });

      it('should return 403 for regular user', async () => {
        const updateData = {
          firstName: 'Updated'
        };

        const response = await request(app)
          .put(`/api/users/${userId}`)
          .set('Authorization', `Bearer ${userToken}`)
          .send(updateData)
          .expect(403);

        expect(response.body).toHaveProperty('error', 'Forbidden');
      });

      it('should validate email format', async () => {
        const updateData = {
          email: 'invalid-email'
        };

        const response = await request(app)
          .put(`/api/users/${userId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send(updateData)
          .expect(400);

        expect(response.body).toHaveProperty('error', 'Validation Error');
      });
    });

    describe('PUT /api/users/:id/change-password', () => {
      it('should change user password for admin', async () => {
        const passwordData = {
          newPassword: 'NewPassword123'
        };

        const response = await request(app)
          .put(`/api/users/${userId}/change-password`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send(passwordData)
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body.message).toContain('User password changed successfully');
      });

      it('should return 403 for regular user', async () => {
        const passwordData = {
          newPassword: 'NewPassword123'
        };

        const response = await request(app)
          .put(`/api/users/${userId}/change-password`)
          .set('Authorization', `Bearer ${userToken}`)
          .send(passwordData)
          .expect(403);

        expect(response.body).toHaveProperty('error', 'Forbidden');
      });

      it('should validate password strength', async () => {
        const passwordData = {
          newPassword: '123'
        };

        const response = await request(app)
          .put(`/api/users/${userId}/change-password`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send(passwordData)
          .expect(400);

        expect(response.body).toHaveProperty('error', 'Validation Error');
      });
    });

    describe('PUT /api/users/:id/deactivate', () => {
      it('should deactivate user for admin', async () => {
        const response = await request(app)
          .put(`/api/users/${userId}/deactivate`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body.message).toContain('User deactivated successfully');
      });

      it('should return 403 for regular user', async () => {
        const response = await request(app)
          .put(`/api/users/${userId}/deactivate`)
          .set('Authorization', `Bearer ${userToken}`)
          .expect(403);

        expect(response.body).toHaveProperty('error', 'Forbidden');
      });

      it('should verify user is actually deactivated', async () => {
        // Admin deactivates user
        await request(app)
          .put(`/api/users/${userId}/deactivate`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        // Check user status in database
        const user = await User.findById(userId);
        expect(user.isActive).toBe(false);

        // Verify user can't access protected routes anymore
        const response = await request(app)
          .get('/api/users/profile')
          .set('Authorization', `Bearer ${userToken}`)
          .expect(403);

        expect(response.body).toHaveProperty('error', 'Account Deactivated');
      });
    });

    describe('DELETE /api/users/:id', () => {
      it('should delete user for admin', async () => {
        const response = await request(app)
          .delete(`/api/users/${userId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body.message).toContain('User deleted successfully');
      });

      it('should return 403 for regular user', async () => {
        const response = await request(app)
          .delete(`/api/users/${userId}`)
          .set('Authorization', `Bearer ${userToken}`)
          .expect(403);

        expect(response.body).toHaveProperty('error', 'Forbidden');
      });
    });
  });
});
