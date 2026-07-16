'use client';

import { useState } from 'react';
import { Plus, Pencil, Power } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/ui/status-badge';
import { ConfirmDialog } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/toast';
import { usePlans, usePlanActions } from '@/features/plans/use-plans';
import { PlanDialog } from '@/features/plans/plan-dialog';
import type { Plan } from '@/features/plans/schemas';
import { formatCents } from '@/lib/format';

export default function PlanosPage() {
  const { data, isLoading, isError } = usePlans();
  const { setActive } = usePlanActions();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [toggling, setToggling] = useState<Plan | null>(null);

  const plans = data?.data ?? [];
  const activePlans = plans.filter((p) => p.active);
  const inactivePlans = plans.filter((p) => !p.active);

  function confirmToggle() {
    if (!toggling) return;
    const next = !toggling.active;
    setActive.mutate(
      { id: toggling.id, active: next },
      {
        onSuccess: () => {
          toast(next ? 'Plano ativado.' : 'Plano desativado.');
          setToggling(null);
        },
        onError: (e) => {
          toast(e instanceof Error ? e.message : 'Erro ao alterar plano', 'error');
          setToggling(null);
        },
      },
    );
  }

  const renderPlan = (plan: Plan) => (
    <Card key={plan.id} className={plan.active ? '' : 'opacity-70'}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle>{plan.name}</CardTitle>
          <StatusBadge tone={plan.active ? 'success' : 'neutral'}>
            {plan.active ? 'Ativo' : 'Inativo'}
          </StatusBadge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-2xl font-bold text-foreground">
          {formatCents(plan.priceCents)}
          <span className="text-sm font-normal text-muted-foreground">
            {' '}/ {plan.intervalDays}d
          </span>
        </p>
        {plan.benefits.length > 0 && (
          <ul className="space-y-1 text-sm text-muted-foreground">
            {plan.benefits.map((b, i) => (
              <li key={i}>• {b}</li>
            ))}
          </ul>
        )}
        <div className="flex gap-2 pt-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditing(plan);
              setDialogOpen(true);
            }}
          >
            <Pencil className="size-4" />
            Editar
          </Button>
          <Button
            variant={plan.active ? 'ghost' : 'default'}
            size="sm"
            onClick={() => setToggling(plan)}
          >
            <Power className="size-4" />
            {plan.active ? 'Desativar' : 'Ativar'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div>
      <PageHeader
        title="Planos"
        description="Planos recorrentes da barbearia"
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="size-4" />
            Novo plano
          </Button>
        }
      />

      {isError && <p className="mb-4 text-sm text-destructive">Erro ao carregar planos.</p>}

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activePlans.map(renderPlan)}
            {activePlans.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhum plano ativo.</p>
            )}
          </div>

          {inactivePlans.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-medium text-muted-foreground">
                Inativos
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {inactivePlans.map(renderPlan)}
              </div>
            </div>
          )}
        </div>
      )}

      <PlanDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        plan={editing}
      />

      <ConfirmDialog
        open={Boolean(toggling)}
        onClose={() => setToggling(null)}
        onConfirm={confirmToggle}
        title={toggling?.active ? 'Desativar plano?' : 'Ativar plano?'}
        description={
          toggling?.active
            ? `"${toggling?.name}" deixará de aparecer para novos clientes.`
            : `"${toggling?.name}" voltará a ficar disponível.`
        }
        confirmLabel={toggling?.active ? 'Desativar' : 'Ativar'}
        tone={toggling?.active ? 'destructive' : 'default'}
        loading={setActive.isPending}
      />
    </div>
  );
}
