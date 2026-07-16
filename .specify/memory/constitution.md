# Constituição — Backoffice Barbearia (Frontend)

> Princípios inegociáveis do frontend do backoffice. Toda spec, plano e task deve
> estar em conformidade. Complementa a constituição da API (hub central).

---

## Artigo I — A API é a única fonte de verdade
- O frontend nunca acessa banco, filas ou serviços externos direto. Tudo via API Barbearia.
- Nenhum segredo (JWT secret, tokens de integração) vive no bundle do cliente.
- Toda resposta da API é validada com **Zod** antes de entrar no estado da aplicação. Resposta que não bate com o schema é erro tratado, não dado silencioso.

## Artigo II — Segurança da sessão
- Tokens (access + refresh) vivem em **cookies httpOnly**, `Secure`, `SameSite=Lax`, nunca em `localStorage`.
- O browser fala com **route handlers / proxy do Next** (`/api/*`), que anexam o token do cookie e encaminham para a API. O token nunca é exposto ao JS do cliente.
- Refresh automático: em `401`, o proxy tenta refresh atômico uma vez e repete a request; se falhar, limpa a sessão e redireciona para `/login`.
- Logout revoga o refresh token na API e limpa os cookies.

## Artigo III — RBAC em duas camadas
- Papéis: `ADMIN`, `GERENTE`, `BARBEIRO`, `CLIENTE` (espelham a API).
- **Servidor:** `middleware.ts` bloqueia rotas não autorizadas antes de renderizar (redireciona `/login?from=` ou `/unauthorized`).
- **Cliente:** guard/hook esconde ações e navegação sem permissão. Nunca confiar só no cliente — o servidor é a barreira real; a API é a barreira final.
- Regras de acesso por rota centralizadas em `config/route-access.ts`.

## Artigo IV — TDD (obrigatório)
- Todo módulo começa pelo teste: schema Zod, service de API (com mock), hook, componente. Red → Green → Refactor.
- Unit/integration com **Vitest + Testing Library**. E2E com **Playwright** só na validação final.
- Nenhuma feature é "done" sem: teste passando, `tsc` limpo, `lint` limpo.

## Artigo V — Performance
- Listas grandes: **paginação e filtragem server-side** (via query params da API) + **virtualização** (`@tanstack/react-virtual`) quando a lista visível passar de ~50 itens.
- Cache e revalidação com **TanStack Query**. `staleTime` por recurso; invalidação após mutações.
- Server Components por padrão; `"use client"` só onde há interação/estado.
- Sem waterfalls: prefetch no servidor quando possível.

## Artigo VI — Idempotência e mutações seguras
- Toda mutação (POST/PATCH) envia header `Idempotency-Key` (UUID v4) — evita duplicação em retry/duplo-clique.
- Mutações usam estados de loading/erro explícitos; otimismo só quando reversível.

## Artigo VII — Consistência de UI/UX
- Design system único: tokens de cor/tipografia/espaçamento centralizados. Tema claro/escuro.
- Componentes primitivos (shadcn/Radix) + componentes compostos reutilizáveis (`DataTable`, `FormField`, `Dialog`, `PageHeader`, `StatCard`, `StatusBadge`).
- Acessibilidade: foco visível, labels, contraste AA, navegação por teclado.
- Estados vazios, de carregamento e de erro desenhados — nunca tela em branco.

## Artigo VIII — Contratos compartilhados
- Formato de paginação da API: `{ data, meta: { total, page, perPage, lastPage } }`.
- Formato de erro da API: `{ statusCode, message, error, correlationId, timestamp, path }`.
- Esses contratos viram schemas Zod base reutilizados por todos os módulos.

## Artigo IX — Multi-tenancy
- `tenantId` vem do JWT (no servidor), nunca é escolhido/enviado pelo cliente.
- Nenhuma tela permite trocar tenant manualmente (a não ser fluxo explícito de admin multi-tenant, fora do MVP).

## Artigo X — Ordem de desenvolvimento
001 (foundation+auth) → 002 (shell+RBAC) → 003 (dashboard) → 004 (fila) → 005 (clientes) → 006 (planos/assinaturas) → 007 (financeiro) → 008 (inbox) → 009 (checkin QR) → 010 (barbeiros/config). Não pular a ordem: cada uma depende da anterior.
