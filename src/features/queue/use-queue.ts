'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getQueue,
  startAppointment,
  finishAppointment,
  cancelAppointment,
} from './services';
import type {
  CancelAppointmentInput,
  FinishAppointmentInput,
} from './schemas';

const QUEUE_KEY = ['queue'];

export function useQueue() {
  return useQuery({
    queryKey: QUEUE_KEY,
    queryFn: ({ signal }) => getQueue(signal),
    // Near-real-time: revalida a fila periodicamente.
    refetchInterval: 10_000,
    staleTime: 5_000,
  });
}

export function useQueueActions() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: QUEUE_KEY });

  const start = useMutation({
    mutationFn: (id: string) => startAppointment(id),
    onSuccess: invalidate,
  });
  const finish = useMutation({
    mutationFn: ({ id, input }: { id: string; input?: FinishAppointmentInput }) =>
      finishAppointment(id, input),
    onSuccess: invalidate,
  });
  const cancel = useMutation({
    mutationFn: ({ id, input }: { id: string; input?: CancelAppointmentInput }) =>
      cancelAppointment(id, input),
    onSuccess: invalidate,
  });

  return { start, finish, cancel };
}
