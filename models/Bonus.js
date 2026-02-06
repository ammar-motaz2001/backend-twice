const mongoose = require('mongoose');

const bonusSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  employeeName: {
    type: String,
    required: [true, 'اسم الموظف مطلوب'],
  },
  amount: {
    type: Number,
    required: [true, 'المبلغ مطلوب'],
    min: 0,
  },
  reason: {
    type: String,
    required: [true, 'السبب مطلوب'],
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12,
  },
  year: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  addedBy: String,
}, {
  timestamps: true,
});

module.exports = mongoose.model('Bonus', bonusSchema);
