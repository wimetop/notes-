import type { ReactNode } from 'react';
import { DashboardPageLayout } from '@/pages-flat/dashboard-layout';

export default async function DashboardLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <DashboardPageLayout>{children}</DashboardPageLayout>;
}
