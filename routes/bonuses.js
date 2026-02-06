const express = require('express');
const router = express.Router();
const asyncHandler = require('../middleware/asyncHandler');
const { protect, checkPermission } = require('../middleware/auth');
const Bonus = require('../models/Bonus');

// @route   GET /api/bonuses
// @desc    Get all bonuses
// @access  Private
router.get('/', protect, checkPermission('payroll'), asyncHandler(async (req, res) => {
  const { employeeId, month, year } = req.query;
  let query = {};
  
  if (employeeId) query.employeeId = employeeId;
  if (month) query.month = parseInt(month);
  if (year) query.year = parseInt(year);
  
  const bonuses = await Bonus.find(query).sort('-date');
  
  res.status(200).json({
    success: true,
    count: bonuses.length,
    data: bonuses,
  });
}));

// @route   POST /api/bonuses
// @desc    Create new bonus
// @access  Private
router.post('/', protect, checkPermission('payroll'), asyncHandler(async (req, res) => {
  const bonus = await Bonus.create({
    ...req.body,
    addedBy: req.user.name,
  });
  
  res.status(201).json({
    success: true,
    data: bonus,
  });
}));

// @route   PUT /api/bonuses/:id
// @desc    Update bonus
// @access  Private
router.put('/:id', protect, checkPermission('payroll'), asyncHandler(async (req, res) => {
  let bonus = await Bonus.findById(req.params.id);
  
  if (!bonus) {
    return res.status(404).json({
      success: false,
      error: 'المكافأة غير موجودة',
    });
  }
  
  bonus = await Bonus.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  
  res.status(200).json({
    success: true,
    data: bonus,
  });
}));

// @route   DELETE /api/bonuses/:id
// @desc    Delete bonus
// @access  Private
router.delete('/:id', protect, checkPermission('payroll'), asyncHandler(async (req, res) => {
  const bonus = await Bonus.findById(req.params.id);
  
  if (!bonus) {
    return res.status(404).json({
      success: false,
      error: 'المكافأة غير موجودة',
    });
  }
  
  await bonus.deleteOne();
  
  res.status(200).json({
    success: true,
    data: {},
  });
}));

module.exports = router;
