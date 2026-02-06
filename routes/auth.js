const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const asyncHandler = require('../middleware/asyncHandler');
const { protect } = require('../middleware/auth');
const User = require('../models/User');

const JWT_SECRET = 'beauty-salon-jwt-secret-key';
const JWT_EXPIRE = '7d';

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: JWT_EXPIRE,
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public (Admin only in production)
router.post('/register', asyncHandler(async (req, res) => {
  const { username, password, name, email, phone, role } = req.body;

  // Check if user already exists
  const userExists = await User.findOne({ $or: [{ username }, { email }] });
  if (userExists) {
    return res.status(400).json({
      success: false,
      error: 'اسم المستخدم أو البريد الإلكتروني موجود بالفعل',
    });
  }

  // Create user
  const user = await User.create({
    username,
    password,
    name,
    email,
    phone,
    role: role || 'cashier',
  });

  // Generate token
  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    token,
    user: {
      id: user._id,
      username: user.username,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      permissions: user.permissions,
    },
  });
}));

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  // Validate input
  if (!username || !password) {
    return res.status(400).json({
      success: false,
      error: 'يرجى إدخال اسم المستخدم وكلمة المرور',
    });
  }

  // Check if user exists
  const user = await User.findOne({ username }).select('+password');
  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'اسم المستخدم أو كلمة المرور غير صحيحة',
    });
  }

  // Check password
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    return res.status(401).json({
      success: false,
      error: 'اسم المستخدم أو كلمة المرور غير صحيحة',
    });
  }

  // Generate token
  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    token,
    user: {
      id: user._id,
      username: user.username,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      image: user.image,
      permissions: user.permissions,
    },
  });
}));

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  res.status(200).json({
    success: true,
    data: {
      id: user._id,
      username: user.username,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      image: user.image,
      permissions: user.permissions,
    },
  });
}));

// @route   PUT /api/auth/update-password
// @desc    Update password
// @access  Private
router.put('/update-password', protect, asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');

  // Check current password
  const isPasswordCorrect = await user.comparePassword(currentPassword);
  if (!isPasswordCorrect) {
    return res.status(401).json({
      success: false,
      error: 'كلمة المرور الحالية غير صحيحة',
    });
  }

  // Update password
  user.password = newPassword;
  await user.save();

  // Generate new token
  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    token,
    message: 'تم تحديث كلمة المرور بنجاح',
  });
}));

module.exports = router;
