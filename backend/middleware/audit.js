const AuditLog = require('../models/AuditLog');
const logger = require('./logger');

module.exports = (action, entityType) => {
  return async (req, res, next) => {
    const originalJson = res.json;
    
    res.json = function(data) {
      // Log successes and failures for full visibility
      const status = data.success ? 'success' : 'failure';

      // Capture metadata
      const auditData = {
        action,
        entityType,
        entityId: req.params.id || data[entityType]?._id || data.id,
        userId: req.user?.id,
        userName: req.user?.name || 'System/Unauthenticated',
        status,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        metadata: {
          method: req.method,
          path: req.path,
          query: req.query,
          statusCode: res.statusCode
        }
      };

      // Only log changes for mutations, and sanitize sensitive data
      if (req.method !== 'GET') {
        const sanitizedBody = { ...req.body };
        const sensitiveFields = ['password', 'token', 'secret', 'otp', 'apiKey'];
        sensitiveFields.forEach(field => delete sanitizedBody[field]);
        auditData.changes = sanitizedBody;
      }

      // Log the action asynchronously
      AuditLog.create(auditData).catch(err => logger.error('Audit log creation failed', err));
      
      originalJson.call(this, data);
    };
    
    next();
  };
};