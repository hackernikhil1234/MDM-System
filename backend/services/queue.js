const Queue = require('bull');
const logger = require('../middleware/logger');

// We only initialize Redis if the URL is present to prevent invalid URL warnings in production
const REDIS_URL = process.env.REDIS_URL;

if (!REDIS_URL) {
  logger.warn('⚠️ No REDIS_URL provided. Background update queue is disabled.');
}

const updateQueue = new Queue('device-updates', REDIS_URL, {
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000 // 5s, 25s, 125s...
    },
    removeOnComplete: true
  }
});

updateQueue.on('error', (err) => {
  logger.error('Queue Error', err);
});

updateQueue.on('failed', (job, err) => {
  logger.error(`Job failed for Device ${job.data.deviceImei}`, err);
});

const publishUpdate = async (jobData) => {
  try {
    await updateQueue.add(jobData);
    logger.info(`Message added to queue: Update for IMEI ${jobData.deviceImei}`);
  } catch (error) {
    logger.error('Failed to add message to queue', error);
    throw error;
  }
};

module.exports = { updateQueue, publishUpdate };