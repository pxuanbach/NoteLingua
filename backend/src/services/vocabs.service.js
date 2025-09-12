const Vocabulary = require('../models/vocabs.model');
const Document = require('../models/documents.model');

// Add new vocabulary
const addVocabulary = async (vocabData) => {
  const {
    user_id,
    word,
    meaning,
    pronunciation_url,
    tags = [],
    source,
    source_type,
    examples = []
  } = vocabData;

  const vocab = new Vocabulary({
    user_id,
    word: word.toLowerCase(),
    meaning,
    pronunciation_url,
    tags,
    source,
    source_type,
    examples
  });

  await vocab.save();
  return vocab;
};

// Get user's vocabulary with filters and pagination
const getUserVocabulary = async (userId, query) => {
  const {
    tags,
    source,
    page = 1,
    limit = 20,
    search
  } = query;

  const filter = { user_id: userId };

  // Apply filters
  if (tags) {
    filter.tags = { $in: [tags] };
  }

  if (source) {
    filter.source = source;
  }

  if (search) {
    filter.$or = [
      { word: { $regex: search, $options: 'i' } },
      { meaning: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [vocabs, total] = await Promise.all([
    Vocabulary.find(filter)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Vocabulary.countDocuments(filter)
  ]);

  const vocabsWithDocuments = vocabs.map(vocab => vocab.toObject());
  // Collect all document IDs that need to be populated
  const documentIds = [...new Set(
    vocabsWithDocuments
      .filter(vocab => vocab.source_type === 'document' && vocab.source)
      .map(vocab => vocab.source)
  )];

  if (documentIds.length > 0) {
    // Find all documents in one query
    const documents = await Document.find({
      _id: { $in: documentIds },
      user_id: userId
    });

    // Create a map for quick lookup
    const documentMap = new Map();
    documents.forEach(doc => {
      documentMap.set(doc._id.toString(), {
        _id: doc._id,
        file_name: doc.file_name,
        file_hash: doc.file_hash,
        created_at: doc.created_at
      });
    });

    // Assign documents to vocabs
    vocabsWithDocuments.forEach(vocab => {
      if (vocab.source_type === 'document' && vocab.source) {
        const document = documentMap.get(vocab.source.toString());

        if (document) {
          vocab.document = document;
        }
      }
    });
  }

  return {
    success: true,
    data: vocabsWithDocuments,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    }
  };
};

// Get vocabulary by ID
const getVocabularyById = async (vocabId, userId) => {
  const vocab = await Vocabulary.findOne({
    _id: vocabId,
    user_id: userId
  });

  if (!vocab) {
    throw new Error('Vocabulary not found');
  }

  // Populate document if source_type is 'document'
  const vocabObj = vocab.toObject();

  if (vocabObj.source_type === 'document' && vocabObj.source) {
    const document = await Document.findOne({
      _id: vocabObj.source,
      user_id: userId
    });

    if (document) {
      vocabObj.document = {
        _id: document._id,
        file_name: document.file_name,
        file_hash: document.file_hash,
        created_at: document.created_at
      };
    }
  }

  return vocabObj;
};

// Update vocabulary
const updateVocabulary = async (vocabId, userId, updateData) => {
  const vocab = await Vocabulary.findOne({
    _id: vocabId,
    user_id: userId
  });

  if (!vocab) {
    throw new Error('Vocabulary not found');
  }

  // Only allow updating specific fields
  const allowedFields = ['meaning', 'pronunciation_url', 'tags', 'examples'];
  const updates = {};

  Object.keys(updateData).forEach(key => {
    if (allowedFields.includes(key)) {
      updates[key] = updateData[key];
    }
  });

  Object.assign(vocab, updates);
  await vocab.save();

  return vocab;
};

// Delete vocabulary
const deleteVocabulary = async (vocabId, userId) => {
  const vocab = await Vocabulary.findOne({
    _id: vocabId,
    user_id: userId
  });

  if (!vocab) {
    throw new Error('Vocabulary not found');
  }

  await Vocabulary.findByIdAndDelete(vocabId);
  return true;
};

// Add review history
const addReviewHistory = async (vocabId, userId, correct) => {
  const vocab = await Vocabulary.findOne({
    _id: vocabId,
    user_id: userId
  });

  if (!vocab) {
    throw new Error('Vocabulary not found');
  }

  await vocab.addReview(correct);
  return vocab;
};

// Get vocabulary by tag
const getVocabularyByTag = async (userId, tag) => {
  return await Vocabulary.findByTag(userId, tag);
};

// Get vocabulary by source
const getVocabularyBySource = async (userId, source) => {
  return await Vocabulary.findBySource(userId, source);
};

// Get vocabulary statistics
const getVocabularyStats = async (userId, timeframe = 'all') => {
  const matchFilter = { user_id: userId };

  // Add date filter based on timeframe
  if (timeframe !== 'all') {
    const now = new Date();
    let startDate;

    switch (timeframe) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = null;
    }

    if (startDate) {
      matchFilter.created_at = { $gte: startDate };
    }
  }

  const stats = await Vocabulary.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        totalReviews: { $sum: { $size: '$review_history' } },
        avgReviewsPerVocab: { $avg: { $size: '$review_history' } }
      }
    }
  ]);

  const sourceTypeStats = await Vocabulary.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: '$source_type',
        count: { $sum: 1 }
      }
    }
  ]);

  // Get weekly breakdown for current month
  const monthlyBreakdown = await Vocabulary.aggregate([
    {
      $match: {
        user_id: userId,
        created_at: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }
    },
    {
      $group: {
        _id: {
          week: { $week: '$created_at' },
          year: { $year: '$created_at' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.week': 1 } }
  ]);

  return {
    total: stats[0]?.total || 0,
    totalReviews: stats[0]?.totalReviews || 0,
    avgReviewsPerVocab: Math.round((stats[0]?.avgReviewsPerVocab || 0) * 100) / 100,
    bySourceType: sourceTypeStats.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    weeklyBreakdown: monthlyBreakdown,
    timeframe
  };
};

// Admin: Get vocabulary statistics for a specific user
const getVocabularyStatsByAdmin = async (targetUserId, timeframe = 'all') => {
  // Validate target user exists
  const User = require('../models/users.model');
  const targetUser = await User.findById(targetUserId);
  if (!targetUser) {
    throw new Error('Target user not found');
  }

  const stats = await getVocabularyStats(targetUserId, timeframe);

  return {
    ...stats,
    user: {
      id: targetUser._id,
      email: targetUser.email,
      firstName: targetUser.firstName,
      lastName: targetUser.lastName
    }
  };
};

// Admin: Get all users' vocabulary overview
const getAllUsersVocabOverview = async () => {
  const overview = await Vocabulary.aggregate([
    {
      $group: {
        _id: '$user_id',
        totalVocabs: { $sum: 1 },
        totalReviews: { $sum: { $size: '$review_history' } },
        lastActivity: { $max: '$updated_at' }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    {
      $unwind: '$user'
    },
    {
      $project: {
        _id: 1,
        totalVocabs: 1,
        totalReviews: 1,
        lastActivity: 1,
        'user.email': 1,
        'user.firstName': 1,
        'user.lastName': 1,
        'user.role': 1
      }
    },
    { $sort: { totalVocabs: -1 } }
  ]);

  return overview;
};

// Admin: Delete any vocabulary
const deleteVocabularyByAdmin = async (vocabularyId) => {
  const vocabulary = await Vocabulary.findById(vocabularyId);
  if (!vocabulary) {
    throw new Error('Vocabulary not found');
  }

  await Vocabulary.findByIdAndDelete(vocabularyId);
  return { message: 'Vocabulary deleted successfully' };
};

module.exports = {
  addVocabulary,
  getUserVocabulary,
  getVocabularyById,
  updateVocabulary,
  deleteVocabulary,
  addReviewHistory,
  getVocabularyByTag,
  getVocabularyBySource,
  getVocabularyStats,
  // Admin functions
  getVocabularyStatsByAdmin,
  getAllUsersVocabOverview,
  deleteVocabularyByAdmin
};
