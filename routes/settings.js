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
      startTime: '',
      endTime: '',
      workingHours: { start: '', end: '' },
      invoiceSettings: {
        showLogo: true,
        showAddress: true,
        showPhone: true,
        showEmail: true,
        autoNumber: true,
        footerText: '',
      },
    });
  }

  res.status(200).json({
    success: true,
    data: settings,
  });
}));

// @route   GET /api/settings/display
// @desc    Get display settings (startTime, endTime, invoice footer) for dynamic use
// @access  Private
router.get('/display', protect, asyncHandler(async (req, res) => {
  const settings = await Settings.findOne().select(
    'startTime endTime workingHours invoiceSettings.footerText shopName address phone'
  );
  const data = settings
    ? {
        startTime: settings.startTime ?? settings.workingHours?.start ?? '',
        endTime: settings.endTime ?? settings.workingHours?.end ?? '',
        footerText: settings.invoiceSettings?.footerText ?? '',
        shopName: settings.shopName,
        address: settings.address,
        phone: settings.phone,
      }
    : {
        startTime: '',
        endTime: '',
        footerText: '',
        shopName: '',
        address: '',
        phone: '',
      };
  res.status(200).json({ success: true, data });
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
