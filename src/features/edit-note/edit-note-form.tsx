'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { useForm } from 'react-hook-form';

import { type UpdateNoteInput, updateNoteSchema, useUpdateNote } from '@/entities/note/client';

type EditableNote = Readonly<{ id: string; title: string; body: string | null }>;

export function EditNoteForm({ note }: Readonly<{ note: EditableNote }>) {
  const { mutateAsync, isPending } = useUpdateNote();
  const { register, handleSubmit, formState: { errors } } = useForm<UpdateNoteInput>({ resolver: zodResolver(updateNoteSchema), defaultValues: { title: note.title, body: note.body ?? '' } });
  return <form noValidate onSubmit={handleSubmit(async (input) => { await mutateAsync({ id: note.id, input }); })}>
    <label htmlFor="edit-note-title">Назва</label>
    <input id="edit-note-title" aria-invalid={errors.title !== undefined} aria-describedby="edit-note-title-error" disabled={isPending} {...register('title')} />
    <p id="edit-note-title-error">{errors.title?.message}</p>
    <label htmlFor="edit-note-body">Текст</label>
    <textarea id="edit-note-body" aria-invalid={errors.body !== undefined} aria-describedby="edit-note-body-error" disabled={isPending} {...register('body')} />
    <p id="edit-note-body-error">{errors.body?.message}</p>
    <button type="submit" disabled={isPending}>{isPending ? 'Збереження…' : 'Зберегти зміни'}</button>
  </form>;
}
