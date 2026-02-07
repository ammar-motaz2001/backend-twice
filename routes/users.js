const express = require('express');
const router = express.Router();
const asyncHandler = require('../middleware/asyncHandler');
const { protect, adminOnly } = require('../middleware/auth');
const User = require('../models/User');

const userResponse = (user) => ({
  id: user._id,
  username: user.username,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  image: user.image,
  permissions: user.permissions,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

// @route   GET /api/users
// @desc    Get all users
// @access  Private (Admin only)
router.get('/', protect, adminOnly, asyncHandler(async (req, res) => {
  const users = await User.find().select('-password').sort('-createdAt');

  res.status(200).json({
    success: true,
    count: users.length,
    data: users.map(userResponse),
  });
}));

// @route   GET /api/users/:id
// @desc    Get single user
// @access  Private (Admin only)
router.get('/:id', protect, adminOnly, asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'المستخدم غير موجود',
    });
  }

  res.status(200).json({
    success: true,
    data: userResponse(user),
  });
}));

// @route   POST /api/users
// @desc    Add (create) user
// @access  Private (Admin only)
router.post('/', protect, adminOnly, asyncHandler(async (req, res) => {
  const { username, password, name, email, phone, role, permissions } = req.body;

  const exists = await User.findOne({ $or: [{ username }, { email }] });
  if (exists) {
    return res.status(400).json({
      success: false,
      error: 'اسم المستخدم أو البريد الإلكتروني موجود بالفعل',
    });
  }

  const user = await User.create({
    username,
    password: password || '123456',
    name,
    email,
    phone,
    role: role || 'cashier',
    permissions,
  });

  res.status(201).json({
    success: true,
    data: userResponse(user),
  });
}));

// @route   PUT /api/users/:id/change-password
// @desc    Change user password (admin: any user; user: own with currentPassword)
// @access  Private
router.put('/:id/change-password', protect, asyncHandler(async (req, res) => {
  const { newPassword, currentPassword } = req.body;
  const targetId = req.params.id;
  const isAdmin = req.user.role === 'admin';
  const isOwn = req.user._id.toString() === targetId;

  if (!newPassword || newPassword.trim().length < 5) {
    return res.status(400).json({
      success: false,
      error: 'كلمة المرور الجديدة مطلوبة (5 أحرف على الأقل)',
    });
  }

  const user = await User.findById(targetId).select('+password');
  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'المستخدم غير موجود',
    });
  }

  if (isOwn && !isAdmin) {
    if (!currentPassword) {
      return res.status(400).json({
        success: false,
        error: 'كلمة المرور الحالية مطلوبة لتغيير كلمة المرور',
      });
    }
    const isCorrect = await user.comparePassword(currentPassword);
    if (!isCorrect) {
      return res.status(401).json({
        success: false,
        error: 'كلمة المرور الحالية غير صحيحة',
      });
    }
  } else if (!isAdmin) {
    return res.status(403).json({
      success: false,
      error: 'غير مصرح لك بتغيير كلمة مرور مستخدم آخر',
    });
  }

  user.password = newPassword.trim();
  await user.save();

  res.status(200).json({
    success: true,
    message: 'تم تحديث كلمة المرور بنجاح',
  });
}));

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private (Admin only)
router.put('/:id', protect, adminOnly, asyncHandler(async (req, res) => {
  let user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'المستخدم غير موجود',
    });
  }

  const { username, password, name, email, phone, role, image, permissions } = req.body;

  if (username && username !== user.username) {
    const exists = await User.findOne({ username });
    if (exists) {
      return res.status(400).json({
        success: false,
        error: 'اسم المستخدم موجود بالفعل',
      });
    }
  }
  if (email && email !== user.email) {
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({
        success: false,
        error: 'البريد الإلكتروني موجود بالفعل',
      });
    }
  }

  user.username = username ?? user.username;
  user.name = name ?? user.name;
  user.email = email ?? user.email;
  user.phone = phone ?? user.phone;
  user.role = role ?? user.role;
  if (image !== undefined) user.image = image;
  if (permissions !== undefined) user.permissions = permissions;
  if (password && password.trim().length >= 5) user.password = password;

  await user.save();

  const updated = await User.findById(user._id).select('-password');

  res.status(200).json({
    success: true,
    data: userResponse(updated),
  });
}));

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Private (Admin only)
router.delete('/:id', protect, adminOnly, asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'المستخدم غير موجود',
    });
  }

  if (user._id.toString() === req.user._id.toString()) {
    return res.status(400).json({
      success: false,
      error: 'لا يمكنك حذف حسابك الخاص',
    });
  }

  await user.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
    message: 'تم حذف المستخدم بنجاح',
  });
}));

module.exports = router;
