'use client';

import { useState } from 'react';
import { Play, CheckCircle2, X } from 'lucide-react';
import type { Appointment, AppointmentStatus } from './schemas';
import { STATUS_LABEL } from './schemas';
import { useQueueActions } from './use-queue';
import { FinishDialog } from './finish-dialog';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge, type BadgeTone } from '@/components/ui/status-badge';
import { ConfirmDialog } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/toast';
import { formatTime } from '@/lib/format';

const TONE: Record<AppointmentStatus, BadgeTone> = {
  AGUARDANDO: 'neutral',
  EM_ATENDIMENTO: 'amberSoft',
  FINALIZADO: 'success',
  CANCELADO: 'danger',
};

function QueueCard({
  appt,
  onFinish,
  onCancel,
}: {
  appt: Appointment;
  onFinish: (a: Appointment) => void;
  onCancel: (a: Appointment) => void;
}) {
  const { start } = useQueueActions();
  const { toast } = useToast();
  const name = appt.customer?.name ?? 'Cliente';
  const busy = start.isPending;

  return (
    <Card className="flex items-center justify-between gap-3 p-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground">
          {name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">{name}</p>
          <p className="truncate text-xs text-muted-foreground">
            {appt.barber?.name ?? 'Sem barbeiro'} ·{' '}
            {appt.services.length ? appt.services.join(', ') : 'A definir'} ·{' '}
            {formatTime(appt.createdAt)}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <StatusBadge tone={TONE[appt.status]}>{STATUS_LABEL[appt.status]}</StatusBadge>
        {appt.status === 'AGUARDANDO' && (
          <>
            <Button
              size="sm"
              disabled={busy}
              onClick={() =>
                start.mutate(appt.id, {
                  onSuccess: () => toast('Atendimento iniciado.'),
                  onError: (e) =>
                    toast(
                      e instanceof Error ? e.message : 'Erro ao iniciar',
                      'error',
                    ),
                })
              }
            >
              <Play className="size-3.5" />
              Iniciar
            </Button>
            <Button
              size="sm"
              variant="ghost"
              aria-label="Cancelar"
              onClick={() => onCancel(appt)}
            >
              <X className="size-4" />
            </Button>
          </>
        )}
        {appt.status === 'EM_ATENDIMENTO' && (
          <Button size="sm" onClick={() => onFinish(appt)}>
            <CheckCircle2 className="size-3.5" />
            Finalizar
          </Button>
        )}
      </div>
    </Card>
  );
}

export function QueueBoard({ appointments }: { appointments: Appointment[] }) {
  const { cancel } = useQueueActions();
  const { toast } = useToast();
  const [finishing, setFinishing] = useState<Appointment | null>(null);
  const [cancelling, setCancelling] = useState<Appointment | null>(null);

  const groups: { status: AppointmentStatus; items: Appointment[] }[] = [
    { status: 'AGUARDANDO', items: appointments.filter((a) => a.status === 'AGUARDANDO') },
    { status: 'EM_ATENDIMENTO', items: appointments.filter((a) => a.status === 'EM_ATENDIMENTO') },
    { status: 'FINALIZADO', items: appointments.filter((a) => a.status === 'FINALIZADO') },
  ];

  return (
    <>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {groups.map((g) => (
          <div key={g.status} className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">
                {STATUS_LABEL[g.status]}
              </h3>
              <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                {g.items.length}
              </span>
            </div>
            {g.items.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                Vazio
              </p>
            ) : (
              g.items.map((a) => (
                <QueueCard
                  key={a.id}
                  appt={a}
                  onFinish={setFinishing}
                  onCancel={setCancelling}
                />
              ))
            )}
          </div>
        ))}
      </div>

      <FinishDialog
        appointment={finishing}
        open={Boolean(finishing)}
        onClose={() => setFinishing(null)}
      />

      <ConfirmDialog
        open={Boolean(cancelling)}
        onClose={() => setCancelling(null)}
        onConfirm={() => {
          if (!cancelling) return;
          cancel.mutate(
            { id: cancelling.id },
            {
              onSuccess: () => {
                toast('Atendimento cancelado.');
                setCancelling(null);
              },
              onError: (e) => {
                toast(e instanceof Error ? e.message : 'Erro ao cancelar', 'error');
                setCancelling(null);
              },
            },
          );
        }}
        title="Cancelar atendimento?"
        description={`Remover ${cancelling?.customer?.name ?? 'o cliente'} da fila.`}
        confirmLabel="Cancelar atendimento"
        tone="destructive"
        loading={cancel.isPending}
      />
    </>
  );
}
