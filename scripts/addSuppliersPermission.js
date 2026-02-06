/**
 * Script to add 'suppliers' permission to all existing users
 * Run with: node scripts/addSuppliersPermission.js
 */

const connectDB = require('../config/database');
const User = require('../models/User');

async function addSuppliersPermission() {
  try {
    await connectDB();
    
    console.log('');
    console.log('════════════════════════════════════════════════');
    console.log('  🔧 إضافة صلاحية التجار للمستخدمين');
    console.log('════════════════════════════════════════════════');
    console.log('');
    
    // Get all users
    const users = await User.find();
    
    if (users.length === 0) {
      console.log('⚠️  لا يوجد مستخدمين في قاعدة البيانات');
      console.log('');
      await mongoose.disconnect();
      process.exit(0);
    }
    
    console.log(`📊 تم العثور على ${users.length} مستخدم(ين)`);
    console.log('');
    
    let updatedCount = 0;
    let skippedCount = 0;
    
    for (const user of users) {
      // Check if suppliers permission already exists
      if (user.permissions && user.permissions.hasOwnProperty('suppliers')) {
        console.log(`⏭️  ${user.name} - الصلاحية موجودة بالفعل`);
        skippedCount++;
        continue;
      }
      
      // Add suppliers permission based on role
      if (!user.permissions) {
        user.permissions = {};
      }
      
      // Admins get true, cashiers get false by default
      user.permissions.suppliers = user.role === 'admin' ? true : false;
      
      await user.save();
      updatedCount++;
      
      console.log(`✅ ${user.name} (${user.role}) - تمت إضافة صلاحية التجار: ${user.permissions.suppliers}`);
    }
    
    console.log('');
    console.log('════════════════════════════════════════════════');
    console.log('  ✅ اكتمل التحديث');
    console.log('════════════════════════════════════════════════');
    console.log('');
    console.log(`📊 الإحصائيات:`);
    console.log(`   - تم التحديث: ${updatedCount}`);
    console.log(`   - تم التجاوز: ${skippedCount}`);
    console.log(`   - الإجمالي: ${users.length}`);
    console.log('');
    
    // Show admin users with suppliers permission
    const adminsWithSuppliers = await User.find({ 
      role: 'admin',
      'permissions.suppliers': true 
    });
    
    if (adminsWithSuppliers.length > 0) {
      console.log('👥 المستخدمين الذين لديهم صلاحية التجار:');
      adminsWithSuppliers.forEach(admin => {
        console.log(`   - ${admin.name} (${admin.email})`);
      });
      console.log('');
    }
    
    console.log('💡 ملاحظة: يمكنك تعديل صلاحيات المستخدمين من صفحة الإعدادات');
    console.log('');
    
    await mongoose.disconnect();
    process.exit(0);
    
  } catch (error) {
    console.error('');
    console.error('❌ حدث خطأ:', error.message);
    console.error('');
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run the script
addSuppliersPermission();
