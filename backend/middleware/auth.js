const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('./logger');

module.exports = async (req, res, next) => {
  const token = req.header('x-auth-token');
  
  if (!token) {
    return res.status(401).json({ success: false, error: 'Access denied. No token provided.' });
  }

  try {
    if (!process.env.JWT_SECRET) {
      logger.error('CRITICAL: JWT_SECRET is not defined in environment variables.');
      return res.status(500).json({ success: false, error: 'Internal server security configuration error' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user exists and is active
    const user = await User.findById(decoded.user.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ success: false, error: 'User no longer exists' });
    }

    if (!user.isActive) {
      logger.warn(`Unauthorized access attempt by deactivated user: ${user.email}`);
      return res.status(403).json({ success: false, error: 'Account is deactivated. Please contact an administrator.' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    const message = error.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token';
    res.status(401).json({ success: false, error: message });
  }
};