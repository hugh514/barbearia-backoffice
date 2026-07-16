import 'server-only';
import { z } from 'zod';
import { apiFetch } from './server-fetch';
import { ensureAccessToken, performRefresh } from '@/lib/auth/refresh-flow';

export class ServerApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ServerApiError';
  }
}

/**
 * GET server-side à API, validado com Zod. Faz refresh + retry único em 401.
 * Para uso em Server Components / Server Actions.
 */
export async function serverApiGet<T extends z.ZodTypeAny>(
  path: string,
  schema: T,
): Promise<z.infer<T>> {
  let token = await ensureAccessToken();
  let res = await apiFetch(path, { accessToken: token ?? undefined });

  if (res.status === 401) {
    token = await performRefresh();
    if (!token) throw new ServerApiError(401, 'Sessão expirada');
    res = await apiFetch(path, { accessToken: token });
  }

  if (!res.ok) {
    throw new ServerApiError(res.status, `Falha ao carregar (${res.status})`);
  }

  const json = await res.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    throw new ServerApiError(502, 'Resposta da API em formato inesperado');
  }
  return parsed.data;
}
