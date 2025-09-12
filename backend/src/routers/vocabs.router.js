const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { requireAdmin } = require('../middlewares/admin.middleware');
const vocabsService = require('../services/vocabs.service');

const router = express.Router();

// Validation for timeframe query parameter
const timeframeValidation = [
  query('timeframe')
    .optional()
    .isIn(['all', 'week', 'month', 'year'])
    .withMessage('Timeframe must be one of: all, week, month, year')
];

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

// @route   POST /api/vocabs
// @desc    Add new vocabulary
// @access  Private
router.post('/',
  authenticateToken,
  [
    body('word')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Word must be between 1 and 100 characters'),
    body('meaning')
      .trim()
      .isLength({ min: 1, max: 1000 })
      .withMessage('Meaning must be between 1 and 1000 characters'),
    body('pronunciation_url')
      .optional({ values: 'falsy' })
      .isURL()
      .withMessage('Pronunciation URL must be valid'),
    body('tags')
      .optional({ values: 'falsy' })
      .isArray()
      .withMessage('Tags must be an array'),
    body('source')
      .optional({ values: 'falsy' })
      .isString()
      .withMessage('Source must be a string'),
    body('source_type')
      .optional({ values: 'falsy' })
      .isIn(['document', 'package', 'self'])
      .withMessage('Source type must be either document or package'),
    body('examples')
      .optional({ values: 'falsy' })
      .isArray()
      .withMessage('Examples must be an array')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const vocabData = {
        ...req.body,
        user_id: req.user.id
      };
      const vocab = await vocabsService.addVocabulary(vocabData);
      res.status(201).json({
        success: true,
        message: 'Vocabulary added successfully',
        data: vocab
      });
    } catch (error) {
      console.error('Add vocabulary error:', error);
      res.status(400).json({
        error: 'Add Vocabulary Failed',
        message: error.message
      });
    }
  }
);

// @route   GET /api/vocabs/me
// @desc    Get user's vocabulary list
// @access  Private
router.get('/me',
  authenticateToken,
  [
    query('tags')
      .optional()
      .isString()
      .withMessage('Tags filter must be a string'),
    query('source')
      .optional()
      .isString()
      .withMessage('Source filter must be a string'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 200 })
      .withMessage('Limit must be between 1 and 200'),
    query('search')
      .optional()
      .trim()
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const result = await vocabsService.getUserVocabulary(req.user.id, req.query);
      res.json(result);
    } catch (error) {
      console.error('Get user vocabulary error:', error);
      res.status(500).json({
        error: 'Vocabulary Retrieval Failed',
        message: error.message
      });
    }
  }
);

// @route   GET /api/vocabs/stats/:userId
// @desc    Admin: Get vocabulary statistics for a specific user
// @access  Private (Admin only)
router.get('/stats/:userId', authenticateToken, requireAdmin, timeframeValidation, handleValidationErrors, async (req, res) => {
  try {
    const { userId } = req.params;
    const { timeframe = 'all' } = req.query;

    const stats = await vocabsService.getVocabularyStatsByAdmin(userId, timeframe);
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get user vocabulary stats error:', error);
    res.status(404).json({
      error: 'Stats Not Found',
      message: error.message
    });
  }
});

// @route   GET /api/vocabs/admin/overview
// @desc    Admin: Get all users vocabulary overview
// @access  Private (Admin only)
router.get('/admin/overview', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const overview = await vocabsService.getAllUsersVocabOverview();
    res.json({
      success: true,
      data: overview
    });
  } catch (error) {
    console.error('Get users vocabulary overview error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: error.message
    });
  }
});

// @route   DELETE /api/vocabs/admin/:id
// @desc    Admin: Delete any vocabulary
// @access  Private (Admin only)
router.delete('/admin/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await vocabsService.deleteVocabularyByAdmin(req.params.id);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Admin delete vocabulary error:', error);
    res.status(404).json({
      error: 'Vocabulary Not Found',
      message: error.message
    });
  }
});

// @route   GET /api/vocabs/stats
// @desc    Get vocabulary statistics
// @access  Private
router.get('/stats', authenticateToken, timeframeValidation, handleValidationErrors, async (req, res) => {
  try {
    const { timeframe = 'all' } = req.query;
    const stats = await vocabsService.getVocabularyStats(req.user.id, timeframe);
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get vocabulary stats error:', error);
    res.status(500).json({
      error: 'Stats Retrieval Failed',
      message: error.message
    });
  }
});

// @route   GET /api/vocabs/:id
// @desc    Get vocabulary by ID
// @access  Private
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const vocab = await vocabsService.getVocabularyById(req.params.id, req.user.id);
    res.json({
      success: true,
      data: vocab
    });
  } catch (error) {
    console.error('Get vocabulary by ID error:', error);
    res.status(404).json({
      error: 'Vocabulary Not Found',
      message: error.message
    });
  }
});

// @route   PUT /api/vocabs/:id
// @desc    Update vocabulary
// @access  Private
router.put('/:id',
  authenticateToken,
  [
    body('word')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Word must be between 1 and 100 characters'),
    body('meaning')
      .optional()
      .trim()
      .isLength({ min: 1, max: 1000 })
      .withMessage('Meaning must be between 1 and 1000 characters'),
    body('pronunciation_url')
      .optional()
      .isURL()
      .withMessage('Pronunciation URL must be valid'),
    body('tags')
      .optional()
      .isArray()
      .withMessage('Tags must be an array'),
    body('examples')
      .optional()
      .isArray()
      .withMessage('Examples must be an array')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const updatedVocab = await vocabsService.updateVocabulary(req.params.id, req.user.id, req.body);
      res.json({
        success: true,
        message: 'Vocabulary updated successfully',
        data: updatedVocab
      });
    } catch (error) {
      console.error('Update vocabulary error:', error);
      res.status(400).json({
        error: 'Update Failed',
        message: error.message
      });
    }
  }
);

// @route   DELETE /api/vocabs/:id
// @desc    Delete vocabulary
// @access  Private
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await vocabsService.deleteVocabulary(req.params.id, req.user.id);
    res.json({
      success: true,
      message: 'Vocabulary deleted successfully'
    });
  } catch (error) {
    console.error('Delete vocabulary error:', error);
    res.status(500).json({
      error: 'Deletion Failed',
      message: error.message
    });
  }
});

// @route   POST /api/vocabs/:id/review
// @desc    Add review history for vocabulary
// @access  Private
router.post('/:id/review',
  authenticateToken,
  [
    body('correct')
      .isBoolean()
      .withMessage('Correct field must be true or false')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const updatedVocab = await vocabsService.addReviewHistory(req.params.id, req.user.id, req.body.correct);
      res.json({
        success: true,
        message: 'Review recorded successfully',
        data: updatedVocab
      });
    } catch (error) {
      console.error('Add review history error:', error);
      res.status(400).json({
        error: 'Review Recording Failed',
        message: error.message
      });
    }
  }
);

module.exports = router;
