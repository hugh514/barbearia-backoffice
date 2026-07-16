'use client';

import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { saveConfig } from './services';
import { configFormSchema, type ChannelConfig, type ConfigForm } from './schemas';

const EMPTY: ConfigForm = {
  businessName: '',
  address: '',
  phone: '',
  workingHours: '',
  rules: '',
  whatsappInstance: '',
  instagramPageId: '',
  services: [],
};

export function ConfigFormView({ config }: { config: ChannelConfig | null }) {
  const queryClient = useQueryClient();
  const [saved, setSaved] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ConfigForm>({
    resolver: zodResolver(configFormSchema),
    defaultValues: EMPTY,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'services',
  });

  useEffect(() => {
    if (config) {
      reset({
        businessName: config.businessName,
        address: config.address,
        phone: config.phone,
        workingHours: config.workingHours,
        rules: config.rules ?? '',
        whatsappInstance: config.whatsappInstance ?? '',
        instagramPageId: config.instagramPageId ?? '',
        services: config.services,
      });
    }
  }, [config, reset]);

  const mutation = useMutation({
    mutationFn: (form: ConfigForm) => saveConfig(form, Boolean(config)),
    onSuccess: () => {
      setSaved(true);
      queryClient.invalidateQueries({ queryKey: ['channel-config'] });
      setTimeout(() => setSaved(false), 2500);
    },
    onError: (e) =>
      setServerError(e instanceof Error ? e.message : 'Erro ao salvar'),
  });

  return (
    <form
      onSubmit={handleSubmit((v) => {
        setServerError(null);
        mutation.mutate(v);
      })}
      className="space-y-4"
      noValidate
    >
      <Card>
        <CardHeader>
          <CardTitle>Dados da barbearia</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="businessName">Nome</Label>
            <Input
              id="businessName"
              invalid={!!errors.businessName}
              {...register('businessName')}
            />
            {errors.businessName && (
              <p className="text-sm text-destructive">
                {errors.businessName.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input id="phone" invalid={!!errors.phone} {...register('phone')} />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="address">Endereço</Label>
            <Input
              id="address"
              invalid={!!errors.address}
              {...register('address')}
            />
            {errors.address && (
              <p className="text-sm text-destructive">{errors.address.message}</p>
            )}
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="workingHours">Horário de funcionamento</Label>
            <Input
              id="workingHours"
              placeholder="Seg-Sáb, 9h às 19h"
              invalid={!!errors.workingHours}
              {...register('workingHours')}
            />
            {errors.workingHours && (
              <p className="text-sm text-destructive">
                {errors.workingHours.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Serviços</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ name: '', price: '' })}
            >
              <Plus className="size-4" />
              Adicionar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {fields.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Nenhum serviço cadastrado.
            </p>
          )}
          {fields.map((field, i) => (
            <div key={field.id} className="flex items-center gap-2">
              <Input
                placeholder="Serviço"
                {...register(`services.${i}.name` as const)}
              />
              <Input
                placeholder="Preço (ex: R$ 40)"
                className="max-w-40"
                {...register(`services.${i}.price` as const)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Remover serviço"
                onClick={() => remove(i)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>IA e canais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rules">Regras do assistente (IA)</Label>
            <textarea
              id="rules"
              rows={4}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              {...register('rules')}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="whatsappInstance">Instância WhatsApp</Label>
              <Input id="whatsappInstance" {...register('whatsappInstance')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instagramPageId">Página Instagram (ID)</Label>
              <Input id="instagramPageId" {...register('instagramPageId')} />
            </div>
          </div>
        </CardContent>
      </Card>

      {serverError && (
        <p role="alert" className="text-sm text-destructive">
          {serverError}
        </p>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Salvando…' : 'Salvar configurações'}
        </Button>
        {saved && (
          <span role="status" className="text-sm text-[var(--success)]">
            Salvo com sucesso!
          </span>
        )}
      </div>
    </form>
  );
}
