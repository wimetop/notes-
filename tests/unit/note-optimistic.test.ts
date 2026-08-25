import { describe, expect, it } from 'vitest';

import { removeNoteFromActiveList } from '@/entities/note/api/note-optimistic';

describe('removeNoteFromActiveList', () => {
  it('removes only the trashed note from an active list', () => {
    const notes = [{ id: 'a' }, { id: 'b' }];
    expect(removeNoteFromActiveList(notes, 'a')).toEqual([{ id: 'b' }]);
  });
});
