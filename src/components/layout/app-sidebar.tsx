'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from '@/features/auth/session-context';
import { navItemsForRole } from '@/config/navigation';
import { cn } from '@/lib/utils';

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useSession();
  if (!user) return null;

  const items = navItemsForRole(user.role);

  return (
    <aside className="hidden w-60 shrink-0 flex-col bg-sidebar text-sidebar-foreground md:flex">
      <div className="flex items-center gap-2 px-5 py-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
          BM
        </span>
        <span className="text-sm font-semibold tracking-wide text-white">
          BARBEARIA
        </span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {items.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-sidebar-active text-sidebar-active-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-hover hover:text-white',
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border px-5 py-4 text-xs uppercase tracking-wide text-sidebar-foreground">
        Painel · {user.role}
      </div>
    </aside>
  );
}
