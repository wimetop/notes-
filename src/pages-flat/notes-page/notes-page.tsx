'use client';
import React, { useState } from 'react';
import { CreateNoteForm } from '@/features/create-note';
import { NotesList } from '@/widgets/notes-list';

export function NotesPage() {
  const [search, setSearch] = useState('');
  const clearSearch = () => {
    setSearch('');
    document.getElementById('notes-search')?.focus();
  };

  return <main>
    <div className="workspace-heading"><span>Особистий архів</span><h1>Нотатки</h1><p>Зберігайте важливе близько, а зайве — у кошику.</p></div>
    <div className="notes-toolbar">
      <label htmlFor="notes-search">Пошук</label>
      <div className="search-field"><input id="notes-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Шукати за назвою" />
        {search && <button type="button" className="search-clear" onClick={clearSearch} aria-label="Очистити пошук">×</button>}
      </div>
    </div>
    <div className="notes-layout"><CreateNoteForm /><NotesList search={search} /></div>
  </main>;
}
