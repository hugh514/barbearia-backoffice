'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/http/client';
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from '@/features/auth/schemas';

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  async function onSubmit(values: ForgotPasswordInput) {
    await apiClient('/auth/forgot-password', {
      method: 'POST',
      body: values,
    }).catch(() => undefined);
    setSent(true);
  }

  if (sent) {
    return (
      <p className="text-sm text-muted-foreground" role="status">
        Se existir uma conta com esse e-mail, enviaremos um link para redefinir a
        senha. Verifique sua caixa de entrada.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          invalid={!!errors.email}
          {...register('email')}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Enviando…' : 'Enviar link'}
      </Button>
      <div className="text-center">
        <a href="/login" className="text-sm text-muted-foreground hover:text-foreground">
          Voltar ao login
        </a>
      </div>
    </form>
  );
}
