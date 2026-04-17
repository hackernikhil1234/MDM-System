require('dotenv').config();
const mongoose = require('mongoose');
const { updateQueue } = require('../services/queue');
const logger = require('../middleware/logger');

// Mongoose Models
const UpdateJob = require('../models/UpdateJob');

// Connect to Database independently for the worker
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mdm_system';
mongoose.connect(MONGO_URI)
  .then(() => logger.info('✅ Worker connected to MongoDB'))
  .catch(err => {
    logger.error('Worker MongoDB connection error', err);
    process.exit(1);
  });

logger.info('🚀 Update Worker started, waiting for jobs...');

// Concurrency set to 10 parallel processed devices
updateQueue.process(10, async (job) => {
  const data = job.data;
  
  logger.info(`Started processing update for IMEI: ${data.deviceImei}`);

  // Try to find the document in MongoDB
  const updateDoc = await UpdateJob.findOne({ 
    deviceImei: data.deviceImei, 
    scheduleId: data.scheduleId 
  });

  if (!updateDoc) {
    throw new Error(`Orphaned Job: No UpdateJob found for ${data.deviceImei}`);
  }

  // Simulate pushing notification to device over APNS/FCM
  // In a real scenario, this would send an MQTT/Socket event
  
  updateDoc.currentState = 'notified';
  updateDoc.timeline.push({
    state: 'notified',
    timestamp: new Date(),
    metadata: { via: 'Background Message Queue' }
  });

  await updateDoc.save();

  logger.info(`Successfully notified IMEI: ${data.deviceImei} in background queue`);
  
  // Job cleanly completes, handled gracefully by Bull
  return true;
});
