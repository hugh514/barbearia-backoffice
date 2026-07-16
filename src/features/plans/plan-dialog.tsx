'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/toast';
import { usePlanActions } from './use-plans';
import { createPlanSchema, type CreatePlanForm, type Plan } from './schemas';
import { maskCurrencyFromDigits, currencyToCents, centsToMasked } from '@/lib/masks';

export function PlanDialog({
  open,
  onClose,
  plan,
}: {
  open: boolean;
  onClose: () => void;
  plan?: Plan | null;
}) {
  const { create, update } = usePlanActions();
  const { toast } = useToast();
  const [price, setPrice] = useState('');
  const [serverError, setServerError] = useState<string | null>(null);
  const isEdit = Boolean(plan);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreatePlanForm>({
    resolver: zodResolver(createPlanSchema),
    defaultValues: { intervalDays: 30, benefits: [] },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: plan?.name ?? '',
        description: plan?.description ?? '',
        priceReais: plan ? plan.priceCents / 100 : 0,
        intervalDays: plan?.intervalDays ?? 30,
        benefits: plan?.benefits ?? [],
      });
      setPrice(plan ? centsToMasked(plan.priceCents) : '');
      setServerError(null);
    }
  }, [open, plan, reset]);

  function onSubmit(values: CreatePlanForm) {
    setServerError(null);
    const priceCents = currencyToCents(price);
    if (priceCents <= 0) {
      setServerError('Informe um preço válido.');
      return;
    }
    const payload = {
      name: values.name,
      description: values.description || undefined,
      priceCents,
      intervalDays: values.intervalDays,
      benefits: values.benefits ?? [],
    };
    const onDone = {
      onSuccess: () => {
        toast(isEdit ? 'Plano atualizado.' : 'Plano criado.');
        reset();
        onClose();
      },
      onError: (e: unknown) =>
        setServerError(e instanceof Error ? e.message : 'Erro ao salvar plano'),
    };
    if (isEdit && plan) {
      update.mutate({ id: plan.id, payload }, onDone);
    } else {
      create.mutate(payload, onDone);
    }
  }

  const pending = create.isPending || update.isPending;

  return (
    <Dialog open={open} onClose={onClose} title={isEdit ? 'Editar plano' : 'Novo plano'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="name">Nome</Label>
          <Input id="name" invalid={!!errors.name} {...register('name')} />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">Preço mensal</Label>
          <Input
            id="price"
            inputMode="numeric"
            placeholder="R$ 0,00"
            value={price}
            onChange={(e) => setPrice(maskCurrencyFromDigits(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="intervalDays">Intervalo (dias)</Label>
          <Input
            id="intervalDays"
            type="number"
            inputMode="numeric"
            {...register('intervalDays', { valueAsNumber: true })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Descrição (opcional)</Label>
          <Input id="description" {...register('description')} />
        </div>
        {serverError && <p role="alert" className="text-sm text-destructive">{serverError}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={pending}>
            {pending ? 'Salvando…' : 'Salvar'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
