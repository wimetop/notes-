import { describe, expect, it, vi } from 'vitest';

import { createPurgeTrashJob } from '@/worker/jobs/purge-trash-core';

describe('trash purge job', () => {
  it('invalidates each affected user cache once even if several notes are deleted', async () => {
    const execute = vi.fn().mockResolvedValue({
      rows: [{ user_id: 'user-a' }, { user_id: 'user-a' }, { user_id: 'user-b' }],
    });
    const invalidate = vi.fn().mockResolvedValue(undefined);
    const purgeTrash = createPurgeTrashJob({ execute, invalidate, ttlDays: 30, log: vi.fn() });

    await expect(purgeTrash()).resolves.toBe(3);
    expect(invalidate).toHaveBeenCalledTimes(2);
    expect(invalidate).toHaveBeenCalledWith('user-a');
    expect(invalidate).toHaveBeenCalledWith('user-b');
  });
});
