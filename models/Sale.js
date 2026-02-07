const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    unique: true,
  },
  customer: {
    type: String,
    required: [true, 'اسم العميل مطلوب'],
  },
  customerPhone: String,
  service: String,
  amount: {
    type: Number,
    required: [true, 'المبلغ مطلوب'],
    min: 0,
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
  },
  status: {
    type: String,
    enum: ['مكتمل', 'قيد الانتظار', 'ملغي', 'completed', 'pending', 'cancelled'],
    default: 'مكتمل',
  },
  date: {
    type: Date,
    default: Date.now,
  },
  category: String,
  items: [{
    name: String,
    quantity: Number,
    price: Number,
    customPrice: Number,
    notes: String,
  }],
  paymentMethod: {
    type: String,
    enum: ['نقدي', 'بطاقة', 'InstaPay'],
    default: 'نقدي',
  },
  notes: String,
}, {
  timestamps: true,
});

// Auto-generate invoice number
saleSchema.pre('save', async function(next) {
  if (this.isNew && !this.invoiceNumber) {
    const count = await mongoose.model('Sale').countDocuments();
    this.invoiceNumber = `INV-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Sale', saleSchema);
