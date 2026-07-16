import { NextResponse } from 'next/server';
import { ensureAccessToken } from '@/lib/auth/refresh-flow';
import { env } from '@/lib/env';

/**
 * Fornece o access token ao cliente APENAS para o handshake do Socket.IO
 * (a API valida JWT no gateway `/conversations`). Exposição controlada e
 * de curta duração: o token não é persistido no cliente, só usado no connect.
 * Requer sessão válida (o proxy/refresh garante); sem sessão → 401.
 */
export async function GET() {
  const token = await ensureAccessToken();
  if (!token) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Sessão expirada', statusCode: 401 },
      { status: 401 },
    );
  }
  return NextResponse.json({ token, url: env.apiBaseUrl });
}
