'use client';
import React from 'react';
import { useNoteQuery } from '@/entities/note/client';
import { DeleteNoteButton } from '@/features/delete-note';
import { EditNoteForm } from '@/features/edit-note';

export function NoteEditPage({ id }: Readonly<{ id: string }>) { const { data, isPending, isError } = useNoteQuery(id); if (isPending) return <main><p className="state-card" role="status">Завантаження нотатки…</p></main>; if (isError || !data) return <main><div className="workspace-heading"><span>Особистий архів</span><h1>Нотатку не знайдено</h1></div></main>; return <main><div className="workspace-heading"><span>Особистий архів</span><h1>Редагувати нотатку</h1></div><EditNoteForm note={data} /><div className="danger-zone"><DeleteNoteButton noteId={data.id} /></div></main>; }
