const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { authenticator } = require('otplib');
const qrcode = require('qrcode');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const auth = require('../middleware/auth');


// Register first admin (run once)
router.post('/setup', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) {
      return res.status(400).json({ success: false, error: 'Admin already exists' });
    }
    const user = new User({ name, email, password, role: 'admin' });
    await user.save();
    res.json({ success: true, message: 'Admin created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Register new user (viewer by default, manager if approved)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, organization } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email, and password are required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, error: 'Password must be at least 8 characters' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'An account with this email already exists' });
    }

    // Create user with viewer role (admin can upgrade later)
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: 'viewer',
      isActive: true,
    });

    await user.save();

    // Log the registration (non-blocking)
    try {
      await AuditLog.create({
        action: 'USER_REGISTERED',
        entityType: 'user',
        entityId: user.id,
        userId: user.id,
        userName: user.name,
        changes: { email: user.email, organization: organization || 'N/A' }
      });
    } catch (auditErr) {
      console.warn('Audit log error (non-fatal):', auditErr.message);
    }

    // Auto-login after registration
    const token = jwt.sign(
      { user: { id: user.id, email: user.email, role: user.role } },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

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
    res.status(500).json({ success: false, error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  console.log('='.repeat(50));
  console.log('Login attempt received');
  console.log('Request body:', req.body);
  console.log('Time:', new Date().toISOString());
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    // 2FA Intercept
    if (user.twoFactorEnabled) {
      return res.json({
        success: true,
        requires2FA: true,
        userId: user.id,
        message: 'Two-factor authentication required'
      });
    }

    // Create token for non-2FA users
    const token = jwt.sign(
      { user: { id: user.id, email: user.email, role: user.role } },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    
    // Log the action
    await AuditLog.create({
      action: 'USER_LOGIN',
      entityType: 'user',
      entityId: user.id,
      userId: user.id,
      userName: user.name,
      metadata: { email: user.email, method: 'password_only' }
    });
    
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
    res.status(500).json({ success: false, error: error.message });
  }
});

// Verify 2FA to complete login logic natively
router.post('/verify-2fa', async (req, res) => {
  try {
    const { userId, token: otpToken } = req.body;
    const user = await User.findById(userId);

    if (!user || (!user.twoFactorEnabled && !user.twoFactorSecret)) {
      return res.status(400).json({ success: false, error: '2FA verification denied' });
    }

    const isValid = authenticator.check(otpToken, user.twoFactorSecret);
    if (!isValid) {
      return res.status(401).json({ success: false, error: 'Invalid 2FA token' });
    }

    // Enable 2FA permanently if testing activation
    if (!user.twoFactorEnabled) {
      user.twoFactorEnabled = true;
      await user.save();
    }

    user.lastLogin = new Date();
    await user.save();

    const jwtToken = jwt.sign(
      { user: { id: user.id, email: user.email, role: user.role } },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Secure audit trail
    await AuditLog.create({
      action: 'USER_LOGIN',
      entityType: 'user',
      entityId: user.id,
      userId: user.id,
      userName: user.name,
      changes: { via_totp: true }
    });

    res.json({
      success: true,
      token: jwtToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Generate 2FA Secret for Settings
router.get('/2fa/generate', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    // Don't override if already secured
    if (user.twoFactorEnabled) {
      return res.status(400).json({ success: false, error: '2FA is already fully managed.' });
    }

    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri(user.email, 'MDM Enterprise Portal', secret);
    const imageUrl = await qrcode.toDataURL(otpauth);

    user.twoFactorSecret = secret;
    await user.save();

    res.json({ success: true, secret, qr: imageUrl });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Verify token
router.get('/verify', async (req, res) => {
  try {
    const token = req.header('x-auth-token');
    if (!token) {
      return res.status(401).json({ success: false, error: 'No token' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.user.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ success: false, error: 'User not found' });
    }
    
    res.json({ success: true, user });
  } catch (error) {
    res.status(401).json({ success: false, error: 'Invalid token' });
  }
});

module.exports = router;