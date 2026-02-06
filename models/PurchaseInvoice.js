const mongoose = require('mongoose');

const purchaseInvoiceItemSchema = new mongoose.Schema({
  itemName: {
    type: String,
    required: [true, 'اسم الصنف مطلوب'],
  },
  quantity: {
    type: Number,
    required: [true, 'الكمية مطلوبة'],
    min: [1, 'الكمية يجب أن تكون 1 على الأقل'],
  },
  unitPrice: {
    type: Number,
    required: [true, 'سعر الوحدة مطلوب'],
    min: [0, 'السعر يجب أن يكون موجباً'],
  },
  totalPrice: {
    type: Number,
    required: true,
  },
});

const purchaseInvoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: [true, 'رقم الفاتورة مطلوب'],
    unique: true,
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: [true, 'التاجر مطلوب'],
  },
  supplierName: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  items: [purchaseInvoiceItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    min: [0, 'المبلغ الإجمالي يجب أن يكون موجباً'],
  },
  paidAmount: {
    type: Number,
    default: 0,
    min: [0, 'المبلغ المدفوع يجب أن يكون موجباً'],
  },
  remainingAmount: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['مدفوعة', 'جزئية', 'غير مدفوعة'],
    default: 'غير مدفوعة',
  },
  paymentMethod: {
    type: String,
    enum: ['نقدي', 'آجل', 'مختلط'],
    default: 'نقدي',
  },
  notes: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

// Calculate remaining amount before saving
purchaseInvoiceSchema.pre('save', function(next) {
  this.remainingAmount = this.totalAmount - this.paidAmount;
  
  // Update status based on payment
  if (this.paidAmount === 0) {
    this.status = 'غير مدفوعة';
  } else if (this.paidAmount >= this.totalAmount) {
    this.status = 'مدفوعة';
  } else {
    this.status = 'جزئية';
  }
  
  next();
});

module.exports = mongoose.model('PurchaseInvoice', purchaseInvoiceSchema);
