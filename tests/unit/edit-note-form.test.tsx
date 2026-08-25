// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { EditNoteForm } from '@/features/edit-note';

describe('EditNoteForm', () => {
  it('renders initial note values in editable controls', () => {
    render(<QueryClientProvider client={new QueryClient()}><EditNoteForm note={{ id: '00000000-0000-4000-8000-000000000001', title: 'Ранкова ідея', body: 'Текст' }} /></QueryClientProvider>);
    expect(screen.getByLabelText('Назва')).toHaveValue('Ранкова ідея');
  });
});
