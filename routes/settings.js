const express = require('express');
const router = express.Router();
const asyncHandler = require('../middleware/asyncHandler');
const { protect, checkPermission } = require('../middleware/auth');
const Settings = require('../models/Settings');

// @route   GET /api/settings
// @desc    Get system settings
// @access  Private
router.get('/', protect, asyncHandler(async (req, res) => {
  let settings = await Settings.findOne();
  
  // Create default settings if none exist
  if (!settings) {
    settings = await Settings.create({
      shopName: 'صالون التجميل',
      currency: 'EGP',
      language: 'ar',
    });
  }
  
  res.status(200).json({
    success: true,
    data: settings,
  });
}));

// @route   PUT /api/settings
// @desc    Update system settings
// @access  Private
router.put('/', protect, checkPermission('settings'), asyncHandler(async (req, res) => {
  let settings = await Settings.findOne();
  
  if (!settings) {
    settings = await Settings.create(req.body);
  } else {
    settings = await Settings.findByIdAndUpdate(settings._id, req.body, {
      new: true,
      runValidators: true,
    });
  }
  
  res.status(200).json({
    success: true,
    data: settings,
  });
}));

module.exports = router;
