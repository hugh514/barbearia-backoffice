'use client';

import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useCustomers } from '@/features/customers/use-customers';
import { CustomersTable } from '@/features/customers/customers-table';
import { CreateCustomerDialog } from '@/features/customers/create-customer-dialog';

export default function ClientesPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const debounced = useDebouncedValue(search);

  const { data, isLoading, isError, error } = useCustomers({
    page,
    perPage: 20,
    search: debounced || undefined,
  });

  const meta = data?.meta;

  return (
    <div>
      <PageHeader
        title="Clientes"
        description="Base de clientes da barbearia"
        actions={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="size-4" />
            Novo cliente
          </Button>
        }
      />

      <div className="mb-4 flex items-center gap-2">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Buscar por nome, telefone ou Instagram"
            className="pl-9"
            aria-label="Buscar clientes"
          />
        </div>
      </div>

      {isError && (
        <p className="mb-4 text-sm text-destructive">
          {error instanceof Error ? error.message : 'Erro ao carregar clientes.'}
        </p>
      )}

      <CustomersTable customers={data?.data ?? []} loading={isLoading} />

      {meta && meta.total > 0 && (
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {meta.total} cliente{meta.total !== 1 ? 's' : ''} · página{' '}
            {meta.page} de {meta.lastPage}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= meta.lastPage}
              onClick={() => setPage((p) => p + 1)}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}

      <CreateCustomerDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </div>
  );
}
