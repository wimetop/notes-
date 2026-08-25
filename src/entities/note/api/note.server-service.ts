import { and, desc, eq, ilike, isNotNull, isNull } from 'drizzle-orm';
import { z } from 'zod';

import { getNotesCacheKey, type CreateNoteInput, type UpdateNoteInput } from '@/entities/note/model';
import { db, notes } from '@/shared/db';
import { safeRedis } from '@/shared/redis';

import { NoteNotFoundError } from './errors';

const listTtlSeconds = 60;

export type Note = typeof notes.$inferSelect;

const cachedNotesSchema = z.array(z.object({
  id: z.string().uuid(),
  userId: z.string(),
  title: z.string(),
  body: z.string().nullable(),
  deletedAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date()
}));

function parseCachedNotes(value: string): Note[] | null {
  try {
    return cachedNotesSchema.parse(JSON.parse(value));
  } catch {
    return null;
  }
}

export async function invalidateUserNotesCache(userId: string): Promise<void> {
  await safeRedis.del(getNotesCacheKey(userId));
}

export async function getActiveNotes(userId: string, searchQuery?: string): Promise<Note[]> {
  const search = searchQuery?.trim();
  if (search === undefined || search === '') {
    const cacheKey = getNotesCacheKey(userId);
    const cached = await safeRedis.get(cacheKey);
    if (cached !== null) {
      const notesFromCache = parseCachedNotes(cached);
      if (notesFromCache !== null) return notesFromCache;
    }
    const activeNotes = await db.select().from(notes)
      .where(and(eq(notes.userId, userId), isNull(notes.deletedAt)))
      .orderBy(desc(notes.updatedAt));
    await safeRedis.set(cacheKey, JSON.stringify(activeNotes), listTtlSeconds);
    return activeNotes;
  }
  return db.select().from(notes)
    .where(and(eq(notes.userId, userId), isNull(notes.deletedAt), ilike(notes.title, `%${search}%`)))
    .orderBy(desc(notes.updatedAt));
}

export async function getTrashNotes(userId: string): Promise<Note[]> {
  return db.select().from(notes)
    .where(and(eq(notes.userId, userId), isNotNull(notes.deletedAt)))
    .orderBy(desc(notes.deletedAt));
}

export async function getNoteById(userId: string, noteId: string): Promise<Note> {
  const [note] = await db.select().from(notes)
    .where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
    .limit(1);
  if (note === undefined) throw new NoteNotFoundError();
  return note;
}

export async function createNote(userId: string, input: CreateNoteInput): Promise<Note> {
  const [note] = await db.insert(notes).values({ userId, ...input }).returning();
  if (note === undefined) throw new Error('Failed to create note');
  await invalidateUserNotesCache(userId);
  return note;
}

export async function updateNote(userId: string, noteId: string, input: UpdateNoteInput): Promise<Note> {
  const [note] = await db.update(notes).set({ ...input, updatedAt: new Date() })
    .where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
    .returning();
  if (note === undefined) throw new NoteNotFoundError();
  await invalidateUserNotesCache(userId);
  return note;
}

export async function moveToTrash(userId: string, noteId: string): Promise<Note> {
  const [note] = await db.update(notes).set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(notes.id, noteId), eq(notes.userId, userId), isNull(notes.deletedAt)))
    .returning();
  if (note === undefined) throw new NoteNotFoundError();
  await invalidateUserNotesCache(userId);
  return note;
}

export async function restoreNote(userId: string, noteId: string): Promise<Note> {
  const [note] = await db.update(notes).set({ deletedAt: null, updatedAt: new Date() })
    .where(and(eq(notes.id, noteId), eq(notes.userId, userId), isNotNull(notes.deletedAt)))
    .returning();
  if (note === undefined) throw new NoteNotFoundError();
  await invalidateUserNotesCache(userId);
  return note;
}
