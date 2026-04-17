const express = require('express');
const router = express.Router();
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const auth = require('../middleware/auth');

// Admin-only middleware
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Admin access required' });
  }
  next();
};

// GET /api/users — list all users (admin only)
router.get('/', auth, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/users/:id/role — change user role (admin only)
router.put('/:id/role', auth, adminOnly, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['admin', 'manager', 'viewer'].includes(role)) {
      return res.status(400).json({ success: false, error: 'Invalid role' });
    }
    if (req.params.id === req.user.id.toString()) {
      return res.status(400).json({ success: false, error: 'Cannot change your own role' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    try {
      await AuditLog.create({
        action: 'USER_ROLE_CHANGED',
        entityType: 'user',
        entityId: user.id,
        entityName: user.name,
        userId: req.user.id,
        userName: req.user.name,
        changes: { role, previousRole: req.body.previousRole },
      });
    } catch (e) { /* non-fatal */ }

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/users/:id/toggle — activate/deactivate user (admin only)
router.put('/:id/toggle', auth, adminOnly, async (req, res) => {
  try {
    if (req.params.id === req.user.id.toString()) {
      return res.status(400).json({ success: false, error: 'Cannot deactivate yourself' });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    user.isActive = !user.isActive;
    await user.save();

    try {
      await AuditLog.create({
        action: user.isActive ? 'USER_CREATED' : 'USER_UPDATED',
        entityType: 'user',
        entityId: user.id,
        entityName: user.name,
        userId: req.user.id,
        userName: req.user.name,
        changes: { isActive: user.isActive },
      });
    } catch (e) { /* non-fatal */ }

    res.json({ success: true, user: { ...user.toObject(), password: undefined } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/users/:id — delete user (admin only)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    if (req.params.id === req.user.id.toString()) {
      return res.status(400).json({ success: false, error: 'Cannot delete yourself' });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    try {
      await AuditLog.create({
        action: 'USER_UPDATED',
        entityType: 'user',
        entityId: req.params.id,
        entityName: user.name,
        userId: req.user.id,
        userName: req.user.name,
        changes: { deleted: true },
      });
    } catch (e) { /* non-fatal */ }

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/users/:id/password — change own password
router.put('/:id/password', auth, async (req, res) => {
  try {
    if (req.params.id !== req.user.id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }
    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ success: false, error: 'New password must be at least 8 characters' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    // Only require current password if changing own password (not admin changing another's)
    if (req.params.id === req.user.id.toString()) {
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) return res.status(400).json({ success: false, error: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
