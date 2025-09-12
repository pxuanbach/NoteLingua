const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { requireAdmin } = require('../middlewares/admin.middleware');
const { upload, handleMulterError } = require('../middlewares/upload.middleware');
const documentsService = require('../services/documents.service');

const router = express.Router();

// Helper function to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Please check your input data',
      details: errors.array()
    });
  }
  next();
};

// Validation for timeframe query parameter
const timeframeValidation = [
  query('timeframe')
    .optional()
    .isIn(['all', 'week', 'month', 'year'])
    .withMessage('Timeframe must be one of: all, week, month, year')
];

// @route   POST /api/documents/import
// @desc    Upload and import document
// @access  Private
router.post('/import',
  authenticateToken,
  upload.single('document'),
  handleMulterError,
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: 'Upload Error',
          message: 'No file uploaded'
        });
      }

      const result = await documentsService.importDocument(req.file, req.user.id);

      const statusCode = result.isExisting ? 200 : 201;
      res.status(statusCode).json({
        success: true,
        message: result.message,
        data: {
          file_hash: result.document.file_hash,
          file_name: result.document.file_name,
          isExisting: result.isExisting
        }
      });
    } catch (error) {
      console.error('Import document error:', error);
      res.status(500).json({
        error: 'Import Failed',
        message: error.message
      });
    }
  }
);

// @route   GET /api/documents/:id
// @desc    Get document by ID
// @access  Private
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const document = await documentsService.getDocumentById(req.params.id, req.user.id);

    res.json({
      success: true,
      data: document
    });
  } catch (error) {
    console.error('Get document error:', error);
    res.status(404).json({
      error: 'Document Not Found',
      message: error.message
    });
  }
});

// @route   DELETE /api/documents/:id
// @desc    Delete document by ID
// @access  Private
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await documentsService.deleteDocumentById(req.params.id, req.user.id);

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({
      error: 'Deletion Failed',
      message: error.message
    });
  }
});

// @route   GET /api/documents
// @desc    Get user's documents
// @access  Private
router.get('/',
  authenticateToken,
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
      .withMessage('Search term must not be empty')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const result = await documentsService.getUserDocuments(req.user.id, req.query);

      res.json({
        success: true,
        data: result.documents,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Get user documents error:', error);
      res.status(500).json({
        success: false,
        error: 'Documents Retrieval Failed',
        message: error.message
      });
    }
  }
);

// @route   GET /api/documents/stats/:userId
// @desc    Admin: Get document statistics for a specific user
// @access  Private (Admin only)
router.get('/stats/:userId', authenticateToken, requireAdmin, timeframeValidation, handleValidationErrors, async (req, res) => {
  try {
    const { userId } = req.params;
    const { timeframe = 'all' } = req.query;

    const stats = await documentsService.getDocumentStatsByAdmin(userId, timeframe);
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get user document stats error:', error);
    res.status(404).json({
      error: 'Stats Not Found',
      message: error.message
    });
  }
});

// @route   GET /api/documents/admin/overview
// @desc    Admin: Get all users document overview
// @access  Private (Admin only)
router.get('/admin/overview', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const overview = await documentsService.getAllUsersDocumentOverview();
    res.json({
      success: true,
      data: overview
    });
  } catch (error) {
    console.error('Get users document overview error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: error.message
    });
  }
});

// @route   DELETE /api/documents/admin/:fileHash/user/:userId
// @desc    Admin: Delete any user's document
// @access  Private (Admin only)
router.delete('/admin/:fileHash/user/:userId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { fileHash, userId } = req.params;
    const result = await documentsService.deleteDocumentByAdmin(fileHash, userId);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Admin delete document error:', error);
    res.status(404).json({
      error: 'Document Not Found',
      message: error.message
    });
  }
});

// @route   GET /api/documents/stats
// @desc    Get document statistics
// @access  Private
router.get('/stats', authenticateToken, timeframeValidation, handleValidationErrors, async (req, res) => {
  try {
    const { timeframe = 'all' } = req.query;
    const stats = await documentsService.getDocumentStats(req.user.id, timeframe);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get document stats error:', error);
    res.status(500).json({
      error: 'Stats Retrieval Failed',
      message: error.message
    });
  }
});

module.exports = router;
