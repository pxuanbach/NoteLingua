const jwt = require('jsonwebtoken');

// Load and parse environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '15m'; // Short expiry for access token
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret_key';
const JWT_REFRESH_EXPIRE = process.env.JWT_REFRESH_EXPIRE || '7d'; // Longer expiry for refresh token

// JWT Access Token generation
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRE });
};

// JWT Refresh Token generation
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRE });
};

// JWT Token verification
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
};

// JWT Refresh Token verification
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET);
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};

module.exports = {
  JWT_SECRET,
  JWT_EXPIRE,
  JWT_REFRESH_SECRET,
  JWT_REFRESH_EXPIRE,
  generateToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken
};
