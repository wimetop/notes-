'use client';
import React from 'react';
import { useTrashQuery } from '@/entities/note/client';
import { RestoreNoteButton } from '@/features/restore-note';

export function TrashList() { const { data, isPending, isError } = useTrashQuery(); if (isPending) return <p className="state-card" role="status">Завантаження кошика…</p>; if (isError) return <p className="state-card" role="alert">Не вдалося завантажити кошик.</p>; return <section aria-label="Кошик">{data?.length ? data.map((note) => <article className="note-card" key={note.id}><span className="note-index" aria-hidden="true">Кошик</span><h2>{note.title}</h2><RestoreNoteButton noteId={note.id} /></article>) : <p className="empty-state">Кошик порожній.</p>}</section>; }
