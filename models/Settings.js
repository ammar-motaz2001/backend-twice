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
  workingHours: {
    start: String,
    end: String,
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
    footerText: String,
  },
  businessName: String,
  businessPhone: String,
  businessEmail: String,
  businessAddress: String,
  timezone: String,
}, {
  timestamps: true,
});

module.exports = mongoose.model('Settings', settingsSchema);
