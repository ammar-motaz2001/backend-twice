const express = require('express');
const router = express.Router();
const asyncHandler = require('../middleware/asyncHandler');
const { protect, checkPermission } = require('../middleware/auth');
const Expense = require('../models/Expense');

// @route   GET /api/expenses
// @desc    Get all expenses
// @access  Private
router.get('/', protect, checkPermission('expenses'), asyncHandler(async (req, res) => {
  const { startDate, endDate, category } = req.query;
  let query = {};
  
  if (category) query.category = category;
  if (startDate && endDate) {
    query.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }
  
  const expenses = await Expense.find(query).sort('-date');
  
  res.status(200).json({
    success: true,
    count: expenses.length,
    data: expenses,
  });
}));

// @route   POST /api/expenses
// @desc    Create new expense
// @access  Private
router.post('/', protect, checkPermission('expenses'), asyncHandler(async (req, res) => {
  const expense = await Expense.create(req.body);
  
  res.status(201).json({
    success: true,
    data: expense,
  });
}));

// @route   PUT /api/expenses/:id
// @desc    Update expense
// @access  Private
router.put('/:id', protect, checkPermission('expenses'), asyncHandler(async (req, res) => {
  let expense = await Expense.findById(req.params.id);
  
  if (!expense) {
    return res.status(404).json({
      success: false,
      error: 'المصروف غير موجود',
    });
  }
  
  expense = await Expense.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  
  res.status(200).json({
    success: true,
    data: expense,
  });
}));

// @route   DELETE /api/expenses/:id
// @desc    Delete expense
// @access  Private
router.delete('/:id', protect, checkPermission('expenses'), asyncHandler(async (req, res) => {
  const expense = await Expense.findById(req.params.id);
  
  if (!expense) {
    return res.status(404).json({
      success: false,
      error: 'المصروف غير موجود',
    });
  }
  
  await expense.deleteOne();
  
  res.status(200).json({
    success: true,
    data: {},
  });
}));

module.exports = router;
