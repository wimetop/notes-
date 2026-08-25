import { afterEach, describe, expect, it, vi } from 'vitest';

import { createSafeRedis } from '@/shared/redis/safe-redis-core';

describe('safe Redis fallback', () => {
  afterEach(() => vi.restoreAllMocks());

  it('returns null when Redis read rejects, allowing the database fallback', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const safeRedis = createSafeRedis({ get: async () => { throw new Error('Redis unavailable'); }, set: async () => undefined, del: async () => 0, scan: async () => ['0', []] });
    await expect(safeRedis.get('notes:v1:list:user-a')).resolves.toBeNull();
  });

  it('connects a lazy client before attempting a cache command', async () => {
    const connect = vi.fn().mockResolvedValue(undefined);
    const get = vi.fn().mockResolvedValue('cached');
    const safeRedis = createSafeRedis({
      status: 'wait',
      connect,
      get,
      set: async () => undefined,
      del: async () => 0,
      scan: async () => ['0', []],
    });

    await expect(safeRedis.get('notes:v1:list:user-a')).resolves.toBe('cached');
    expect(connect).toHaveBeenCalledOnce();
    expect(get).toHaveBeenCalledOnce();
  });
});
