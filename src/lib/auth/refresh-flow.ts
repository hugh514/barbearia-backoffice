import 'server-only';
import { refreshTokens } from './refresh';
import {
  readRefreshToken,
  readAccessToken,
  setSessionCookies,
  clearSessionCookies,
} from './cookies';

// Coalesce refreshes concorrentes na mesma instância: várias requests que batem
// 401 ao mesmo tempo compartilham um único refresh.
let inFlight: Promise<string | null> | null = null;

/**
 * Garante um access token válido: se já houver um no cookie, usa-o; senão tenta
 * refresh. Retorna o access token válido ou null (sessão inválida — relogar).
 */
export async function ensureAccessToken(
  forceRefresh = false,
): Promise<string | null> {
  if (!forceRefresh) {
    const current = await readAccessToken();
    if (current) return current;
  }
  return performRefresh();
}

/** Executa (ou reutiliza) um refresh em andamento. */
export async function performRefresh(): Promise<string | null> {
  if (inFlight) return inFlight;

  inFlight = (async () => {
    const refreshToken = await readRefreshToken();
    if (!refreshToken) {
      await clearSessionCookies();
      return null;
    }
    const pair = await refreshTokens(refreshToken);
    if (!pair) {
      await clearSessionCookies();
      return null;
    }
    await setSessionCookies(pair.accessToken, pair.refreshToken);
    return pair.accessToken;
  })();

  try {
    return await inFlight;
  } finally {
    inFlight = null;
  }
}
