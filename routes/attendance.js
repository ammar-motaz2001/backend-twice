const express = require('express');
const router = express.Router();
const asyncHandler = require('../middleware/asyncHandler');
const { protect, checkPermission } = require('../middleware/auth');
const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');

const normalizeStatus = (s) => {
  const v = (s || '').toString().trim().toLowerCase();
  if (v === 'present' || v === 'حاضر') return 'حاضر';
  if (v === 'absent' || v === 'غائب') return 'غائب';
  if (v === 'delay' || v === 'تأخير') return 'تأخير';
  if (v === 'leave' || v === 'إجازة') return 'إجازة';
  return 'حاضر';
};

const isCheckInStatus = (status) =>
  status === 'حاضر' || status === 'تأخير';

// @route   GET /api/attendance
// @desc    Get all attendance records (query optional: date, employeeId, status; omit for all)
// @access  Private
router.get('/', protect, checkPermission('attendance'), asyncHandler(async (req, res) => {
  const { date, employeeId, status } = req.query;
  const query = {};
  if (date) query.date = date;
  if (employeeId) query.employeeId = employeeId;
  if (status) query.status = normalizeStatus(status);

  const records = await Attendance.find(query).sort('-date');

  res.status(200).json({
    success: true,
    count: records.length,
    data: records,
  });
}));

// @route   POST /api/attendance
// @desc    Create attendance record (body optional; required: employeeId, date; rest depend on status)
// @access  Private
router.post('/', protect, checkPermission('attendance'), asyncHandler(async (req, res) => {
  const body = { ...req.body };
  if (!body.employeeId || !body.date) {
    return res.status(400).json({
      success: false,
      error: 'employeeId and date are required',
    });
  }

  body.status = normalizeStatus(body.status);
  if (isCheckInStatus(body.status) && !body.checkIn) {
    body.checkIn = new Date().toTimeString().slice(0, 5);
  }
  if (!body.employeeName) {
    const emp = await Employee.findById(body.employeeId).select('name position').lean();
    if (emp) {
      body.employeeName = emp.name || '';
      if (!body.position) body.position = emp.position || '';
    }
  }
  body.employeeName = body.employeeName ?? '';
  body.checkIn = body.checkIn ?? '';
  body.checkOut = body.checkOut ?? '';

  const record = await Attendance.create(body);

  res.status(201).json({
    success: true,
    data: record,
  });
}));

// @route   PUT /api/attendance/:id
// @desc    Update attendance record (body optional; only provided fields are updated)
// @access  Private
router.put('/:id', protect, checkPermission('attendance'), asyncHandler(async (req, res) => {
  const record = await Attendance.findById(req.params.id);

  if (!record) {
    return res.status(404).json({
      success: false,
      error: 'سجل الحضور غير موجود',
    });
  }

  const body = { ...req.body };
  if (body.status !== undefined) body.status = normalizeStatus(body.status);
  Object.keys(body).forEach((k) => {
    if (body[k] === undefined) delete body[k];
  });

  const updated = await Attendance.findByIdAndUpdate(req.params.id, body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: updated,
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
