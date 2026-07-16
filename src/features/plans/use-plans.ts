'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listPlans, createPlan, updatePlan } from './services';
import type { CreatePlanPayload } from './schemas';

const KEY = ['plans'];

export function usePlans() {
  return useQuery({
    queryKey: KEY,
    queryFn: ({ signal }) => listPlans(1, 50, signal),
    staleTime: 30_000,
  });
}

export function usePlanActions() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: KEY });

  const create = useMutation({
    mutationFn: (payload: CreatePlanPayload) => createPlan(payload),
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreatePlanPayload> }) =>
      updatePlan(id, payload),
    onSuccess: invalidate,
  });
  const setActive = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      updatePlan(id, { active }),
    onSuccess: invalidate,
  });

  return { create, update, setActive };
}
