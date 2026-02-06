/**
 * List all users in the database (for debugging).
 * Run: node scripts/listUsers.js
 */
const connectDB = require('../config/database');
const User = require('../models/User');

const listUsers = async () => {
  try {
    await connectDB();
    const users = await User.find().select('-password');
    console.log(`\n📋 Users in DB (collection: "users", database: beauty-center): ${users.length}\n`);
    if (users.length === 0) {
      console.log('   No users found. Run: node scripts/initDatabase.js\n');
      process.exit(0);
      return;
    }
    users.forEach((u, i) => {
      console.log(`   ${i + 1}. username: ${u.username}, role: ${u.role}, name: ${u.name}`);
    });
    console.log('');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

listUsers();
