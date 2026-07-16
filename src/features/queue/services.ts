import { apiClient } from '@/lib/http/client';
import {
  appointmentSchema,
  queueResponseSchema,
  type Appointment,
  type CancelAppointmentInput,
  type FinishAppointmentInput,
} from './schemas';

export async function getQueue(signal?: AbortSignal): Promise<Appointment[]> {
  const res = await apiClient('/appointments/queue', {
    schema: queueResponseSchema,
    signal,
  });
  return res.data;
}

export async function startAppointment(id: string): Promise<Appointment> {
  return apiClient(`/appointments/${id}/start`, {
    method: 'PATCH',
    schema: appointmentSchema,
  });
}

export async function finishAppointment(
  id: string,
  input: FinishAppointmentInput = {},
): Promise<Appointment> {
  return apiClient(`/appointments/${id}/finish`, {
    method: 'PATCH',
    body: input,
    schema: appointmentSchema,
  });
}

export async function cancelAppointment(
  id: string,
  input: CancelAppointmentInput = {},
): Promise<Appointment> {
  return apiClient(`/appointments/${id}/cancel`, {
    method: 'PATCH',
    body: input,
    schema: appointmentSchema,
  });
}
