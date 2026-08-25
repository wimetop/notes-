import Redis from 'ioredis';

import { getEnv } from '@/shared/config';

export const redis = new Redis(getEnv().REDIS_URL, {
  lazyConnect: true,
  maxRetriesPerRequest: 1
});

redis.on('error', (error: Error) => {
  console.error('Redis cache client error', error);
});
