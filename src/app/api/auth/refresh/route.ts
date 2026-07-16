import { NextResponse } from 'next/server';
import { performRefresh } from '@/lib/auth/refresh-flow';
import { readAccessToken } from '@/lib/auth/cookies';
import { sessionFromToken } from '@/lib/auth/jwt';

export async function POST() {
  const token = await performRefresh();
  if (!token) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Sessão expirada', statusCode: 401 },
      { status: 401 },
    );
  }
  const session = sessionFromToken(token);
  return NextResponse.json({ user: session?.user ?? null }, { status: 200 });
}

export async function GET() {
  // Retorna a sessão atual (útil para hidratar o cliente).
  const token = await readAccessToken();
  const session = sessionFromToken(token);
  return NextResponse.json({ user: session?.user ?? null }, { status: 200 });
}
