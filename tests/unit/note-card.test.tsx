// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { NoteCard } from '@/entities/note/client';

describe('NoteCard', () => {
  it('marks a note card with the shared visual class', () => {
    render(<NoteCard note={{
      id: '00000000-0000-4000-8000-000000000001', userId: 'user-1', title: 'План', body: null,
      deletedAt: null, createdAt: new Date(), updatedAt: new Date()
    }} />);

    expect(screen.getByRole('article')).toHaveClass('note-card');
  });
});
