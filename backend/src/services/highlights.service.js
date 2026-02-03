const Highlight = require('../models/highlights.model');
const Document = require('../models/documents.model');
const Vocab = require('../models/vocabs.model');

/**
 * Create a new highlight
 * @param {string} userId - User ID
 * @param {string} vocabId - Vocabulary ID
 * @param {string} documentId - Document ID
 * @param {string} fileHash - File hash
 * @param {Object} highlightData - Highlight data
 * @returns {Object} Created highlight
 */
const createHighlight = async (userId, vocabId, documentId, fileHash, highlightData) => {
  try {
    // Verify vocab exists and belongs to user
    const vocab = await Vocab.findOne({
      _id: vocabId,
      user: userId,
    });

    if (!vocab) {
      throw new Error('Vocabulary not found or access denied');
    }

    // Verify document exists and belongs to user
    const document = await Document.findOne({
      _id: documentId,
      user: userId,
      file_hash: fileHash,
    });

    if (!document) {
      throw new Error('Document not found or access denied');
    }

    // Create highlight
    const highlight = new Highlight({
      user: userId,
      vocab: vocabId,
      document: documentId,
      file_hash: fileHash,
      ...highlightData,
    });

    const savedHighlight = await highlight.save();

    return {
      ...savedHighlight.toJSON(),
      vocab,
    };
  } catch (error) {
    console.error('Create highlight error:', error);
    throw error;
  }
};

/**
 * Get highlights for a document
 * @param {string} userId - User ID
 * @param {string} documentId - Document ID
 * @param {Object} options - Query options
 * @returns {Array} Array of highlights
 */
const getDocumentHighlights = async (userId, documentId, options = {}) => {
  try {
    const { page = 1, limit = 50, search, tags } = options;

    // Build query
    const query = {
      user: userId,
      document: documentId,
    };

    // Add search filter
    if (search) {
      query['content.text'] = { $regex: search, $options: 'i' };
    }

    // Add tags filter
    if (tags && tags.length > 0) {
      query.tags = { $in: tags };
    }

    // Get highlights with pagination
    const highlights = await Highlight.find(query)
      .populate({
        path: 'vocab',
        select: 'word meaning pronunciation_url tags examples',
      })
      .sort({ created_at: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get total count for pagination
    const total = await Highlight.countDocuments(query);

    return {
      highlights,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error('Get document highlights error:', error);
    throw error;
  }
};

/**
 * Get highlights for a file hash
 * @param {string} userId - User ID
 * @param {string} fileHash - File hash
 * @param {Object} options - Query options
 * @returns {Array} Array of highlights
 */
const getFileHighlights = async (userId, fileHash, options = {}) => {
  try {
    const { page = 1, limit = 50, search, tags } = options;

    // Build query
    const query = {
      user: userId,
      file_hash: fileHash,
    };

    // Add search filter
    if (search) {
      query['content.text'] = { $regex: search, $options: 'i' };
    }

    // Add tags filter
    if (tags && tags.length > 0) {
      query.tags = { $in: tags };
    }

    // Get highlights with pagination
    const highlights = await Highlight.find(query)
      .sort({ created_at: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get total count for pagination
    const total = await Highlight.countDocuments(query);

    return {
      highlights,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error('Get file highlights error:', error);
    throw error;
  }
};

/**
 * Get a single highlight by ID
 * @param {string} highlightId - Highlight ID
 * @param {string} userId - User ID
 * @returns {Object} Highlight object
 */
const getHighlightById = async (highlightId, userId) => {
  try {
    const highlight = await Highlight.findOne({
      _id: highlightId,
      user: userId,
    });

    if (!highlight) {
      throw new Error('Highlight not found');
    }

    return highlight;
  } catch (error) {
    console.error('Get highlight by ID error:', error);
    throw error;
  }
};

/**
 * Update a highlight
 * @param {string} highlightId - Highlight ID
 * @param {string} userId - User ID
 * @param {Object} updateData - Update data
 * @returns {Object} Updated highlight
 */
const updateHighlight = async (highlightId, userId, updateData) => {
  try {
    const highlight = await Highlight.findOne({
      _id: highlightId,
      user: userId,
    });

    if (!highlight) {
      throw new Error('Highlight not found');
    }

    // Update highlight
    Object.assign(highlight, updateData);
    highlight.updated_at = new Date();
    await highlight.save();

    return highlight;
  } catch (error) {
    console.error('Update highlight error:', error);
    throw error;
  }
};

/**
 * Delete a highlight
 * @param {string} highlightId - Highlight ID
 * @param {string} userId - User ID
 * @returns {boolean} Success status
 */
const deleteHighlight = async (highlightId, userId) => {
  try {
    const result = await Highlight.deleteOne({
      _id: highlightId,
      user: userId,
    });

    if (result.deletedCount === 0) {
      throw new Error('Highlight not found');
    }

    return true;
  } catch (error) {
    console.error('Delete highlight error:', error);
    throw error;
  }
};

/**
 * Search highlights by text
 * @param {string} userId - User ID
 * @param {string} searchText - Search text
 * @param {Object} options - Query options
 * @returns {Array} Array of highlights
 */
const searchHighlights = async (userId, searchText, options = {}) => {
  try {
    const { page = 1, limit = 50, tags } = options;

    // Build query
    const query = {
      user: userId,
      'content.text': { $regex: searchText, $options: 'i' },
    };

    // Add tags filter
    if (tags && tags.length > 0) {
      query.tags = { $in: tags };
    }

    // Get highlights with pagination
    const highlights = await Highlight.find(query)
      .sort({ created_at: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get total count for pagination
    const total = await Highlight.countDocuments(query);

    return {
      highlights,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error('Search highlights error:', error);
    throw error;
  }
};

module.exports = {
  createHighlight,
  getDocumentHighlights,
  getFileHighlights,
  getHighlightById,
  updateHighlight,
  deleteHighlight,
  searchHighlights,
};
