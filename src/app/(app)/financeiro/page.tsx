import { DollarSign, Scissors, CreditCard } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/features/dashboard/stat-card';
import { revenueMetricsSchema } from '@/features/finance/schemas';
import { serverApiGet, ServerApiError } from '@/lib/http/server-api';
import { formatBRL } from '@/lib/format';

export const dynamic = 'force-dynamic';

const PERIODS = ['today', 'week', 'month', 'year'] as const;
const LABEL: Record<(typeof PERIODS)[number], string> = {
  today: 'Hoje',
  week: 'Semana',
  month: 'Mês',
  year: 'Ano',
};

export default async function FinanceiroPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const sp = await searchParams;
  const period = PERIODS.includes(sp.period as (typeof PERIODS)[number])
    ? (sp.period as (typeof PERIODS)[number])
    : 'month';

  let metrics = null;
  let error: string | null = null;
  try {
    metrics = await serverApiGet(
      `/dashboard/revenue?period=${period}`,
      revenueMetricsSchema,
    );
  } catch (e) {
    error =
      e instanceof ServerApiError ? e.message : 'Erro ao carregar financeiro.';
  }

  return (
    <div>
      <PageHeader
        title="Financeiro"
        description={`Receita · ${LABEL[period]}`}
      />

      {error && (
        <Card>
          <CardContent className="p-6 text-sm text-destructive">
            {error}
          </CardContent>
        </Card>
      )}

      {metrics && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard
              label="Receita total"
              value={formatBRL(metrics.totalRevenue)}
              icon={DollarSign}
              highlight
            />
            <StatCard
              label="Atendimentos"
              value={formatBRL(metrics.appointmentRevenue)}
              icon={Scissors}
            />
            <StatCard
              label="Planos"
              value={formatBRL(metrics.planRevenue)}
              icon={CreditCard}
            />
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Receita por barbeiro</CardTitle>
            </CardHeader>
            <CardContent>
              {metrics.revenueByBarber.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhuma receita no período.
                </p>
              ) : (
                <ul className="divide-y divide-border">
                  {metrics.revenueByBarber.map((b) => (
                    <li
                      key={b.barberId ?? b.barberName}
                      className="flex items-center justify-between py-3"
                    >
                      <span className="text-sm text-foreground">
                        {b.barberName}
                        <span className="ml-2 text-xs text-muted-foreground">
                          {b.appointmentCount} atend.
                        </span>
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        {formatBRL(b.revenue)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
