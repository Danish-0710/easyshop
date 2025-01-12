import { Request, Response, NextFunction } from 'express';
import Redis from 'ioredis';
import { config } from '../config';
import { logger } from '../utils/logger';

const redis = new Redis(config.redis.uri);

redis.on('error', (err) => {
  logger.error('Redis connection error:', err);
});

redis.on('connect', () => {
  logger.info('Connected to Redis');
});

export const cacheMiddleware = (prefix: string, ttl = config.redis.ttl) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'GET') {
      return next();
    }

    try {
      const key = `${prefix}:${req.originalUrl}`;
      const cachedData = await redis.get(key);

      if (cachedData) {
        logger.debug(`Cache hit for ${key}`);
        return res.json(JSON.parse(cachedData));
      }

      const originalJson = res.json;
      res.json = function (data) {
        try {
          redis.setex(key, ttl, JSON.stringify(data))
            .catch(err => logger.error('Redis set error:', err));
        } catch (err) {
          logger.error('Cache serialization error:', err);
        }
        return originalJson.call(this, data);
      };

      logger.debug(`Cache miss for ${key}`);
      next();
    } catch (err) {
      logger.error('Cache middleware error:', err);
      next();
    }
  };
};

export const clearCache = async (pattern: string) => {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
      logger.info(`Cleared cache for pattern: ${pattern}`);
    }
  } catch (err) {
    logger.error('Clear cache error:', err);
  }
};
