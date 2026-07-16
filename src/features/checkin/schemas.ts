import { z } from 'zod';
import { appointmentSchema } from '@/features/queue/schemas';

export const checkinResponseSchema = z.object({
  appointment: appointmentSchema,
  queuePosition: z.number(),
  reused: z.boolean(),
});
export type CheckinResponse = z.infer<typeof checkinResponseSchema>;
