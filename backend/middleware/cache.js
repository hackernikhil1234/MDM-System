const redis = require('redis');
const logger = require('./logger');

// Setup Redis Client natively
let client;

// We connect only if REDIS_URL is provided to gracefully handle local/test environments
if (process.env.REDIS_URL) {
  client = redis.createClient({
    url: process.env.REDIS_URL
  });

  client.on('error', (err) => logger.error('Redis Client Error', err));
  client.on('connect', () => logger.info('✅ Connected to Cache Layer (Redis)'));

  client.connect().catch(err => {
    logger.error('Failed to connect to Redis', err);
    client = null;
  });
} else {
  logger.warn('⚠️ No REDIS_URL provided. Cache layer remains disabled.');
}

// Generate unique cache keys based on query, route, and USER ID
const generateKey = (req) => {
  const userId = req.user ? req.user.id : 'public';
  return `rpcache:${userId}:${req.originalUrl || req.url}`;
};

/**
 * Enterprise Cache Middleware
 * @param {number} duration - Time to live in seconds
 */
const cacheMiddleware = (duration = 60) => {
  return async (req, res, next) => {
    // Skip caching if redis is down or not a GET request
    if (!client || !client.isReady || req.method !== 'GET') return next();

    const key = generateKey(req);

    try {
      const cachedData = await client.get(key);
      
      if (cachedData) {
        return res.json(JSON.parse(cachedData));
      }

      // Hijack response writing, caching it for next time
      const originalJson = res.json.bind(res);
      res.json = (data) => {
        if (res.statusCode === 200) {
          // Cache data asynchronously to not block returning the response
          client.setEx(key, duration, JSON.stringify(data)).catch(e => logger.error('Cache set fail', e));
        }
        originalJson(data);
      };
      
      next();
    } catch (err) {
      logger.error('Cache middleware error:', err);
      next(); // Fail gracefully and proceed
    }
  };
};

/**
 * Expose invalidator logic for write endpoints (PUT, POST, DELETE)
 */
const invalidateCache = async (pattern) => {
  if (!client || !client.isReady) return;
  try {
    // Using SCAN instead of KEYS for production safety
    let cursor = 0;
    do {
      const reply = await client.scan(cursor, { MATCH: pattern, COUNT: 100 });
      cursor = reply.cursor;
      if (reply.keys.length > 0) {
        await client.del(reply.keys);
        logger.info(`Invalidated ${reply.keys.length} keys for pattern: ${pattern}`);
      }
    } while (cursor !== 0);
  } catch (err) {
    logger.error('Cache invalidation error:', err);
  }
};

module.exports = { client, cacheMiddleware, invalidateCache };

