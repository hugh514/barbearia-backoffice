import { NextResponse, type NextRequest } from 'next/server';
import { env } from '@/lib/env';
import { ensureAccessToken, performRefresh } from '@/lib/auth/refresh-flow';

type Ctx = { params: Promise<{ path: string[] }> };

// Cabeçalhos do cliente que repassamos à API (nunca cookies/host).
const FORWARD_HEADERS = ['content-type', 'accept', 'idempotency-key'];

async function forward(request: NextRequest, ctx: Ctx): Promise<NextResponse> {
  const { path } = await ctx.params;
  const search = request.nextUrl.search;
  const targetPath = `/${path.join('/')}${search}`;

  const bodyText =
    request.method === 'GET' || request.method === 'HEAD'
      ? undefined
      : await request.text();

  const buildInit = (accessToken: string | null): RequestInit => {
    const headers = new Headers();
    for (const h of FORWARD_HEADERS) {
      const v = request.headers.get(h);
      if (v) headers.set(h, v);
    }
    if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
    return {
      method: request.method,
      headers,
      body: bodyText,
      cache: 'no-store',
    };
  };

  const url = `${env.apiBaseUrl}${targetPath}`;

  let token = await ensureAccessToken();
  let apiRes = await fetch(url, buildInit(token));

  // Refresh atômico + retry único em 401.
  if (apiRes.status === 401) {
    token = await performRefresh();
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Sessão expirada', statusCode: 401 },
        { status: 401 },
      );
    }
    apiRes = await fetch(url, buildInit(token));
  }

  const resBody = await apiRes.text();
  const contentType = apiRes.headers.get('content-type') ?? 'application/json';
  return new NextResponse(resBody, {
    status: apiRes.status,
    headers: { 'content-type': contentType },
  });
}

export const GET = forward;
export const POST = forward;
export const PUT = forward;
export const PATCH = forward;
export const DELETE = forward;
