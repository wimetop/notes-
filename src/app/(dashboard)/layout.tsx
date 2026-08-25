import type { ReactNode } from 'react';
import { Header } from '@/widgets/header';
import { QueryProvider, requirePageSession } from '@/shared/lib';

export default async function DashboardLayout({ children }: Readonly<{ children: ReactNode }>) {
  const user = await requirePageSession();
  return <QueryProvider><Header user={user} />{children}</QueryProvider>;
}
