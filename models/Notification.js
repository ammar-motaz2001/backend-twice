const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'العنوان مطلوب'],
  },
  message: {
    type: String,
    required: [true, 'الرسالة مطلوبة'],
  },
  time: {
    type: String,
    default: () => new Date().toLocaleTimeString('ar-EG'),
  },
  read: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    enum: ['info', 'warning', 'success', 'error'],
    default: 'info',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Notification', notificationSchema);
