import { describe, it, expect } from 'vitest';
import {
  canAccessRoute,
  isPublicRoute,
  requiredRoles,
} from './route-access';

describe('isPublicRoute', () => {
  it('reconhece rotas públicas', () => {
    expect(isPublicRoute('/login')).toBe(true);
    expect(isPublicRoute('/reset-password/abc')).toBe(true);
  });
  it('rota privada não é pública', () => {
    expect(isPublicRoute('/dashboard')).toBe(false);
  });
});

describe('requiredRoles', () => {
  it('dashboard exige ADMIN/GERENTE', () => {
    expect(requiredRoles('/dashboard')).toEqual(['ADMIN', 'GERENTE']);
  });
  it('fila permite equipe incluindo BARBEIRO', () => {
    expect(requiredRoles('/fila')).toContain('BARBEIRO');
  });
  it('rota não listada não tem restrição de papel', () => {
    expect(requiredRoles('/qualquer-coisa')).toBeNull();
  });
});

describe('canAccessRoute', () => {
  it('nega sem sessão em rota privada', () => {
    expect(canAccessRoute('/dashboard', null)).toBe(false);
  });
  it('permite público sem sessão', () => {
    expect(canAccessRoute('/login', null)).toBe(true);
  });
  it('BARBEIRO não acessa financeiro', () => {
    expect(canAccessRoute('/financeiro', 'BARBEIRO')).toBe(false);
  });
  it('BARBEIRO acessa fila', () => {
    expect(canAccessRoute('/fila', 'BARBEIRO')).toBe(true);
  });
  it('ADMIN acessa tudo', () => {
    expect(canAccessRoute('/financeiro', 'ADMIN')).toBe(true);
    expect(canAccessRoute('/configuracoes', 'ADMIN')).toBe(true);
  });
  it('GERENTE acessa clientes (subrota)', () => {
    expect(canAccessRoute('/clientes/123', 'GERENTE')).toBe(true);
  });
});
