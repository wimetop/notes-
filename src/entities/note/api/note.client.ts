import { z } from 'zod';

import type { CreateNoteInput, UpdateNoteInput } from '@/entities/note/model';

const noteSchema = z.object({
  id: z.string().uuid(), userId: z.string(), title: z.string(), body: z.string().nullable(),
  deletedAt: z.coerce.date().nullable(), createdAt: z.coerce.date(), updatedAt: z.coerce.date()
});
const noteListSchema = z.array(noteSchema);
type ClientNote = z.infer<typeof noteSchema>;
type Fetcher = typeof fetch;

async function parseResponse(response: Response): Promise<unknown> {
  if (!response.ok) {
    const error = z.object({ error: z.string().optional() }).safeParse(await response.json());
    throw new Error(error.success ? (error.data.error ?? 'Request failed') : 'Request failed');
  }
  return response.status === 204 ? undefined : response.json();
}

export function createNotesClient(fetcher: Fetcher) {
  return {
    async list(search?: string): Promise<ClientNote[]> {
      const parameters = new URLSearchParams();
      if (search?.trim()) parameters.set('q', search.trim());
      const query = parameters.toString();
      return noteListSchema.parse(await parseResponse(await fetcher(`/api/notes${query ? `?${query}` : ''}`)));
    },
    async trash(): Promise<ClientNote[]> { return noteListSchema.parse(await parseResponse(await fetcher('/api/notes?trash=true'))); },
    async get(id: string): Promise<ClientNote> { return noteSchema.parse(await parseResponse(await fetcher(`/api/notes/${id}`))); },
    async create(input: CreateNoteInput): Promise<ClientNote> { return noteSchema.parse(await parseResponse(await fetcher('/api/notes', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(input) }))); },
    async update(id: string, input: UpdateNoteInput): Promise<ClientNote> { return noteSchema.parse(await parseResponse(await fetcher(`/api/notes/${id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify(input) }))); },
    async trashNote(id: string): Promise<void> { await parseResponse(await fetcher(`/api/notes/${id}`, { method: 'DELETE' })); },
    async restore(id: string): Promise<ClientNote> { return noteSchema.parse(await parseResponse(await fetcher(`/api/notes/${id}/restore`, { method: 'POST' }))); }
  };
}

export const notesClient = createNotesClient(fetch);
export type { ClientNote };
