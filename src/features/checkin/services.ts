import { apiClient } from '@/lib/http/client';
import { checkinResponseSchema, type CheckinResponse } from './schemas';

export async function consumeCheckin(token: string): Promise<CheckinResponse> {
  return apiClient('/checkin/consume', {
    method: 'POST',
    body: { token },
    schema: checkinResponseSchema,
  });
}
