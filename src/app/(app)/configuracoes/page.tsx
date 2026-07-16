'use client';

import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/layout/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { getConfig } from '@/features/settings/services';
import { ConfigFormView } from '@/features/settings/config-form';

export default function ConfiguracoesPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['channel-config'],
    queryFn: ({ signal }) => getConfig(signal),
    staleTime: 30_000,
  });

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Configurações"
        description="Dados da barbearia, serviços e canais de atendimento"
      />

      {isError && (
        <p className="mb-4 text-sm text-destructive">
          Erro ao carregar configurações.
        </p>
      )}

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : (
        <ConfigFormView config={data ?? null} />
      )}
    </div>
  );
}
