'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { useForm } from 'react-hook-form';

import { createNoteSchema, type CreateNoteInput, useCreateNote } from '@/entities/note/client';

export function CreateNoteForm() {
  const titleErrorId = 'create-note-title-error';
  const { mutateAsync, isPending } = useCreateNote();
  const { register, handleSubmit, formState: { errors }, reset } = useForm<CreateNoteInput>({ resolver: zodResolver(createNoteSchema), defaultValues: { title: '', body: '' } });
  return <form noValidate onSubmit={handleSubmit(async (input) => { await mutateAsync(input); reset(); })}>
    <label htmlFor="create-note-title">Назва</label>
    <input id="create-note-title" aria-invalid={errors.title !== undefined} aria-describedby={titleErrorId} disabled={isPending} {...register('title')} />
    <p id={titleErrorId}>{errors.title?.message}</p>
    <label htmlFor="create-note-body">Текст</label>
    <textarea className="resize-none" id="create-note-body" disabled={isPending} {...register('body')} />
    <button type="submit" disabled={isPending}>{isPending ? 'Створення…' : 'Створити нотатку'}</button>
  </form>;
}
