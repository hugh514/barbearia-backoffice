# Plano Técnico — 001 Foundation + Auth

## Stack
Next.js 16 (App Router) · React 19 · TypeScript strict · Tailwind 4 · shadcn/Radix ·
TanStack Query 5 · TanStack Table 8 + React Virtual 3 · Zod 4 · react-hook-form 7 ·
Vitest + Testing Library · Playwright · `jose` (decode JWT no servidor).

## Estrutura de pastas (espelha ISPO/admin-uni)
```
src/
  app/
    (public)/login/page.tsx
    (public)/forgot-password/page.tsx
    (public)/reset-password/page.tsx
    (app)/layout.tsx            # shell protegido
    (app)/page.tsx              # dashboard (feature 003)
    api/                        # proxy + auth route handlers
      auth/login/route.ts
      auth/logout/route.ts
      auth/refresh/route.ts
      [...path]/route.ts        # proxy genérico p/ API
    layout.tsx  providers.tsx
  features/
    auth/{components,services,schemas,hooks}/
  components/{ui,layout,shared}/
  lib/
    http/         # server-fetch, buildUrl, idempotency
    auth/         # session, cookies, guards, jwt
    zod/          # schemas base (pagination, error)
  config/{site.ts,route-access.ts,navigation.ts}
  types/
```

## Auth — desenho
1. **Login** (`POST /api/auth/login`): route handler valida body (Zod), chama `POST {API}/auth/login`, recebe `{ accessToken, refreshToken }`, seta 2 cookies httpOnly (`bb_at`, `bb_rt`) com `Secure`+`SameSite=Lax`+`Path=/`. `bb_at` expira junto do access; `bb_rt` com TTL do refresh.
2. **Sessão no servidor** (`lib/auth/session.ts`): lê `bb_at`, decodifica com `jose` (sem verificar assinatura — a API é a autoridade; só extrai `sub/role/tenantId/email/exp`). `getServerSession()` retorna `Session | null`.
3. **Proxy** (`app/api/[...path]/route.ts`): encaminha `/api/*` → `{API}/*` com `Authorization: Bearer <bb_at>`. Em `401`: chama refresh interno uma vez; se ok, repete; senão, responde 401 e o cliente redireciona para login.
4. **Refresh atômico** (`lib/auth/refresh.ts`): usa um lock em memória/promise única para coalescer refreshes concorrentes; chama `POST {API}/auth/refresh` com `bb_rt`, re-seta cookies.
5. **Middleware** (`middleware.ts`): para rotas em `(app)`, se não há `bb_at` válido → redireciona `/login?from=`. Checa `route-access.ts` por papel → `/unauthorized`.
6. **Cliente**: `SessionProvider` (Context) recebe a sessão inicial do servidor; `useSession()` expõe `user`/`role`. `fetchApi()` (cliente) sempre chama `/api/*` (mesmo host, cookies `same-origin`), com `Idempotency-Key` em mutações e validação Zod da resposta.

## Schemas Zod base (`lib/zod`)
```ts
export const paginationMetaSchema = z.object({
  total: z.number(), page: z.number(), perPage: z.number(), lastPage: z.number(),
});
export const paginated = <T extends z.ZodTypeAny>(item: T) =>
  z.object({ data: z.array(item), meta: paginationMetaSchema });
export const apiErrorSchema = z.object({
  statusCode: z.number(), message: z.union([z.string(), z.array(z.string())]),
  error: z.string(), correlationId: z.string().optional(),
  timestamp: z.string().optional(), path: z.string().optional(),
});
export const roleSchema = z.enum(['ADMIN','GERENTE','BARBEIRO','CLIENTE']);
```

## Endpoints consumidos
`POST /auth/login` · `POST /auth/refresh` · `POST /auth/logout` · `GET /auth/me` · `POST /tenants/validate`.
Novos (a adicionar na API): `POST /auth/forgot-password` · `POST /auth/reset-password` · `POST /customers/register` (auto-cadastro cliente).

## Testes (TDD)
- `lib/zod`: paginated/apiError parse (happy + inválido).
- `lib/auth/session`: decode de JWT válido/expirado/ausente.
- `features/auth/services`: login/refresh/logout com fetch mockado (msw ou mock).
- `LoginForm`: render, validação, submit sucesso/erro, sem vazar token.
- `route-access`: matriz papel×rota.
