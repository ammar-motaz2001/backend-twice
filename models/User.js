const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'اسم المستخدم مطلوب'],
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'كلمة المرور مطلوبة'],
    minlength: 6,
  },
  name: {
    type: String,
    required: [true, 'الاسم مطلوب'],
  },
  email: {
    type: String,
    required: [true, 'البريد الإلكتروني مطلوب'],
    unique: true,
    lowercase: true,
  },
  phone: {
    type: String,
    required: [true, 'رقم الهاتف مطلوب'],
  },
  role: {
    type: String,
    enum: ['admin', 'cashier'],
    default: 'cashier',
  },
  image: String,
  permissions: {
    dashboard: { type: Boolean, default: true },
    sales: { type: Boolean, default: true },
    invoices: { type: Boolean, default: true },
    customers: { type: Boolean, default: true },
    appointments: { type: Boolean, default: true },
    inventory: { type: Boolean, default: false },
    services: { type: Boolean, default: true },
    expenses: { type: Boolean, default: false },
    shifts: { type: Boolean, default: true },
    employees: { type: Boolean, default: false },
    attendance: { type: Boolean, default: false },
    payroll: { type: Boolean, default: false },
    reports: { type: Boolean, default: false },
    suppliers: { type: Boolean, default: false },
    settings: { type: Boolean, default: false },
  },
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);