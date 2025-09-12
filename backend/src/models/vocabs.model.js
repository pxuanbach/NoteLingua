const mongoose = require('mongoose');

const vocabSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  word: {
    type: String,
    required: [true, 'Word is required'],
    trim: true,
    maxlength: [100, 'Word cannot exceed 100 characters']
  },
  meaning: {
    type: String,
    required: [true, 'Meaning is required'],
    trim: true,
    maxlength: [1000, 'Meaning cannot exceed 1000 characters']
  },
  pronunciation_url: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  source: {
    type: String,
    trim: true
  },
  source_type: {
    type: String,
    enum: ['document', 'package', 'self'],
    required: [true, 'Source type is required']
  },
  examples: [{
    type: String,
    trim: true,
    maxlength: [500, 'Example cannot exceed 500 characters']
  }],
  review_history: [{
    date: {
      type: Date,
      default: Date.now
    },
    correct: {
      type: Boolean,
      required: true
    }
  }],
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Instance method to add review
vocabSchema.methods.addReview = function (correct) {
  this.review_history.push({
    date: new Date(),
    correct
  });
  return this.save();
};

// Static method to find by tag
vocabSchema.statics.findByTag = function (userId, tag) {
  return this.find({
    user_id: userId,
    tags: { $in: [tag] }
  });
};

// Static method to find by source
vocabSchema.statics.findBySource = function (userId, source) {
  return this.find({
    user_id: userId,
    source: source
  });
};

// Compound indexes for performance
vocabSchema.index({ user_id: 1, word: 1 });
vocabSchema.index({ user_id: 1, tags: 1 });
vocabSchema.index({ user_id: 1, created_at: -1 });
vocabSchema.index({ source: 1 });

module.exports = mongoose.model('Vocabulary', vocabSchema);
