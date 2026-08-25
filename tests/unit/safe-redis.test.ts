import { describe, expect, it } from 'vitest';

import { createSafeRedis } from '@/shared/redis/safe-redis-core';

describe('safe Redis fallback', () => {
  it('returns null when Redis read rejects, allowing the database fallback', async () => {
    const safeRedis = createSafeRedis({ get: async () => { throw new Error('Redis unavailable'); }, set: async () => undefined, del: async () => 0, scan: async () => ['0', []] });
    await expect(safeRedis.get('notes:v1:list:user-a')).resolves.toBeNull();
  });
});
