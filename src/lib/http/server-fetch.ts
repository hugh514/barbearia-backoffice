import 'server-only';
import { env } from '@/lib/env';

export interface ApiFetchOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  accessToken?: string;
  idempotencyKey?: string;
}

/**
 * Faz uma request à API Barbearia a partir do servidor do Next.
 * Anexa Authorization e Idempotency-Key quando fornecidos. Não lança em status
 * de erro — devolve a Response crua para o chamador decidir (ex.: refresh em 401).
 */
export async function apiFetch(
  path: string,
  options: ApiFetchOptions = {},
): Promise<Response> {
  const { body, accessToken, idempotencyKey, headers, ...rest } = options;

  const finalHeaders = new Headers(headers);
  finalHeaders.set('Accept', 'application/json');
  if (body !== undefined) {
    finalHeaders.set('Content-Type', 'application/json');
  }
  if (accessToken) {
    finalHeaders.set('Authorization', `Bearer ${accessToken}`);
  }
  if (idempotencyKey) {
    finalHeaders.set('Idempotency-Key', idempotencyKey);
  }

  const url = `${env.apiBaseUrl}${path.startsWith('/') ? path : `/${path}`}`;

  return fetch(url, {
    ...rest,
    headers: finalHeaders,
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: 'no-store',
  });
}
