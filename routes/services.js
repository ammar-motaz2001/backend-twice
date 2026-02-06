const express = require('express');
const router = express.Router();
const asyncHandler = require('../middleware/asyncHandler');
const { protect, checkPermission } = require('../middleware/auth');
const Service = require('../models/Service');

// @route   GET /api/services
// @desc    Get all services
// @access  Private
router.get('/', protect, asyncHandler(async (req, res) => {
  const services = await Service.find().sort('-createdAt');
  
  res.status(200).json({
    success: true,
    count: services.length,
    data: services,
  });
}));

// @route   GET /api/services/:id
// @desc    Get single service
// @access  Private
router.get('/:id', protect, asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);
  
  if (!service) {
    return res.status(404).json({
      success: false,
      error: 'الخدمة غير موجودة',
    });
  }
  
  res.status(200).json({
    success: true,
    data: service,
  });
}));

// @route   POST /api/services
// @desc    Create new service
// @access  Private (services permission required)
router.post('/', protect, checkPermission('services'), asyncHandler(async (req, res) => {
  const service = await Service.create(req.body);
  
  res.status(201).json({
    success: true,
    data: service,
  });
}));

// @route   PUT /api/services/:id
// @desc    Update service
// @access  Private (services permission required)
router.put('/:id', protect, checkPermission('services'), asyncHandler(async (req, res) => {
  let service = await Service.findById(req.params.id);
  
  if (!service) {
    return res.status(404).json({
      success: false,
      error: 'الخدمة غير موجودة',
    });
  }
  
  service = await Service.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  
  res.status(200).json({
    success: true,
    data: service,
  });
}));

// @route   DELETE /api/services/:id
// @desc    Delete service
// @access  Private (services permission required)
router.delete('/:id', protect, checkPermission('services'), asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);
  
  if (!service) {
    return res.status(404).json({
      success: false,
      error: 'الخدمة غير موجودة',
    });
  }
  
  await service.deleteOne();
  
  res.status(200).json({
    success: true,
    data: {},
  });
}));

module.exports = router;
