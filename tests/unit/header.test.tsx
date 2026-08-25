// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { Header } from '@/widgets/header';

describe('Header', () => {
  it('shows the signed-in name and email in the workspace header', () => {
    render(<Header user={{ id: 'user-1', name: 'Ірина Коваль', email: 'iryna@example.com' }} />);

    expect(screen.getByText('Ірина Коваль')).toBeInTheDocument();
    expect(screen.getByText('iryna@example.com')).toBeInTheDocument();
  });
});
