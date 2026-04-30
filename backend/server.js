const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const xss = require('xss-clean');
const compression = require('compression');
const promClient = require('prom-client');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const logger = require('./middleware/logger');
const { apiLimiter } = require('./middleware/rateLimiter');

const app = express();

// Trust proxy for Load Balancers (Render/Vercel/AWS)
app.set('trust proxy', 1);

// Initialize Prometheus Metrics
const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

const httpRequestTimer = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.1, 0.3, 0.5, 1, 1.5, 5]
});
register.registerMetric(httpRequestTimer);

// Metrics Endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// ─── CORS must be registered FIRST, before any security middleware ───────────
// CORS Configuration — supports comma-separated FRONTEND_URL for multi-origin setups
const rawOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

const allowedOrigins = [...new Set([...rawOrigins, 'http://localhost:3000'])];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked request from: ${origin}`);
      callback(new Error(`CORS: Origin ${origin} is not allowed`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'x-auth-token', 'Authorization'],
  optionsSuccessStatus: 200
};

// Respond immediately to all OPTIONS preflight requests
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));

// ─── Security & Compression ───────────────────────────────────────────────────
app.use(helmet());
app.use(xss());
app.use(compression());
app.use('/api/', apiLimiter);

// Request Logging & Metrics Tracking
app.use((req, res, next) => {
  const startEpoch = Date.now();
  res.on('finish', () => {
    const responseTimeInMs = Date.now() - startEpoch;
    httpRequestTimer.labels(req.method, req.route ? req.route.path : req.path, res.statusCode).observe(responseTimeInMs / 1000);
    logger.info(`${req.method} ${req.originalUrl} [${res.statusCode}] - ${responseTimeInMs}ms`);
  });
  next();
});

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));


// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mdm_system';
mongoose.connect(MONGO_URI)
  .then(async () => {
    logger.info('✅ Connected to MongoDB');
    try {
      const User = require('./models/User');
      const adminEmail = process.env.INITIAL_ADMIN_EMAIL || 'admin@mdmportal.com';
      const adminExists = await User.findOne({ email: adminEmail });
      if (!adminExists) {
        await User.create({
          name: 'System Administrator',
          email: adminEmail,
          password: process.env.INITIAL_ADMIN_PASSWORD || 'ChangeMeImmediately123!',
          role: 'admin',
          isActive: true
        });
        logger.warn(`🎉 Default admin created: ${adminEmail}. PLEASE CHANGE PASSWORD.`);
      }
    } catch (e) {
      logger.error(`⚠️ Seed error: ${e.message}`);
    }
  })
  .catch(err => {
    logger.error(`❌ MongoDB error: ${err.message}`);
    process.exit(1);
  });

// Route Registration
const routes = {
  auth: require('./routes/auth'),
  devices: require('./routes/devices'),
  versions: require('./routes/versions'),
  schedules: require('./routes/schedules'),
  updates: require('./routes/updates'),
  audit: require('./routes/audit'),
  stats: require('./routes/stats'),
  users: require('./routes/users')
};

Object.entries(routes).forEach(([path, handler]) => {
  app.use(`/api/${path}`, handler);
});

// Health Check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Error Handling
app.use((req, res) => res.status(404).json({ success: false, error: 'Route not found' }));
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(err.status || 500).json({ success: false, error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
const httpServer = http.createServer(app);

// Hardened Socket.io Configuration with Auth Middleware
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST']
  }
});

const jwt = require('jsonwebtoken');
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error: No token provided'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded.user;
    next();
  } catch (err) {
    return next(new Error('Authentication error: Invalid token'));
  }
});

io.on('connection', (socket) => {
  logger.info(`🔌 Socket connected: ${socket.id} (User: ${socket.user.email})`);

  // Join rooms based on role for targeted broadcasting
  socket.join(`user:${socket.user.id}`);
  if (socket.user.role === 'admin' || socket.user.role === 'manager') {
    socket.join('staff');
  }
  if (socket.user.role === 'admin') {
    socket.join('admin');
  }

  socket.on('disconnect', () => {
    logger.info(`🔌 Socket disconnected: ${socket.id}`);
  });
});

app.set('io', io);


// Graceful Shutdown Logic
const shutdown = () => {
  logger.info('Graceful shutdown initiated...');
  httpServer.close(() => {
    logger.info('HTTP server closed.');
    mongoose.connection.close(false, () => {
      logger.info('MongoDB connection closed.');
      process.exit(0);
    });
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

httpServer.listen(PORT, () => {
  logger.info(`✅ Server running on port ${PORT}`);
});