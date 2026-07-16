/**
 * Configuração de ambiente — SERVER ONLY.
 * Nunca importe este arquivo em código de cliente: `API_BASE_URL` e nomes de
 * cookie não devem vazar para o bundle. (Não usa prefixo NEXT_PUBLIC de propósito.)
 */
export const env = {
  apiBaseUrl: process.env.API_BASE_URL ?? 'http://localhost:3000',
  cookies: {
    access: process.env.SESSION_COOKIE_ACCESS ?? 'bb_at',
    refresh: process.env.SESSION_COOKIE_REFRESH ?? 'bb_rt',
  },
  isProd: process.env.NODE_ENV === 'production',
} as const;
