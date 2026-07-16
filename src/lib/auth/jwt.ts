import { decodeJwt } from 'jose';
import { roleSchema, type Role } from '@/lib/zod/base';

/** Claims que extraímos do access token da API. */
export interface SessionUser {
  id: string;
  email: string;
  role: Role;
  tenantId: string;
}

export interface Session {
  user: SessionUser;
  /** epoch em segundos */
  expiresAt: number;
}

/**
 * Decodifica (sem verificar assinatura) o access token e extrai a sessão.
 * A API é a autoridade sobre a validade; aqui só lemos claims para o servidor
 * do Next decidir roteamento. Retorna null se ausente/inválido/expirado.
 *
 * @param nowSeconds epoch atual em segundos (injetável para testes).
 */
export function sessionFromToken(
  token: string | undefined | null,
  nowSeconds: number = Math.floor(Date.now() / 1000),
): Session | null {
  if (!token) return null;

  let claims: Record<string, unknown>;
  try {
    claims = decodeJwt(token) as Record<string, unknown>;
  } catch {
    return null;
  }

  const exp = typeof claims.exp === 'number' ? claims.exp : 0;
  if (!exp || exp <= nowSeconds) return null;

  const role = roleSchema.safeParse(claims.role);
  const sub = claims.sub;
  const tenantId = claims.tenantId;
  const email = claims.email;

  if (
    !role.success ||
    typeof sub !== 'string' ||
    typeof tenantId !== 'string' ||
    typeof email !== 'string'
  ) {
    return null;
  }

  return {
    user: { id: sub, email, role: role.data, tenantId },
    expiresAt: exp,
  };
}
