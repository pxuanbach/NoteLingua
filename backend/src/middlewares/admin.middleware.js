/**
 * Admin role middleware
 * Checks if the authenticated user has admin role
 */

const requireAdmin = (req, res, next) => {
  try {
    // Check if user is authenticated (should be called after authenticateToken)
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication Required',
        message: 'Please login to access this resource'
      });
    }

    // Check if user has admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Access Denied',
        message: 'Admin access required'
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      error: 'Server Error',
      message: 'Error checking admin permissions'
    });
  }
};

module.exports = { requireAdmin };
