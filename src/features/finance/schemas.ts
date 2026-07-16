import { z } from 'zod';

export const revenueMetricsSchema = z.object({
  period: z.string(),
  appointmentRevenue: z.number(),
  planRevenue: z.number(),
  totalRevenue: z.number(),
  revenueByBarber: z.array(
    z.object({
      barberId: z.string().nullable(),
      barberName: z.string(),
      revenue: z.number(),
      appointmentCount: z.number(),
    }),
  ),
});
export type RevenueMetrics = z.infer<typeof revenueMetricsSchema>;
