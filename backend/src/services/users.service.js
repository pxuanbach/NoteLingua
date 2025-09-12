const User = require('../models/users.model');
const Vocabulary = require('../models/vocabs.model');
const Document = require('../models/documents.model');

// Get user profile
const getUserProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  
  return user;
};

// Update user profile
const updateUserProfile = async (userId, updateData, isAdminUpdate = false) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  
  // Define allowed fields based on user role
  let allowedFields = ['firstName', 'lastName', 'phoneNumber'];
  
  // Only admin can update email
  if (isAdminUpdate) {
    allowedFields.push('email', 'role');
  }
  
  const updates = {};
  
  Object.keys(updateData).forEach(key => {
    if (allowedFields.includes(key)) {
      updates[key] = updateData[key];
    }
  });
  
  Object.assign(user, updates);
  await user.save();
  
  return user;
};

// Get user statistics
const getUserStats = async (userId) => {
  const [totalVocabs, totalDocuments, totalNotes] = await Promise.all([
    Vocabulary.countDocuments({ user_id: userId }),
    Document.countDocuments({ user_id: userId }),
    Document.aggregate([
      { $match: { user_id: userId } },
      { $project: { noteCount: { $size: '$notes' } } },
      { $group: { _id: null, total: { $sum: '$noteCount' } } }
    ])
  ]);
  
  return {
    totalVocabulary: totalVocabs,
    totalDocuments: totalDocuments,
    totalNotes: totalNotes[0]?.total || 0,
    joinedDate: (await User.findById(userId)).created_at
  };
};

// Deactivate user account
const deactivateUserAccount = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  
  // For now, we'll just set a flag or delete the user
  // In a real app, you might set an 'isActive' field to false
  user.isActive = false;
  await user.save();
  
  return true;
};

// Delete user account
const deleteUserAccount = async (userId) => {
  // Delete user's vocabulary and documents
  await Promise.all([
    Vocabulary.deleteMany({ user_id: userId }),
    Document.deleteMany({ user_id: userId }),
    User.findByIdAndDelete(userId)
  ]);
  
  return true;
};

// Admin functions
// Get all users with pagination and filters
const getAllUsers = async (query) => {
  const {
    page = 1,
    limit = 10,
    search,
    role,
    isActive
  } = query;
  
  const filter = {};
  
  if (search) {
    filter.email = { $regex: search, $options: 'i' };
  }
  
  if (role) {
    filter.role = role;
  }
  
  // Filter by account status (admin can see all, filter if specified)
  if (typeof isActive !== 'undefined') {
    filter.isActive = isActive === 'true' || isActive === true;
  }
  
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const [users, total] = await Promise.all([
    User.find(filter)
      .select('-password_hash')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    User.countDocuments(filter)
  ]);
  
  return {
    users,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    }
  };
};

// Get user by ID (Admin)
const getUserById = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  
  return user;
};

// Update user by ID (Admin)
const updateUserById = async (userId, updateData) => {
  // Reuse updateUserProfile with admin privileges
  return await updateUserProfile(userId, updateData, true);
};

// Change user password (Admin)
const changeUserPassword = async (userId, newPassword) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  
  user.password_hash = newPassword; // Will be hashed by pre-save middleware
  await user.save();
  
  return true;
};

// Deactivate user by ID (Admin)
const deactivateUserById = async (userId) => {
  return await deactivateUserAccount(userId);
};

// Delete user by ID (Admin)
const deleteUserById = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  
  // Delete user's data
  await Promise.all([
    Vocabulary.deleteMany({ user_id: userId }),
    Document.deleteMany({ user_id: userId }),
    User.findByIdAndDelete(userId)
  ]);
  
  return true;
};

// Get user analytics (Admin)
const getUserAnalytics = async () => {
  const [
    totalUsers,
    usersByRole,
    recentUsers,
    userGrowth
  ] = await Promise.all([
    User.countDocuments(),
    User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]),
    User.find()
      .select('-password_hash')
      .sort({ created_at: -1 })
      .limit(10),
    User.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$created_at' },
            month: { $month: '$created_at' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ])
  ]);
  
  return {
    totalUsers,
    usersByRole: usersByRole.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    recentUsers,
    userGrowth
  };
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  getUserStats,
  deactivateUserAccount,
  deleteUserAccount,
  getAllUsers,
  getUserById,
  updateUserById,
  changeUserPassword,
  deactivateUserById,
  deleteUserById,
  getUserAnalytics
};
