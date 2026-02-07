const express = require('express');
const router = express.Router();
const asyncHandler = require('../middleware/asyncHandler');
const { protect, checkPermission } = require('../middleware/auth');
const Shift = require('../models/Shift');

// @route   GET /api/shifts
// @desc    Get all shifts
// @access  Private
router.get('/', protect, checkPermission('shifts'), asyncHandler(async (req, res) => {
  const { status } = req.query;
  let query = {};
  
  if (status) query.status = status;
  
  const shifts = await Shift.find(query).sort('-date');
  
  res.status(200).json({
    success: true,
    count: shifts.length,
    data: shifts,
  });
}));

// @route   POST /api/shifts
// @desc    Create new shift (always starts with zero sales)
// @access  Private
router.post('/', protect, checkPermission('shifts'), asyncHandler(async (req, res) => {
  const body = { ...req.body };
  body.totalSales = 0;
  body.salesDetails = {
    cash: 0,
    card: 0,
    instapay: 0,
    total: 0,
  };
  const shift = await Shift.create(body);

  res.status(201).json({
    success: true,
    data: shift,
  });
}));

// @route   PUT /api/shifts/:id
// @desc    Update shift (closing keeps totalSales/salesDetails; client cannot overwrite them)
// @access  Private
router.put('/:id', protect, checkPermission('shifts'), asyncHandler(async (req, res) => {
  const shift = await Shift.findById(req.params.id);

  if (!shift) {
    return res.status(404).json({
      success: false,
      error: 'الوردية غير موجودة',
    });
  }

  const body = { ...req.body };
  delete body.totalSales;
  delete body.salesDetails;

  const updated = await Shift.findByIdAndUpdate(req.params.id, body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: updated,
  });
}));

// @route   DELETE /api/shifts/:id
// @desc    Delete shift
// @access  Private
router.delete('/:id', protect, checkPermission('shifts'), asyncHandler(async (req, res) => {
  const shift = await Shift.findById(req.params.id);
  
  if (!shift) {
    return res.status(404).json({
      success: false,
      error: 'الوردية غير موجودة',
    });
  }
  
  await shift.deleteOne();
  
  res.status(200).json({
    success: true,
    data: {},
  });
}));

module.exports = router;
