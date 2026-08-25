import type { ReactNode } from 'react';
import { Header } from '@/widgets/header';
import { QueryProvider, requirePageSession } from '@/shared/lib';

export default async function DashboardLayout({ children }: Readonly<{ children: ReactNode }>) { await requirePageSession(); return <QueryProvider><Header />{children}</QueryProvider>; }
