'use client';
import React from 'react';
import { useTrashQuery } from '@/entities/note/client';
import { RestoreNoteButton } from '@/features/restore-note';

export function TrashList() { const { data, isPending, isError } = useTrashQuery(); if (isPending) return <p role="status">Завантаження кошика…</p>; if (isError) return <p role="alert">Не вдалося завантажити кошик.</p>; return <section aria-label="Кошик">{data?.length ? data.map((note) => <article key={note.id}><h2>{note.title}</h2><RestoreNoteButton noteId={note.id} /></article>) : <p>Кошик порожній.</p>}</section>; }
