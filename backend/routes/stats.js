const express = require('express');
const router = express.Router();
const Device = require('../models/Device');
const Schedule = require('../models/UpdateSchedule');
const UpdateJob = require('../models/UpdateJob');
const AuditLog = require('../models/AuditLog');
const Version = require('../models/AppVersion');
const auth = require('../middleware/auth');
const { cacheMiddleware } = require('../middleware/cache');

// GET /api/stats — live dashboard statistics
// Cached for 30 seconds to massively reduce aggregate DB load
router.get('/', auth, cacheMiddleware(30), async (req, res) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

    const [
      totalDevices,
      activeDevices,
      blockedDevices,
      totalVersions,
      activeVersions,
      totalSchedules,
      activeSchedules,
      completedSchedules,
      recentJobs,
      recentAudit,
      devicesByRegion,
      devicesByVersion,
    ] = await Promise.all([
      Device.countDocuments(),
      Device.countDocuments({ status: 'active' }),
      Device.countDocuments({ status: 'blocked' }),
      Version.countDocuments(),
      Version.countDocuments({ isActive: true }),
      Schedule.countDocuments(),
      Schedule.countDocuments({ status: { $in: ['in_progress', 'pending'] } }),
      Schedule.countDocuments({ status: 'completed' }),
      UpdateJob.find({ createdAt: { $gte: sevenDaysAgo } }).lean(),
      AuditLog.find({ timestamp: { $gte: thirtyDaysAgo } }).sort({ timestamp: -1 }).limit(100).lean(),
      Device.aggregate([{ $group: { _id: '$region', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 10 }]),
      Device.aggregate([{ $group: { _id: '$currentVersionCode', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 5 }]),
    ]);

    // Latest version
    const latestVersion = await Version.findOne({ isActive: true }).sort({ createdAt: -1 });

    // Calculate update success rate from recent jobs
    const totalJobs = recentJobs.length;
    const successJobs = recentJobs.filter(j => j.currentState === 'installation_completed').length;
    const failedJobs = recentJobs.filter(j => j.currentState === 'failed').length;
    const successRate = totalJobs > 0 ? Math.round((successJobs / totalJobs) * 100) : 100;

    // Build daily audit stats for charting (last 7 days)
    const dailyStats = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date(now);
      day.setDate(day.getDate() - i);
      const dayStart = new Date(day.setHours(0, 0, 0, 0));
      const dayEnd = new Date(day.setHours(23, 59, 59, 999));
      const dayLogs = recentAudit.filter(log => {
        const t = new Date(log.timestamp);
        return t >= dayStart && t <= dayEnd;
      });
      dailyStats.push({
        date: dayStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        updates: dayLogs.filter(l => l.action.startsWith('UPDATE') || l.action.startsWith('SCHEDULE')).length,
        devices: dayLogs.filter(l => l.action.startsWith('DEVICE')).length,
        errors: dayLogs.filter(l => l.status === 'failure').length,
        total: dayLogs.length,
      });
    }

    res.json({
      success: true,
      stats: {
        totalActive: activeDevices,
        totalDevices,
        activeDevices,
        blockedDevices,
        inactiveDevices: totalDevices - activeDevices - blockedDevices,
        totalVersions,
        activeVersions,
        totalSchedules,
        activeSchedules,
        completedSchedules,
        totalJobs,
        successJobs,
        failedJobs,
        successRate,
        latestVersion: latestVersion?.versionName || '1.0',
        latestVersionCode: latestVersion?.versionCode || 0,
        devicesByRegion,
        devicesByVersion,
        dailyStats,
      },
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;