import { apiClient } from '@/lib/http/client';
import {
  customerListSchema,
  customerSchema,
  type CreateCustomerInput,
  type CustomerList,
  type Customer,
  type UpdateCustomerInput,
} from './schemas';

export interface ListParams {
  page?: number;
  perPage?: number;
  search?: string;
}

export async function listCustomers(
  params: ListParams = {},
  signal?: AbortSignal,
): Promise<CustomerList> {
  const q = new URLSearchParams();
  q.set('page', String(params.page ?? 1));
  q.set('perPage', String(params.perPage ?? 20));
  if (params.search) q.set('search', params.search);

  return apiClient(`/customers?${q.toString()}`, {
    schema: customerListSchema,
    signal,
  });
}

export async function createCustomer(
  input: CreateCustomerInput,
  idempotencyKey?: string,
): Promise<Customer> {
  return apiClient('/customers', {
    method: 'POST',
    body: input,
    schema: customerSchema,
    idempotencyKey,
  });
}

export async function updateCustomer(
  id: string,
  input: UpdateCustomerInput,
): Promise<Customer> {
  return apiClient(`/customers/${id}`, {
    method: 'PATCH',
    body: input,
    schema: customerSchema,
  });
}
