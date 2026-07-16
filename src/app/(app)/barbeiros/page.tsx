'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/ui/status-badge';
import { useUsers } from '@/features/users/use-users';
import { CreateUserDialog } from '@/features/users/create-user-dialog';
import { ROLE_LABEL } from '@/features/users/schemas';

export default function BarbeirosPage() {
  const { data, isLoading, isError } = useUsers();
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div>
      <PageHeader
        title="Equipe"
        description="Barbeiros e gestores da barbearia"
        actions={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="size-4" />
            Novo membro
          </Button>
        }
      />

      {isError && (
        <p className="mb-4 text-sm text-destructive">Erro ao carregar equipe.</p>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {(data?.data ?? []).map((u) => (
            <Card
              key={u.id}
              className="flex items-center justify-between gap-4 p-4"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground">
                  {u.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {u.name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {u.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge tone="amberSoft">{ROLE_LABEL[u.role]}</StatusBadge>
                <StatusBadge tone={u.active ? 'success' : 'neutral'}>
                  {u.active ? 'Ativo' : 'Inativo'}
                </StatusBadge>
              </div>
            </Card>
          ))}
          {data && data.data.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Nenhum membro cadastrado.
            </p>
          )}
        </div>
      )}

      <CreateUserDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </div>
  );
}
