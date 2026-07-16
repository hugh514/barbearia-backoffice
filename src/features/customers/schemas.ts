import { z } from 'zod';
import { paginated } from '@/lib/zod/base';

export const customerOriginSchema = z.enum([
  'MANUAL',
  'WHATSAPP',
  'INSTAGRAM',
]);
export type CustomerOrigin = z.infer<typeof customerOriginSchema>;

export const planStatusSchema = z.enum([
  'NONE',
  'ACTIVE',
  'PENDING',
  'OVERDUE',
  'CANCELLED',
]);
export type PlanStatus = z.infer<typeof planStatusSchema>;

export const customerSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  name: z.string(),
  phone: z.string(),
  instagramId: z.string().nullish(),
  instagramUser: z.string().nullish(),
  origin: customerOriginSchema,
  planStatus: planStatusSchema,
  lastVisit: z.string().nullish(),
  active: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Customer = z.infer<typeof customerSchema>;

export const customerListSchema = paginated(customerSchema);
export type CustomerList = z.infer<typeof customerListSchema>;

export const createCustomerSchema = z.object({
  name: z.string().trim().min(2, 'Informe o nome'),
  phone: z
    .string()
    .trim()
    .min(8, 'Telefone inválido')
    .regex(/^[0-9()+\-\s]+$/, 'Telefone contém caracteres inválidos'),
  instagramUser: z.string().trim().optional(),
});
export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;

export const updateCustomerSchema = createCustomerSchema.partial();
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;

export const PLAN_STATUS_LABEL: Record<PlanStatus, string> = {
  NONE: 'Sem plano',
  ACTIVE: 'Ativo',
  PENDING: 'Pendente',
  OVERDUE: 'Em atraso',
  CANCELLED: 'Cancelado',
};

export const ORIGIN_LABEL: Record<CustomerOrigin, string> = {
  MANUAL: 'Manual',
  WHATSAPP: 'WhatsApp',
  INSTAGRAM: 'Instagram',
};
