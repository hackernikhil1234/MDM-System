const { body, validationResult } = require('express-validator');

// Helper to handle validation errors uniformly
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      errors: errors.array().map(err => ({ field: err.path, message: err.msg })) 
    });
  }
  next();
};

exports.validateDeviceHeartbeat = [
  body('imei')
    .notEmpty().withMessage('IMEI is required')
    .isLength({ min: 14, max: 16 }).withMessage('Invalid IMEI length'),
  body('appVersion').notEmpty().withMessage('App version is required'),
  body('appVersionCode').isNumeric().withMessage('Version code must be numeric'),
  body('deviceOS').isIn(['android', 'ios', 'windows']).withMessage('Unsupported OS'),
  validate
];

exports.validateVersionCreate = [
  body('versionCode').isNumeric().withMessage('Version code must be numeric'),
  body('versionName').trim().notEmpty().withMessage('Version name is required'),
  body('releaseDate').isISO8601().withMessage('Valid ISO 8601 release date is required'),
  validate
];

exports.validateLogin = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  validate
];