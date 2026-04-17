const rateLimit = require('express-rate-limit');

// General API rate limiter (100 requests per 15 minutes)
exports.apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  standardHeaders: true, 
  legacyHeaders: false, 
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again after 15 minutes'
  }
});

// Stricter limiter for devices
exports.deviceLimiter = rateLimit({
  windowMs: 60 * 1000, 
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.body.imei || req.ip,
  message: {
    success: false,
    error: 'Too many authentication attempts, please try again later'
  }
});