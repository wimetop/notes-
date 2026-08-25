import { describe, expect, it } from 'vitest';
import { createNoteSchema, updateNoteSchema } from '@/entities/note/model/schema';

describe('note DTO security validation', () => {
  it('rejects mass-assignment fields', () => {
    expect(() => createNoteSchema.parse({ title: 'Safe', userId: 'attacker', deletedAt: '2026-01-01' })).toThrow();
  });
  it('rejects blank and oversized note fields', () => {
    expect(() => createNoteSchema.parse({ title: '   ' })).toThrow();
    expect(() => createNoteSchema.parse({ title: 'x'.repeat(121) })).toThrow();
    expect(() => createNoteSchema.parse({ title: 'Safe', body: 'x'.repeat(5001) })).toThrow();
  });
  it('allows partial edit but rejects an empty update', () => {
    expect(updateNoteSchema.parse({ body: 'Only body' })).toEqual({ body: 'Only body' });
    expect(() => updateNoteSchema.parse({})).toThrow();
  });
});
