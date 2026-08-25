'use client';
import React, { useState } from 'react';
import { CreateNoteForm } from '@/features/create-note';
import { NotesList } from '@/widgets/notes-list';

export function NotesPage() { const [search, setSearch] = useState(''); return <main><h1>Нотатки</h1><label htmlFor="notes-search">Пошук</label><input id="notes-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Шукати за назвою" /><CreateNoteForm /><NotesList search={search} /></main>; }
