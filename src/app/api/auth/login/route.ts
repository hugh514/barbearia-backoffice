import { NextResponse } from 'next/server';
import { apiFetch } from '@/lib/http/server-fetch';
import { setSessionCookies } from '@/lib/auth/cookies';
import { sessionFromToken } from '@/lib/auth/jwt';
import { loginSchema, tokenPairSchema } from '@/features/auth/schemas';

export async function POST(request: Request) {
  const raw = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Bad Request', message: 'Dados inválidos', statusCode: 400 },
      { status: 400 },
    );
  }

  const res = await apiFetch('/auth/login', {
    method: 'POST',
    body: parsed.data,
  });

  const json = await res.json().catch(() => null);
  if (!res.ok) {
    return NextResponse.json(json ?? { message: 'Falha no login' }, {
      status: res.status,
    });
  }

  const tokens = tokenPairSchema.safeParse(json);
  if (!tokens.success) {
    return NextResponse.json(
      { error: 'Bad Gateway', message: 'Resposta inesperada da API', statusCode: 502 },
      { status: 502 },
    );
  }

  await setSessionCookies(tokens.data.accessToken, tokens.data.refreshToken);
  const session = sessionFromToken(tokens.data.accessToken);
  return NextResponse.json({ user: session?.user ?? null }, { status: 200 });
}
