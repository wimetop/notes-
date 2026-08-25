import { describe, expect, it } from 'vitest';

import { createNotesQueryClient } from '@/shared/lib/query-client';

describe('createNotesQueryClient', () => {
  it('keeps note data fresh for 30 seconds without focus refetches', () => {
    const client = createNotesQueryClient();
    expect(client.getDefaultOptions().queries).toMatchObject({ staleTime: 30_000, refetchOnWindowFocus: false });
  });
});
