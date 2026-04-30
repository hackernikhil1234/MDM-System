const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis').default;
const { client } = require('./cache');
const logger = require('./logger');

// Distributed Redis Store configuration
const store = client ? new RedisStore({
  sendCommand: (...args) => client.sendCommand(args),
}) : undefined;

if (!store) {
  logger.warn('⚠️ Redis not available. Rate limiting falling back to in-memory store.');
}

// General API rate limiter (100 requests per 15 minutes)
exports.apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  standardHeaders: true, 
  legacyHeaders: false,
  store: store,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again after 15 minutes'
  }
});

// Stricter limiter for devices & auth
exports.deviceLimiter = rateLimit({
  windowMs: 60 * 1000, 
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  store: store,
  keyGenerator: (req) => {
    // Priority: IMEI (Device) > User ID (Auth) > IP (Public)
    return req.body.imei || req.user?.id || req.ip;
  },
  message: {
    success: false,
    error: 'Security: Too many authentication attempts detected. Cooling down...'
  }
});