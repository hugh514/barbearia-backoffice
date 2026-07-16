'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Send } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  useConversations,
  useMessages,
  useRealtimeInbox,
  messagesKey,
} from '@/features/inbox/use-inbox';
import { replyConversation } from '@/features/inbox/services';
import { CHANNEL_LABEL, type Conversation } from '@/features/inbox/schemas';
import { formatTime } from '@/lib/format';
import { cn } from '@/lib/utils';

export default function InboxPage() {
  const [active, setActive] = useState<Conversation | null>(null);
  const queryClient = useQueryClient();
  const { data: conversations, isLoading } = useConversations();
  const { data: messages, isLoading: loadingMsgs } = useMessages(
    active?.id ?? null,
  );
  useRealtimeInbox(active?.id ?? null);

  const [text, setText] = useState('');
  const reply = useMutation({
    mutationFn: (msg: string) => replyConversation(active!, msg),
    onSuccess: () => {
      setText('');
      if (active) {
        queryClient.invalidateQueries({ queryKey: messagesKey(active.id) });
      }
    },
  });

  return (
    <div>
      <PageHeader title="Inbox" description="Conversas omnichannel (tempo real)" />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_1fr]">
        {/* Lista de conversas */}
        <Card className="max-h-[calc(100vh-14rem)] overflow-auto p-0">
          {isLoading ? (
            <div className="space-y-2 p-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : (conversations?.data ?? []).length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">
              Nenhuma conversa.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {conversations!.data.map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => setActive(c)}
                    className={cn(
                      'flex w-full flex-col gap-1 px-4 py-3 text-left transition-colors hover:bg-secondary',
                      active?.id === c.id && 'bg-secondary',
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate text-sm font-medium text-foreground">
                        {c.customer?.name ?? 'Cliente'}
                      </span>
                      <StatusBadge tone="amberSoft">
                        {CHANNEL_LABEL[c.channel]}
                      </StatusBadge>
                    </div>
                    <span className="truncate text-xs text-muted-foreground">
                      {c.lastMessage?.content ?? 'Sem mensagens'}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Thread */}
        <Card className="flex max-h-[calc(100vh-14rem)] flex-col">
          {!active ? (
            <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
              Selecione uma conversa
            </div>
          ) : (
            <>
              <div className="border-b border-border p-4">
                <p className="text-sm font-semibold text-foreground">
                  {active.customer?.name ?? 'Cliente'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {active.customer?.phone} · {CHANNEL_LABEL[active.channel]}
                </p>
              </div>

              <div className="flex-1 space-y-2 overflow-auto p-4">
                {loadingMsgs ? (
                  <Skeleton className="h-20 w-full" />
                ) : (
                  (messages?.data ?? []).map((m) => (
                    <div
                      key={m.id}
                      className={cn(
                        'max-w-[75%] rounded-lg px-3 py-2 text-sm',
                        m.direction === 'OUTBOUND'
                          ? 'ml-auto bg-primary text-primary-foreground'
                          : 'bg-secondary text-secondary-foreground',
                      )}
                    >
                      <p>{m.content}</p>
                      <p className="mt-1 text-[10px] opacity-70">
                        {formatTime(m.createdAt)}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <form
                className="flex items-center gap-2 border-t border-border p-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (text.trim()) reply.mutate(text.trim());
                }}
              >
                <Input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Digite uma resposta…"
                  aria-label="Mensagem"
                />
                <Button type="submit" disabled={reply.isPending || !text.trim()}>
                  <Send className="size-4" />
                </Button>
              </form>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
