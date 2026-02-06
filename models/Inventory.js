const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'اسم المنتج مطلوب'],
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'التصنيف مطلوب'],
  },
  stock: {
    type: Number,
    required: [true, 'الكمية مطلوبة'],
    min: 0,
  },
  price: {
    type: Number,
    required: [true, 'السعر مطلوب'],
    min: 0,
  },
  minStock: {
    type: Number,
    default: 10,
  },
  image: String,
}, {
  timestamps: true,
});

module.exports = mongoose.model('Inventory', inventorySchema);
