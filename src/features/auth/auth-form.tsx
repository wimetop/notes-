'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

import { authClient } from './auth-client';

export function AuthForm({ mode }: Readonly<{ mode: 'login' | 'register' }>) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const register = mode === 'register';
  return <form noValidate onSubmit={async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setBusy(true); setError(null);
    const result = register
      ? await authClient.signUp.email({ email: String(data.get('email')), password: String(data.get('password')), name: String(data.get('name')) })
      : await authClient.signIn.email({ email: String(data.get('email')), password: String(data.get('password')) });
    setBusy(false);
    if (result.error) { setError(result.error.message ?? 'Не вдалося виконати дію.'); return; }
    router.push('/notes'); router.refresh();
  }}>
    <h1>{register ? 'Створити обліковий запис' : 'Увійти'}</h1>
    {register && <><label htmlFor="name">Ім’я</label><input id="name" name="name" autoComplete="name" required /></>}
    <label htmlFor="email">Email</label><input id="email" name="email" type="email" autoComplete="email" required />
    <label htmlFor="password">Пароль</label><input id="password" name="password" type="password" autoComplete={register ? 'new-password' : 'current-password'} minLength={8} required />
    {error && <p role="alert">{error}</p>}
    <button type="submit" disabled={busy}>{busy ? 'Зачекайте…' : register ? 'Зареєструватися' : 'Увійти'}</button>
  </form>;
}
