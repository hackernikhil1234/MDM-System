const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (origin.includes('localhost') || origin.includes('vercel.app') || origin === process.env.FRONTEND_URL) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-auth-token']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Mock Redis for development (comment out actual Redis connection)
global.redis = {
  get: async (key) => null,
  set: async (key, value) => {},
  del: async (key) => {}
};

console.log('⚠️ Using mock Redis (no actual Redis server needed)');

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mdm_system';
mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    try {
      const User = require('./models/User');
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount === 0) {
        await User.create({
          name: 'System Administrator',
          email: 'admin@mdmportal.com',
          password: 'adminPassword123!',
          role: 'admin',
          isActive: true
        });
        console.log('🎉 Default admin created: admin@mdmportal.com');
      }
    } catch (e) {
      console.error('⚠️ Failed to seed default admin:', e.message);
    }
  })
  .catch(err => {
    console.log('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// Import routes
const authRoutes = require('./routes/auth');
const deviceRoutes = require('./routes/devices');
const versionRoutes = require('./routes/versions');
const scheduleRoutes = require('./routes/schedules');
const updateRoutes = require('./routes/updates');
const auditRoutes = require('./routes/audit');
const statsRoutes = require('./routes/stats');
const userRoutes = require('./routes/users');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/versions', versionRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/updates', updateRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/users', userRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    redis: 'mock mode'
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Backend API is working!',
    timestamp: new Date().toISOString()
  });
});

// Add this temporary test endpoint
app.post('/api/test-bcrypt', async (req, res) => {
  const bcrypt = require('bcryptjs');
  const { password, hash } = req.body;
  
  try {
    const isMatch = await bcrypt.compare(password, hash);
    res.json({ 
      success: true, 
      isMatch,
      password,
      hashPreview: hash.substring(0, 20) + '...'
    });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'Route not found',
    path: req.path 
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    success: false, 
    error: 'Internal server error',
    message: err.message 
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📝 Test the API:`);
  console.log(`   - Health check: http://localhost:${PORT}/health`);
  console.log(`   - Test route: http://localhost:${PORT}/api/test`);
  console.log(`   - Login: POST http://localhost:${PORT}/api/auth/login`);
  console.log(`   - Device heartbeat: POST http://localhost:${PORT}/api/devices/heartbeat`);
});