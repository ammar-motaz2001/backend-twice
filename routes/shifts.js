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
// @desc    Create new shift
// @access  Private
router.post('/', protect, checkPermission('shifts'), asyncHandler(async (req, res) => {
  const shift = await Shift.create(req.body);
  
  res.status(201).json({
    success: true,
    data: shift,
  });
}));

// @route   PUT /api/shifts/:id
// @desc    Update shift
// @access  Private
router.put('/:id', protect, checkPermission('shifts'), asyncHandler(async (req, res) => {
  let shift = await Shift.findById(req.params.id);
  
  if (!shift) {
    return res.status(404).json({
      success: false,
      error: 'الوردية غير موجودة',
    });
  }
  
  shift = await Shift.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  
  res.status(200).json({
    success: true,
    data: shift,
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
