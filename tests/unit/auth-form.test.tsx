// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() })
}));

const { signIn } = vi.hoisted(() => ({ signIn: vi.fn() }));
vi.mock('@/features/auth/auth-client', () => ({ authClient: { signIn: { email: signIn }, signUp: { email: signIn } } }));

import { AuthForm } from '@/features/auth';

describe('AuthForm', () => {
  afterEach(() => {
    cleanup();
    signIn.mockReset();
  });

  it('links a new visitor from login to registration', () => {
    render(<AuthForm mode="login" />);

    expect(screen.getByRole('link', { name: 'Створити акаунт' })).toHaveAttribute('href', '/register');
  });

  it('links a returning visitor from registration to login', () => {
    render(<AuthForm mode="register" />);

    expect(screen.getByRole('link', { name: 'Увійти' })).toHaveAttribute('href', '/login');
  });

  it('recovers from a rejected sign-in request and exposes the error', async () => {
    signIn.mockRejectedValueOnce(new Error('Network unavailable'));
    render(<AuthForm mode="login" />);

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'person@example.com' } });
    fireEvent.change(screen.getByLabelText('Пароль'), { target: { value: 'correct horse battery staple' } });
    fireEvent.click(screen.getByRole('button', { name: 'Увійти' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Помилка мережі');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Увійти' })).toBeEnabled());
  });

  it('validates a registration name before calling Better Auth', async () => {
    render(<AuthForm mode="register" />);

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'person@example.com' } });
    fireEvent.change(screen.getByLabelText('Пароль'), { target: { value: 'correct horse battery staple' } });
    fireEvent.click(screen.getByRole('button', { name: 'Зареєструватися' }));

    expect(await screen.findByText('Вкажіть ім’я.')).toBeInTheDocument();
    expect(signIn).not.toHaveBeenCalled();
  });
});
