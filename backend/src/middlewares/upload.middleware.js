const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { MAX_FILE_SIZE, ALLOWED_FILE_TYPES, UPLOADS_DIR } = require('../config/upload.config');

// Ensure uploads directory exists
const uploadsDir = UPLOADS_DIR;
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, extension);
    cb(null, `${baseName}_${uniqueSuffix}${extension}`);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  const fileExtension = path.extname(file.originalname).toLowerCase().slice(1);

  if (ALLOWED_FILE_TYPES.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error(`File type .${fileExtension} is not allowed`), false);
  }
};

// Multer configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 5
  }
});

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File Too Large',
        message: `File size exceeds the limit of ${MAX_FILE_SIZE / 1024 / 1024}MB`
      });
    }
    return res.status(400).json({
      error: 'Upload Error',
      message: err.message
    });
  }

  if (err.message.includes('File type')) {
    return res.status(400).json({
      error: 'Invalid File Type',
      message: err.message
    });
  }

  next(err);
};

module.exports = {
  upload,
  handleMulterError
};
