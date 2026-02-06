const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'اسم العميل مطلوب'],
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
  },
  phone: {
    type: String,
    required: [true, 'رقم الهاتف مطلوب'],
    unique: true,
  },
  image: String,
  visits: {
    type: Number,
    default: 0,
  },
  spending: {
    type: Number,
    default: 0,
  },
  vip: {
    type: Boolean,
    default: false,
  },
  visitHistory: [{
    date: String,
    services: String,
    amount: Number,
  }],
}, {
  timestamps: true,
});

module.exports = mongoose.model('Customer', customerSchema);
