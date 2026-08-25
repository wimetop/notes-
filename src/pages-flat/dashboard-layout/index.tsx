import type { ReactNode } from 'react';

import { requirePageSession, QueryProvider } from '@/shared/lib';
import { Header } from '@/widgets/header';

export async function DashboardPageLayout({ children }: Readonly<{ children: ReactNode }>) {
  const user = await requirePageSession();
  return <QueryProvider><Header user={user} />{children}</QueryProvider>;
}
