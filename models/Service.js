const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'اسم الخدمة مطلوب'],
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'التصنيف مطلوب'],
  },
  price: {
    type: Number,
    required: [true, 'السعر مطلوب'],
    min: 0,
  },
  duration: String,
  image: String,
  active: {
    type: Boolean,
    default: true,
  },
  salesCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Service', serviceSchema);
