'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { loginSchema, type LoginInput } from '@/features/auth/schemas';
import { loginRequest } from '@/features/auth/services';
import { ApiRequestError } from '@/lib/http/client';

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [serverError, setServerError] = useState<string | null>(null);
  const [needsTenant, setNeedsTenant] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginInput) {
    setServerError(null);
    try {
      await loginRequest(values);
      const from = params.get('from');
      router.replace(from && from.startsWith('/') ? from : '/');
      router.refresh();
    } catch (err) {
      if (err instanceof ApiRequestError && err.status === 400) {
        setNeedsTenant(true);
      }
      setServerError(
        err instanceof Error ? err.message : 'Não foi possível entrar.',
      );
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
      noValidate
      aria-describedby={serverError ? 'login-error' : undefined}
    >
      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="voce@barbearia.com"
          invalid={!!errors.email}
          {...register('email')}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          invalid={!!errors.password}
          {...register('password')}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      {needsTenant && (
        <div className="space-y-2">
          <Label htmlFor="tenantSlug">Barbearia</Label>
          <Input
            id="tenantSlug"
            type="text"
            placeholder="identificador-da-barbearia"
            {...register('tenantSlug')}
          />
          <p className="text-xs text-muted-foreground">
            Seu e-mail está em mais de uma barbearia. Informe o identificador.
          </p>
        </div>
      )}

      {serverError && (
        <p id="login-error" role="alert" className="text-sm text-destructive">
          {serverError}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Entrando…' : 'Entrar'}
      </Button>

      <div className="text-center">
        <a
          href="/forgot-password"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Esqueci minha senha
        </a>
      </div>
    </form>
  );
}
