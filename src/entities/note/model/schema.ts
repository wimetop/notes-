import { z } from 'zod';

export const noteIdSchema = z.uuid();
export const createNoteSchema = z.object({
  title: z.string().trim().min(1).max(120),
  body: z.string().max(5000).optional()
}).strict();
export const updateNoteSchema = createNoteSchema.partial().refine(
  (value) => value.title !== undefined || value.body !== undefined,
  { message: 'At least one editable field is required' }
);
export const noteQuerySchema = z.object({
  q: z.string().trim().max(120).optional(),
  trash: z.literal('true').optional()
}).strict();

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
