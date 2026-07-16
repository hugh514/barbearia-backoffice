import { z } from 'zod';
import { paginated } from '@/lib/zod/base';

export const conversationChannelSchema = z.enum(['WHATSAPP', 'INSTAGRAM']);
export type ConversationChannel = z.infer<typeof conversationChannelSchema>;

export const conversationStatusSchema = z.enum([
  'ABERTA',
  'AGUARDANDO',
  'EM_ATENDIMENTO',
  'FECHADA',
]);
export type ConversationStatus = z.infer<typeof conversationStatusSchema>;

export const conversationSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  customerId: z.string(),
  channel: conversationChannelSchema,
  status: conversationStatusSchema,
  assignedTo: z.string().nullish(),
  createdAt: z.string(),
  updatedAt: z.string(),
  customer: z
    .object({
      id: z.string(),
      name: z.string(),
      phone: z.string(),
      instagramUser: z.string().nullish(),
    })
    .optional(),
  lastMessage: z
    .object({
      id: z.string(),
      content: z.string(),
      direction: z.string(),
      createdAt: z.string(),
    })
    .nullish(),
});
export type Conversation = z.infer<typeof conversationSchema>;

export const conversationListSchema = paginated(conversationSchema);

export const messageSchema = z.object({
  id: z.string(),
  conversationId: z.string(),
  content: z.string(),
  direction: z.enum(['INBOUND', 'OUTBOUND']),
  channel: conversationChannelSchema,
  createdAt: z.string(),
});
export type Message = z.infer<typeof messageSchema>;

export const messageListSchema = paginated(messageSchema);

export const CHANNEL_LABEL: Record<ConversationChannel, string> = {
  WHATSAPP: 'WhatsApp',
  INSTAGRAM: 'Instagram',
};

export const CONV_STATUS_LABEL: Record<ConversationStatus, string> = {
  ABERTA: 'Aberta',
  AGUARDANDO: 'Aguardando',
  EM_ATENDIMENTO: 'Em atendimento',
  FECHADA: 'Fechada',
};
