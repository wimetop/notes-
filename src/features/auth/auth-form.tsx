'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { authClient } from './auth-client';
import { createAuthFormSchema, type AuthFormInput } from './auth-form-schema';

export function AuthForm({ mode }: Readonly<{ mode: 'login' | 'register' }>) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const register = mode === 'register';
  const { register: field, handleSubmit, formState: { errors } } = useForm<AuthFormInput>({
    resolver: zodResolver(createAuthFormSchema(register)),
    defaultValues: { name: '', email: '', password: '' },
  });
  return <form noValidate onSubmit={handleSubmit(async (data) => {
    setBusy(true); setError(null);
    try {
      const result = register
        ? await authClient.signUp.email({ email: data.email, password: data.password, name: data.name ?? '' })
        : await authClient.signIn.email({ email: data.email, password: data.password });
      if (result.error) { setError(result.error.message ?? 'Не вдалося виконати дію.'); return; }
      router.push('/notes'); router.refresh();
    } catch {
      setError('Помилка мережі. Спробуйте ще раз.');
    } finally {
      setBusy(false);
    }
  })}>
    <h1>{register ? 'Створити обліковий запис' : 'Увійти'}</h1>
    {register && <><label htmlFor="name">Ім’я</label><input id="name" autoComplete="name" aria-invalid={errors.name !== undefined} aria-describedby="name-error" disabled={busy} {...field('name')} /><p id="name-error">{errors.name?.message}</p></>}
    <label htmlFor="email">Email</label><input id="email" type="email" autoComplete="email" aria-invalid={errors.email !== undefined} aria-describedby="email-error" disabled={busy} {...field('email')} />
    <p id="email-error">{errors.email?.message}</p>
    <label htmlFor="password">Пароль</label><input id="password" type="password" autoComplete={register ? 'new-password' : 'current-password'} aria-invalid={errors.password !== undefined} aria-describedby="password-error" disabled={busy} {...field('password')} />
    <p id="password-error">{errors.password?.message}</p>
    {error && <p role="alert">{error}</p>}
    <button type="submit" disabled={busy}>{busy ? 'Зачекайте…' : register ? 'Зареєструватися' : 'Увійти'}</button>
    <p className="auth-switch">
      {register ? 'Вже є акаунт? ' : 'Вперше тут? '}
      <Link href={register ? '/login' : '/register'}>{register ? 'Увійти' : 'Створити акаунт'}</Link>
    </p>
  </form>;
}
