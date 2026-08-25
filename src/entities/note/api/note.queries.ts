'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { noteKeys, type CreateNoteInput, type UpdateNoteInput } from '@/entities/note/model';
import { notesClient, type ClientNote } from './note.client';
import { removeNoteFromActiveList } from './note-optimistic';

export const useNotesQuery = (search?: string) => useQuery({ queryKey: noteKeys.list(search), queryFn: () => notesClient.list(search) });
export const useNoteQuery = (id: string) => useQuery({ queryKey: noteKeys.detail(id), queryFn: () => notesClient.get(id) });
export const useTrashQuery = () => useQuery({ queryKey: noteKeys.trash(), queryFn: () => notesClient.trash() });
function invalidate(client: ReturnType<typeof useQueryClient>) { return client.invalidateQueries({ queryKey: noteKeys.all }); }
export function useCreateNote() { const client = useQueryClient(); return useMutation({ mutationFn: (input: CreateNoteInput) => notesClient.create(input), onSettled: () => invalidate(client) }); }
export function useUpdateNote() { const client = useQueryClient(); return useMutation({ mutationFn: ({ id, input }: { id: string; input: UpdateNoteInput }) => notesClient.update(id, input), onSettled: () => invalidate(client) }); }
export function useMoveToTrash() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: notesClient.trashNote,
    async onMutate(noteId) {
      await client.cancelQueries({ queryKey: noteKeys.all });
      const previous = client.getQueriesData<ClientNote[]>({ queryKey: noteKeys.lists() });
      client.setQueriesData<ClientNote[]>({ queryKey: noteKeys.lists() }, (notes) => removeNoteFromActiveList(notes, noteId));
      return { previous };
    },
    onError: (_error, _noteId, context) => context?.previous.forEach(([key, data]) => client.setQueryData(key, data)),
    onSettled: () => invalidate(client),
  });
}
export function useRestoreNote() { const client = useQueryClient(); return useMutation({ mutationFn: notesClient.restore, onSettled: () => invalidate(client) }); }
