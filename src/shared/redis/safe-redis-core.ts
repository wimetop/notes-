type RedisOperations = {
  status?: string;
  connect?: () => Promise<unknown>;
  get(key: string): Promise<string | null>;
  set(key: string, value: string, mode: 'EX', ttl: number): Promise<unknown>;
  del(...keys: string[]): Promise<unknown>;
  scan(cursor: string, mode: 'MATCH', pattern: string, countMode: 'COUNT', count: number): Promise<[string, string[]]>;
};

function logRedisError(operation: string, error: unknown): void {
  console.error(`Redis ${operation} failed`, error);
}

async function connectIfLazy(redis: RedisOperations): Promise<void> {
  if (redis.status === 'wait' && redis.connect !== undefined) await redis.connect();
}

export function createSafeRedis(redis: RedisOperations) {
  return {
    async get(key: string): Promise<string | null> {
      try {
        await connectIfLazy(redis);
        return await redis.get(key);
      } catch (error) {
        logRedisError('get', error);
        return null;
      }
    },
    async set(key: string, value: string, ttlSeconds: number): Promise<void> {
      try {
        await connectIfLazy(redis);
        await redis.set(key, value, 'EX', ttlSeconds);
      } catch (error) {
        logRedisError('set', error);
      }
    },
    async del(key: string): Promise<void> {
      try {
        await connectIfLazy(redis);
        await redis.del(key);
      } catch (error) {
        logRedisError('del', error);
      }
    },
    async delPattern(pattern: string): Promise<void> {
      try {
        await connectIfLazy(redis);
        let cursor = '0';
        do {
          const [next, keys] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
          cursor = next;
          if (keys.length > 0) await redis.del(...keys);
        } while (cursor !== '0');
      } catch (error) {
        logRedisError('delPattern', error);
      }
    },
  };
}
