const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const auth = require('../middleware/auth');

// Admin-only check
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Admin access required' });
  }
  next();
};

/**
 * @route   GET /api/audit
 * @desc    Get audit logs with filters
 * @access  Private (Admin/Manager)
 */
router.get('/', auth, auditController.getAuditLogs);

/**
 * @route   GET /api/audit/device/:imei
 * @desc    Get timeline for specific device
 * @access  Private
 */
router.get('/device/:imei', auth, auditController.getDeviceTimeline);

/**
 * @route   POST /api/audit/maintenance/clear
 * @desc    Clear old logs (Admin only)
 * @access  Private (Admin)
 */
router.post('/maintenance/clear', auth, adminOnly, auditController.clearOldLogs);

module.exports = router;