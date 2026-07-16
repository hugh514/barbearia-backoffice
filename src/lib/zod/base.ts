import { z } from 'zod';

/** Papéis do sistema — espelham a API. */
export const roleSchema = z.enum(['ADMIN', 'GERENTE', 'BARBEIRO', 'CLIENTE']);
export type Role = z.infer<typeof roleSchema>;

/** Metadados de paginação retornados pela API. */
export const paginationMetaSchema = z.object({
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  perPage: z.number().int().positive(),
  lastPage: z.number().int().positive(),
});
export type PaginationMeta = z.infer<typeof paginationMetaSchema>;

/** Envelope de lista paginada da API: `{ data, meta }`. */
export function paginated<T extends z.ZodTypeAny>(item: T) {
  return z.object({
    data: z.array(item),
    meta: paginationMetaSchema,
  });
}
export type Paginated<T> = { data: T[]; meta: PaginationMeta };

/** Corpo de erro padrão da API (global-exception.filter). */
export const apiErrorSchema = z.object({
  statusCode: z.number(),
  message: z.union([z.string(), z.array(z.string())]),
  error: z.string(),
  correlationId: z.string().optional(),
  timestamp: z.string().optional(),
  path: z.string().optional(),
});
export type ApiError = z.infer<typeof apiErrorSchema>;

/** Normaliza `message` (string | string[]) para uma única string legível. */
export function errorMessage(err: unknown): string {
  const parsed = apiErrorSchema.safeParse(err);
  if (!parsed.success) return 'Erro inesperado. Tente novamente.';
  const { message } = parsed.data;
  return Array.isArray(message) ? message.join(', ') : message;
}
