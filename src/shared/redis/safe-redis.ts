import { redis } from './client';

function logRedisError(operation: string, error: unknown): void {
  console.error(`Redis ${operation} failed`, error);
}

export const safeRedis = {
  async get(key: string): Promise<string | null> {
    try {
      return await redis.get(key);
    } catch (error) {
      logRedisError('get', error);
      return null;
    }
  },
  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    try {
      await redis.set(key, value, 'EX', ttlSeconds);
    } catch (error) {
      logRedisError('set', error);
    }
  },
  async del(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch (error) {
      logRedisError('del', error);
    }
  },
  async delPattern(pattern: string): Promise<void> {
    try {
      let cursor = '0';
      do {
        const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
        cursor = nextCursor;
        if (keys.length > 0) await redis.del(...keys);
      } while (cursor !== '0');
    } catch (error) {
      logRedisError('delPattern', error);
    }
  }
};
