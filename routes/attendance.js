const express = require('express');
const router = express.Router();
const asyncHandler = require('../middleware/asyncHandler');
const { protect, checkPermission } = require('../middleware/auth');
const Attendance = require('../models/Attendance');

// @route   GET /api/attendance
// @desc    Get all attendance records
// @access  Private
router.get('/', protect, checkPermission('attendance'), asyncHandler(async (req, res) => {
  const { date, employeeId, status } = req.query;
  let query = {};
  
  if (date) query.date = date;
  if (employeeId) query.employeeId = employeeId;
  if (status) query.status = status;
  
  const records = await Attendance.find(query).sort('-date');
  
  res.status(200).json({
    success: true,
    count: records.length,
    data: records,
  });
}));

// @route   POST /api/attendance
// @desc    Create attendance record
// @access  Private
router.post('/', protect, checkPermission('attendance'), asyncHandler(async (req, res) => {
  const record = await Attendance.create(req.body);
  
  res.status(201).json({
    success: true,
    data: record,
  });
}));

// @route   PUT /api/attendance/:id
// @desc    Update attendance record
// @access  Private
router.put('/:id', protect, checkPermission('attendance'), asyncHandler(async (req, res) => {
  let record = await Attendance.findById(req.params.id);
  
  if (!record) {
    return res.status(404).json({
      success: false,
      error: 'سجل الحضور غير موجود',
    });
  }
  
  record = await Attendance.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  
  res.status(200).json({
    success: true,
    data: record,
  });
}));

// @route   DELETE /api/attendance/:id
// @desc    Delete attendance record
// @access  Private
router.delete('/:id', protect, checkPermission('attendance'), asyncHandler(async (req, res) => {
  const record = await Attendance.findById(req.params.id);
  
  if (!record) {
    return res.status(404).json({
      success: false,
      error: 'سجل الحضور غير موجود',
    });
  }
  
  await record.deleteOne();
  
  res.status(200).json({
    success: true,
    data: {},
  });
}));

module.exports = router;
