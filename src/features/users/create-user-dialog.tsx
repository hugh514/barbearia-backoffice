'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUserActions } from './use-users';
import { createUserSchema, ROLE_LABEL, type CreateUserInput } from './schemas';
import { useSession } from '@/features/auth/session-context';

export function CreateUserDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { create } = useUserActions();
  const { hasRole } = useSession();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { role: 'BARBEIRO' },
  });

  // ADMIN pode criar ADMIN/GERENTE/BARBEIRO; GERENTE só BARBEIRO.
  const roleOptions: (keyof typeof ROLE_LABEL)[] = hasRole('ADMIN')
    ? ['ADMIN', 'GERENTE', 'BARBEIRO']
    : ['BARBEIRO'];

  function onSubmit(values: CreateUserInput) {
    setServerError(null);
    create.mutate(values, {
      onSuccess: () => {
        reset();
        onClose();
      },
      onError: (e) =>
        setServerError(e instanceof Error ? e.message : 'Erro ao criar usuário'),
    });
  }

  return (
    <Dialog open={open} onClose={onClose} title="Novo membro da equipe">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="name">Nome</Label>
          <Input id="name" invalid={!!errors.name} {...register('name')} />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            invalid={!!errors.email}
            {...register('email')}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Senha inicial</Label>
          <Input
            id="password"
            type="password"
            invalid={!!errors.password}
            {...register('password')}
          />
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Papel</Label>
          <select
            id="role"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            {...register('role')}
          >
            {roleOptions.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABEL[r]}
              </option>
            ))}
          </select>
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
            {create.isPending ? 'Salvando…' : 'Cadastrar'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
