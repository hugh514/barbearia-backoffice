import { NextResponse, type NextRequest } from 'next/server';
import { sessionFromToken } from '@/lib/auth/jwt';
import { canAccessRoute, isPublicRoute } from '@/config/route-access';
import { env } from '@/lib/env';

/**
 * Proxy (antigo middleware, renomeado no Next 16). Faz a checagem otimista de
 * sessão/papel no servidor antes de renderizar. A barreira final continua sendo
 * a API; aqui só evitamos renderizar telas sem permissão.
 */
export function proxy(request: NextRequest): NextResponse {
  const { pathname, search } = request.nextUrl;

  const accessToken = request.cookies.get(env.cookies.access)?.value;
  const refreshToken = request.cookies.get(env.cookies.refresh)?.value;
  const session = sessionFromToken(accessToken);
  const role = session?.user.role ?? null;
  // Access pode ter expirado mas ainda há refresh: trata como "possivelmente logado".
  const maybeAuthenticated = Boolean(session) || Boolean(refreshToken);

  // Usuário logado tentando acessar rota pública de auth → manda pro painel.
  if (isPublicRoute(pathname) && session) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Rota privada sem qualquer sinal de sessão → login.
  if (!maybeAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname + search);
    return NextResponse.redirect(loginUrl);
  }

  // Com sessão decodificável, checa papel. (Se só há refresh, deixa passar e a
  // camada de dados dispara o refresh; a API barra se necessário.)
  if (session && !canAccessRoute(pathname, role)) {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Roda em tudo, exceto assets, rotas de API (têm seu próprio guard) e arquivos.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)'],
};
