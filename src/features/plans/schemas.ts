import { z } from 'zod';
import { paginated } from '@/lib/zod/base';

export const planSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  name: z.string(),
  description: z.string().nullish(),
  priceCents: z.number(),
  intervalDays: z.number(),
  benefits: z.array(z.string()),
  active: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Plan = z.infer<typeof planSchema>;

export const planListSchema = paginated(planSchema);

export const createPlanSchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome'),
  description: z.string().trim().optional(),
  priceReais: z
    .number({ message: 'Informe o preço' })
    .positive('Preço deve ser maior que zero'),
  intervalDays: z.number().int().positive(),
  benefits: z.array(z.string()).optional(),
});
export type CreatePlanForm = z.infer<typeof createPlanSchema>;

/** Payload enviado à API (converte reais → centavos). */
export interface CreatePlanPayload {
  name: string;
  description?: string;
  priceCents: number;
  intervalDays: number;
  benefits: string[];
  active?: boolean;
}
