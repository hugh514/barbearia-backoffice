'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listUsers, createUser } from './services';
import type { CreateUserInput } from './schemas';

const KEY = ['users'];

export function useUsers() {
  return useQuery({
    queryKey: KEY,
    queryFn: ({ signal }) => listUsers(1, 50, signal),
    staleTime: 30_000,
  });
}

export function useUserActions() {
  const queryClient = useQueryClient();
  const create = useMutation({
    mutationFn: (input: CreateUserInput) => createUser(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
  return { create };
}
