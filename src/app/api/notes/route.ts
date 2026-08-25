import { createNote, createNoteSchema, getActiveNotes, getTrashNotes, noteQuerySchema } from '@/entities/note';
import { toRouteErrorResponse } from '../route-errors';
import { requireAuthSession } from '@/shared/lib';

export async function GET(request: Request): Promise<Response> {
  try {
    const user = await requireAuthSession();
    const parameters = new URL(request.url).searchParams;
    const query = noteQuerySchema.strict().parse({ q: parameters.get('q') ?? undefined, trash: parameters.get('trash') ?? undefined });
    return Response.json(query.trash === 'true' ? await getTrashNotes(user.id) : await getActiveNotes(user.id, query.q));
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
