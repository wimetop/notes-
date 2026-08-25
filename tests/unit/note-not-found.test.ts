import { describe, expect, it } from 'vitest';

import { NoteNotFoundError } from '@/entities/note/api/errors';

describe('NoteNotFoundError', () => {
  it('is distinguishable from other failures without exposing ownership', () => {
    expect(new NoteNotFoundError()).toMatchObject({ name: 'NoteNotFoundError' });
  });
});
