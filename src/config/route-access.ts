import type { Role } from '@/lib/zod/base';

/** Rotas públicas — acessíveis sem sessão. */
export const PUBLIC_ROUTES = [
  '/login',
  '/forgot-password',
  '/reset-password',
] as const;

/**
 * Regras de acesso por prefixo de rota. A primeira regra cujo `prefix` casa com
 * o pathname define os papéis permitidos. Rotas não listadas exigem apenas
 * sessão autenticada (qualquer papel).
 */
interface RouteRule {
  prefix: string;
  roles: Role[];
}

const ADMIN_GERENTE: Role[] = ['ADMIN', 'GERENTE'];
const STAFF: Role[] = ['ADMIN', 'GERENTE', 'BARBEIRO'];

export const ROUTE_ACCESS_RULES: RouteRule[] = [
  { prefix: '/dashboard', roles: ADMIN_GERENTE },
  { prefix: '/financeiro', roles: ADMIN_GERENTE },
  { prefix: '/planos', roles: ADMIN_GERENTE },
  { prefix: '/assinaturas', roles: ADMIN_GERENTE },
  { prefix: '/barbeiros', roles: ADMIN_GERENTE },
  { prefix: '/configuracoes', roles: ADMIN_GERENTE },
  { prefix: '/fila', roles: STAFF },
  { prefix: '/clientes', roles: STAFF },
  { prefix: '/inbox', roles: STAFF },
  { prefix: '/checkin', roles: STAFF },
];

export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(`${r}/`),
  );
}

/** Papéis exigidos para a rota, ou null se qualquer autenticado pode acessar. */
export function requiredRoles(pathname: string): Role[] | null {
  const rule = ROUTE_ACCESS_RULES.find(
    (r) => pathname === r.prefix || pathname.startsWith(`${r.prefix}/`),
  );
  return rule ? rule.roles : null;
}

export function canAccessRoute(pathname: string, role: Role | null): boolean {
  if (isPublicRoute(pathname)) return true;
  if (!role) return false;
  const roles = requiredRoles(pathname);
  return roles === null ? true : roles.includes(role);
}
