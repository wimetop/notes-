'use client';
import React from 'react';
import { useNoteQuery } from '@/entities/note/client';
import { DeleteNoteButton } from '@/features/delete-note';
import { EditNoteForm } from '@/features/edit-note';

export function NoteEditPage({ id }: Readonly<{ id: string }>) { const { data, isPending, isError } = useNoteQuery(id); if (isPending) return <main><p role="status">Завантаження нотатки…</p></main>; if (isError || !data) return <main><h1>Нотатку не знайдено</h1></main>; return <main><h1>Редагувати нотатку</h1><EditNoteForm note={data} /><DeleteNoteButton noteId={data.id} /></main>; }
