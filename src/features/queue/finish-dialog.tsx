'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/toast';
import { getConfig } from '@/features/settings/services';
import { useQueueActions } from './use-queue';
import type { Appointment } from './schemas';
import { maskCurrencyFromDigits, currencyToCents, centsToMasked } from '@/lib/masks';

/** Tenta extrair centavos de um preço textual como "R$ 40" ou "40,00". */
function priceToCents(price: string): number {
  const digits = price.replace(/\D/g, '');
  if (!digits) return 0;
  // Heurística: se tem vírgula/ponto decimal, respeita; senão assume reais inteiros.
  if (/[.,]\d{2}$/.test(price)) return parseInt(digits, 10);
  return parseInt(digits, 10) * 100;
}

export function FinishDialog({
  appointment,
  open,
  onClose,
}: {
  appointment: Appointment | null;
  open: boolean;
  onClose: () => void;
}) {
  const { finish } = useQueueActions();
  const { toast } = useToast();
  const [selected, setSelected] = useState<string[]>([]);
  const [price, setPrice] = useState('');

  const { data: config } = useQuery({
    queryKey: ['channel-config'],
    queryFn: ({ signal }) => getConfig(signal),
    staleTime: 60_000,
  });

  const services = useMemo(() => config?.services ?? [], [config]);

  useEffect(() => {
    if (open) {
      setSelected(appointment?.services ?? []);
      setPrice('');
    }
  }, [open, appointment]);

  // Soma automática dos preços dos serviços selecionados (quando parseáveis).
  useEffect(() => {
    if (!open) return;
    const cents = services
      .filter((s) => selected.includes(s.name))
      .reduce((sum, s) => sum + priceToCents(s.price), 0);
    if (cents > 0) setPrice(centsToMasked(cents));
  }, [selected, services, open]);

  if (!appointment) return null;

  function toggle(name: string) {
    setSelected((cur) =>
      cur.includes(name) ? cur.filter((s) => s !== name) : [...cur, name],
    );
  }

  function submit() {
    const cents = currencyToCents(price);
    finish.mutate(
      {
        id: appointment!.id,
        input: {
          services: selected.length ? selected : undefined,
          totalPrice: cents > 0 ? cents / 100 : undefined,
        },
      },
      {
        onSuccess: () => {
          toast('Atendimento finalizado.');
          onClose();
        },
        onError: (e) =>
          toast(e instanceof Error ? e.message : 'Erro ao finalizar', 'error'),
      },
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Finalizar atendimento"
      description={appointment.customer?.name ?? 'Cliente'}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Serviços realizados</Label>
          {services.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum serviço cadastrado em Configurações.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {services.map((s) => {
                const on = selected.includes(s.name);
                return (
                  <button
                    key={s.name}
                    type="button"
                    onClick={() => toggle(s.name)}
                    className={
                      on
                        ? 'rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground'
                        : 'rounded-full border border-input px-3 py-1.5 text-xs text-foreground hover:bg-secondary'
                    }
                  >
                    {s.name}
                    {s.price ? ` · ${s.price}` : ''}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="finish-price">Valor total</Label>
          <Input
            id="finish-price"
            inputMode="numeric"
            placeholder="R$ 0,00"
            value={price}
            onChange={(e) => setPrice(maskCurrencyFromDigits(e.target.value))}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={submit} disabled={finish.isPending}>
            {finish.isPending ? 'Finalizando…' : 'Finalizar'}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
