import { describe, expect, it } from 'vitest';

import { createNoteSchema, updateNoteSchema } from '@/entities/note/model/schema';

describe('note DTO schemas', () => {
  it.each(['', 'x'.repeat(121)])('rejects invalid create title %s', (title) => {
    expect(() => createNoteSchema.parse({ title })).toThrow();
  });

  it('rejects an update with no editable fields', () => {
    expect(() => updateNoteSchema.parse({})).toThrow();
  });

  it('accepts an optional body up to 5000 characters', () => {
    expect(createNoteSchema.parse({ title: 'Valid', body: 'x'.repeat(5000) })).toEqual({
      title: 'Valid',
      body: 'x'.repeat(5000)
    });
  });
});
