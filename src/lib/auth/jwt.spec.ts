import { describe, it, expect } from 'vitest';
import { sessionFromToken } from './jwt';

function b64url(obj: unknown): string {
  return Buffer.from(JSON.stringify(obj))
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/** Monta um JWT não assinado (decodeJwt não verifica assinatura). */
function makeToken(
  claims: Record<string, unknown>,
  expSeconds: number,
): string {
  const header = b64url({ alg: 'none', typ: 'JWT' });
  const payload = b64url({ ...claims, exp: expSeconds });
  return `${header}.${payload}.`;
}

const baseClaims = {
  sub: 'user-1',
  email: 'a@b.com',
  role: 'ADMIN',
  tenantId: 'tenant-1',
};

describe('sessionFromToken', () => {
  it('extrai sessão de token válido', async () => {
    const now = 1_000_000;
    const token = await makeToken(baseClaims, now + 3600);
    const session = sessionFromToken(token, now);
    expect(session).not.toBeNull();
    expect(session!.user).toEqual({
      id: 'user-1',
      email: 'a@b.com',
      role: 'ADMIN',
      tenantId: 'tenant-1',
    });
    expect(session!.expiresAt).toBe(now + 3600);
  });

  it('retorna null para token ausente', () => {
    expect(sessionFromToken(undefined)).toBeNull();
    expect(sessionFromToken(null)).toBeNull();
    expect(sessionFromToken('')).toBeNull();
  });

  it('retorna null para token expirado', async () => {
    const now = 1_000_000;
    const token = await makeToken(baseClaims, now - 10);
    expect(sessionFromToken(token, now)).toBeNull();
  });

  it('retorna null para string não-JWT', () => {
    expect(sessionFromToken('not-a-jwt', 1_000_000)).toBeNull();
  });

  it('retorna null quando role é inválido', async () => {
    const now = 1_000_000;
    const token = await makeToken(
      { ...baseClaims, role: 'ROOT' },
      now + 3600,
    );
    expect(sessionFromToken(token, now)).toBeNull();
  });

  it('retorna null quando faltam claims', async () => {
    const now = 1_000_000;
    const token = await makeToken(
      { sub: 'user-1', role: 'ADMIN' },
      now + 3600,
    );
    expect(sessionFromToken(token, now)).toBeNull();
  });
});
