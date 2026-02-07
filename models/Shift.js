const mongoose = require('mongoose');

const shiftSchema = new mongoose.Schema({
  startTime: {
    type: String,
    required: [true, 'وقت البداية مطلوب'],
  },
  endTime: String,
  startingCash: {
    type: Number,
    required: [true, 'النقدية الافتتاحية مطلوبة'],
    default: 0,
  },
  totalSales: {
    type: Number,
    default: 0,
  },
  totalExpenses: {
    type: Number,
    default: 0,
  },
  finalCash: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['open', 'closed'],
    default: 'open',
  },
  date: {
    type: Date,
    default: Date.now,
  },
  cashier: {
    type: String,
    required: [true, 'اسم الكاشير مطلوب'],
  },
  salesDetails: {
    cash: { type: Number, default: 0 },
    card: { type: Number, default: 0 },
    instapay: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Shift', shiftSchema);
