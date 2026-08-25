import Link from 'next/link';
import React from 'react';

export function Header() { return <header><nav aria-label="Головна навігація"><Link href="/notes">Нотатки</Link><Link href="/notes/trash">Кошик</Link></nav></header>; }
