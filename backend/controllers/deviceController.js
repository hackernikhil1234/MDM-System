const Device = require('../models/Device');
const AppVersion = require('../models/AppVersion');
const AuditLog = require('../models/AuditLog');
const logger = require('../middleware/logger');

// Register or update device heartbeat
exports.heartbeat = async (req, res) => {
  try {
    const { imei, appVersion, appVersionCode, deviceOS, deviceModel, location, batteryLevel, networkType } = req.body;

    let device = await Device.findOne({ imei });

    if (device) {
      if (device.status === 'blocked') {
        logger.warn(`Blocked device heartbeat attempt: ${imei}`);
        return res.status(403).json({ success: false, error: 'Device is blocked' });
      }

      // Update existing device
      device.appVersion = appVersion;
      device.appVersionCode = appVersionCode;
      device.deviceOS = deviceOS;
      device.deviceModel = deviceModel || device.deviceModel;
      device.lastOpenTime = new Date();
      device.location = location || device.location;
      device.metadata = { 
        batteryLevel: batteryLevel ?? device.metadata?.batteryLevel,
        networkType: networkType || device.metadata?.networkType 
      };
      device.status = 'active';
    } else {
      // Register new device
      device = new Device({
        imei,
        appVersion,
        appVersionCode,
        deviceOS,
        deviceModel,
        location,
        metadata: { batteryLevel, networkType }
      });
      logger.info(`New device registered: ${imei}`);
    }

    await device.save();

    // Check for available updates
    const latestVersion = await AppVersion.findOne({ isActive: true }).sort({ versionCode: -1 });
    
    let updateInfo = { available: false };
    if (latestVersion && latestVersion.versionCode > device.appVersionCode) {
      updateInfo = {
        available: true,
        versionCode: latestVersion.versionCode,
        versionName: latestVersion.versionName,
        mandatory: latestVersion.isMandatory,
        downloadUrl: latestVersion.downloadUrl,
        releaseNotes: latestVersion.releaseNotes,
        fileSize: latestVersion.fileSize
      };
    }

    res.json({
      success: true,
      device: {
        imei: device.imei,
        status: device.status,
        lastSync: device.lastOpenTime
      },
      updateInfo
    });
  } catch (error) {
    logger.error('Heartbeat controller error:', error);
    res.status(500).json({ success: false, error: 'Internal server error processing heartbeat' });
  }
};

// Get device inventory with advanced filters
exports.getDeviceInventory = async (req, res) => {
  try {
    const { 
      region, version, status, search, osVersions,
      batteryLevel, lastSeenDays, page = 1, limit = 20 
    } = req.query;
    
    const query = {};
    if (status && status !== 'all') query.status = status;
    if (region && region !== 'all') query['location.region'] = region;
    if (version && version !== 'all') query.appVersion = version;
    
    if (osVersions) {
      const osList = osVersions.split(',').filter(Boolean);
      if (osList.length) query.deviceOS = { $in: osList.map(os => new RegExp(os, 'i')) };
    }
    
    if (batteryLevel && batteryLevel !== 'all') {
      const levels = {
        critical: { $lt: 15 },
        low: { $gte: 15, $lte: 30 },
        good: { $gte: 30, $lte: 60 },
        excellent: { $gt: 60 }
      };
      if (levels[batteryLevel]) query['metadata.batteryLevel'] = levels[batteryLevel];
    }
    
    if (lastSeenDays && lastSeenDays !== 'all') {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(lastSeenDays));
      query.lastOpenTime = { $gte: daysAgo };
    }
    
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { imei: searchRegex },
        { deviceModel: searchRegex },
        { 'location.city': searchRegex },
        { 'location.region': searchRegex }
      ];
    }

    const total = await Device.countDocuments(query);
    const devices = await Device.find(query)
      .sort({ lastOpenTime: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .lean();

    // Aggregate statistics
    const stats = {
      totalActive: await Device.countDocuments({ status: 'active' }),
      totalInactive: await Device.countDocuments({ status: 'inactive' }),
      totalBlocked: await Device.countDocuments({ status: 'blocked' }),
      latestVersion: (await AppVersion.findOne().sort({ versionCode: -1 }).lean())?.versionCode || 0
    };

    res.json({
      success: true,
      devices,
      stats,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error('Get device inventory error:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve device inventory' });
  }
};

// Get device details
exports.getDeviceDetails = async (req, res) => {
  try {
    const device = await Device.findOne({ imei: req.params.imei }).lean();
    if (!device) {
      return res.status(404).json({ success: false, error: 'Device not found' });
    }
    
    const UpdateJob = require('../models/UpdateJob');
    const updateHistory = await UpdateJob.find({ deviceImei: device.imei })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
    
    res.json({ success: true, device, updateHistory });
  } catch (error) {
    logger.error('Get device details error:', error);
    res.status(500).json({ success: false, error: 'Error fetching device details' });
  }
};