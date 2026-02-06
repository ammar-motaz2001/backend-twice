const express = require('express');
const router = express.Router();
const asyncHandler = require('../middleware/asyncHandler');
const { protect, checkPermission } = require('../middleware/auth');
const Appointment = require('../models/Appointment');

// @route   GET /api/appointments
// @desc    Get all appointments
// @access  Private
router.get('/', protect, asyncHandler(async (req, res) => {
  const { date, status } = req.query;
  let query = {};
  
  if (date) query.date = date;
  if (status) query.status = status;
  
  const appointments = await Appointment.find(query).sort('date time');
  
  res.status(200).json({
    success: true,
    count: appointments.length,
    data: appointments,
  });
}));

// @route   GET /api/appointments/:id
// @desc    Get single appointment
// @access  Private
router.get('/:id', protect, asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);
  
  if (!appointment) {
    return res.status(404).json({
      success: false,
      error: 'الموعد غير موجود',
    });
  }
  
  res.status(200).json({
    success: true,
    data: appointment,
  });
}));

// @route   POST /api/appointments
// @desc    Create new appointment
// @access  Private
router.post('/', protect, checkPermission('appointments'), asyncHandler(async (req, res) => {
  const appointment = await Appointment.create(req.body);
  
  res.status(201).json({
    success: true,
    data: appointment,
  });
}));

// @route   PUT /api/appointments/:id
// @desc    Update appointment
// @access  Private
router.put('/:id', protect, checkPermission('appointments'), asyncHandler(async (req, res) => {
  let appointment = await Appointment.findById(req.params.id);
  
  if (!appointment) {
    return res.status(404).json({
      success: false,
      error: 'الموعد غير موجود',
    });
  }
  
  appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  
  res.status(200).json({
    success: true,
    data: appointment,
  });
}));

// @route   DELETE /api/appointments/:id
// @desc    Delete appointment
// @access  Private
router.delete('/:id', protect, checkPermission('appointments'), asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);
  
  if (!appointment) {
    return res.status(404).json({
      success: false,
      error: 'الموعد غير موجود',
    });
  }
  
  await appointment.deleteOne();
  
  res.status(200).json({
    success: true,
    data: {},
  });
}));

module.exports = router;
