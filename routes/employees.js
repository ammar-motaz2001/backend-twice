const express = require('express');
const router = express.Router();
const asyncHandler = require('../middleware/asyncHandler');
const { protect, checkPermission } = require('../middleware/auth');
const Employee = require('../models/Employee');

// @route   GET /api/employees
// @desc    Get all employees
// @access  Private
router.get('/', protect, checkPermission('employees'), asyncHandler(async (req, res) => {
  const { status } = req.query;
  let query = {};
  
  if (status) query.status = status;
  
  const employees = await Employee.find(query).sort('-createdAt');
  
  res.status(200).json({
    success: true,
    count: employees.length,
    data: employees,
  });
}));

// @route   GET /api/employees/:id
// @desc    Get single employee
// @access  Private
router.get('/:id', protect, checkPermission('employees'), asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.id);
  
  if (!employee) {
    return res.status(404).json({
      success: false,
      error: 'الموظف غير موجود',
    });
  }
  
  res.status(200).json({
    success: true,
    data: employee,
  });
}));

// @route   POST /api/employees
// @desc    Create new employee
// @access  Private
router.post('/', protect, checkPermission('employees'), asyncHandler(async (req, res) => {
  const employee = await Employee.create(req.body);
  
  res.status(201).json({
    success: true,
    data: employee,
  });
}));

// @route   PUT /api/employees/:id
// @desc    Update employee
// @access  Private
router.put('/:id', protect, checkPermission('employees'), asyncHandler(async (req, res) => {
  let employee = await Employee.findById(req.params.id);
  
  if (!employee) {
    return res.status(404).json({
      success: false,
      error: 'الموظف غير موجود',
    });
  }
  
  employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  
  res.status(200).json({
    success: true,
    data: employee,
  });
}));

// @route   DELETE /api/employees/:id
// @desc    Delete employee
// @access  Private
router.delete('/:id', protect, checkPermission('employees'), asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.id);
  
  if (!employee) {
    return res.status(404).json({
      success: false,
      error: 'الموظف غير موجود',
    });
  }
  
  await employee.deleteOne();
  
  res.status(200).json({
    success: true,
    data: {},
  });
}));

module.exports = router;
