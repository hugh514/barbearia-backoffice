import { z } from 'zod';
import { apiClient } from '@/lib/http/client';
import { roleSchema } from '@/lib/zod/base';
import type { LoginInput } from './schemas';

const sessionUserSchema = z.object({
  id: z.string(),
  email: z.string(),
  role: roleSchema,
  tenantId: z.string(),
});

const authResponseSchema = z.object({
  user: sessionUserSchema.nullable(),
});

export type AuthUser = z.infer<typeof sessionUserSchema>;

/** Login via proxy do Next (seta cookies httpOnly no servidor). */
export async function loginRequest(input: LoginInput): Promise<AuthUser> {
  const res = await apiClient('/auth/login', {
    method: 'POST',
    body: input,
    schema: authResponseSchema,
  });
  if (!res.user) {
    throw new Error('Sessão inválida após login.');
  }
  return res.user;
}

export async function logoutRequest(): Promise<void> {
  await apiClient('/auth/logout', { method: 'POST' });
}

export async function currentSession(): Promise<AuthUser | null> {
  const res = await apiClient('/auth/refresh', {
    method: 'GET',
    schema: authResponseSchema,
  });
  return res.user;
}
