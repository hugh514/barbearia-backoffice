import {
  LayoutDashboard,
  Users,
  ListOrdered,
  DollarSign,
  Scissors,
  CreditCard,
  MessageSquare,
  QrCode,
  Settings,
  type LucideIcon,
} from 'lucide-react';
import type { Role } from '@/lib/zod/base';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  roles: Role[];
}

const ADMIN_GERENTE: Role[] = ['ADMIN', 'GERENTE'];
const STAFF: Role[] = ['ADMIN', 'GERENTE', 'BARBEIRO'];

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ADMIN_GERENTE },
  { label: 'Fila do Dia', href: '/fila', icon: ListOrdered, roles: STAFF },
  { label: 'Clientes', href: '/clientes', icon: Users, roles: STAFF },
  { label: 'Planos', href: '/planos', icon: CreditCard, roles: ADMIN_GERENTE },
  { label: 'Financeiro', href: '/financeiro', icon: DollarSign, roles: ADMIN_GERENTE },
  { label: 'Inbox', href: '/inbox', icon: MessageSquare, roles: STAFF },
  { label: 'Check-in', href: '/checkin', icon: QrCode, roles: STAFF },
  { label: 'Barbeiros', href: '/barbeiros', icon: Scissors, roles: ADMIN_GERENTE },
  { label: 'Configurações', href: '/configuracoes', icon: Settings, roles: ADMIN_GERENTE },
];

/** Rota inicial conforme o papel (barbeiro não vê dashboard). */
export function homeForRole(role: Role): string {
  return role === 'BARBEIRO' ? '/fila' : '/dashboard';
}

export function navItemsForRole(role: Role): NavItem[] {
  return NAV_ITEMS.filter((item) => item.roles.includes(role));
}
