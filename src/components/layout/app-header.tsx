'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { useSession } from '@/features/auth/session-context';
import { logoutRequest } from '@/features/auth/services';
import { Button } from '@/components/ui/button';

export function AppHeader({ title }: { title?: string }) {
  const router = useRouter();
  const { user } = useSession();

  async function handleLogout() {
    await logoutRequest().catch(() => undefined);
    router.replace('/login');
    router.refresh();
  }

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-6">
      <h2 className="text-sm font-medium text-muted-foreground">{title ?? ''}</h2>
      <div className="flex items-center gap-3">
        <span className="hidden text-sm text-foreground sm:inline">
          {user?.email}
        </span>
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          <LogOut className="size-4" />
          Sair
        </Button>
      </div>
    </header>
  );
}
