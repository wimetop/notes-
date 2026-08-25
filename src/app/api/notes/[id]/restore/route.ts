import { noteIdSchema, restoreNote } from '@/entities/note';
import { toRouteErrorResponse } from '../../../route-errors';
import { requireAuthSession } from '@/shared/lib';

export async function POST(_: Request, context: { params: Promise<{ id: string }> }): Promise<Response> {
  try {
    const user = await requireAuthSession();
    const noteId = noteIdSchema.parse((await context.params).id);
    return Response.json(await restoreNote(user.id, noteId));
  } catch (error) {
    return toRouteErrorResponse(error);
  }
}
