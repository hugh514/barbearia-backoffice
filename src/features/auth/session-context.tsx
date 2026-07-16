'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { SessionUser } from '@/lib/auth/jwt';
import type { Role } from '@/lib/zod/base';

interface SessionContextValue {
  user: SessionUser | null;
  hasRole: (...roles: Role[]) => boolean;
  isAuthenticated: boolean;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({
  user,
  children,
}: {
  user: SessionUser | null;
  children: ReactNode;
}) {
  const value = useMemo<SessionContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      hasRole: (...roles: Role[]) =>
        user ? roles.includes(user.role) : false,
    }),
    [user],
  );
  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error('useSession deve ser usado dentro de <SessionProvider>');
  }
  return ctx;
}
