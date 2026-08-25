import Link from 'next/link';
import React from 'react';
import type { AuthenticatedUser } from '@/shared/lib';

export function Header({ user }: Readonly<{ user: AuthenticatedUser }>) {
  const initial = user.name.trim().charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase();

  return <header>
    <nav aria-label="Головна навігація">
      <Link href="/notes">Нотатки</Link>
      <Link href="/notes/trash">Кошик</Link>
      <div className="user-profile">
        <span className="user-avatar" aria-hidden="true">{initial}</span>
        <span className="user-identity"><strong>{user.name}</strong><small>{user.email}</small></span>
      </div>
    </nav>
  </header>;
}
