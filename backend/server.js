const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const xss = require('xss-clean');
const promClient = require('prom-client');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const logger = require('./middleware/logger');
const { apiLimiter } = require('./middleware/rateLimiter');

const app = express();

// Trust proxy for Render/Vercel (important for Rate Limiting)
app.set('trust proxy', 1);

// Initialize Prometheus metrics collection
const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

// Custom Prometheus HTTP duration metric
const httpRequestTimer = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.1, 0.3, 0.5, 1, 1.5, 5]
});
register.registerMetric(httpRequestTimer);

// Prometheus metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Middleware
// 1. Security Headers
app.use(helmet());

// 2. Data Sanitization (NoSQL injection & XSS prevention)
app.use(xss());

// 3. Rate Limiting (Applied strictly to /api)
app.use('/api/', apiLimiter);

// 4. Request Logging to Winston & metrics tracking
app.use((req, res, next) => {
  const startEpoch = Date.now();
  res.on('finish', () => {
    const responseTimeInMs = Date.now() - startEpoch;
    httpRequestTimer.labels(req.method, req.route ? req.route.path : req.path, res.statusCode).observe(responseTimeInMs / 1000);
    logger.info(`${req.method} ${req.originalUrl} [${res.statusCode}] - ${responseTimeInMs}ms`);
  });
  next();
});

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

// Mock Redis removed - logic mapped to middleware/cache.js natively

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
const httpServer = http.createServer(app);

// Initialize Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  logger.info(`🔌 WebSocket Client connected: ${socket.id}`);
  
  socket.on('disconnect', () => {
    logger.info(`🔌 WebSocket Client disconnected: ${socket.id}`);
  });
});

// Expose io locally to all req instances within Express routes
app.set('io', io);

httpServer.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📡 WebSockets Active`);
  console.log(`📝 Test the API:`);
  console.log(`   - Health check: http://localhost:${PORT}/health`);
  console.log(`   - Test route: http://localhost:${PORT}/api/test`);
  console.log(`   - Login: POST http://localhost:${PORT}/api/auth/login`);
  console.log(`   - Device heartbeat: POST http://localhost:${PORT}/api/devices/heartbeat`);
});