import { describe, it, expect } from 'vitest';
import {
  customerSchema,
  customerListSchema,
  createCustomerSchema,
} from './schemas';

const validCustomer = {
  id: 'c1',
  tenantId: 't1',
  name: 'João',
  phone: '11999998888',
  origin: 'MANUAL',
  planStatus: 'ACTIVE',
  active: true,
  createdAt: '2026-07-16T10:00:00.000Z',
  updatedAt: '2026-07-16T10:00:00.000Z',
};

describe('customerSchema', () => {
  it('valida cliente com campos opcionais ausentes', () => {
    expect(customerSchema.parse(validCustomer).name).toBe('João');
  });
  it('aceita instagramId null', () => {
    expect(
      customerSchema.safeParse({ ...validCustomer, instagramId: null }).success,
    ).toBe(true);
  });
  it('rejeita origin inválido', () => {
    expect(
      customerSchema.safeParse({ ...validCustomer, origin: 'X' }).success,
    ).toBe(false);
  });
});

describe('customerListSchema', () => {
  it('valida envelope paginado', () => {
    const parsed = customerListSchema.parse({
      data: [validCustomer],
      meta: { total: 1, page: 1, perPage: 20, lastPage: 1 },
    });
    expect(parsed.data).toHaveLength(1);
  });
});

describe('createCustomerSchema', () => {
  it('exige nome com 2+ caracteres', () => {
    expect(
      createCustomerSchema.safeParse({ name: 'a', phone: '11999998888' })
        .success,
    ).toBe(false);
  });
  it('rejeita telefone com letras', () => {
    expect(
      createCustomerSchema.safeParse({ name: 'João', phone: 'abcdefgh' })
        .success,
    ).toBe(false);
  });
  it('aceita telefone formatado', () => {
    expect(
      createCustomerSchema.safeParse({
        name: 'João',
        phone: '(11) 99999-8888',
      }).success,
    ).toBe(true);
  });
});
