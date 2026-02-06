const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now,
  },
  description: {
    type: String,
    required: [true, 'الوصف مطلوب'],
  },
  amount: {
    type: Number,
    required: [true, 'المبلغ مطلوب'],
    min: 0,
  },
  paymentMethod: {
    type: String,
    enum: ['نقدي', 'بطاقة', 'InstaPay'],
    default: 'نقدي',
  },
  notes: String,
  category: String,
}, {
  timestamps: true,
});

module.exports = mongoose.model('Expense', expenseSchema);
