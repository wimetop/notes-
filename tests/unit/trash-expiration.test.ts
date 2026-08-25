import { describe, expect, it } from 'vitest';

import { isTrashExpired } from '@/entities/note/model/trash-expiration';

describe('isTrashExpired', () => {
  it('returns true when the deletion date is older than the TTL', () => {
    expect(isTrashExpired(new Date('2026-08-01T00:00:00Z'), 7, new Date('2026-08-09T00:00:00Z'))).toBe(true);
  });

  it('keeps a deletion exactly at the TTL boundary', () => {
    expect(isTrashExpired(new Date('2026-08-02T00:00:00Z'), 7, new Date('2026-08-09T00:00:00Z'))).toBe(false);
  });
});
