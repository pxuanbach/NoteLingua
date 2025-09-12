const bcrypt = require('bcryptjs');
const User = require('../models/users.model');
const { generateToken, generateRefreshToken, verifyRefreshToken } = require('../config/auth.config');

// Register new user
const register = async (userData) => {
  const { email, password, firstName, lastName, phoneNumber, role = 'user' } = userData;
  
  // Check if user already exists
  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    throw new Error('User with this email already exists');
  }
  
  // Create new user
  const user = new User({
    email,
    password_hash: password, // Will be hashed by pre-save middleware
    firstName,
    lastName,
    phoneNumber,
    role
  });
  
  await user.save();
  
  // Generate tokens
  const tokenPayload = { userId: user._id, email: user.email, role: user.role };
  const accessToken = generateToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);
  
  return {
    user,
    access_token: accessToken,
    refresh_token: refreshToken
  };
};

// Login user
const login = async (credentials) => {
  const { email, password } = credentials;
  
  // Find user with password included
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password_hash');
  if (!user) {
    throw new Error('Invalid email or password');
  }
  
  // Check password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  // Check if account is active
  if (!user.isActive) {
    throw new Error('Account has been deactivated. Please contact administrator for assistance.');
  }

  // Generate tokens
  const tokenPayload = { userId: user._id, email: user.email, role: user.role };
  const accessToken = generateToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);
  
  return {
    user,
    access_token: accessToken,
    refresh_token: refreshToken
  };
};

// Logout user (mainly for logging purposes)
const logout = async (userId) => {
  // In JWT-based system, logout is handled client-side
  // This can be used for logging or cleanup
  console.log(`User ${userId} logged out at ${new Date().toISOString()}`);
  return true;
};

// Change password
const changePassword = async (userId, passwordData) => {
  const { currentPassword, newPassword } = passwordData;
  
  // Find user with password
  const user = await User.findById(userId).select('+password_hash');
  if (!user) {
    throw new Error('User not found');
  }
  
  // Verify current password
  const isCurrentPasswordValid = await user.comparePassword(currentPassword);
  if (!isCurrentPasswordValid) {
    throw new Error('Current password is incorrect');
  }
  
  // Update password
  user.password_hash = newPassword; // Will be hashed by pre-save middleware
  await user.save();
  
  return true;
};

// Forgot password (placeholder for future implementation)
const forgotPassword = async (email) => {
  const user = await User.findByEmail(email);
  if (!user) {
    throw new Error('User not found');
  }
  
  // TODO: Implement password reset token generation and email sending
  console.log(`Password reset requested for ${email}`);
  return true;
};

// Reset password (placeholder for future implementation)
const resetPassword = async (token, newPassword) => {
  // TODO: Implement token verification and password reset
  throw new Error('Password reset functionality not implemented yet');
};

// Refresh token
const refreshToken = async (refreshTokenString) => {
  try {
    // Verify refresh token
    const decoded = verifyRefreshToken(refreshTokenString);
    
    // Get user from database
    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Generate new tokens
    const tokenPayload = { userId: user._id, email: user.email, role: user.role };
    const newAccessToken = generateToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);
    
    return { 
      access_token: newAccessToken,
      refresh_token: newRefreshToken
    };
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};

module.exports = {
  register,
  login,
  logout,
  changePassword,
  forgotPassword,
  resetPassword,
  refreshToken
};
