import { apiClient } from '@/lib/http/client';
import {
  userListSchema,
  userSchema,
  type CreateUserInput,
  type User,
} from './schemas';

export async function listUsers(
  page = 1,
  limit = 50,
  signal?: AbortSignal,
) {
  return apiClient(`/users?page=${page}&limit=${limit}`, {
    schema: userListSchema,
    signal,
  });
}

export async function createUser(input: CreateUserInput): Promise<User> {
  return apiClient('/users', {
    method: 'POST',
    body: input,
    schema: userSchema,
  });
}
