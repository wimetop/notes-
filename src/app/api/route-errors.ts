import { ZodError } from 'zod';

import { NoteNotFoundError } from '@/entities/note';

export function toRouteErrorResponse(error: unknown): Response {
  if (error instanceof NoteNotFoundError) return Response.json({ error: 'Not found' }, { status: 404 });
  if (error instanceof ZodError) return Response.json({ error: 'Invalid request', issues: error.issues }, { status: 400 });
  if (error instanceof Response) return error;
  console.error('Unhandled API error', error);
  return Response.json({ error: 'Internal server error' }, { status: 500 });
}
