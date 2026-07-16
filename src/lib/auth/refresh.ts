import 'server-only';
import { apiFetch } from '@/lib/http/server-fetch';
import { tokenPairSchema, type TokenPair } from '@/features/auth/schemas';

/**
 * Troca um refresh token por um novo par de tokens via API.
 * Retorna null se o refresh falhar (token inválido/expirado/revogado).
 */
export async function refreshTokens(
  refreshToken: string,
): Promise<TokenPair | null> {
  try {
    const res = await apiFetch('/auth/refresh', {
      method: 'POST',
      body: { refreshToken },
    });
    if (!res.ok) return null;
    const json = await res.json();
    const parsed = tokenPairSchema.safeParse(json);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}
