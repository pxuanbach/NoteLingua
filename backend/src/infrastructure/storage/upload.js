const path = require('path');
const fs = require('fs');
const { UPLOADS_DIR } = require('../../config/upload.config');

// Ensure uploads directory exists
const ensureUploadsDirectory = () => {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    console.log('📁 Created uploads directory:', UPLOADS_DIR);
  }
};

// File validation
const validateFileType = (file, allowedTypes) => {
  if (!allowedTypes.includes(file.mimetype)) {
    throw new Error(`File type ${file.mimetype} is not allowed. Allowed types: ${allowedTypes.join(', ')}`);
  }
};

const validateFileSize = (file, maxSize) => {
  if (file.size > maxSize) {
    throw new Error(`File size ${file.size} exceeds maximum allowed size of ${maxSize} bytes`);
  }
};

// Generate unique filename
const generateUniqueFilename = (originalFilename) => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const extension = path.extname(originalFilename);
  const basename = path.basename(originalFilename, extension);
  return `${basename}_${timestamp}_${random}${extension}`;
};

// Clean up old files (utility function)
const cleanupOldFiles = (directory, maxAge = 24 * 60 * 60 * 1000) => {
  // 24 hours default
  const files = fs.readdirSync(directory);
  const now = Date.now();

  files.forEach((file) => {
    const filePath = path.join(directory, file);
    const stats = fs.statSync(filePath);

    if (now - stats.mtime.getTime() > maxAge) {
      fs.unlinkSync(filePath);
      console.log(`🗑️ Cleaned up old file: ${file}`);
    }
  });
};

module.exports = {
  UPLOADS_DIR,
  ensureUploadsDirectory,
  validateFileType,
  validateFileSize,
  generateUniqueFilename,
  cleanupOldFiles,
};
