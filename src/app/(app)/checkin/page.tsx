'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, UserCheck } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QrScanner } from '@/features/checkin/qr-scanner';
import { consumeCheckin } from '@/features/checkin/services';
import type { CheckinResponse } from '@/features/checkin/schemas';

export default function CheckinPage() {
  const queryClient = useQueryClient();
  const [token, setToken] = useState('');
  const [result, setResult] = useState<CheckinResponse | null>(null);

  const consume = useMutation({
    mutationFn: (t: string) => consumeCheckin(t),
    onSuccess: (data) => {
      setResult(data);
      setToken('');
      queryClient.invalidateQueries({ queryKey: ['queue'] });
    },
  });

  function submit(value: string) {
    const t = value.trim();
    if (t) consume.mutate(t);
  }

  return (
    <div>
      <PageHeader
        title="Check-in"
        description="Escaneie o QR do cliente ou informe o token para colocá-lo na fila"
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Validar cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <QrScanner onScan={submit} />

            <form
              className="space-y-2"
              onSubmit={(e) => {
                e.preventDefault();
                submit(token);
              }}
            >
              <Label htmlFor="token">Token manual</Label>
              <div className="flex gap-2">
                <Input
                  id="token"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Cole o token do cliente"
                />
                <Button type="submit" disabled={consume.isPending}>
                  <UserCheck className="size-4" />
                  Validar
                </Button>
              </div>
            </form>

            {consume.isError && (
              <p role="alert" className="text-sm text-destructive">
                {consume.error instanceof Error
                  ? consume.error.message
                  : 'Token inválido ou expirado.'}
              </p>
            )}
          </CardContent>
        </Card>

        {result && (
          <Card className="border-[var(--success)]/40">
            <CardContent className="space-y-2 p-6">
              <div className="flex items-center gap-2 text-[var(--success)]">
                <CheckCircle2 className="size-5" />
                <span className="font-semibold">
                  {result.reused
                    ? 'Cliente já estava na fila'
                    : 'Check-in confirmado!'}
                </span>
              </div>
              <p className="text-sm text-foreground">
                {result.appointment.customer?.name ?? 'Cliente'}
              </p>
              <p className="text-sm text-muted-foreground">
                Posição na fila: <strong>{result.queuePosition}</strong>
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
