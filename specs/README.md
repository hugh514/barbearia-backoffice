# Specs — Backoffice Barbearia (SDD / speckit)

Desenvolvimento orientado a specs. Ordem obrigatória (constituição, Artigo X).
Cada módulo mapeia telas → endpoints da API → papéis.

Contratos base (todos): paginação `{ data, meta:{total,page,perPage,lastPage} }`, erro
`{ statusCode, message, error, correlationId, timestamp, path }`. Papéis: ADMIN, GERENTE, BARBEIRO, CLIENTE.

| # | Módulo | Telas | Endpoints API | Papéis |
|---|--------|-------|---------------|--------|
| 001 | Foundation + Auth | login, forgot/reset senha, cadastro | `/auth/login,refresh,logout,me`, `/tenants/validate` | todos |
| 002 | Shell + RBAC | sidebar, topbar, breadcrumbs, unauthorized | — | todos |
| 003 | Dashboard | KPIs, gráficos (clientes, receita), últimos atendimentos | `/dashboard/summary,customers,revenue,plans,conversations,barbers` | ADMIN, GERENTE |
| 004 | Fila do Dia (walk-in) | kanban Aguardando/Atendendo/Finalizado, iniciar/finalizar/cancelar, entrada na fila, tempo real | `/appointments`, `/appointments/queue`, `/appointments/:id/start\|finish\|cancel` | ADMIN, GERENTE, BARBEIRO |
| 005 | Clientes (CRM) | lista (paginada/filtrada/virtualizada), detalhe (pagamentos, histórico, conversas), criar/editar/upsert | `/customers`, `/customers/:id`, `/customers/:id/payments\|history\|conversations` | ADMIN, GERENTE, BARBEIRO |
| 006 | Planos & Assinaturas | CRUD planos; lista/detalhe assinaturas; ativar/suspender/cancelar/renovar | `/plans*`, `/subscriptions*` | ADMIN, GERENTE (CLIENTE vê próprias) |
| 007 | Financeiro | lista de pagamentos, status, detalhe | `/payments/:id`, `/customers/:id/payments` | ADMIN, GERENTE |
| 008 | Inbox (conversas) | lista de conversas, thread de mensagens, status, resposta, tempo real (Socket.IO) | `/conversations*`, `/conversations/:id/messages`, `/channels/:channel/reply` | ADMIN, GERENTE, BARBEIRO |
| 009 | Check-in QR | gerar/validar token de check-in do cliente | `/checkin/token`, `/checkin/consume` | equipe |
| 010 | Barbeiros + Config | gestão de usuários (equipe), config de canais | `/users*`, `/channels/config` | ADMIN, GERENTE |

## Extensões necessárias na API (spec 008 da API / task 8)
- `POST /auth/forgot-password` — inicia recuperação (resposta genérica, evento p/ e-mail via BullMQ).
- `POST /auth/reset-password` — redefine senha por token.
- `POST /customers/register` (ou `/auth/register-client`) — auto-cadastro público de cliente (painel do cliente).

Cada `NNN-*/` contém `spec.md` (o quê), `plan.md` (como), `tasks.md` (ordem). 001 é o detalhado de referência; os demais seguem o mesmo formato e são preenchidos ao iniciar o módulo (a spec é reescrita/validada antes de implementar — Artigo IV).

## Status de implementação (2026-07-16)
| Módulo | Status |
|--------|--------|
| 001 Foundation + Auth | ✅ implementado + testado (unit + e2e) |
| 002 Shell + RBAC | ✅ sidebar, header, proxy (middleware), route-access, unauthorized |
| 003 Dashboard | ✅ KPIs + atendimentos por barbeiro (server component) |
| 004 Fila (walk-in) | ✅ kanban Aguardando/Atendendo/Finalizado, iniciar/finalizar/cancelar, polling 10s |
| 005 Clientes (CRM) | ✅ lista paginada + busca server-side + virtualização + criar |
| 006 Planos | ✅ lista + criar + desativar (assinaturas: pendente) |
| 007 Financeiro | ✅ receita por período + por barbeiro (via /dashboard/revenue) |
| 010 Barbeiros/Equipe | ✅ lista + cadastro de membro (RBAC por papel) |
| 008 Inbox (conversas) | ✅ lista + thread + resposta + Socket.IO real-time |
| 009 Check-in QR | ✅ scanner (BarcodeDetector) + token manual + consumo |
| Configurações (canais) | ✅ dados da barbearia + serviços + regras IA + canais |

Extensão da API implementada: `POST /auth/forgot-password`, `POST /auth/reset-password`
(spec `api-barbearia/specs/012-auth-password-recovery`).
