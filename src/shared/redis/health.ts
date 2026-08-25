type RedisHealthClient = {
  status: string;
  connect(): Promise<unknown>;
  ping(): Promise<unknown>;
};

export function createRedisHealthCheck(redis: RedisHealthClient): () => Promise<void> {
  return async (): Promise<void> => {
    if (redis.status === 'wait') await redis.connect();
    await redis.ping();
  };
}
