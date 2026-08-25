import { z } from 'zod';

import type { notes } from '@/shared/db';

type Note = typeof notes.$inferSelect;

const cachedNotesSchema = z.array(z.object({
  id: z.string().uuid(),
  userId: z.string(),
  title: z.string(),
  body: z.string().nullable(),
  deletedAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
}));

export function parseCachedNotes(value: string): Note[] | null {
  try {
    return cachedNotesSchema.parse(JSON.parse(value));
  } catch {
    return null;
  }
}
