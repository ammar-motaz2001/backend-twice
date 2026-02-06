const express = require('express');
const router = express.Router();
const asyncHandler = require('../middleware/asyncHandler');
const { protect, checkPermission } = require('../middleware/auth');
const Inventory = require('../models/Inventory');

// @route   GET /api/inventory
// @desc    Get all inventory items
// @access  Private
router.get('/', protect, checkPermission('inventory'), asyncHandler(async (req, res) => {
  const { category, lowStock } = req.query;
  let query = {};
  
  if (category) query.category = category;
  
  const items = await Inventory.find(query).sort('-createdAt');
  
  // Filter low stock items if requested
  let filteredItems = items;
  if (lowStock === 'true') {
    filteredItems = items.filter(item => item.stock <= item.minStock);
  }
  
  res.status(200).json({
    success: true,
    count: filteredItems.length,
    data: filteredItems,
  });
}));

// @route   GET /api/inventory/:id
// @desc    Get single inventory item
// @access  Private
router.get('/:id', protect, checkPermission('inventory'), asyncHandler(async (req, res) => {
  const item = await Inventory.findById(req.params.id);
  
  if (!item) {
    return res.status(404).json({
      success: false,
      error: 'المنتج غير موجود',
    });
  }
  
  res.status(200).json({
    success: true,
    data: item,
  });
}));

// @route   POST /api/inventory
// @desc    Create new inventory item
// @access  Private
router.post('/', protect, checkPermission('inventory'), asyncHandler(async (req, res) => {
  const item = await Inventory.create(req.body);
  
  res.status(201).json({
    success: true,
    data: item,
  });
}));

// @route   PUT /api/inventory/:id
// @desc    Update inventory item
// @access  Private
router.put('/:id', protect, checkPermission('inventory'), asyncHandler(async (req, res) => {
  let item = await Inventory.findById(req.params.id);
  
  if (!item) {
    return res.status(404).json({
      success: false,
      error: 'المنتج غير موجود',
    });
  }
  
  item = await Inventory.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  
  res.status(200).json({
    success: true,
    data: item,
  });
}));

// @route   DELETE /api/inventory/:id
// @desc    Delete inventory item
// @access  Private
router.delete('/:id', protect, checkPermission('inventory'), asyncHandler(async (req, res) => {
  const item = await Inventory.findById(req.params.id);
  
  if (!item) {
    return res.status(404).json({
      success: false,
      error: 'المنتج غير موجود',
    });
  }
  
  await item.deleteOne();
  
  res.status(200).json({
    success: true,
    data: {},
  });
}));

module.exports = router;
