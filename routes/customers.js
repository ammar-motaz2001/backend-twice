const express = require('express');
const router = express.Router();
const asyncHandler = require('../middleware/asyncHandler');
const { protect, checkPermission } = require('../middleware/auth');
const Customer = require('../models/Customer');

// @route   GET /api/customers
// @desc    Get all customers
// @access  Private
router.get('/', protect, asyncHandler(async (req, res) => {
  const customers = await Customer.find().sort('-createdAt');
  
  res.status(200).json({
    success: true,
    count: customers.length,
    data: customers,
  });
}));

// @route   GET /api/customers/:id
// @desc    Get single customer
// @access  Private
router.get('/:id', protect, asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  
  if (!customer) {
    return res.status(404).json({
      success: false,
      error: 'العميل غير موجود',
    });
  }
  
  res.status(200).json({
    success: true,
    data: customer,
  });
}));

// @route   GET /api/customers/phone/:phone
// @desc    Get customer by phone
// @access  Private
router.get('/phone/:phone', protect, asyncHandler(async (req, res) => {
  const customer = await Customer.findOne({ phone: req.params.phone });
  
  if (!customer) {
    return res.status(404).json({
      success: false,
      error: 'العميل غير موجود',
    });
  }
  
  res.status(200).json({
    success: true,
    data: customer,
  });
}));

// @route   POST /api/customers
// @desc    Create new customer
// @access  Private
router.post('/', protect, asyncHandler(async (req, res) => {
  // Check if customer with phone already exists
  const existingCustomer = await Customer.findOne({ phone: req.body.phone });
  
  if (existingCustomer) {
    return res.status(400).json({
      success: false,
      error: 'رقم الهاتف مسجل بالفعل',
    });
  }
  
  const customer = await Customer.create(req.body);
  
  res.status(201).json({
    success: true,
    data: customer,
  });
}));

// @route   PUT /api/customers/:id
// @desc    Update customer
// @access  Private
router.put('/:id', protect, asyncHandler(async (req, res) => {
  let customer = await Customer.findById(req.params.id);
  
  if (!customer) {
    return res.status(404).json({
      success: false,
      error: 'العميل غير موجود',
    });
  }
  
  customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  
  res.status(200).json({
    success: true,
    data: customer,
  });
}));

// @route   DELETE /api/customers/:id
// @desc    Delete customer
// @access  Private
router.delete('/:id', protect, checkPermission('customers'), asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  
  if (!customer) {
    return res.status(404).json({
      success: false,
      error: 'العميل غير موجود',
    });
  }
  
  await customer.deleteOne();
  
  res.status(200).json({
    success: true,
    data: {},
  });
}));

module.exports = router;
