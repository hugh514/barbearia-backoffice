import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { getServerSession } from '@/lib/auth/session';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { AppHeader } from '@/components/layout/app-header';

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession();
  if (!session) redirect('/login');

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader />
        <main className="flex-1 overflow-x-hidden p-6">{children}</main>
      </div>
    </div>
  );
}
