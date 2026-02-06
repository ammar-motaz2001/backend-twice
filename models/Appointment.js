const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  customer: {
    type: String,
    required: [true, 'اسم العميل مطلوب'],
  },
  customerPhone: String,
  customerImage: String,
  service: {
    type: String,
    required: [true, 'الخدمة مطلوبة'],
  },
  time: {
    type: String,
    required: [true, 'الوقت مطلوب'],
  },
  duration: String,
  status: {
    type: String,
    enum: ['مؤكد', 'مكتمل', 'ملغي', 'قيد الانتظار'],
    default: 'مؤكد',
  },
  date: {
    type: String,
    required: [true, 'التاريخ مطلوب'],
  },
  specialist: String,
  notes: String,
}, {
  timestamps: true,
});

module.exports = mongoose.model('Appointment', appointmentSchema);
