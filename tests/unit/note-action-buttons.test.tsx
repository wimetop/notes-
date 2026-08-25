// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { DeleteNoteButton } from '@/features/delete-note';
import { RestoreNoteButton } from '@/features/restore-note';

describe('note actions', () => {
  it('uses explicit accessible labels for delete and restore', () => {
    render(<QueryClientProvider client={new QueryClient()}><DeleteNoteButton noteId="00000000-0000-4000-8000-000000000001" /><RestoreNoteButton noteId="00000000-0000-4000-8000-000000000001" /></QueryClientProvider>);
    expect(screen.getByRole('button', { name: 'Перемістити в кошик' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Відновити нотатку' })).toBeInTheDocument();
  });
});
