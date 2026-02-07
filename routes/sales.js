const express = require('express');
const router = express.Router();
const asyncHandler = require('../middleware/asyncHandler');
const { protect, checkPermission } = require('../middleware/auth');
const Sale = require('../models/Sale');
const Shift = require('../models/Shift');
const Customer = require('../models/Customer');

// Map sale paymentMethod to shift salesDetails key (case-insensitive)
const paymentToShiftKey = (method) => {
  const m = (method || '').toString().toLowerCase();
  if (m === 'نقدي' || m === 'cash') return 'cash';
  if (m === 'بطاقة' || m === 'card') return 'card';
  if (m === 'instapay') return 'instapay';
  return 'cash';
};

const addSaleToOpenShift = async (shiftId, amount, paymentMethod) => {
  const shift = await Shift.findById(shiftId).lean();
  if (!shift) return;
  const key = paymentToShiftKey(paymentMethod);
  const details = shift.salesDetails || { cash: 0, card: 0, instapay: 0, total: 0 };
  const newDetails = {
    cash: details.cash || 0,
    card: details.card || 0,
    instapay: details.instapay || 0,
  };
  newDetails[key] = (newDetails[key] || 0) + amount;
  newDetails.total = newDetails.cash + newDetails.card + newDetails.instapay;
  const newTotal = (shift.totalSales || 0) + amount;
  await Shift.updateOne(
    { _id: shiftId },
    { $set: { totalSales: newTotal, salesDetails: newDetails } },
  );
};

const subtractSaleFromOpenShift = async (shiftId, amount, paymentMethod) => {
  const shift = await Shift.findById(shiftId).lean();
  if (!shift) return;
  const key = paymentToShiftKey(paymentMethod);
  const details = shift.salesDetails || { cash: 0, card: 0, instapay: 0, total: 0 };
  const newDetails = {
    cash: Math.max(0, (details.cash || 0) - (key === 'cash' ? amount : 0)),
    card: Math.max(0, (details.card || 0) - (key === 'card' ? amount : 0)),
    instapay: Math.max(0, (details.instapay || 0) - (key === 'instapay' ? amount : 0)),
  };
  newDetails.total = newDetails.cash + newDetails.card + newDetails.instapay;
  const newTotal = Math.max(0, (shift.totalSales || 0) - amount);
  await Shift.updateOne(
    { _id: shiftId },
    { $set: { totalSales: newTotal, salesDetails: newDetails } },
  );
};

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
  const saleAmount = (req.body.amount || 0) - (req.body.discount || 0);
  const paymentMethod = req.body.paymentMethod || 'نقدي';

  // Add sale to current open shift (by cashier name or most recent open)
  const openShift = await Shift.findOne({ status: 'open' })
    .sort('-date');
  if (openShift && saleAmount > 0) {
    await addSaleToOpenShift(openShift._id, saleAmount, paymentMethod);
  }

  // Update customer stats if customer phone is provided
  if (req.body.customerPhone) {
    const customer = await Customer.findOne({ phone: req.body.customerPhone });
    if (customer) {
      customer.visits = (customer.visits || 0) + 1;
      customer.spending = (customer.spending || 0) + saleAmount;

      // Add to visit history
      if (!customer.visitHistory) customer.visitHistory = [];
      customer.visitHistory.push({
        date: new Date().toISOString().split('T')[0],
        services: req.body.service || 'خدمات متعددة',
        amount: saleAmount,
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
  const oldSale = await Sale.findById(req.params.id);

  if (!oldSale) {
    return res.status(404).json({
      success: false,
      error: 'الفاتورة غير موجودة',
    });
  }

  const openShift = await Shift.findOne({ status: 'open' }).sort('-date');
  const oldAmount = (oldSale.amount || 0) - (oldSale.discount || 0);
  const oldPayment = oldSale.paymentMethod || 'نقدي';

  const sale = await Sale.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  const newAmount = (sale.amount || 0) - (sale.discount || 0);
  const newPayment = sale.paymentMethod || 'نقدي';

  if (openShift && (oldAmount > 0 || newAmount > 0)) {
    if (oldAmount > 0) {
      await subtractSaleFromOpenShift(openShift._id, oldAmount, oldPayment);
    }
    if (newAmount > 0) {
      await addSaleToOpenShift(openShift._id, newAmount, newPayment);
    }
  }

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

  const saleAmount = (sale.amount || 0) - (sale.discount || 0);
  const paymentMethod = sale.paymentMethod || 'نقدي';

  await sale.deleteOne();

  // Subtract sale from current open shift
  if (saleAmount > 0) {
    const openShift = await Shift.findOne({ status: 'open' }).sort('-date');
    if (openShift) {
      await subtractSaleFromOpenShift(openShift._id, saleAmount, paymentMethod);
    }
  }

  res.status(200).json({
    success: true,
    data: {},
  });
}));

module.exports = router;
