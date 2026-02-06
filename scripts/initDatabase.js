require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/database');
const User = require('../models/User');
const Settings = require('../models/Settings');

const initDatabase = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    console.log('🔧 Initializing database...\n');
    
    // Check if admin user already exists
    let admin = await User.findOne({ username: 'admin' }).select('+password');

    if (!admin) {
      // Create admin user
      admin = await User.create({
        username: 'admin',
        password: 'admin',
        name: 'المدير',
        email: 'admin@salon.com',
        phone: '01000000000',
        role: 'admin',
        permissions: {
          dashboard: true,
          sales: true,
          invoices: true,
          customers: true,
          appointments: true,
          inventory: true,
          services: true,
          expenses: true,
          shifts: true,
          employees: true,
          attendance: true,
          payroll: true,
          reports: true,
          settings: true,
        },
      });
      console.log('✅ Admin user created');
      console.log(`   Username: ${admin.username}`);
      console.log('   Password: admin\n');
    } else {
      // Ensure existing admin has password "admin"
      admin.password = 'admin';
      await admin.save();
      console.log('✅ Admin user updated (username: admin, password: admin)\n');
    }
    
    // Check if cashier user already exists
    const cashierExists = await User.findOne({ username: 'cashier' });
    
    if (!cashierExists) {
      // Create cashier user
      const cashier = await User.create({
        username: 'cashier',
        password: 'cashier123',
        name: 'الكاشير',
        email: 'cashier@salon.com',
        phone: '01111111111',
        role: 'cashier',
        permissions: {
          dashboard: true,
          sales: true,
          invoices: true,
          customers: true,
          appointments: true,
          inventory: false,
          services: true,
          expenses: false,
          shifts: true,
          employees: false,
          attendance: false,
          payroll: false,
          reports: false,
          settings: false,
        },
      });
      console.log('✅ Cashier user created');
      console.log(`   Username: ${cashier.username}`);
      console.log('   Password: cashier123\n');
    } else {
      console.log('ℹ️  Cashier user already exists\n');
    }
    
    // Check if settings already exist
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = await Settings.create({
        shopName: 'صالون التجميل',
        currency: 'EGP',
        language: 'ar',
        notifications: true,
        darkMode: false,
      });
      console.log('✅ Default settings created\n');
    } else {
      console.log('ℹ️  Settings already exist\n');
    }
    
    console.log('════════════════════════════════════════════════');
    console.log('✅ Database initialized successfully!');
    console.log('════════════════════════════════════════════════');
    console.log('\n📝 Default Users:');
    console.log('   Admin:   username: admin   | password: admin');
    console.log('   Cashier: username: cashier | password: cashier123');
    console.log('\n⚠️  IMPORTANT: Change default passwords in production!\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  }
};

initDatabase();
