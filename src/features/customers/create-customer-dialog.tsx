'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/toast';
import { createCustomer } from './services';
import { createCustomerSchema, type CreateCustomerInput } from './schemas';
import { maskPhone } from '@/lib/masks';

export function CreateCustomerDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateCustomerInput>({
    resolver: zodResolver(createCustomerSchema),
  });

  const phoneField = register('phone');

  const mutation = useMutation({
    mutationFn: (input: CreateCustomerInput) => createCustomer(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast('Cliente cadastrado.');
      reset();
      onClose();
    },
    onError: (e) =>
      setServerError(e instanceof Error ? e.message : 'Erro ao criar cliente'),
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Novo cliente"
      description="Cadastre um cliente manualmente"
    >
      <form
        onSubmit={handleSubmit((v) => {
          setServerError(null);
          mutation.mutate(v);
        })}
        className="space-y-4"
        noValidate
      >
        <div className="space-y-2">
          <Label htmlFor="name">Nome</Label>
          <Input id="name" invalid={!!errors.name} {...register('name')} />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Telefone</Label>
          <Input
            id="phone"
            inputMode="tel"
            placeholder="(11) 99999-9999"
            invalid={!!errors.phone}
            {...phoneField}
            onChange={(e) => {
              e.target.value = maskPhone(e.target.value);
              phoneField.onChange(e);
            }}
          />
          {errors.phone && (
            <p className="text-sm text-destructive">{errors.phone.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="instagramUser">Instagram (opcional)</Label>
          <Input id="instagramUser" {...register('instagramUser')} />
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
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Salvando…' : 'Salvar'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
