const express = require('express');
const { body } = require('express-validator');
const authService = require('../services/auth.service');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { handleValidationErrors } = require('../middlewares/validation.middleware');

const router = express.Router();

// Validation middleware
const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', registerValidation, handleValidationErrors, async (req, res) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: result
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({
      error: 'Registration Failed',
      message: error.message
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user and return JWT token
// @access  Public
router.post('/login', loginValidation, handleValidationErrors, async (req, res) => {
  try {
    const result = await authService.login(req.body);
    res.json({
      success: true,
      message: 'Login successful',
      data: result
    });
  } catch (error) {
    console.error('Login error:', error);
    const statusCode = error.message.includes('Invalid') ? 401 : 400;
    res.status(statusCode).json({
      error: 'Login Failed',
      message: error.message
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (mainly for client-side token clearing)
// @access  Private
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // In a JWT-based system, logout is mainly handled on the client side
    // Here we can log the logout event or perform cleanup
    await authService.logout(req.user.id);

    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Logout Failed',
      message: error.message
    });
  }
});

// @route   PUT /api/auth/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password',
  authenticateToken,
  [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      await authService.changePassword(req.user.id, req.body);
      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      console.error('Change password error:', error);
      const statusCode = error.message.includes('Current password') ? 400 : 500;
      res.status(statusCode).json({
        error: 'Change Password Failed',
        message: error.message
      });
    }
  }
);

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password',
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      await authService.forgotPassword(req.body.email);
      res.json({
        success: true,
        message: 'Password reset instructions sent to your email'
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      // Don't reveal if email exists for security
      res.json({
        success: true,
        message: 'If the email exists, password reset instructions have been sent'
      });
    }
  }
);

// @route   POST /api/auth/reset-password
// @desc    Reset password with token
// @access  Public
router.post('/reset-password',
  [
    body('token')
      .notEmpty()
      .withMessage('Reset token is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      await authService.resetPassword(req.body.token, req.body.newPassword);
      res.json({
        success: true,
        message: 'Password reset successful'
      });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(400).json({
        error: 'Reset Password Failed',
        message: error.message
      });
    }
  }
);

// @route   POST /api/auth/refresh-token
// @desc    Refresh JWT token
// @access  Public
router.post('/refresh-token', async (req, res) => {
  try {
    // Extract refresh token from Authorization header
    const authHeader = req.headers['authorization'];
    const refreshToken = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!refreshToken) {
      return res.status(401).json({
        error: 'Token Refresh Failed',
        message: 'No refresh token provided'
      });
    }

    const result = await authService.refreshToken(refreshToken);
    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: result
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({
      error: 'Token Refresh Failed',
      message: error.message
    });
  }
});

module.exports = router;
