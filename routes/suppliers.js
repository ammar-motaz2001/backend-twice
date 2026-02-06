const express = require('express');
const router = express.Router();
const asyncHandler = require('../middleware/asyncHandler');
const { protect, checkPermission } = require('../middleware/auth');
const Supplier = require('../models/Supplier');

// @route   GET /api/suppliers
// @desc    Get all suppliers
// @access  Private
router.get('/', protect, asyncHandler(async (req, res) => {
  const suppliers = await Supplier.find().sort('-createdAt');
  
  res.status(200).json({
    success: true,
    count: suppliers.length,
    data: suppliers,
  });
}));

// @route   GET /api/suppliers/:id
// @desc    Get single supplier
// @access  Private
router.get('/:id', protect, asyncHandler(async (req, res) => {
  const supplier = await Supplier.findById(req.params.id);
  
  if (!supplier) {
    return res.status(404).json({
      success: false,
      error: 'التاجر غير موجود',
    });
  }
  
  res.status(200).json({
    success: true,
    data: supplier,
  });
}));

// @route   POST /api/suppliers
// @desc    Create new supplier
// @access  Private
router.post('/', protect, asyncHandler(async (req, res) => {
  const supplier = await Supplier.create(req.body);
  
  res.status(201).json({
    success: true,
    data: supplier,
  });
}));

// @route   PUT /api/suppliers/:id
// @desc    Update supplier
// @access  Private
router.put('/:id', protect, asyncHandler(async (req, res) => {
  let supplier = await Supplier.findById(req.params.id);
  
  if (!supplier) {
    return res.status(404).json({
      success: false,
      error: 'التاجر غير موجود',
    });
  }
  
  supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  
  res.status(200).json({
    success: true,
    data: supplier,
  });
}));

// @route   DELETE /api/suppliers/:id
// @desc    Delete supplier
// @access  Private
router.delete('/:id', protect, checkPermission('suppliers'), asyncHandler(async (req, res) => {
  const supplier = await Supplier.findById(req.params.id);
  
  if (!supplier) {
    return res.status(404).json({
      success: false,
      error: 'التاجر غير موجود',
    });
  }
  
  await supplier.deleteOne();
  
  res.status(200).json({
    success: true,
    data: {},
  });
}));

// @route   PUT /api/suppliers/:id/balance
// @desc    Update supplier balance
// @access  Private
router.put('/:id/balance', protect, asyncHandler(async (req, res) => {
  const { amount, type } = req.body; // type: 'add' or 'subtract'
  
  let supplier = await Supplier.findById(req.params.id);
  
  if (!supplier) {
    return res.status(404).json({
      success: false,
      error: 'التاجر غير موجود',
    });
  }
  
  if (type === 'add') {
    supplier.balance += amount;
  } else if (type === 'subtract') {
    supplier.balance -= amount;
  }
  
  await supplier.save();
  
  res.status(200).json({
    success: true,
    data: supplier,
  });
}));

module.exports = router;
