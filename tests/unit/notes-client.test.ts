import { describe, expect, it } from 'vitest';

import { createNotesClient } from '@/entities/note/api/note.client';

describe('notes client', () => {
  it('encodes a search query when requesting notes', async () => {
    let requestedUrl = '';
    const client = createNotesClient(async (input) => {
      requestedUrl = String(input);
      return new Response('[]', { status: 200 });
    });
    await client.list('a & b');
    expect(requestedUrl).toContain('q=a+%26+b');
  });
});
