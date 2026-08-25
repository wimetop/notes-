import { describe, expect, it, vi } from 'vitest';

import { createRedisHealthCheck } from '@/shared/redis/health';

describe('Redis health check', () => {
  it('connects a lazy client before pinging it', async () => {
    const connect = vi.fn().mockResolvedValue(undefined);
    const ping = vi.fn().mockResolvedValue('PONG');
    const check = createRedisHealthCheck({ status: 'wait', connect, ping });

    await expect(check()).resolves.toBeUndefined();
    expect(connect).toHaveBeenCalledOnce();
    expect(ping).toHaveBeenCalledOnce();
  });
});
