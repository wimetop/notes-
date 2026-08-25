// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() })
}));

import { AuthForm } from '@/features/auth';

describe('AuthForm', () => {
  it('links a new visitor from login to registration', () => {
    render(<AuthForm mode="login" />);

    expect(screen.getByRole('link', { name: 'Створити акаунт' })).toHaveAttribute('href', '/register');
  });

  it('links a returning visitor from registration to login', () => {
    render(<AuthForm mode="register" />);

    expect(screen.getByRole('link', { name: 'Увійти' })).toHaveAttribute('href', '/login');
  });
});
