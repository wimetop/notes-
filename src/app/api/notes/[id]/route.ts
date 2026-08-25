import { getNoteById, moveToTrash, noteIdSchema, updateNote, updateNoteSchema } from '@/entities/note';
import { toRouteErrorResponse } from '../../route-errors';
import { requireAuthSession } from '@/shared/lib';

type RouteContext = { params: Promise<{ id: string }> };

async function getId(context: RouteContext): Promise<string> {
  return noteIdSchema.parse((await context.params).id);
}

export async function GET(_: Request, context: RouteContext): Promise<Response> {
  try {
    const user = await requireAuthSession();
    return Response.json(await getNoteById(user.id, await getId(context)));
  } catch (error) {
    return toRouteErrorResponse(error);
  }
}

export async function PATCH(request: Request, context: RouteContext): Promise<Response> {
  try {
    const user = await requireAuthSession();
    const input = updateNoteSchema.strict().parse(await request.json());
    return Response.json(await updateNote(user.id, await getId(context), input));
  } catch (error) {
    return toRouteErrorResponse(error);
  }
}

export async function DELETE(_: Request, context: RouteContext): Promise<Response> {
  try {
    const user = await requireAuthSession();
    await moveToTrash(user.id, await getId(context));
    return new Response(null, { status: 204 });
  } catch (error) {
    return toRouteErrorResponse(error);
  }
}
