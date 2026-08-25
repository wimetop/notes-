import { describe, expect, it } from 'vitest';

import { getNotesCacheKey } from '@/entities/note/model/cache';

describe('getNotesCacheKey', () => {
  it('namespaces the active-list cache by user', () => {
    expect(getNotesCacheKey('user-a')).toBe('notes:v1:list:user-a');
  });
});
