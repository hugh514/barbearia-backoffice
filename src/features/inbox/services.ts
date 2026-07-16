import { apiClient } from '@/lib/http/client';
import {
  conversationListSchema,
  messageListSchema,
  type Conversation,
} from './schemas';

export async function listConversations(
  page = 1,
  perPage = 30,
  signal?: AbortSignal,
) {
  return apiClient(`/conversations?page=${page}&perPage=${perPage}`, {
    schema: conversationListSchema,
    signal,
  });
}

export async function listMessages(
  conversationId: string,
  page = 1,
  perPage = 50,
  signal?: AbortSignal,
) {
  return apiClient(
    `/conversations/${conversationId}/messages?page=${page}&perPage=${perPage}`,
    { schema: messageListSchema, signal },
  );
}

/** Responde numa conversa via canal (WhatsApp/Instagram). */
export async function replyConversation(
  conversation: Conversation,
  message: string,
): Promise<void> {
  await apiClient(`/channels/${conversation.channel.toLowerCase()}/reply`, {
    method: 'POST',
    body: { conversationId: conversation.id, message },
  });
}
