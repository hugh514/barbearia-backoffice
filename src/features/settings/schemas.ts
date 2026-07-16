import { z } from 'zod';

export const channelServiceSchema = z.object({
  name: z.string(),
  price: z.string(),
});

export const channelConfigSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  businessName: z.string(),
  services: z.array(channelServiceSchema),
  address: z.string(),
  phone: z.string(),
  workingHours: z.string(),
  rules: z.string().nullish(),
  whatsappInstance: z.string().nullish(),
  instagramPageId: z.string().nullish(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type ChannelConfig = z.infer<typeof channelConfigSchema>;

export const configFormSchema = z.object({
  businessName: z.string().trim().min(1, 'Informe o nome do negócio'),
  address: z.string().trim().min(1, 'Informe o endereço'),
  phone: z.string().trim().min(8, 'Telefone inválido'),
  workingHours: z.string().trim().min(1, 'Informe o horário'),
  rules: z.string().trim().optional(),
  whatsappInstance: z.string().trim().optional(),
  instagramPageId: z.string().trim().optional(),
  services: z.array(channelServiceSchema),
});
export type ConfigForm = z.infer<typeof configFormSchema>;
