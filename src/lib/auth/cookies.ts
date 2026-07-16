import { cookies } from 'next/headers';
import { env } from '@/lib/env';
import { sessionFromToken } from './jwt';

const ACCESS_MAX_AGE = 60 * 60; // 1h (fallback; o token traz o exp real)
const REFRESH_MAX_AGE = 60 * 60 * 24 * 30; // 30 dias

const baseCookie = {
  httpOnly: true,
  secure: env.isProd,
  sameSite: 'lax' as const,
  path: '/',
};

/** Grava os cookies de sessão (chamar em Route Handler / Server Action). */
export async function setSessionCookies(
  accessToken: string,
  refreshToken: string,
): Promise<void> {
  const store = await cookies();
  const session = sessionFromToken(accessToken);
  const accessMaxAge = session
    ? Math.max(1, session.expiresAt - Math.floor(Date.now() / 1000))
    : ACCESS_MAX_AGE;

  store.set(env.cookies.access, accessToken, {
    ...baseCookie,
    maxAge: accessMaxAge,
  });
  store.set(env.cookies.refresh, refreshToken, {
    ...baseCookie,
    maxAge: REFRESH_MAX_AGE,
  });
}

/** Remove os cookies de sessão. */
export async function clearSessionCookies(): Promise<void> {
  const store = await cookies();
  store.delete(env.cookies.access);
  store.delete(env.cookies.refresh);
}

export async function readAccessToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(env.cookies.access)?.value;
}

export async function readRefreshToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(env.cookies.refresh)?.value;
}
