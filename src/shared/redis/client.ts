import Redis from 'ioredis';

import { getEnv } from '@/shared/config';

export const redis = new Redis(getEnv().REDIS_URL, {
  lazyConnect: true,
  maxRetriesPerRequest: 1,
  enableOfflineQueue: false,
  connectTimeout: 1_000,
  retryStrategy: (attempt) => Math.min(attempt * 100, 1_000)
});

redis.on('error', (error: Error) => {
  console.error('Redis cache client error', error);
});
