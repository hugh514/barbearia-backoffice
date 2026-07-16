# Backoffice Barbearia

Painel de gestão (backoffice) da plataforma de barbearia. Consome exclusivamente a
API central (`../api-barbearia`). Construído com Spec-Driven Development (ver `specs/`).

## Stack
Next.js 16 (App Router) · React 19 · TypeScript strict · Tailwind 4 · TanStack Query/Table/Virtual ·
Zod · react-hook-form · jose · Vitest + Testing Library · Playwright.

## Arquitetura
- **Auth por cookie httpOnly + proxy** (Artigo II): o browser fala só com `/api/*`
  (route handlers do Next), que anexam o token do cookie e encaminham à API. Token
  nunca chega ao JS do cliente. Refresh atômico com retry único em 401.
- **RBAC em duas camadas** (Artigo III): `src/proxy.ts` (middleware do Next 16) barra
  rotas por papel no servidor; guards no cliente escondem ações. API é a barreira final.
- **Validação Zod de toda resposta** (Artigo I): `src/lib/http/client.ts` (browser) e
  `src/lib/http/server-api.ts` (server components) validam antes de usar.
- **Idempotência** (Artigo VI): mutações enviam `Idempotency-Key`.
- **Performance** (Artigo V): paginação/filtragem server-side, virtualização
  (`@tanstack/react-virtual`) em listas grandes, cache com TanStack Query.

## Estrutura
```
src/
  app/            # rotas (public: login/forgot/reset; app: dashboard/fila/clientes/...)
    api/          # proxy + route handlers de auth
  features/       # auth, dashboard, customers, queue, plans, users, finance
  components/     # ui (primitivos) + layout (shell)
  lib/            # zod base, auth (jwt/cookies/session/refresh), http, format
  config/         # route-access (RBAC), navigation
  proxy.ts        # middleware do Next 16 (proteção de rota)
```

## Rodar
```bash
cp .env.example .env.local   # API_BASE_URL=http://localhost:3000
npm install
npm run dev                  # http://localhost:3001
```
A API precisa estar no ar (ver `../api-barbearia`). Credenciais de dev:
`admin@barbearia.example` / `admin123`.

## Testes
```bash
npm test           # unit (Vitest) — 43 testes
npm run test:e2e   # e2e (Playwright, contra build de produção) — 13 testes
npm run typecheck  # tsc
npm run build      # build de produção
```

## Status dos módulos
Ver `specs/README.md`. Implementados: auth, shell/RBAC, dashboard, fila, clientes,
planos, financeiro, equipe. Pendentes (placeholders): inbox (Socket.IO), check-in QR, configurações.
