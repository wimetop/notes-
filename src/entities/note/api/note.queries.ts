'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { noteKeys, type CreateNoteInput, type UpdateNoteInput } from '@/entities/note/model';
import { notesClient } from './note.client';

export const useNotesQuery = (search?: string) => useQuery({ queryKey: noteKeys.list(search), queryFn: () => notesClient.list(search) });
export const useNoteQuery = (id: string) => useQuery({ queryKey: noteKeys.detail(id), queryFn: () => notesClient.get(id) });
export const useTrashQuery = () => useQuery({ queryKey: noteKeys.trash(), queryFn: () => notesClient.trash() });
function invalidate(client: ReturnType<typeof useQueryClient>) { return client.invalidateQueries({ queryKey: noteKeys.all }); }
export function useCreateNote() { const client = useQueryClient(); return useMutation({ mutationFn: (input: CreateNoteInput) => notesClient.create(input), onSettled: () => invalidate(client) }); }
export function useUpdateNote() { const client = useQueryClient(); return useMutation({ mutationFn: ({ id, input }: { id: string; input: UpdateNoteInput }) => notesClient.update(id, input), onSettled: () => invalidate(client) }); }
export function useMoveToTrash() { const client = useQueryClient(); return useMutation({ mutationFn: notesClient.trashNote, onSettled: () => invalidate(client) }); }
export function useRestoreNote() { const client = useQueryClient(); return useMutation({ mutationFn: notesClient.restore, onSettled: () => invalidate(client) }); }
