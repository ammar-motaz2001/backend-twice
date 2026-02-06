const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = 'beauty-salon-jwt-secret-key';

// Protect routes - Verify JWT token
exports.protect = async (req, res, next) => {
  let token;

  // Check if token exists in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'غير مصرح لك بالوصول لهذا المورد',
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Get user from token
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'المستخدم غير موجود',
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'رمز التوثيق غير صالح',
    });
  }
};

// Check specific permission
exports.checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'غير مصرح لك بالوصول',
      });
    }

    // Admin has all permissions
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if user has the specific permission
    if (req.user.permissions && req.user.permissions[permission]) {
      return next();
    }

    return res.status(403).json({
      success: false,
      error: 'ليس لديك صلاحية للقيام بهذا الإجراء',
    });
  };
};

// Admin only middleware
exports.adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      error: 'هذا الإجراء متاح للمدير فقط',
    });
  }
};
