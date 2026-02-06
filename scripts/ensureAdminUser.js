/**
 * Ensure admin user exists with username: admin, password: admin.
 * Run: node scripts/ensureAdminUser.js
 */
const connectDB = require('../config/database');
const User = require('../models/User');

const ensureAdminUser = async () => {
  try {
    await connectDB();
    let admin = await User.findOne({ username: 'admin' }).select('+password');

    if (!admin) {
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
      console.log('✅ Admin user created: username=admin, password=admin');
    } else {
      admin.password = 'admin';
      admin.name = admin.name || 'المدير';
      admin.email = admin.email || 'admin@salon.com';
      admin.phone = admin.phone || '01000000000';
      await admin.save();
      console.log('✅ Admin user updated: username=admin, password=admin');
    }
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

ensureAdminUser();
