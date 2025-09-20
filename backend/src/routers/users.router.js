const express = require('express');
const { body, query } = require('express-validator');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth.middleware');
const usersService = require('../services/users.service');
const { handleValidationErrors } = require('../middlewares/validation.middleware');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await usersService.getUserProfile(req.user.id);
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(404).json({
      error: 'User Not Found',
      message: error.message
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile',
  authenticateToken,
  [
    body('firstName')
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('First name must be between 1 and 50 characters'),
    body('lastName')
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Last name must be between 1 and 50 characters'),
    body('phoneNumber')
      .optional()
      .trim()
      .matches(/^[\+]?[1-9][\d]{0,15}$/)
      .withMessage('Please enter a valid phone number')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      // Check if this is an admin update
      const isAdminUpdate = req.user.role === 'admin';

      // Remove email from request body if user is not admin
      if (req.body.email && !isAdminUpdate) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Only administrators can update email addresses'
        });
      }

      const updatedUser = await usersService.updateUserProfile(req.user.id, req.body, isAdminUpdate);
      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedUser
      });
    } catch (error) {
      console.error('Update user profile error:', error);
      res.status(400).json({
        error: 'Update Failed',
        message: error.message
      });
    }
  }
);

// @route   GET /api/users/stats
// @desc    Get user statistics
// @access  Private
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const stats = await usersService.getUserStats(req.user.id);
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      error: 'Stats Retrieval Failed',
      message: error.message
    });
  }
});

// @route   PUT /api/users/deactivate
// @desc    Deactivate user account (soft delete)
// @access  Private
router.put('/deactivate', authenticateToken, async (req, res) => {
  try {
    await usersService.deactivateUserAccount(req.user.id);
    res.json({
      success: true,
      message: 'Account deactivated successfully'
    });
  } catch (error) {
    console.error('Deactivate user account error:', error);
    res.status(500).json({
      error: 'Account Deactivation Failed',
      message: error.message
    });
  }
});

// Admin only routes
// @route   GET /api/users
// @desc    Get all users (Admin only)
// @access  Private (Admin)
router.get('/',
  authenticateToken,
  authorizeRoles('admin'),
  [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('search')
      .optional()
      .trim()
      .isLength({ min: 1 })
      .withMessage('Search term must not be empty'),
    query('role')
      .optional()
      .isIn(['user', 'admin'])
      .withMessage('Role must be either user or admin'),
    query('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be true or false')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const users = await usersService.getAllUsers(req.query);
      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({
        error: 'Users Retrieval Failed',
        message: error.message
      });
    }
  }
);

// @route   GET /api/users/:id
// @desc    Get user by ID (Admin only)
// @access  Private (Admin)
router.get('/:id',
  authenticateToken,
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      const user = await usersService.getUserById(req.params.id);
      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Get user by ID error:', error);
      res.status(404).json({
        error: 'User Not Found',
        message: error.message
      });
    }
  }
);

// @route   PUT /api/users/:id
// @desc    Update user by ID (Admin only)
// @access  Private (Admin)
router.put('/:id',
  authenticateToken,
  authorizeRoles('admin'),
  [
    body('email')
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    body('firstName')
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('First name must be between 1 and 50 characters'),
    body('lastName')
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Last name must be between 1 and 50 characters'),
    body('phoneNumber')
      .optional()
      .trim()
      .matches(/^[\+]?[1-9][\d]{0,15}$/)
      .withMessage('Please enter a valid phone number'),
    body('role')
      .optional()
      .isIn(['user', 'admin'])
      .withMessage('Role must be either user or admin')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const updatedUser = await usersService.updateUserById(req.params.id, req.body);
      res.json({
        success: true,
        message: 'User updated successfully',
        data: updatedUser
      });
    } catch (error) {
      console.error('Update user by ID error:', error);
      res.status(400).json({
        error: 'Update Failed',
        message: error.message
      });
    }
  }
);

// @route   DELETE /api/users/:id
// @desc    Delete user by ID (Admin only)
// @access  Private (Admin)
router.delete('/:id',
  authenticateToken,
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      await usersService.deleteUserById(req.params.id);
      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      console.error('Delete user by ID error:', error);
      res.status(500).json({
        error: 'Deletion Failed',
        message: error.message
      });
    }
  }
);

// @route   PUT /api/users/:id/change-password
// @desc    Change user password by ID (Admin only)
// @access  Private (Admin)
router.put('/:id/change-password',
  authenticateToken,
  authorizeRoles('admin'),
  [
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      await usersService.changeUserPassword(req.params.id, req.body.newPassword);
      res.json({
        success: true,
        message: 'User password changed successfully'
      });
    } catch (error) {
      console.error('Change user password error:', error);
      res.status(400).json({
        error: 'Password Change Failed',
        message: error.message
      });
    }
  }
);

// @route   PUT /api/users/:id/deactivate
// @desc    Deactivate user by ID (Admin only)
// @access  Private (Admin)
router.put('/:id/deactivate',
  authenticateToken,
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      await usersService.deactivateUserById(req.params.id);
      res.json({
        success: true,
        message: 'User deactivated successfully'
      });
    } catch (error) {
      console.error('Deactivate user error:', error);
      res.status(500).json({
        error: 'User Deactivation Failed',
        message: error.message
      });
    }
  }
);

module.exports = router;
