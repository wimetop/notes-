'use client';
import React from 'react';
import { NoteCard, useNotesQuery } from '@/entities/note/client';

export function NotesList({ search }: Readonly<{ search?: string }>) {
  const { data, isPending, isError } = useNotesQuery(search);
  if (isPending) return <p role="status">Завантаження нотаток…</p>;
  if (isError) return <p role="alert">Не вдалося завантажити нотатки.</p>;
  if (!data?.length) return <p>Нотаток ще немає. Створіть першу.</p>;
  return <section aria-label="Активні нотатки">{data.map((note) => <NoteCard key={note.id} note={note} />)}</section>;
}
