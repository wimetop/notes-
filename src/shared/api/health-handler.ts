type DependencyCheck = () => Promise<unknown>;

export function createHealthHandler(
  checkDatabase: DependencyCheck,
  checkRedis: DependencyCheck,
): () => Promise<Response> {
  return async (): Promise<Response> => {
    const [database, redis] = await Promise.allSettled([checkDatabase(), checkRedis()]);
    const dbAvailable = database.status === 'fulfilled';
    const redisAvailable = redis.status === 'fulfilled';

    if (dbAvailable && redisAvailable) {
      return Response.json({ status: 'ok', db: true, redis: true });
    }

    console.error('Healthcheck failed', { database, redis });
    return Response.json(
      { status: 'unavailable', db: dbAvailable, redis: redisAvailable },
      { status: 503 },
    );
  };
}
