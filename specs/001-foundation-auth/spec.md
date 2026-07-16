# Feature Specification: Foundation + Autenticação

**Feature Branch**: `001-foundation-auth`
**Created**: 2026-07-16
**Status**: Ready for Implementation

## User Scenarios & Testing

### User Story 1 - Login com e-mail e senha (Priority: P1)
Um funcionário da barbearia (ADMIN/GERENTE/BARBEIRO) acessa o backoffice, informa e-mail e senha e entra no painel correspondente ao seu papel.

**Why this priority**: Sem login não há acesso a nada. É a fundação de toda a aplicação.

**Independent Test**: Submeter credenciais válidas no `/login` redireciona para `/` (dashboard). Credenciais inválidas mostram erro genérico sem revelar se o e-mail existe.

**Acceptance Scenarios**:
1. **Given** usuário na tela de login, **When** envia credenciais válidas, **Then** cookies httpOnly de sessão são setados e é redirecionado para a rota inicial do seu papel.
2. **Given** credenciais inválidas, **When** envia, **Then** vê mensagem "Credenciais inválidas" e permanece em `/login`.
3. **Given** e-mail em múltiplos tenants, **When** envia sem `tenantSlug`, **Then** o sistema pede o identificador da barbearia.
4. **Given** sessão ativa, **When** acessa `/login`, **Then** é redirecionado para `/`.

### User Story 2 - Sessão persistente e refresh automático (Priority: P1)
O usuário permanece logado ao recarregar a página e entre abas; o access token expirado é renovado transparentemente.

**Why this priority**: UX e segurança da sessão — evita relogar a cada expiração de token.

**Independent Test**: Com access token expirado mas refresh válido, uma request protegida dispara refresh e devolve os dados sem erro visível ao usuário.

**Acceptance Scenarios**:
1. **Given** access token expirado e refresh válido, **When** o cliente chama uma rota protegida, **Then** o proxy renova o token uma vez e repete a request com sucesso.
2. **Given** refresh token inválido/expirado, **When** ocorre 401 no refresh, **Then** a sessão é limpa e o usuário vai para `/login?from=<rota>`.
3. **Given** usuário logado, **When** recarrega a página, **Then** continua autenticado (sessão lida do cookie no servidor).

### User Story 3 - Logout (Priority: P1)
O usuário encerra a sessão com segurança.

**Acceptance Scenarios**:
1. **Given** usuário logado, **When** clica em sair, **Then** o refresh token é revogado na API, os cookies são limpos e ele vai para `/login`.

### User Story 4 - Recuperação de senha (Priority: P2)
O usuário que esqueceu a senha solicita redefinição por e-mail e define uma nova senha via token.

**Why this priority**: Fluxo essencial de conta, mas depende de endpoint novo na API (`/auth/forgot-password`, `/auth/reset-password`).

**Independent Test**: Solicitar recuperação sempre responde com sucesso genérico (não revela existência do e-mail); com token válido, define nova senha e permite login.

**Acceptance Scenarios**:
1. **Given** tela "Esqueci a senha", **When** informa um e-mail, **Then** vê confirmação genérica ("se existir uma conta, enviaremos um link"), independente de o e-mail existir.
2. **Given** token de reset válido, **When** define nova senha que atende à política, **Then** a senha é atualizada e ele pode logar.
3. **Given** token inválido/expirado, **When** tenta redefinir, **Then** vê erro e opção de solicitar novo link.

### User Story 5 - Cadastro (Priority: P2)
Cadastro de novos usuários. Backoffice: um ADMIN/GERENTE cadastra membros da equipe (já coberto pela API `/users`). Cliente: auto-cadastro público (depende de endpoint novo na API).

**Acceptance Scenarios**:
1. **Given** ADMIN autenticado, **When** cadastra um BARBEIRO com dados válidos, **Then** o usuário é criado e aparece na lista.
2. **Given** e-mail já usado no tenant, **When** cadastra, **Then** vê erro 409 tratado ("e-mail já cadastrado").

### Edge Cases
- API fora do ar no login → erro amigável, sem vazar stack.
- Duplo clique em "Entrar" → uma única request (idempotência + botão desabilitado).
- Cookie adulterado/expirado → tratado como não autenticado.
- Rede lenta → estados de loading; timeout com retry manual.
- Race de refresh (várias requests 401 juntas) → um único refresh, demais aguardam.

## Requirements

### Functional Requirements
- **FR-001**: O sistema DEVE autenticar via `POST /auth/login` (e-mail, senha, tenantSlug opcional).
- **FR-002**: Tokens DEVEM ser guardados em cookies httpOnly/Secure/SameSite=Lax setados por route handler do Next; nunca acessíveis ao JS do cliente.
- **FR-003**: Um proxy (`/api/*`) DEVE encaminhar requests à API anexando o access token do cookie.
- **FR-004**: Em `401`, o proxy DEVE tentar `POST /auth/refresh` uma vez e repetir; ao falhar, limpar sessão e sinalizar relogin.
- **FR-005**: `middleware.ts` DEVE proteger rotas privadas no servidor e redirecionar não autenticados para `/login?from=`.
- **FR-006**: Toda resposta da API DEVE ser validada com Zod antes de uso.
- **FR-007**: Logout DEVE chamar `POST /auth/logout` e limpar cookies.
- **FR-008**: Recuperação de senha DEVE usar `POST /auth/forgot-password` e `POST /auth/reset-password` (a adicionar na API — ver spec 008 da API).
- **FR-009**: Mensagens de erro de auth NÃO DEVEM revelar existência de conta.
- **FR-010**: Mutações de auth DEVEM enviar `Idempotency-Key`.

### Key Entities
- **Sessão**: `{ user: { id, email, role, tenantId }, expiresAt }` derivada do JWT.
- **Credenciais**: `{ email, password, tenantSlug? }`.
- **Papel (Role)**: `ADMIN | GERENTE | BARBEIRO | CLIENTE`.

## Success Criteria
- **SC-001**: Login válido conclui em < 2s em rede normal e leva ao painel correto.
- **SC-002**: 100% das respostas de API passam por validação Zod.
- **SC-003**: Nenhum token aparece em `localStorage`, `sessionStorage` ou no HTML renderizado (verificável por teste).
- **SC-004**: Refresh automático é invisível ao usuário em 100% dos casos de access expirado + refresh válido.
- **SC-005**: Cobertura de testes dos fluxos de auth (login, refresh, logout, guard) ≥ 90%.

## Assumptions
- A API já expõe `/auth/login`, `/auth/refresh`, `/auth/logout`, `/auth/me`, `/tenants/validate`.
- `/auth/forgot-password`, `/auth/reset-password` e auto-cadastro de cliente serão adicionados à API (spec de extensão).
- Ambiente dev roda a API em `http://localhost:3000`; o frontend em `http://localhost:3001`.
