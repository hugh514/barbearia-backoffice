'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { listCustomers, type ListParams } from './services';

export function useCustomers(params: ListParams) {
  return useQuery({
    queryKey: ['customers', params],
    queryFn: ({ signal }) => listCustomers(params, signal),
    placeholderData: keepPreviousData,
    staleTime: 15_000,
  });
}
