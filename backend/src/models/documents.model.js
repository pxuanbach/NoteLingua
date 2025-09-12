const mongoose = require('mongoose');
const crypto = require('crypto');

const documentSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  file_hash: {
    type: String,
    required: [true, 'File hash is required'],
    index: true
  },
  file_name: {
    type: String,
    required: [true, 'File name is required'],
    trim: true,
    maxlength: [255, 'File name cannot exceed 255 characters']
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Static method to generate file hash
documentSchema.statics.generateFileHash = function (filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const fs = require('fs');
    const stream = fs.createReadStream(filePath);

    stream.on('data', data => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
};

// Static method to find by file hash
documentSchema.statics.findByHash = function (fileHash) {
  return this.findOne({ file_hash: fileHash });
};

// Compound indexes for performance
documentSchema.index({ user_id: 1, created_at: -1 });
documentSchema.index({ user_id: 1, file_hash: 1 }, { unique: true }); // Ensure unique per user
documentSchema.index({ file_hash: 1 });

module.exports = mongoose.model('Document', documentSchema);
