import { describe, expect, it } from 'vitest';

import { createRequireAuthSession } from '@/shared/lib/auth-session';

describe('createRequireAuthSession', () => {
  it('throws 401 when the session has no user', async () => {
    const requireAuthSession = createRequireAuthSession(async () => null);

    await expect(requireAuthSession()).rejects.toMatchObject({ status: 401 });
  });

  it('returns only the authenticated user identity', async () => {
    const requireAuthSession = createRequireAuthSession(async () => ({
      user: { id: 'user-a', email: 'a@example.com', name: 'A' }
    }));

    await expect(requireAuthSession()).resolves.toEqual({ id: 'user-a', email: 'a@example.com' });
  });
});
