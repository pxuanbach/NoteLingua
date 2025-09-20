const express = require('express');
const { body, query, param } = require('express-validator');
const { authenticateToken } = require('../middlewares/auth.middleware');
const highlightsService = require('../services/highlights.service');
const { handleValidationErrors } = require('../middlewares/validation.middleware');

const router = express.Router();

// Validation for highlight creation
const createHighlightValidation = [
  body('vocab_id')
    .notEmpty()
    .withMessage('Vocabulary ID is required')
    .isMongoId()
    .withMessage('Vocabulary ID must be a valid MongoDB ObjectId'),
  body('document_id')
    .notEmpty()
    .withMessage('Document ID is required')
    .isMongoId()
    .withMessage('Document ID must be a valid MongoDB ObjectId'),
  body('file_hash')
    .notEmpty()
    .withMessage('File hash is required'),
  body('content.text')
    .notEmpty()
    .withMessage('Highlight text is required')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Highlight text must be between 1 and 1000 characters'),
  body('position.boundingRect.x1')
    .isNumeric()
    .withMessage('Bounding rect x1 must be a number'),
  body('position.boundingRect.y1')
    .isNumeric()
    .withMessage('Bounding rect y1 must be a number'),
  body('position.boundingRect.x2')
    .isNumeric()
    .withMessage('Bounding rect x2 must be a number'),
  body('position.boundingRect.y2')
    .isNumeric()
    .withMessage('Bounding rect y2 must be a number'),
  body('position.boundingRect.width')
    .isNumeric()
    .withMessage('Bounding rect width must be a number'),
  body('position.boundingRect.height')
    .isNumeric()
    .withMessage('Bounding rect height must be a number'),
  body('position.rects')
    .isArray()
    .withMessage('Rects must be an array'),
  body('position.rects.*.x1')
    .isNumeric()
    .withMessage('Rect x1 must be a number'),
  body('position.rects.*.y1')
    .isNumeric()
    .withMessage('Rect y1 must be a number'),
  body('position.rects.*.x2')
    .isNumeric()
    .withMessage('Rect x2 must be a number'),
  body('position.rects.*.y2')
    .isNumeric()
    .withMessage('Rect y2 must be a number'),
  body('position.rects.*.width')
    .isNumeric()
    .withMessage('Rect width must be a number'),
  body('position.rects.*.height')
    .isNumeric()
    .withMessage('Rect height must be a number'),
  body('comment.text')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Comment text cannot exceed 1000 characters'),
  body('comment.emoji')
    .optional()
    .isLength({ max: 10 })
    .withMessage('Emoji cannot exceed 10 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('source_tag')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Source tag cannot exceed 50 characters')
];

// Validation for highlight update
const updateHighlightValidation = [
  body('content.text')
    .optional()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Highlight text must be between 1 and 1000 characters'),
  body('comment.text')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Comment text cannot exceed 1000 characters'),
  body('comment.emoji')
    .optional()
    .isLength({ max: 10 })
    .withMessage('Emoji cannot exceed 10 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('source_tag')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Source tag cannot exceed 50 characters')
];

// @route   POST /api/highlights
// @desc    Create a new highlight
// @access  Private
router.post('/', authenticateToken, createHighlightValidation, handleValidationErrors, async (req, res) => {
  try {
    const { vocab_id, document_id, file_hash, ...highlightData } = req.body;

    const highlight = await highlightsService.createHighlight(
      req.user.id,
      vocab_id,
      document_id,
      file_hash,
      highlightData
    );

    res.status(201).json({
      success: true,
      message: 'Highlight created successfully',
      data: highlight
    });
  } catch (error) {
    console.error('Create highlight error:', error);
    res.status(400).json({
      error: 'Create Highlight Failed',
      message: error.message
    });
  }
});

// @route   GET /api/highlights/document/:documentId
// @desc    Get highlights for a document
// @access  Private
router.get('/document/:documentId',
  authenticateToken,
  [
    param('documentId')
      .isMongoId()
      .withMessage('Document ID must be a valid MongoDB ObjectId'),
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
    query('tags')
      .optional()
      .isArray()
      .withMessage('Tags must be an array')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const result = await highlightsService.getDocumentHighlights(
        req.user.id,
        req.params.documentId,
        req.query
      );

      res.json({
        success: true,
        data: result.highlights,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Get document highlights error:', error);
      res.status(500).json({
        error: 'Get Highlights Failed',
        message: error.message
      });
    }
  }
);

// @route   GET /api/highlights/file/:fileHash
// @desc    Get highlights for a file
// @access  Private
router.get('/file/:fileHash',
  authenticateToken,
  [
    param('fileHash')
      .notEmpty()
      .withMessage('File hash is required'),
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
    query('tags')
      .optional()
      .isArray()
      .withMessage('Tags must be an array')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const result = await highlightsService.getFileHighlights(
        req.user.id,
        req.params.fileHash,
        req.query
      );

      res.json({
        success: true,
        data: result.highlights,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Get file highlights error:', error);
      res.status(500).json({
        error: 'Get Highlights Failed',
        message: error.message
      });
    }
  }
);

// @route   GET /api/highlights/search
// @desc    Search highlights by text
// @access  Private
router.get('/search',
  authenticateToken,
  [
    query('q')
      .notEmpty()
      .withMessage('Search query is required')
      .isLength({ min: 1 })
      .withMessage('Search query must not be empty'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('tags')
      .optional()
      .isArray()
      .withMessage('Tags must be an array')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const result = await highlightsService.searchHighlights(
        req.user.id,
        req.query.q,
        {
          page: req.query.page,
          limit: req.query.limit,
          tags: req.query.tags
        }
      );

      res.json({
        success: true,
        data: result.highlights,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Search highlights error:', error);
      res.status(500).json({
        error: 'Search Highlights Failed',
        message: error.message
      });
    }
  }
);

// @route   GET /api/highlights/:highlightId
// @desc    Get a single highlight
// @access  Private
router.get('/:highlightId',
  authenticateToken,
  [
    param('highlightId')
      .isMongoId()
      .withMessage('Highlight ID must be a valid MongoDB ObjectId')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const highlight = await highlightsService.getHighlightById(
        req.params.highlightId,
        req.user.id
      );

      res.json({
        success: true,
        data: highlight
      });
    } catch (error) {
      console.error('Get highlight error:', error);
      if (error.message === 'Highlight not found') {
        return res.status(404).json({
          error: 'Highlight Not Found',
          message: error.message
        });
      }
      res.status(500).json({
        error: 'Get Highlight Failed',
        message: error.message
      });
    }
  }
);

// @route   PUT /api/highlights/:highlightId
// @desc    Update a highlight
// @access  Private
router.put('/:highlightId',
  authenticateToken,
  [
    param('highlightId')
      .isMongoId()
      .withMessage('Highlight ID must be a valid MongoDB ObjectId')
  ],
  updateHighlightValidation,
  handleValidationErrors,
  async (req, res) => {
    try {
      const highlight = await highlightsService.updateHighlight(
        req.params.highlightId,
        req.user.id,
        req.body
      );

      res.json({
        success: true,
        message: 'Highlight updated successfully',
        data: highlight
      });
    } catch (error) {
      console.error('Update highlight error:', error);
      if (error.message === 'Highlight not found') {
        return res.status(404).json({
          error: 'Highlight Not Found',
          message: error.message
        });
      }
      res.status(400).json({
        error: 'Update Highlight Failed',
        message: error.message
      });
    }
  }
);

// @route   DELETE /api/highlights/:highlightId
// @desc    Delete a highlight
// @access  Private
router.delete('/:highlightId',
  authenticateToken,
  [
    param('highlightId')
      .isMongoId()
      .withMessage('Highlight ID must be a valid MongoDB ObjectId')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      await highlightsService.deleteHighlight(
        req.params.highlightId,
        req.user.id
      );

      res.json({
        success: true,
        message: 'Highlight deleted successfully'
      });
    } catch (error) {
      console.error('Delete highlight error:', error);
      if (error.message === 'Highlight not found') {
        return res.status(404).json({
          error: 'Highlight Not Found',
          message: error.message
        });
      }
      res.status(500).json({
        error: 'Delete Highlight Failed',
        message: error.message
      });
    }
  }
);

module.exports = router;
