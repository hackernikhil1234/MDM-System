const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');
const auth = require('../middleware/auth');
const { cacheMiddleware } = require('../middleware/cache');
const { validateDeviceHeartbeat } = require('../middleware/validators');
const { deviceLimiter, apiLimiter } = require('../middleware/rateLimiter');

/**
 * @route   GET /api/devices
 * @desc    Get all devices with filters
 * @access  Private (Admin/Manager)
 */
router.get('/', auth, apiLimiter, cacheMiddleware(30), deviceController.getDeviceInventory);

/**
 * @route   POST /api/devices/heartbeat
 * @desc    Device heartbeat/registration
 * @access  Public (Rate-limited)
 */
router.post('/heartbeat', deviceLimiter, validateDeviceHeartbeat, deviceController.heartbeat);

/**
 * @route   GET /api/devices/:imei
 * @desc    Get single device details
 * @access  Private
 */
router.get('/:imei', auth, apiLimiter, deviceController.getDeviceDetails);

// Note: Additional device actions (block, bulk-update) should also move to controller
// I'll keep them here for now but simplified or move them in next step

module.exports = router;