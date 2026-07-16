import { apiClient } from '@/lib/http/client';
import {
  planListSchema,
  planSchema,
  type CreatePlanPayload,
  type Plan,
} from './schemas';

export async function listPlans(
  page = 1,
  perPage = 50,
  signal?: AbortSignal,
) {
  return apiClient(`/plans?page=${page}&perPage=${perPage}`, {
    schema: planListSchema,
    signal,
  });
}

export async function createPlan(payload: CreatePlanPayload): Promise<Plan> {
  return apiClient('/plans', {
    method: 'POST',
    body: payload,
    schema: planSchema,
  });
}

export async function updatePlan(
  id: string,
  payload: Partial<CreatePlanPayload>,
): Promise<Plan> {
  return apiClient(`/plans/${id}`, {
    method: 'PATCH',
    body: payload,
    schema: planSchema,
  });
}

export async function disablePlan(id: string): Promise<void> {
  await apiClient(`/plans/${id}`, { method: 'DELETE' });
}
