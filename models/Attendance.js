const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  employeeName: { type: String, default: '' },
  name: String,
  position: String,
  checkIn: { type: String, default: '' },
  checkOut: { type: String, default: '' },
  workHours: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['حاضر', 'غائب', 'تأخير', 'إجازة', 'present', 'absent', 'delay', 'leave'],
    default: 'حاضر',
  },
  date: {
    type: String,
    required: true,
  },
  image: String,
  advance: {
    type: Number,
    default: 0,
  },
  day: String,
  notes: String,
}, {
  timestamps: true,
});

module.exports = mongoose.model('Attendance', attendanceSchema);
