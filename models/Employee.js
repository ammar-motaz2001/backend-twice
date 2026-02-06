const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'اسم الموظف مطلوب'],
    trim: true,
  },
  phone: {
    type: String,
    required: [true, 'رقم الهاتف مطلوب'],
  },
  position: {
    type: String,
    required: [true, 'المنصب مطلوب'],
  },
  hireDate: {
    type: String,
    required: [true, 'تاريخ التعيين مطلوب'],
  },
  salaryType: {
    type: String,
    enum: ['شهري', 'يومي', 'بالساعة'],
    default: 'شهري',
  },
  baseSalary: {
    type: Number,
    required: [true, 'الراتب الأساسي مطلوب'],
    min: 0,
  },
  workDays: {
    type: Number,
    default: 26,
  },
  shiftHours: {
    type: Number,
    default: 8,
  },
  hourlyRate: Number,
  commission: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['نشط', 'موقوف'],
    default: 'نشط',
  },
  latePenaltyPerMinute: {
    type: Number,
    default: 0,
  },
  absencePenaltyPerDay: {
    type: Number,
    default: 0,
  },
  customDeductions: {
    type: Number,
    default: 0,
  },
  image: String,
}, {
  timestamps: true,
});

module.exports = mongoose.model('Employee', employeeSchema);
