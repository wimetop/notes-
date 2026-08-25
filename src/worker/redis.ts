import Redis from 'ioredis';
import { getEnv } from '@/shared/config';

export const workerRedis = new Redis(getEnv().REDIS_URL, { maxRetriesPerRequest: null, enableReadyCheck: false });
workerRedis.on('error', (error: Error) => console.error('Worker Redis error', error));
