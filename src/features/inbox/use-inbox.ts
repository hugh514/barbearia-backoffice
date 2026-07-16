'use client';

import { useEffect } from 'react';
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { io, type Socket } from 'socket.io-client';
import { listConversations, listMessages } from './services';

export const CONVERSATIONS_KEY = ['conversations'];
export const messagesKey = (id: string) => ['messages', id];

export function useConversations() {
  return useQuery({
    queryKey: CONVERSATIONS_KEY,
    queryFn: ({ signal }) => listConversations(1, 30, signal),
    placeholderData: keepPreviousData,
    staleTime: 10_000,
  });
}

export function useMessages(conversationId: string | null) {
  return useQuery({
    queryKey: messagesKey(conversationId ?? 'none'),
    queryFn: ({ signal }) => listMessages(conversationId!, 1, 50, signal),
    enabled: Boolean(conversationId),
    staleTime: 5_000,
  });
}

/**
 * Conecta ao Socket.IO da API (namespace /conversations) para atualização em
 * tempo real. Autentica com um token efêmero obtido do próprio backend (o
 * cookie httpOnly nunca é lido pelo JS). Em `message.new`/`conversation.updated`
 * invalida as queries relevantes.
 */
export function useRealtimeInbox(activeConversationId: string | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    let socket: Socket | null = null;
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch('/api/realtime/token', {
          credentials: 'same-origin',
          cache: 'no-store',
        });
        if (!res.ok) return;
        const { token, url } = (await res.json()) as {
          token: string;
          url: string;
        };
        if (cancelled) return;

        socket = io(`${url}/conversations`, {
          auth: { token },
          transports: ['websocket'],
          reconnectionAttempts: 5,
        });

        socket.on('conversation.updated', () => {
          queryClient.invalidateQueries({ queryKey: CONVERSATIONS_KEY });
        });
        socket.on('message.new', (msg: { conversationId?: string }) => {
          queryClient.invalidateQueries({ queryKey: CONVERSATIONS_KEY });
          if (msg?.conversationId) {
            queryClient.invalidateQueries({
              queryKey: messagesKey(msg.conversationId),
            });
          } else if (activeConversationId) {
            queryClient.invalidateQueries({
              queryKey: messagesKey(activeConversationId),
            });
          }
        });
      } catch {
        // Sem tempo real → o polling das queries cobre a atualização.
      }
    })();

    return () => {
      cancelled = true;
      socket?.disconnect();
    };
  }, [queryClient, activeConversationId]);
}
