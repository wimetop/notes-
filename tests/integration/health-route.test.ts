import { afterEach, describe, expect, it, vi } from 'vitest';
import { createHealthHandler } from '@/shared/api/health-handler';

describe('health handler', () => {
  afterEach(() => vi.restoreAllMocks());

  it('returns 200 only when database and Redis are reachable', async () => {
    const response = await createHealthHandler(async () => undefined, async () => 'PONG')();
    await expect(response.json()).resolves.toEqual({ status: 'ok', db: true, redis: true });
  });
  it('returns 503 if Redis fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const response = await createHealthHandler(async () => undefined, async () => { throw new Error('Redis unavailable'); })();
    expect(response.status).toBe(503);
  });
});
