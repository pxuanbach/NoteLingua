// Load and parse general app environment variables
const NODE_ENV = process.env.NODE_ENV || 'development';
const PORT = parseInt(process.env.PORT) || 5000;

// External API configurations
const FORVO_API_KEY = process.env.FORVO_API_KEY || '';
const WIKTIONARY_API_URL = process.env.WIKTIONARY_API_URL || 'https://en.wiktionary.org/api/rest_v1';

// Email configuration
const EMAIL_HOST = process.env.EMAIL_HOST || 'smtp.gmail.com';
const EMAIL_PORT = parseInt(process.env.EMAIL_PORT) || 587;
const EMAIL_USER = process.env.EMAIL_USER || '';
const EMAIL_PASS = process.env.EMAIL_PASS || '';

module.exports = {
  NODE_ENV,
  PORT,
  FORVO_API_KEY,
  WIKTIONARY_API_URL,
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_USER,
  EMAIL_PASS
};
