const AuditLog = require('../models/AuditLog');
const logger = require('../middleware/logger');

// Get audit logs with advanced filters and pagination
exports.getAuditLogs = async (req, res) => {
  try {
    const { 
      entityType, 
      entityId, 
      userId, 
      action,
      startDate, 
      endDate, 
      page = 1, 
      limit = 50 
    } = req.query;

    const query = {};
    if (entityType) query.entityType = entityType;
    if (entityId) query.entityId = entityId;
    if (userId) query.userId = userId;
    if (action) query.action = action;
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const logs = await AuditLog.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .lean();

    const total = await AuditLog.countDocuments(query);

    // Get unique actions and entity types for UI filters
    const uniqueActions = await AuditLog.distinct('action');
    
    res.json({
      success: true,
      logs,
      filters: {
        actions: uniqueActions,
        entityTypes: ['device', 'version', 'schedule', 'job', 'user']
      },
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error('Get audit logs error:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve audit logs' });
  }
};

// Get device timeline
exports.getDeviceTimeline = async (req, res) => {
  try {
    const logs = await AuditLog.find({
      entityType: 'device',
      entityId: req.params.imei
    }).sort({ timestamp: -1 }).lean();

    res.json({ success: true, timeline: logs });
  } catch (error) {
    logger.error('Get device timeline error:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve device timeline' });
  }
};

// Clear logs older than X days (Maintenance)
exports.clearOldLogs = async (req, res) => {
  try {
    const days = parseInt(req.body.days) || 90;
    const date = new Date();
    date.setDate(date.getDate() - days);

    const result = await AuditLog.deleteMany({ timestamp: { $lt: date } });
    
    logger.info(`Audit cleanup: Removed ${result.deletedCount} logs older than ${days} days by ${req.user.email}`);
    
    res.json({ 
      success: true, 
      message: `Successfully cleared ${result.deletedCount} logs older than ${days} days.`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    logger.error('Audit cleanup error:', error);
    res.status(500).json({ success: false, error: 'Audit cleanup failed' });
  }
};