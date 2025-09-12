const Document = require('../models/documents.model');
const Vocabulary = require('../models/vocabs.model');
const path = require('path');

// Import/Upload document
const importDocument = async (file, userId) => {
  // Generate file hash
  const fileHash = await Document.generateFileHash(file.path);

  // Check if document already exists for this user
  const existingDoc = await Document.findOne({
    file_hash: fileHash,
    user_id: userId
  });

  if (existingDoc) {
    return {
      document: existingDoc,
      isExisting: true,
      message: 'Document already exists for this user'
    };
  }

  // Check if document exists for other users (same file, different user)
  const existingDocOtherUser = await Document.findByHash(fileHash);

  // Create new document entry for this user
  const document = new Document({
    user_id: userId,
    file_hash: fileHash,
    file_name: file.filename
  });

  await document.save();

  return {
    document,
    isExisting: false,
    message: existingDocOtherUser ?
      'Document created for user (file exists for other users)' :
      'Document imported successfully'
  };
};

// Get user documents with pagination

// Get notes for document


// Get user's documents
const getUserDocuments = async (userId, query = {}) => {
  const {
    page = 1,
    limit = 10,
    search
  } = query;

  const filter = { user_id: userId };

  if (search) {
    filter.file_name = { $regex: search, $options: 'i' };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [documents, total] = await Promise.all([
    Document.find(filter)
      .select('user_id file_hash file_name notes created_at')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Document.countDocuments(filter)
  ]);

  return {
    documents,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    }
  };
};

// Delete document
const deleteDocument = async (fileHash, userId) => {
  const document = await Document.findOne({
    file_hash: fileHash,
    user_id: userId
  });

  if (!document) {
    throw new Error('Document not found');
  }

  // Also delete related vocabulary entries
  await Vocabulary.deleteMany({
    user_id: userId,
    source: document._id.toString(),
    source_type: 'document'
  });

  await Document.findByIdAndDelete(document._id);
  return true;
};

// Search documents by word in notes
const searchDocumentsByWord = async (userId, word) => {
  const documents = await Document.find({
    user_id: userId,
    'notes.word': { $regex: word.toLowerCase(), $options: 'i' }
  }).select('file_hash file_name notes created_at');

  // Filter notes to only include matching words and add metadata
  const documentsWithMatchingNotes = documents.map(doc => {
    const matchingNotes = doc.notes.filter(note =>
      note.word.toLowerCase().includes(word.toLowerCase())
    );

    return {
      ...doc.toObject(),
      notes: matchingNotes,
      noteCount: matchingNotes.length,
      totalNotes: doc.notes.length
    };
  });

  return documentsWithMatchingNotes;
};

// Get document statistics
const getDocumentStats = async (userId, timeframe = 'all') => {
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

  const stats = await Document.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: null,
        totalDocuments: { $sum: 1 },
        totalNotes: { $sum: { $size: '$notes' } },
        avgNotesPerDoc: { $avg: { $size: '$notes' } }
      }
    }
  ]);

  // Get recent activity (last 7 days)
  const recentActivity = await Document.aggregate([
    {
      $match: {
        user_id: userId,
        created_at: {
          $gte: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$created_at"
          }
        },
        documentsAdded: { $sum: 1 },
        notesAdded: { $sum: { $size: '$notes' } }
      }
    },
    { $sort: { '_id': 1 } }
  ]);

  return {
    totalDocuments: stats[0]?.totalDocuments || 0,
    totalNotes: stats[0]?.totalNotes || 0,
    avgNotesPerDoc: Math.round((stats[0]?.avgNotesPerDoc || 0) * 100) / 100,
    recentActivity,
    timeframe
  };
};

// Admin: Get document statistics for a specific user
const getDocumentStatsByAdmin = async (targetUserId, timeframe = 'all') => {
  // Validate target user exists
  const User = require('../models/users.model');
  const targetUser = await User.findById(targetUserId);
  if (!targetUser) {
    throw new Error('Target user not found');
  }

  const stats = await getDocumentStats(targetUserId, timeframe);

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

// Admin: Get all users' document overview
const getAllUsersDocumentOverview = async () => {
  const overview = await Document.aggregate([
    {
      $group: {
        _id: '$user_id',
        totalDocuments: { $sum: 1 },
        totalNotes: { $sum: { $size: '$notes' } },
        lastActivity: { $max: '$created_at' }
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
        totalDocuments: 1,
        totalNotes: 1,
        lastActivity: 1,
        'user.email': 1,
        'user.firstName': 1,
        'user.lastName': 1,
        'user.role': 1
      }
    },
    { $sort: { totalDocuments: -1 } }
  ]);

  return overview;
};

// Admin: Delete any document
const deleteDocumentByAdmin = async (fileHash, targetUserId) => {
  const document = await Document.findOne({
    file_hash: fileHash,
    user_id: targetUserId
  });

  if (!document) {
    throw new Error('Document not found');
  }

  // Delete related vocabulary entries
  await Vocabulary.deleteMany({
    user_id: targetUserId,
    source: document._id.toString(),
    source_type: 'document'
  });

  await Document.findByIdAndDelete(document._id);
  return { message: 'Document deleted successfully' };
};

// Get document by ID
const getDocumentById = async (documentId, userId) => {
  const document = await Document.findOne({
    _id: documentId,
    user_id: userId
  });

  if (!document) {
    throw new Error('Document not found');
  }

  return document;
};

// Delete document by ID
const deleteDocumentById = async (documentId, userId) => {
  const document = await Document.findOne({
    _id: documentId,
    user_id: userId
  });

  if (!document) {
    throw new Error('Document not found');
  }

  await Document.findByIdAndDelete(document._id);
  return { message: 'Document deleted successfully' };
};

module.exports = {
  importDocument,
  getUserDocuments,
  getDocumentById,
  deleteDocumentById,
  deleteDocument,
  searchDocumentsByWord,
  getDocumentStats,
  // Admin functions
  getDocumentStatsByAdmin,
  getAllUsersDocumentOverview,
  deleteDocumentByAdmin
};
