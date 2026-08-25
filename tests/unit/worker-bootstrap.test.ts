import { describe, expect, it, vi } from 'vitest';

import { startWorker } from '@/worker/bootstrap';

describe('startWorker', () => {
  it('closes every resource and reports startup failure when scheduling rejects', async () => {
    const closeWorker = vi.fn().mockResolvedValue(undefined);
    const closeQueue = vi.fn().mockResolvedValue(undefined);
    const quitRedis = vi.fn().mockResolvedValue(undefined);
    const endPool = vi.fn().mockResolvedValue(undefined);
    const error = vi.fn();

    await expect(startWorker({
      schedule: vi.fn().mockRejectedValue(new Error('Redis unavailable')),
      closeWorker,
      closeQueue,
      quitRedis,
      endPool,
      error,
    })).resolves.toBe(false);

    expect(closeWorker).toHaveBeenCalledOnce();
    expect(closeQueue).toHaveBeenCalledOnce();
    expect(quitRedis).toHaveBeenCalledOnce();
    expect(endPool).toHaveBeenCalledOnce();
    expect(error).toHaveBeenCalledOnce();
  });
});
