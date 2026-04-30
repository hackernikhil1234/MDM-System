const jwt = require('jsonwebtoken');
const { authenticator } = require('otplib');
const qrcode = require('qrcode');
const User = require('../models/User');
const logger = require('../middleware/logger');

// Generate JWT Helper
const generateToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }
  return jwt.sign(
    { user: { id: user.id, email: user.email, role: user.role } },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Register first admin (protected by ENV secret for safety)
exports.setup = async (req, res) => {
  try {
    const { email, password, name, setupKey } = req.body;
    
    // Safety check: require a setup key from environment to prevent unauthorized setup
    if (process.env.SETUP_KEY && setupKey !== process.env.SETUP_KEY) {
      return res.status(403).json({ success: false, error: 'Unauthorized setup attempt' });
    }

    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) {
      return res.status(400).json({ success: false, error: 'Admin already exists. Setup phase is closed.' });
    }

    const user = new User({ name, email, password, role: 'admin' });
    await user.save();
    
    logger.info(`Initial admin setup completed for: ${email}`);
    res.json({ success: true, message: 'Admin created successfully' });
  } catch (error) {
    logger.error('Setup error:', error);
    res.status(500).json({ success: false, error: 'Failed to complete initial setup' });
  }
};

// Register new user
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'An account with this email already exists' });
    }

    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: 'viewer',
      organization: req.body.organization || 'MDMCORE'
    });

    await user.save();

    const token = generateToken(user);
    
    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({ success: false, error: 'Internal server error during registration' });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password +twoFactorSecret');
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, error: 'Invalid credentials or account disabled' });
    }
    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    
    user.lastLogin = new Date();
    await user.save();
    
    if (user.twoFactorEnabled) {
      return res.json({
        success: true,
        requires2FA: true,
        userId: user.id,
        message: 'Two-factor authentication required'
      });
    }

    const token = generateToken(user);
    
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Login failed due to a server error' });
  }
};

// Verify 2FA
exports.verify2FA = async (req, res) => {
  try {
    const { userId, token: otpToken } = req.body;
    const user = await User.findById(userId).select('+twoFactorSecret');

    if (!user || !user.isActive || !user.twoFactorSecret) {
      return res.status(400).json({ success: false, error: '2FA verification denied' });
    }

    const isValid = authenticator.check(otpToken, user.twoFactorSecret);
    if (!isValid) {
      return res.status(401).json({ success: false, error: 'Invalid 2FA token' });
    }

    if (!user.twoFactorEnabled) {
      user.twoFactorEnabled = true;
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user);

    res.json({
      success: true,
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    logger.error('2FA Verification error:', err);
    res.status(500).json({ success: false, error: '2FA verification failed' });
  }
};

// Generate 2FA Secret
exports.generate2FA = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.twoFactorEnabled) {
      return res.status(400).json({ success: false, error: '2FA is already enabled' });
    }

    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri(user.email, 'MDMPortal Enterprise', secret);
    const imageUrl = await qrcode.toDataURL(otpauth);

    user.twoFactorSecret = secret;
    await user.save();

    res.json({ success: true, secret, qr: imageUrl });
  } catch (err) {
    logger.error('2FA Generation error:', err);
    res.status(500).json({ success: false, error: 'Failed to generate 2FA secret' });
  }
};

// Verify session token
exports.verifyToken = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, error: 'User session invalid or account disabled' });
    }
    res.json({ success: true, user });
  } catch (error) {
    res.status(401).json({ success: false, error: 'Invalid session' });
  }
};
