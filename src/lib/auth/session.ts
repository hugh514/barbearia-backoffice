import 'server-only';
import { readAccessToken } from './cookies';
import { sessionFromToken, type Session } from './jwt';

/**
 * Lê a sessão atual a partir do cookie de access token (server-side).
 * Retorna null se não houver token válido/não expirado.
 */
export async function getServerSession(): Promise<Session | null> {
  const token = await readAccessToken();
  return sessionFromToken(token);
}
