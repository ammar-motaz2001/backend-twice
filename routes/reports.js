const express = require('express');
const router = express.Router();
const asyncHandler = require('../middleware/asyncHandler');
const { protect, checkPermission } = require('../middleware/auth');
const Sale = require('../models/Sale');
const Customer = require('../models/Customer');
const Appointment = require('../models/Appointment');
const Expense = require('../models/Expense');
const Inventory = require('../models/Inventory');

// @route   GET /api/reports/dashboard
// @desc    Get dashboard statistics
// @access  Private
router.get('/dashboard', protect, asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);
  
  // Today's sales
  const todaySales = await Sale.find({
    date: { $gte: today, $lt: tomorrow },
    status: 'مكتمل',
  });
  const todayRevenue = todaySales.reduce((sum, sale) => sum + (sale.amount - (sale.discount || 0)), 0);
  
  // This month's sales
  const monthSales = await Sale.find({
    date: { $gte: startOfMonth, $lte: endOfMonth },
    status: 'مكتمل',
  });
  const monthRevenue = monthSales.reduce((sum, sale) => sum + (sale.amount - (sale.discount || 0)), 0);
  
  // This month's expenses
  const monthExpenses = await Expense.find({
    date: { $gte: startOfMonth, $lte: endOfMonth },
  });
  const totalExpenses = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  // Customers count
  const totalCustomers = await Customer.countDocuments();
  
  // Today's appointments
  const todayDateStr = today.toISOString().split('T')[0];
  const todayAppointments = await Appointment.countDocuments({ date: todayDateStr });
  const pendingAppointments = await Appointment.countDocuments({ status: 'مؤكد' });
  
  // Low stock items
  const inventory = await Inventory.find();
  const lowStockItems = inventory.filter(item => item.stock <= item.minStock).length;
  
  res.status(200).json({
    success: true,
    data: {
      todayRevenue,
      monthRevenue,
      totalExpenses,
      netProfit: monthRevenue - totalExpenses,
      todaySales: todaySales.length,
      totalCustomers,
      todayAppointments,
      pendingAppointments,
      lowStockItems,
      totalSales: monthSales.length,
    },
  });
}));

// @route   GET /api/reports/sales
// @desc    Get sales report
// @access  Private
router.get('/sales', protect, checkPermission('reports'), asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  
  let query = {};
  if (startDate && endDate) {
    query.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }
  
  const sales = await Sale.find(query);
  
  const totalRevenue = sales.reduce((sum, sale) => sum + (sale.amount - (sale.discount || 0)), 0);
  const totalDiscount = sales.reduce((sum, sale) => sum + (sale.discount || 0), 0);
  
  // Group by payment method
  const byPaymentMethod = {};
  sales.forEach(sale => {
    const method = sale.paymentMethod || 'نقدي';
    if (!byPaymentMethod[method]) {
      byPaymentMethod[method] = { count: 0, amount: 0 };
    }
    byPaymentMethod[method].count++;
    byPaymentMethod[method].amount += sale.amount - (sale.discount || 0);
  });
  
  res.status(200).json({
    success: true,
    data: {
      sales,
      totalRevenue,
      totalDiscount,
      totalSales: sales.length,
      byPaymentMethod,
    },
  });
}));

// @route   GET /api/reports/customers
// @desc    Get customers report
// @access  Private
router.get('/customers', protect, checkPermission('reports'), asyncHandler(async (req, res) => {
  const customers = await Customer.find();
  
  const totalSpending = customers.reduce((sum, c) => sum + (c.spending || 0), 0);
  const totalVisits = customers.reduce((sum, c) => sum + (c.visits || 0), 0);
  const vipCustomers = customers.filter(c => c.vip).length;
  
  const topCustomers = customers
    .sort((a, b) => (b.spending || 0) - (a.spending || 0))
    .slice(0, 10);
  
  res.status(200).json({
    success: true,
    data: {
      totalCustomers: customers.length,
      vipCustomers,
      totalSpending,
      totalVisits,
      averageSpending: customers.length > 0 ? totalSpending / customers.length : 0,
      topCustomers,
    },
  });
}));

module.exports = router;
