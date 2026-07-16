import { z } from 'zod';

export const appointmentStatusSchema = z.enum([
  'AGUARDANDO',
  'EM_ATENDIMENTO',
  'FINALIZADO',
  'CANCELADO',
]);
export type AppointmentStatus = z.infer<typeof appointmentStatusSchema>;

export const appointmentSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  customerId: z.string(),
  barberId: z.string().nullish(),
  status: appointmentStatusSchema,
  services: z.array(z.string()),
  totalPrice: z.string().nullish(),
  notes: z.string().nullish(),
  cancelReason: z.string().nullish(),
  startedAt: z.string().nullish(),
  finishedAt: z.string().nullish(),
  createdAt: z.string(),
  updatedAt: z.string(),
  customer: z
    .object({ id: z.string(), name: z.string(), phone: z.string() })
    .optional(),
  barber: z
    .object({ id: z.string(), name: z.string() })
    .nullish(),
  waitTimeSeconds: z.number().optional(),
  durationSeconds: z.number().nullish(),
});
export type Appointment = z.infer<typeof appointmentSchema>;

export const queueResponseSchema = z.object({
  data: z.array(appointmentSchema),
});

export const finishAppointmentSchema = z.object({
  notes: z.string().trim().min(1).optional(),
  totalPrice: z.number().positive().optional(),
  services: z.array(z.string()).optional(),
});
export type FinishAppointmentInput = z.infer<typeof finishAppointmentSchema>;

export const cancelAppointmentSchema = z.object({
  reason: z.string().trim().min(1).optional(),
});
export type CancelAppointmentInput = z.infer<typeof cancelAppointmentSchema>;

export const STATUS_LABEL: Record<AppointmentStatus, string> = {
  AGUARDANDO: 'Aguardando',
  EM_ATENDIMENTO: 'Em atendimento',
  FINALIZADO: 'Finalizado',
  CANCELADO: 'Cancelado',
};
