import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import {
  roleSchema,
  paginationMetaSchema,
  paginated,
  apiErrorSchema,
  errorMessage,
} from './base';

describe('roleSchema', () => {
  it('aceita papéis válidos', () => {
    expect(roleSchema.parse('ADMIN')).toBe('ADMIN');
    expect(roleSchema.parse('BARBEIRO')).toBe('BARBEIRO');
  });
  it('rejeita papel desconhecido', () => {
    expect(roleSchema.safeParse('ROOT').success).toBe(false);
  });
});

describe('paginated', () => {
  const schema = paginated(z.object({ id: z.string() }));

  it('valida envelope { data, meta }', () => {
    const ok = schema.parse({
      data: [{ id: 'a' }, { id: 'b' }],
      meta: { total: 2, page: 1, perPage: 20, lastPage: 1 },
    });
    expect(ok.data).toHaveLength(2);
    expect(ok.meta.total).toBe(2);
  });

  it('rejeita meta faltando campos', () => {
    expect(
      schema.safeParse({ data: [], meta: { total: 0, page: 1 } }).success,
    ).toBe(false);
  });

  it('rejeita item que não bate com o schema', () => {
    expect(
      schema.safeParse({
        data: [{ id: 123 }],
        meta: { total: 1, page: 1, perPage: 20, lastPage: 1 },
      }).success,
    ).toBe(false);
  });
});

describe('paginationMetaSchema', () => {
  it('exige page positivo', () => {
    expect(
      paginationMetaSchema.safeParse({
        total: 0,
        page: 0,
        perPage: 20,
        lastPage: 1,
      }).success,
    ).toBe(false);
  });
});

describe('apiErrorSchema + errorMessage', () => {
  it('parseia erro com message string', () => {
    const e = apiErrorSchema.parse({
      statusCode: 401,
      message: 'Invalid credentials',
      error: 'Unauthorized',
    });
    expect(e.statusCode).toBe(401);
  });

  it('junta message array', () => {
    expect(
      errorMessage({
        statusCode: 400,
        message: ['email inválido', 'senha curta'],
        error: 'Bad Request',
      }),
    ).toBe('email inválido, senha curta');
  });

  it('devolve fallback para entrada não reconhecida', () => {
    expect(errorMessage({ foo: 'bar' })).toMatch(/inesperado/i);
  });
});
