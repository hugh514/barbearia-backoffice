import { z } from 'zod';

export const dashboardSummarySchema = z.object({
  period: z.string(),
  totalAppointments: z.number(),
  appointmentsByBarber: z.array(
    z.object({
      barberId: z.string().nullable(),
      barberName: z.string(),
      count: z.number(),
    }),
  ),
  newCustomers: z.number(),
  revenue: z.number(),
  occupancyRate: z.number(),
});
export type DashboardSummary = z.infer<typeof dashboardSummarySchema>;

export const PERIODS = ['today', 'week', 'month', 'year'] as const;
export type Period = (typeof PERIODS)[number];

export const PERIOD_LABEL: Record<Period, string> = {
  today: 'Hoje',
  week: 'Semana',
  month: 'Mês',
  year: 'Ano',
};
