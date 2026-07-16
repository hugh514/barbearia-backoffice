import { DollarSign, Users, CalendarCheck, Activity } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/features/dashboard/stat-card';
import {
  dashboardSummarySchema,
  PERIOD_LABEL,
  type Period,
} from '@/features/dashboard/schemas';
import { serverApiGet, ServerApiError } from '@/lib/http/server-api';
import { formatBRL, formatPercent } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const sp = await searchParams;
  const period: Period = (['today', 'week', 'month', 'year'] as const).includes(
    sp.period as Period,
  )
    ? (sp.period as Period)
    : 'month';

  let summary = null;
  let error: string | null = null;
  try {
    summary = await serverApiGet(
      `/dashboard/summary?period=${period}`,
      dashboardSummarySchema,
    );
  } catch (e) {
    error =
      e instanceof ServerApiError
        ? e.message
        : 'Não foi possível carregar o dashboard.';
  }

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description={`Visão geral · ${PERIOD_LABEL[period]}`}
      />

      {error && (
        <Card>
          <CardContent className="p-6 text-sm text-destructive">
            {error}
          </CardContent>
        </Card>
      )}

      {summary && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Receita"
              value={formatBRL(summary.revenue)}
              icon={DollarSign}
              highlight
            />
            <StatCard
              label="Atendimentos"
              value={String(summary.totalAppointments)}
              icon={CalendarCheck}
            />
            <StatCard
              label="Novos clientes"
              value={String(summary.newCustomers)}
              icon={Users}
            />
            <StatCard
              label="Ocupação"
              value={formatPercent(summary.occupancyRate)}
              icon={Activity}
            />
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Atendimentos por barbeiro</CardTitle>
            </CardHeader>
            <CardContent>
              {summary.appointmentsByBarber.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhum atendimento no período.
                </p>
              ) : (
                <ul className="divide-y divide-border">
                  {summary.appointmentsByBarber.map((b) => (
                    <li
                      key={b.barberId ?? b.barberName}
                      className="flex items-center justify-between py-3"
                    >
                      <span className="text-sm text-foreground">
                        {b.barberName}
                      </span>
                      <span className="text-sm font-medium text-muted-foreground">
                        {b.count}
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
