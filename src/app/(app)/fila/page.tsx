'use client';

import { PageHeader } from '@/components/layout/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { useQueue } from '@/features/queue/use-queue';
import { QueueBoard } from '@/features/queue/queue-board';

export default function FilaPage() {
  const { data, isLoading, isError, error, isFetching } = useQueue();

  return (
    <div>
      <PageHeader
        title="Fila do Dia"
        description={
          isFetching
            ? 'Atualizando atendimentos…'
            : 'Atendimentos por ordem de chegada (tempo real)'
        }
      />

      {isError && (
        <p className="mb-4 text-sm text-destructive">
          {error instanceof Error ? error.message : 'Erro ao carregar a fila.'}
        </p>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : (
        <QueueBoard appointments={data ?? []} />
      )}
    </div>
  );
}
