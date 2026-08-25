import { redis } from './client';
import { createSafeRedis } from './safe-redis-core';

export { createSafeRedis } from './safe-redis-core';
export const safeRedis = createSafeRedis(redis);
