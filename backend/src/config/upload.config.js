// Load and parse upload environment variables
const path = require('path');
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 10485760; // 10MB default
const ALLOWED_FILE_TYPES = (process.env.ALLOWED_FILE_TYPES || 'pdf,txt,doc,docx').split(',');
const UPLOADS_DIR = path.join(__dirname, '../../uploads');

module.exports = {
  MAX_FILE_SIZE,
  ALLOWED_FILE_TYPES,
  UPLOADS_DIR
};
