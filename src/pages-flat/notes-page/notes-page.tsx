'use client';
import React, { useState } from 'react';
import { CreateNoteForm } from '@/features/create-note';
import { useDebouncedValue } from '@/shared/lib/use-debounced-value';
import { NotesList } from '@/widgets/notes-list';

export function NotesPage() {
  const [search, setSearch] = useState('');
  const [searchSource, setSearchSource] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const debouncedSearch = useDebouncedValue(searchSource, 300);
  const committedSearch = search === '' ? '' : debouncedSearch;
  const clearSearch = () => {
    setSearch('');
    setSearchSource('');
    document.getElementById('notes-search')?.focus();
  };

  return <main>
    <div className="workspace-heading"><span>Особистий архів</span><h1>Нотатки</h1><p>Зберігайте важливе близько, а зайве — у кошику.</p></div>
    <div className="notes-toolbar">
      <label htmlFor="notes-search">Пошук</label>
      <div className="search-field"><input id="notes-search" value={search} onCompositionStart={() => setIsComposing(true)} onCompositionEnd={(event) => { setIsComposing(false); setSearchSource(event.currentTarget.value); }} onChange={(event) => { setSearch(event.target.value); if (!isComposing) setSearchSource(event.target.value); }} placeholder="Шукати за назвою" />
        {search && <button type="button" className="search-clear" onClick={clearSearch} aria-label="Очистити пошук">×</button>}
      </div>
    </div>
    <div className="notes-layout"><CreateNoteForm /><NotesList search={committedSearch} /></div>
  </main>;
}
