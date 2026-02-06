# Beauty Salon Management System - Backend API

Backend محلي كامل لنظام إدارة مركز التجميل مبني على **Node.js + Express + MongoDB**

---

## 📋 المتطلبات

قبل البدء، تأكد من تثبيت:

- **Node.js** (v14 أو أحدث) - [تحميل](https://nodejs.org/)
- **MongoDB** (v4.4 أو أحدث) - [تحميل](https://www.mongodb.com/try/download/community)
- **Git** (اختياري)

---

## 🚀 التثبيت والتشغيل

### 1️⃣ تثبيت المكتبات

```bash
cd backend
npm install
```

### 2️⃣ إعداد البيئة

انسخ ملف `.env.example` وأعد تسميته إلى `.env`:

```bash
cp .env.example .env
```

ثم عدّل الملف `.env`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/beauty-salon
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000
```

### 3️⃣ تشغيل MongoDB

تأكد من تشغيل MongoDB على جهازك:

**Windows:**
```bash
net start MongoDB
```

**macOS/Linux:**
```bash
sudo systemctl start mongod
# أو
sudo service mongod start
```

### 4️⃣ تهيئة قاعدة البيانات

قم بإنشاء المستخدمين الافتراضيين والإعدادات:

```bash
npm run init-db
```

هذا سينشئ:
- ✅ مستخدم Admin (admin / admin123)
- ✅ مستخدم Cashier (cashier / cashier123)
- ✅ الإعدادات الافتراضية

### 5️⃣ تشغيل السيرفر

**للتطوير (مع التحديث التلقائي):**
```bash
npm run dev
```

**للإنتاج:**
```bash
npm start
```

السيرفر سيعمل على: `http://localhost:5000`

---

## 🧪 اختبار API

### Health Check:
```bash
curl http://localhost:5000/health
```

### تسجيل الدخول:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

---

## 📁 هيكل المشروع

```
backend/
├── config/
│   └── database.js          # إعدادات MongoDB
├── middleware/
│   ├── auth.js             # JWT Authentication
│   ├── errorHandler.js     # معالجة الأخطاء
│   └── asyncHandler.js     # معالجة Async
├── models/                 # Mongoose Models
│   ├── User.js
│   ├── Service.js
│   ├── Customer.js
│   ├── Appointment.js
│   ├── Sale.js
│   ├── Inventory.js
│   ├── Employee.js
│   ├── Attendance.js
│   ├── Expense.js
│   ├── Shift.js
│   ├── Bonus.js
│   ├── Settings.js
│   └── Notification.js
├── routes/                 # API Routes
│   ├── auth.js
│   ├── services.js
│   ├── customers.js
│   ├── appointments.js
│   ├── sales.js
│   ├── inventory.js
│   ├── employees.js
│   ├── attendance.js
│   ├── expenses.js
│   ├── shifts.js
│   ├── bonuses.js
│   ├── reports.js
│   └── settings.js
├── scripts/
│   └── initDatabase.js     # تهيئة قاعدة البيانات
├── .env.example           # مثال لملف البيئة
├── server.js              # نقطة البداية
├── package.json
└── README.md
```

---

## 🔐 المصادقة (Authentication)

جميع الـ endpoints تتطلب JWT Token (ماعدا `/health` و `/api/auth/login`)

### الحصول على Token:

```javascript
// 1. تسجيل الدخول
const response = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'admin',
    password: 'admin123'
  })
});

const { token } = await response.json();

// 2. استخدام Token في الطلبات
const services = await fetch('http://localhost:5000/api/services', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

---

## 📡 API Endpoints

### المصادقة (Auth)
- `POST /api/auth/login` - تسجيل دخول
- `POST /api/auth/register` - تسجيل مستخدم جديد
- `GET /api/auth/me` - الحصول على بيانات المستخدم الحالي
- `PUT /api/auth/update-password` - تحديث كلمة المرور

### الخدمات (Services)
- `GET /api/services` - جلب كل الخدمات
- `GET /api/services/:id` - جلب خدمة واحدة
- `POST /api/services` - إضافة خدمة
- `PUT /api/services/:id` - تحديث خدمة
- `DELETE /api/services/:id` - حذف خدمة

### العملاء (Customers)
- `GET /api/customers` - جلب كل العملاء
- `GET /api/customers/:id` - جلب عميل واحد
- `GET /api/customers/phone/:phone` - جلب عميل برقم الهاتف
- `POST /api/customers` - إضافة عميل
- `PUT /api/customers/:id` - تحديث عميل
- `DELETE /api/customers/:id` - حذف عميل

### المواعيد (Appointments)
- `GET /api/appointments` - جلب كل المواعيد
- `GET /api/appointments/:id` - جلب موعد واحد
- `POST /api/appointments` - إضافة موعد
- `PUT /api/appointments/:id` - تحديث موعد
- `DELETE /api/appointments/:id` - حذف موعد

### المبيعات (Sales)
- `GET /api/sales` - جلب كل الفواتير
- `GET /api/sales/:id` - جلب فاتورة واحدة
- `POST /api/sales` - إضافة فاتورة
- `PUT /api/sales/:id` - تحديث فاتورة
- `DELETE /api/sales/:id` - حذف فاتورة

### المخزون (Inventory)
- `GET /api/inventory` - جلب كل المنتجات
- `GET /api/inventory/:id` - جلب منتج واحد
- `POST /api/inventory` - إضافة منتج
- `PUT /api/inventory/:id` - تحديث منتج
- `DELETE /api/inventory/:id` - حذف منتج

### الموظفين (Employees)
- `GET /api/employees` - جلب كل الموظفين
- `GET /api/employees/:id` - جلب موظف واحد
- `POST /api/employees` - إضافة موظف
- `PUT /api/employees/:id` - تحديث موظف
- `DELETE /api/employees/:id` - حذف موظف

### الحضور (Attendance)
- `GET /api/attendance` - جلب سجلات الحضور
- `POST /api/attendance` - إضافة سجل حضور
- `PUT /api/attendance/:id` - تحديث سجل
- `DELETE /api/attendance/:id` - حذف سجل

### المصروفات (Expenses)
- `GET /api/expenses` - جلب كل المصروفات
- `POST /api/expenses` - إضافة مصروف
- `PUT /api/expenses/:id` - تحديث مصروف
- `DELETE /api/expenses/:id` - حذف مصروف

### الورديات (Shifts)
- `GET /api/shifts` - جلب كل الورديات
- `POST /api/shifts` - إضافة وردية
- `PUT /api/shifts/:id` - تحديث وردية
- `DELETE /api/shifts/:id` - حذف وردية

### المكافآت (Bonuses)
- `GET /api/bonuses` - جلب كل المكافآت
- `POST /api/bonuses` - إضافة مكافأة
- `PUT /api/bonuses/:id` - تحديث مكافأة
- `DELETE /api/bonuses/:id` - حذف مكافأة

### التقارير (Reports)
- `GET /api/reports/dashboard` - إحصائيات Dashboard
- `GET /api/reports/sales` - تقرير المبيعات
- `GET /api/reports/customers` - تقرير العملاء

### الإعدادات (Settings)
- `GET /api/settings` - جلب الإعدادات
- `PUT /api/settings` - تحديث الإعدادات

---

## 👥 المستخدمين الافتراضيين

### Admin (مدير):
```
Username: admin
Password: admin123
Role: admin
Permissions: جميع الصلاحيات
```

### Cashier (كاشير):
```
Username: cashier
Password: cashier123
Role: cashier
Permissions: صلاحيات محدودة (بدون مخزون، مصروفات، موظفين، رواتب)
```

⚠️ **مهم:** غيّر كلمات المرور الافتراضية في الإنتاج!

---

## 🔒 الصلاحيات (Permissions)

كل endpoint محمي بـ:
1. **JWT Token** - يجب تسجيل الدخول
2. **Permission Check** - التحقق من الصلاحية المطلوبة

مثال:
- Admin: صلاحيات كاملة
- Cashier: لا يمكنه الوصول لـ Inventory, Expenses, Employees, etc.

---

## 🛠️ التطوير

### إضافة endpoint جديد:

1. أنشئ Model في `/models`
2. أنشئ Route في `/routes`
3. أضف Route في `server.js`

### تشغيل مع Nodemon:
```bash
npm run dev
```

---

## 📦 التصدير للإنتاج

### 1. تعديل متغيرات البيئة:

```env
NODE_ENV=production
MONGODB_URI=mongodb://your-production-server/beauty-salon
JWT_SECRET=use-strong-secret-key-here
CORS_ORIGIN=https://your-frontend-domain.com
```

### 2. تشغيل السيرفر:

```bash
npm start
```

### 3. استخدام Process Manager (PM2):

```bash
npm install -g pm2
pm2 start server.js --name beauty-salon-api
pm2 save
pm2 startup
```

---

## 🐛 استكشاف الأخطاء

### MongoDB لا يعمل:
```bash
# التحقق من الحالة
mongod --version

# تشغيل MongoDB
mongod
```

### Port مشغول:
غيّر PORT في ملف `.env`

### خطأ في الاتصال:
تأكد من MONGODB_URI صحيح في `.env`

---

## 📚 الموارد

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [JWT.io](https://jwt.io/)

---

## 📝 ملاحظات

1. **هذا Backend محلي** - يعمل على جهازك
2. **قاعدة البيانات MongoDB** - بدلاً من KV Store
3. **جاهز للتطوير** - يمكن تعديله بسهولة
4. **قابل للنشر** - يمكن رفعه على أي سيرفر

---

## 🎯 الخطوات التالية

1. ✅ تشغيل Backend محلياً
2. 🔗 ربط Frontend مع Backend
3. 🧪 اختبار APIs
4. 🚀 النشر للإنتاج (اختياري)

---

**تم التطوير بـ ❤️ لنظام إدارة مركز التجميل**
