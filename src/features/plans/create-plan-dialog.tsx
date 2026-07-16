'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePlanActions } from './use-plans';
import { createPlanSchema, type CreatePlanForm } from './schemas';

export function CreatePlanDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { create } = usePlanActions();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreatePlanForm>({
    resolver: zodResolver(createPlanSchema),
    defaultValues: { intervalDays: 30, benefits: [] },
  });

  function onSubmit(values: CreatePlanForm) {
    setServerError(null);
    create.mutate(
      {
        name: values.name,
        description: values.description || undefined,
        priceCents: Math.round(values.priceReais * 100),
        intervalDays: values.intervalDays,
        benefits: values.benefits ?? [],
      },
      {
        onSuccess: () => {
          reset();
          onClose();
        },
        onError: (e) =>
          setServerError(e instanceof Error ? e.message : 'Erro ao criar plano'),
      },
    );
  }

  return (
    <Dialog open={open} onClose={onClose} title="Novo plano">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="name">Nome</Label>
          <Input id="name" invalid={!!errors.name} {...register('name')} />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="priceReais">Preço mensal (R$)</Label>
          <Input
            id="priceReais"
            type="number"
            step="0.01"
            invalid={!!errors.priceReais}
            {...register('priceReais', { valueAsNumber: true })}
          />
          {errors.priceReais && (
            <p className="text-sm text-destructive">{errors.priceReais.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="intervalDays">Intervalo (dias)</Label>
          <Input
            id="intervalDays"
            type="number"
            {...register('intervalDays', { valueAsNumber: true })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Descrição (opcional)</Label>
          <Input id="description" {...register('description')} />
        </div>
        {serverError && (
          <p role="alert" className="text-sm text-destructive">
            {serverError}
          </p>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={create.isPending}>
            {create.isPending ? 'Salvando…' : 'Salvar'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
