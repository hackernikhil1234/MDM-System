const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const { deviceLimiter, apiLimiter } = require('../middleware/rateLimiter');
const { validateLogin } = require('../middleware/validators');

/**
 * @route   POST /api/auth/setup
 * @desc    Initial admin setup (Run once)
 * @access  Public (Protected by SETUP_KEY)
 */
router.post('/setup', apiLimiter, authController.setup);

/**
 * @route   POST /api/auth/register
 * @desc    Register new viewer
 * @access  Public
 */
router.post('/register', apiLimiter, authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
router.post('/login', deviceLimiter, validateLogin, authController.login);

/**
 * @route   POST /api/auth/verify-2fa
 * @desc    Complete login with TOTP
 * @access  Public
 */
router.post('/verify-2fa', deviceLimiter, authController.verify2FA);

/**
 * @route   GET /api/auth/2fa/generate
 * @desc    Generate TOTP secret
 * @access  Private
 */
router.get('/2fa/generate', auth, apiLimiter, authController.generate2FA);

/**
 * @route   GET /api/auth/verify
 * @desc    Verify session token
 * @access  Private
 */
router.get('/verify', auth, apiLimiter, authController.verifyToken);

module.exports = router;