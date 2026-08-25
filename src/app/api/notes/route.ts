import { createNote, createNoteSchema, getActiveNotes, noteQuerySchema } from '@/entities/note';
import { toRouteErrorResponse } from '../route-errors';
import { requireAuthSession } from '@/shared/lib';

export async function GET(request: Request): Promise<Response> {
  try {
    const user = await requireAuthSession();
    const query = noteQuerySchema.strict().parse({ q: new URL(request.url).searchParams.get('q') ?? undefined });
    return Response.json(await getActiveNotes(user.id, query.q));
  } catch (error) {
    return toRouteErrorResponse(error);
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const user = await requireAuthSession();
    const input = createNoteSchema.strict().parse(await request.json());
    return Response.json(await createNote(user.id, input), { status: 201 });
  } catch (error) {
    return toRouteErrorResponse(error);
  }
}
