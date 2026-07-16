import { z } from 'zod';
import { roleSchema } from '@/lib/zod/base';

export const userSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  name: z.string(),
  email: z.string(),
  role: roleSchema,
  active: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type User = z.infer<typeof userSchema>;

/** Lista de usuários usa envelope não-padrão da API: { data, total, page, limit }. */
export const userListSchema = z.object({
  data: z.array(userSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
});
export type UserList = z.infer<typeof userListSchema>;

const strongPassword = z
  .string()
  .min(8, 'Mínimo de 8 caracteres')
  .regex(/[A-Z]/, 'Inclua uma maiúscula')
  .regex(/[a-z]/, 'Inclua uma minúscula')
  .regex(/[0-9]/, 'Inclua um número');

export const createUserSchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome'),
  email: z.string().email('E-mail inválido'),
  password: strongPassword,
  role: roleSchema,
});
export type CreateUserInput = z.infer<typeof createUserSchema>;

export const ROLE_LABEL = {
  ADMIN: 'Administrador',
  GERENTE: 'Gerente',
  BARBEIRO: 'Barbeiro',
  CLIENTE: 'Cliente',
} as const;
