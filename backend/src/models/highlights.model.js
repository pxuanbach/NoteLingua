const mongoose = require('mongoose');

const highlightSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  vocab_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vocabulary',
    required: [true, 'Vocabulary ID is required'],
    index: true
  },
  document_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: [true, 'Document ID is required'],
    index: true
  },
  file_hash: {
    type: String,
    required: [true, 'File hash is required'],
    index: true
  },
  content: {
    text: {
      type: String,
      required: [true, 'Highlight text is required'],
      trim: true
    }
  },
  position: {
    boundingRect: {
      x1: {
        type: Number,
        required: [true, 'Bounding rect x1 is required']
      },
      y1: {
        type: Number,
        required: [true, 'Bounding rect y1 is required']
      },
      x2: {
        type: Number,
        required: [true, 'Bounding rect x2 is required']
      },
      y2: {
        type: Number,
        required: [true, 'Bounding rect y2 is required']
      },
      width: {
        type: Number,
        required: [true, 'Bounding rect width is required']
      },
      height: {
        type: Number,
        required: [true, 'Bounding rect height is required']
      },
      pageNumber: {
        type: Number,
        min: 1
      }
    },
    rects: [{
      x1: {
        type: Number,
        required: [true, 'Rect x1 is required']
      },
      y1: {
        type: Number,
        required: [true, 'Rect y1 is required']
      },
      x2: {
        type: Number,
        required: [true, 'Rect x2 is required']
      },
      y2: {
        type: Number,
        required: [true, 'Rect y2 is required']
      },
      width: {
        type: Number,
        required: [true, 'Rect width is required']
      },
      height: {
        type: Number,
        required: [true, 'Rect height is required']
      },
      pageNumber: {
        type: Number,
        min: 1
      }
    }],
    pageNumber: {
      type: Number,
      min: 1
    }
  },
  comment: {
    text: {
      type: String,
      default: '',
      trim: true,
      maxlength: [1000, 'Comment text cannot exceed 1000 characters']
    },
    emoji: {
      type: String,
      default: '',
      maxlength: [10, 'Emoji cannot exceed 10 characters']
    }
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  source_tag: {
    type: String,
    trim: true,
    maxlength: [50, 'Source tag cannot exceed 50 characters']
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Indexes for performance
highlightSchema.index({ user_id: 1, vocab_id: 1 });
highlightSchema.index({ user_id: 1, document_id: 1 });
highlightSchema.index({ user_id: 1, file_hash: 1 });
highlightSchema.index({ vocab_id: 1 });
highlightSchema.index({ document_id: 1 });
highlightSchema.index({ created_at: -1 });

// Pre-save middleware to update updated_at
highlightSchema.pre('save', function (next) {
  this.updated_at = new Date();
  next();
});

// Instance method to update highlight
highlightSchema.methods.updateHighlight = function (updateData) {
  Object.assign(this, updateData);
  this.updated_at = new Date();
  return this.save();
};

// Static method to find highlights by document
highlightSchema.statics.findByDocument = function (documentId, userId) {
  return this.find({
    document_id: documentId,
    user_id: userId
  }).sort({ created_at: -1 });
};

// Static method to find highlights by file hash
highlightSchema.statics.findByFileHash = function (fileHash, userId) {
  return this.find({
    file_hash: fileHash,
    user_id: userId
  }).sort({ created_at: -1 });
};

// Static method to find highlights containing specific text
highlightSchema.statics.findByText = function (userId, searchText) {
  return this.find({
    user_id: userId,
    'content.text': { $regex: searchText, $options: 'i' }
  }).sort({ created_at: -1 });
};

// Static method to find highlights by tags
highlightSchema.statics.findByTags = function (userId, tags) {
  return this.find({
    user_id: userId,
    tags: { $in: tags }
  }).sort({ created_at: -1 });
};

module.exports = mongoose.model('Highlight', highlightSchema);
