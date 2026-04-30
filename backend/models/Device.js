const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  imei: {
    type: String,
    required: true,
    unique: true,
    index: true,
    trim: true,
    minlength: 14,
    maxlength: 16
  },
  appVersion: {
    type: String,
    required: true,
    trim: true
  },
  appVersionCode: {
    type: Number,
    required: true
  },
  deviceOS: {
    type: String,
    required: true,
    enum: ['android', 'ios', 'windows', 'macos', 'linux'],
    lowercase: true
  },
  deviceModel: {
    type: String,
    trim: true
  },
  lastOpenTime: {
    type: Date,
    default: Date.now
  },
  location: {
    region: { type: String, trim: true },
    city: { type: String, trim: true },
    lastKnownLatitude: Number,
    lastKnownLongitude: Number
  },
  clientCustomization: {
    type: String,
    default: 'default',
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'blocked'],
    default: 'active'
  },
  metadata: {
    batteryLevel: { type: Number, min: 0, max: 100 },
    storageAvailable: Number,
    networkType: String
  }
}, {
  timestamps: true
});

// Enterprise Data Indexes for High-Performance Queries
deviceSchema.index({ status: 1, lastOpenTime: -1 });
deviceSchema.index({ 'location.region': 1, status: 1 });
deviceSchema.index({ appVersion: 1, appVersionCode: -1 });
deviceSchema.index({ lastOpenTime: -1 });

module.exports = mongoose.model('Device', deviceSchema);