const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');


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
    
    // Create token
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
      metadata: { email: user.email }
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