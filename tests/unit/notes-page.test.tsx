// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/features/create-note', () => ({ CreateNoteForm: () => <div>Форма створення</div> }));
vi.mock('@/widgets/notes-list', () => ({ NotesList: () => <div>Список нотаток</div> }));

import { NotesPage } from '@/pages-flat/notes-page';

describe('NotesPage', () => {
  it('provides an accessible clear control when search has text', () => {
    render(<NotesPage />);
    const search = screen.getByLabelText('Пошук');

    fireEvent.change(search, { target: { value: 'план' } });

    expect(screen.getByRole('button', { name: 'Очистити пошук' })).toBeInTheDocument();
  });
});
