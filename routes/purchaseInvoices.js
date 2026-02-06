const express = require('express');
const router = express.Router();
const asyncHandler = require('../middleware/asyncHandler');
const { protect, checkPermission } = require('../middleware/auth');
const PurchaseInvoice = require('../models/PurchaseInvoice');
const Supplier = require('../models/Supplier');

// @route   GET /api/purchase-invoices
// @desc    Get all purchase invoices
// @access  Private
router.get('/', protect, asyncHandler(async (req, res) => {
  const invoices = await PurchaseInvoice.find()
    .populate('supplier', 'name phone')
    .sort('-createdAt');
  
  res.status(200).json({
    success: true,
    count: invoices.length,
    data: invoices,
  });
}));

// @route   GET /api/purchase-invoices/:id
// @desc    Get single purchase invoice
// @access  Private
router.get('/:id', protect, asyncHandler(async (req, res) => {
  const invoice = await PurchaseInvoice.findById(req.params.id)
    .populate('supplier', 'name phone address');
  
  if (!invoice) {
    return res.status(404).json({
      success: false,
      error: 'الفاتورة غير موجودة',
    });
  }
  
  res.status(200).json({
    success: true,
    data: invoice,
  });
}));

// @route   GET /api/purchase-invoices/supplier/:supplierId
// @desc    Get invoices by supplier
// @access  Private
router.get('/supplier/:supplierId', protect, asyncHandler(async (req, res) => {
  const invoices = await PurchaseInvoice.find({ supplier: req.params.supplierId })
    .sort('-createdAt');
  
  res.status(200).json({
    success: true,
    count: invoices.length,
    data: invoices,
  });
}));

// @route   POST /api/purchase-invoices
// @desc    Create new purchase invoice
// @access  Private
router.post('/', protect, asyncHandler(async (req, res) => {
  const { supplier: supplierId, items, paidAmount } = req.body;
  
  // Get supplier
  const supplier = await Supplier.findById(supplierId);
  
  if (!supplier) {
    return res.status(404).json({
      success: false,
      error: 'التاجر غير موجود',
    });
  }
  
  // Calculate total amount
  let totalAmount = 0;
  const processedItems = items.map(item => {
    const itemTotal = item.quantity * item.unitPrice;
    totalAmount += itemTotal;
    return {
      ...item,
      totalPrice: itemTotal,
    };
  });
  
  // Generate invoice number
  const lastInvoice = await PurchaseInvoice.findOne().sort('-invoiceNumber');
  let invoiceNumber = 'PI-0001';
  
  if (lastInvoice && lastInvoice.invoiceNumber) {
    const lastNumber = parseInt(lastInvoice.invoiceNumber.split('-')[1]);
    invoiceNumber = `PI-${String(lastNumber + 1).padStart(4, '0')}`;
  }
  
  // Create invoice
  const invoice = await PurchaseInvoice.create({
    ...req.body,
    invoiceNumber,
    supplierName: supplier.name,
    items: processedItems,
    totalAmount,
    paidAmount: paidAmount || 0,
  });
  
  // Update supplier totals and balance
  supplier.totalPurchases += totalAmount;
  supplier.totalPaid += (paidAmount || 0);
  supplier.balance = supplier.totalPurchases - supplier.totalPaid;
  await supplier.save();
  
  res.status(201).json({
    success: true,
    data: invoice,
  });
}));

// @route   PUT /api/purchase-invoices/:id
// @desc    Update purchase invoice
// @access  Private
router.put('/:id', protect, asyncHandler(async (req, res) => {
  let invoice = await PurchaseInvoice.findById(req.params.id);
  
  if (!invoice) {
    return res.status(404).json({
      success: false,
      error: 'الفاتورة غير موجودة',
    });
  }
  
  const oldTotalAmount = invoice.totalAmount;
  const oldPaidAmount = invoice.paidAmount;
  const oldSupplierId = invoice.supplier;
  
  // Recalculate if items changed
  if (req.body.items) {
    let totalAmount = 0;
    const processedItems = req.body.items.map(item => {
      const itemTotal = item.quantity * item.unitPrice;
      totalAmount += itemTotal;
      return {
        ...item,
        totalPrice: itemTotal,
      };
    });
    
    req.body.items = processedItems;
    req.body.totalAmount = totalAmount;
  }
  
  invoice = await PurchaseInvoice.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  
  // Update supplier balance if amounts changed
  const newTotalAmount = invoice.totalAmount;
  const newPaidAmount = invoice.paidAmount;
  
  if (oldTotalAmount !== newTotalAmount || oldPaidAmount !== newPaidAmount) {
    const supplier = await Supplier.findById(invoice.supplier);
    
    if (supplier) {
      // Reverse old amounts
      supplier.totalPurchases -= oldTotalAmount;
      supplier.totalPaid -= oldPaidAmount;
      
      // Add new amounts
      supplier.totalPurchases += newTotalAmount;
      supplier.totalPaid += newPaidAmount;
      supplier.balance = supplier.totalPurchases - supplier.totalPaid;
      
      await supplier.save();
    }
  }
  
  res.status(200).json({
    success: true,
    data: invoice,
  });
}));

// @route   PUT /api/purchase-invoices/:id/payment
// @desc    Add payment to invoice
// @access  Private
router.put('/:id/payment', protect, asyncHandler(async (req, res) => {
  const { amount } = req.body;
  
  let invoice = await PurchaseInvoice.findById(req.params.id);
  
  if (!invoice) {
    return res.status(404).json({
      success: false,
      error: 'الفاتورة غير موجودة',
    });
  }
  
  const oldPaidAmount = invoice.paidAmount;
  invoice.paidAmount += amount;
  
  if (invoice.paidAmount > invoice.totalAmount) {
    return res.status(400).json({
      success: false,
      error: 'المبلغ المدفوع أكبر من إجمالي الفاتورة',
    });
  }
  
  await invoice.save();
  
  // Update supplier
  const supplier = await Supplier.findById(invoice.supplier);
  if (supplier) {
    supplier.totalPaid += (invoice.paidAmount - oldPaidAmount);
    supplier.balance = supplier.totalPurchases - supplier.totalPaid;
    await supplier.save();
  }
  
  res.status(200).json({
    success: true,
    data: invoice,
  });
}));

// @route   DELETE /api/purchase-invoices/:id
// @desc    Delete purchase invoice
// @access  Private
router.delete('/:id', protect, checkPermission('invoices'), asyncHandler(async (req, res) => {
  const invoice = await PurchaseInvoice.findById(req.params.id);
  
  if (!invoice) {
    return res.status(404).json({
      success: false,
      error: 'الفاتورة غير موجودة',
    });
  }
  
  // Update supplier balance
  const supplier = await Supplier.findById(invoice.supplier);
  if (supplier) {
    supplier.totalPurchases -= invoice.totalAmount;
    supplier.totalPaid -= invoice.paidAmount;
    supplier.balance = supplier.totalPurchases - supplier.totalPaid;
    await supplier.save();
  }
  
  await invoice.deleteOne();
  
  res.status(200).json({
    success: true,
    data: {},
  });
}));

module.exports = router;
