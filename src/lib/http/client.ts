import { z } from 'zod';
import { errorMessage } from '@/lib/zod/base';

/** Erro de API já normalizado para a camada de UI. */
export class ApiRequestError extends Error {
  constructor(
    public status: number,
    message: string,
    public body?: unknown,
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

function uuid(): string {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export interface ClientFetchOptions<T extends z.ZodTypeAny = z.ZodTypeAny> {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  /** Schema Zod para validar a resposta (Artigo I). */
  schema?: T;
  /** Chave de idempotência; gerada automaticamente em mutações se ausente. */
  idempotencyKey?: string;
  signal?: AbortSignal;
}

const MUTATIONS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/**
 * Cliente HTTP do browser → sempre bate no proxy do Next (`/api/*`), nunca na
 * API direto. Cookies httpOnly são enviados via `same-origin`. Valida a resposta
 * com Zod quando um schema é fornecido.
 */
export async function apiClient<T extends z.ZodTypeAny>(
  path: string,
  options: ClientFetchOptions<T> & { schema: T },
): Promise<z.infer<T>>;
export async function apiClient(
  path: string,
  options?: ClientFetchOptions,
): Promise<unknown>;
export async function apiClient<T extends z.ZodTypeAny>(
  path: string,
  options: ClientFetchOptions<T> = {},
): Promise<unknown> {
  const method = options.method ?? 'GET';
  const headers = new Headers({ Accept: 'application/json' });
  if (options.body !== undefined) headers.set('Content-Type', 'application/json');
  if (MUTATIONS.has(method)) {
    headers.set('Idempotency-Key', options.idempotencyKey ?? uuid());
  }

  const res = await fetch(`/api${path.startsWith('/') ? path : `/${path}`}`, {
    method,
    headers,
    credentials: 'same-origin',
    cache: 'no-store',
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    signal: options.signal,
  });

  const isJson = res.headers
    .get('content-type')
    ?.includes('application/json');
  const payload = isJson ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    throw new ApiRequestError(res.status, errorMessage(payload), payload);
  }

  if (options.schema) {
    const parsed = options.schema.safeParse(payload);
    if (!parsed.success) {
      throw new ApiRequestError(
        502,
        'Resposta da API em formato inesperado.',
        parsed.error.issues,
      );
    }
    return parsed.data;
  }

  return payload as never;
}
