// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { CreateNoteForm } from '@/features/create-note';

describe('CreateNoteForm', () => {
  it('associates the title input with an accessible validation message', () => {
    render(<QueryClientProvider client={new QueryClient()}><CreateNoteForm /></QueryClientProvider>);
    const input = screen.getByLabelText('Назва');
    expect(input).toHaveAttribute('aria-describedby', 'create-note-title-error');
  });
});
