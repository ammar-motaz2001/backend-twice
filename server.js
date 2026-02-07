const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const serviceRoutes = require('./routes/services');
const customerRoutes = require('./routes/customers');
const appointmentRoutes = require('./routes/appointments');
const saleRoutes = require('./routes/sales');
const inventoryRoutes = require('./routes/inventory');
const employeeRoutes = require('./routes/employees');
const attendanceRoutes = require('./routes/attendance');
const expenseRoutes = require('./routes/expenses');
const shiftRoutes = require('./routes/shifts');
const bonusRoutes = require('./routes/bonuses');
const reportRoutes = require('./routes/reports');
const settingsRoutes = require('./routes/settings');
const supplierRoutes = require('./routes/suppliers');
const purchaseInvoiceRoutes = require('./routes/purchaseInvoices');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan('dev'));

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: '✅ Beauty Salon API Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/shifts', shiftRoutes);
app.use('/api/bonuses', bonusRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/purchase-invoices', purchaseInvoiceRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'المسار غير موجود',
  });
});

// Error handler middleware (must be last)
app.use(errorHandler);

// Start server
const PORT = 5001;
const server = app.listen(PORT, () => {
  console.log('');
  console.log('════════════════════════════════════════════════');
  console.log('  💅 Beauty Salon Management System API');
  console.log('════════════════════════════════════════════════');
  console.log(`  🚀 Server running on port ${PORT}`);
  console.log('  🌍 Environment: development');
  console.log(`  📡 API: http://localhost:${PORT}`);
  console.log(`  ✅ Health: http://localhost:${PORT}/health`);
  console.log('════════════════════════════════════════════════');
  console.log('');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

module.exports = app;