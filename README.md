# barbearia-backoffice

Painel de gestão da plataforma de barbearia. Consome exclusivamente a API
[`api-barbearia`](https://github.com/hugh514/api-barbearia).

| Item | Valor |
|------|--------|
| Repositório | https://github.com/hugh514/barbearia-backoffice |
| Porta local | `http://localhost:3001` |
| API | `API_BASE_URL=http://localhost:3000` |

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind 4 · TanStack Query/Table/Virtual ·
Zod · react-hook-form · jose · Vitest · Playwright

## Arquitetura

- **Auth por cookie httpOnly + proxy**: o browser fala só com `/api/*`; tokens não vão para o JS do cliente.
- **RBAC**: `src/proxy.ts` protege rotas; a API é a barreira final.
- **Validação Zod** de respostas em `src/lib/http/`.
- **Idempotência**: mutações enviam `Idempotency-Key`.

## Estrutura

```text
src/
  app/            # rotas (public + app)
    api/          # proxy e auth
  features/       # auth, dashboard, customers, queue, plans, subscriptions, …
  components/     # ui + layout
  lib/            # http, auth, format
  config/         # route-access, navigation
  proxy.ts        # proteção de rota (Next 16)
specs/            # SDD
```

## Rodar

```bash
cp .env.example .env.local
npm install
npm run dev
```

A API precisa estar no ar (`api-barbearia`). Credenciais de seed: `admin@barbearia.example` / `admin123`.

## Testes

```bash
npm test
npm run test:e2e
npm run typecheck
npm run build
```

## Módulos

Auth, shell/RBAC, dashboard, fila, clientes, planos, assinaturas, financeiro, equipe, inbox, check-in QR, configurações. Detalhes em `specs/README.md`.

## Ecossistema

| Repositório | Papel | Porta |
|-------------|--------|-------|
| [api-barbearia](https://github.com/hugh514/api-barbearia) | API | 3000 |
| [barbearia-backoffice](https://github.com/hugh514/barbearia-backoffice) | Painel da equipe | 3001 |
| [barbearia-cliente](https://github.com/hugh514/barbearia-cliente) | App do cliente | 3002 |
