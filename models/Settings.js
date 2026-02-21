const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  shopName: {
    type: String,
    default: 'صالون التجميل',
  },
  shopLogo: String,
  address: String,
  phone: String,
  email: String,
  currency: {
    type: String,
    default: 'EGP',
  },
  language: {
    type: String,
    default: 'ar',
  },
  // وقت البداية ووقت النهاية - للإعدادات العامة (dynamic)
  startTime: { type: String, default: '' },
  endTime: { type: String, default: '' },
  workingHours: {
    start: { type: String, default: '' },
    end: { type: String, default: '' },
  },
  notifications: {
    type: Boolean,
    default: true,
  },
  darkMode: {
    type: Boolean,
    default: false,
  },
  invoiceSettings: {
    showLogo: { type: Boolean, default: true },
    showAddress: { type: Boolean, default: true },
    showPhone: { type: Boolean, default: true },
    showEmail: { type: Boolean, default: true },
    footer: String,
    autoNumber: { type: Boolean, default: true },
    // نص تذييل الفاتورة (dynamic)
    footerText: { type: String, default: '' },
  },
  businessName: String,
  businessPhone: String,
  businessEmail: String,
  businessAddress: String,
  timezone: String,
}, {
  timestamps: true,
});

// Keep startTime/endTime and workingHours in sync (dynamic الإعدادات العامة)
settingsSchema.pre('save', function(next) {
  if (this.startTime !== undefined && this.startTime !== '')
    this.workingHours.start = this.startTime;
  if (this.endTime !== undefined && this.endTime !== '')
    this.workingHours.end = this.endTime;
  if (this.workingHours?.start !== undefined) this.startTime = this.workingHours.start;
  if (this.workingHours?.end !== undefined) this.endTime = this.workingHours.end;
  next();
});

module.exports = mongoose.model('Settings', settingsSchema);
