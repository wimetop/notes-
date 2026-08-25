type DependencyCheck = () => Promise<unknown>;

export function createHealthHandler(
  checkDatabase: DependencyCheck,
  checkRedis: DependencyCheck,
): () => Promise<Response> {
  return async (): Promise<Response> => {
    try {
      await Promise.all([checkDatabase(), checkRedis()]);

      return Response.json({ status: 'ok', db: true, redis: true });
    } catch (error) {
      console.error('Healthcheck failed', error);

      return Response.json(
        { status: 'unavailable', db: false, redis: false },
        { status: 503 },
      );
    }
  };
}
