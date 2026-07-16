import { NextResponse } from 'next/server';
import { apiFetch } from '@/lib/http/server-fetch';
import {
  clearSessionCookies,
  readAccessToken,
  readRefreshToken,
} from '@/lib/auth/cookies';

export async function POST() {
  const accessToken = await readAccessToken();
  const refreshToken = await readRefreshToken();

  // Best-effort: revoga o refresh na API. Falha não impede limpar a sessão local.
  if (accessToken && refreshToken) {
    await apiFetch('/auth/logout', {
      method: 'POST',
      accessToken,
      body: { refreshToken },
    }).catch(() => undefined);
  }

  await clearSessionCookies();
  return NextResponse.json({ ok: true }, { status: 200 });
}
