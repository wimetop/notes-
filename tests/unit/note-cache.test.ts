import { describe, expect, it } from 'vitest';

import { parseCachedNotes } from '@/entities/note/api/note-cache';

describe('note cache parser', () => {
  it('treats corrupt JSON as a cache miss', () => {
    expect(parseCachedNotes('{bad-json')).toBeNull();
  });

  it('treats values that do not match the note DTO as a cache miss', () => {
    expect(parseCachedNotes(JSON.stringify([{ id: 'not-a-uuid' }]))).toBeNull();
  });
});
