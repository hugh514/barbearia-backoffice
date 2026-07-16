import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { z } from 'zod';
import { apiClient, ApiRequestError } from './client';

function mockFetch(status: number, body: unknown, contentType = 'application/json') {
  return vi.fn().mockImplementation(
    () =>
      Promise.resolve(
        new Response(body === undefined ? null : JSON.stringify(body), {
          status,
          headers: { 'content-type': contentType },
        }),
      ),
  );
}

beforeEach(() => {
  vi.stubGlobal('crypto', { randomUUID: () => 'fixed-uuid' });
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('apiClient', () => {
  it('faz GET para /api/<path> e retorna JSON', async () => {
    const f = mockFetch(200, { ok: true });
    vi.stubGlobal('fetch', f);
    const data = await apiClient('/dashboard/summary');
    expect(f).toHaveBeenCalledWith(
      '/api/dashboard/summary',
      expect.objectContaining({ method: 'GET', credentials: 'same-origin' }),
    );
    expect(data).toEqual({ ok: true });
  });

  it('injeta Idempotency-Key em mutações', async () => {
    const f = mockFetch(201, { id: '1' });
    vi.stubGlobal('fetch', f);
    await apiClient('/customers', { method: 'POST', body: { name: 'x' } });
    const headers = f.mock.calls[0][1].headers as Headers;
    expect(headers.get('Idempotency-Key')).toBe('fixed-uuid');
  });

  it('não injeta Idempotency-Key em GET', async () => {
    const f = mockFetch(200, {});
    vi.stubGlobal('fetch', f);
    await apiClient('/customers');
    const headers = f.mock.calls[0][1].headers as Headers;
    expect(headers.get('Idempotency-Key')).toBeNull();
  });

  it('valida resposta com schema e retorna dado tipado', async () => {
    const f = mockFetch(200, { data: [{ id: 'a' }], meta: { total: 1 } });
    vi.stubGlobal('fetch', f);
    const schema = z.object({
      data: z.array(z.object({ id: z.string() })),
      meta: z.object({ total: z.number() }),
    });
    const out = await apiClient('/x', { schema });
    expect(out.data[0].id).toBe('a');
  });

  it('lança ApiRequestError 502 quando resposta não bate com schema', async () => {
    const f = mockFetch(200, { wrong: true });
    vi.stubGlobal('fetch', f);
    const schema = z.object({ id: z.string() });
    await expect(apiClient('/x', { schema })).rejects.toMatchObject({
      status: 502,
    });
  });

  it('lança ApiRequestError com mensagem da API em erro HTTP', async () => {
    const f = mockFetch(401, {
      statusCode: 401,
      message: 'Invalid credentials',
      error: 'Unauthorized',
    });
    vi.stubGlobal('fetch', f);
    await expect(apiClient('/auth/me')).rejects.toBeInstanceOf(ApiRequestError);
    await expect(apiClient('/auth/me')).rejects.toMatchObject({
      status: 401,
      message: 'Invalid credentials',
    });
  });
});
