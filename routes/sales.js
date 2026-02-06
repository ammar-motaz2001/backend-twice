const express = require('express');
const router = express.Router();
const asyncHandler = require('../middleware/asyncHandler');
const { protect, checkPermission } = require('../middleware/auth');
const Sale = require('../models/Sale');
const Customer = require('../models/Customer');

// @route   GET /api/sales
// @desc    Get all sales
// @access  Private
router.get('/', protect, asyncHandler(async (req, res) => {
  const { startDate, endDate, status, paymentMethod } = req.query;
  let query = {};
  
  if (status) query.status = status;
  if (paymentMethod) query.paymentMethod = paymentMethod;
  if (startDate && endDate) {
    query.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }
  
  const sales = await Sale.find(query).sort('-date');
  
  res.status(200).json({
    success: true,
    count: sales.length,
    data: sales,
  });
}));

// @route   GET /api/sales/:id
// @desc    Get single sale
// @access  Private
router.get('/:id', protect, asyncHandler(async (req, res) => {
  const sale = await Sale.findById(req.params.id);
  
  if (!sale) {
    return res.status(404).json({
      success: false,
      error: 'الفاتورة غير موجودة',
    });
  }
  
  res.status(200).json({
    success: true,
    data: sale,
  });
}));

// @route   POST /api/sales
// @desc    Create new sale
// @access  Private
router.post('/', protect, checkPermission('sales'), asyncHandler(async (req, res) => {
  const sale = await Sale.create(req.body);
  
  // Update customer stats if customer phone is provided
  if (req.body.customerPhone) {
    const customer = await Customer.findOne({ phone: req.body.customerPhone });
    if (customer) {
      customer.visits = (customer.visits || 0) + 1;
      customer.spending = (customer.spending || 0) + (req.body.amount - (req.body.discount || 0));
      
      // Add to visit history
      if (!customer.visitHistory) customer.visitHistory = [];
      customer.visitHistory.push({
        date: new Date().toISOString().split('T')[0],
        services: req.body.service || 'خدمات متعددة',
        amount: req.body.amount - (req.body.discount || 0),
      });
      
      await customer.save();
    }
  }
  
  res.status(201).json({
    success: true,
    data: sale,
  });
}));

// @route   PUT /api/sales/:id
// @desc    Update sale
// @access  Private
router.put('/:id', protect, checkPermission('sales'), asyncHandler(async (req, res) => {
  let sale = await Sale.findById(req.params.id);
  
  if (!sale) {
    return res.status(404).json({
      success: false,
      error: 'الفاتورة غير موجودة',
    });
  }
  
  sale = await Sale.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  
  res.status(200).json({
    success: true,
    data: sale,
  });
}));

// @route   DELETE /api/sales/:id
// @desc    Delete sale
// @access  Private
router.delete('/:id', protect, checkPermission('sales'), asyncHandler(async (req, res) => {
  const sale = await Sale.findById(req.params.id);
  
  if (!sale) {
    return res.status(404).json({
      success: false,
      error: 'الفاتورة غير موجودة',
    });
  }
  
  await sale.deleteOne();
  
  res.status(200).json({
    success: true,
    data: {},
  });
}));

module.exports = router;
