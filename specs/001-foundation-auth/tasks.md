# Tasks — 001 Foundation + Auth

> TDD: escrever o teste antes da implementação em cada bloco.

## Setup
- [ ] T001 Instalar deps: `@tanstack/react-query @tanstack/react-table @tanstack/react-virtual zod react-hook-form @hookform/resolvers jose clsx tailwind-merge lucide-react`
- [ ] T002 Dev deps: `vitest @vitejs/plugin-react @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom @playwright/test`
- [ ] T003 Config Vitest (`vitest.config.ts`, setup jsdom + jest-dom) e script `test`
- [ ] T004 Config Playwright (`playwright.config.ts`) e scripts `test:e2e`
- [ ] T005 shadcn/ui init + primitivos base (button, input, label, form, card, dialog, dropdown, sonner/toast)
- [ ] T006 Tokens de tema (globals.css): paleta (sidebar escura, accent âmbar), dark mode

## Contratos base (Zod)
- [ ] T010 [teste] `lib/zod/base.spec.ts` — paginated/apiError/role parse
- [ ] T011 Implementar `lib/zod/base.ts`

## Sessão & JWT
- [ ] T012 [teste] `lib/auth/session.spec.ts` — decode válido/expirado/ausente
- [ ] T013 Implementar `lib/auth/jwt.ts` + `lib/auth/session.ts` (jose, cookies `bb_at`/`bb_rt`)
- [ ] T014 [teste] `config/route-access.spec.ts` — matriz papel×rota
- [ ] T015 Implementar `config/route-access.ts` + `config/navigation.ts`

## HTTP / Proxy
- [ ] T016 Implementar `lib/http/server-fetch.ts` (buildUrl, headers, idempotency)
- [ ] T017 Route handler `app/api/auth/login/route.ts` (Zod, set cookies)
- [ ] T018 Route handler `app/api/auth/refresh/route.ts` (refresh atômico coalescido)
- [ ] T019 Route handler `app/api/auth/logout/route.ts` (revoga + limpa)
- [ ] T020 Proxy `app/api/[...path]/route.ts` (Bearer + retry em 401)
- [ ] T021 [teste] `lib/http/client.spec.ts` — fetchApi valida resposta, injeta idempotency
- [ ] T022 Implementar `lib/http/client.ts` (cliente → `/api/*`)

## Middleware & Guards
- [ ] T023 `middleware.ts` — protege `(app)`, redireciona login/unauthorized
- [ ] T024 `SessionProvider` + `useSession` + `PermissionGuard`

## Telas de auth
- [ ] T025 [teste] `LoginForm.spec.tsx` — validação, submit ok/erro, sem vazar token
- [ ] T026 `features/auth/components/login-form.tsx` + `app/(public)/login/page.tsx`
- [ ] T027 [teste] serviços auth (login/refresh/logout mockados)
- [ ] T028 `features/auth/services/auth.service.ts` + schemas
- [ ] T029 `forgot-password` e `reset-password` (telas + serviços) — depende da extensão da API
- [ ] T030 Providers globais (`app/providers.tsx`: QueryClient + Session + Theme + Toaster)

## Done quando
- [ ] Todos os testes verdes, `tsc` limpo, `lint` limpo, login→dashboard funcionando contra a API real.
