import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const replace = vi.fn();
const refresh = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace, refresh }),
  useSearchParams: () => new URLSearchParams(''),
}));

const loginRequest = vi.fn();
vi.mock('@/features/auth/services', () => ({
  loginRequest: (...args: unknown[]) => loginRequest(...args),
}));

import { LoginForm } from './login-form';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('LoginForm', () => {
  it('valida e-mail inválido antes de chamar a API', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);
    await user.type(screen.getByLabelText('E-mail'), 'nao-e-email');
    await user.type(screen.getByLabelText('Senha'), 'segredo123');
    await user.click(screen.getByRole('button', { name: /entrar/i }));

    expect(await screen.findByText(/e-mail inválido/i)).toBeInTheDocument();
    expect(loginRequest).not.toHaveBeenCalled();
  });

  it('faz login e redireciona em sucesso', async () => {
    loginRequest.mockResolvedValue({
      id: '1',
      email: 'a@b.com',
      role: 'ADMIN',
      tenantId: 't1',
    });
    const user = userEvent.setup();
    render(<LoginForm />);
    await user.type(screen.getByLabelText('E-mail'), 'a@b.com');
    await user.type(screen.getByLabelText('Senha'), 'segredo123');
    await user.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() =>
      expect(loginRequest).toHaveBeenCalledWith({
        email: 'a@b.com',
        password: 'segredo123',
      }),
    );
    expect(replace).toHaveBeenCalledWith('/');
  });

  it('mostra erro do servidor sem redirecionar', async () => {
    loginRequest.mockRejectedValue(new Error('Credenciais inválidas'));
    const user = userEvent.setup();
    render(<LoginForm />);
    await user.type(screen.getByLabelText('E-mail'), 'a@b.com');
    await user.type(screen.getByLabelText('Senha'), 'errada');
    await user.click(screen.getByRole('button', { name: /entrar/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /credenciais inválidas/i,
    );
    expect(replace).not.toHaveBeenCalled();
  });

  it('não expõe token no DOM', async () => {
    loginRequest.mockResolvedValue({
      id: '1',
      email: 'a@b.com',
      role: 'ADMIN',
      tenantId: 't1',
    });
    const user = userEvent.setup();
    const { container } = render(<LoginForm />);
    await user.type(screen.getByLabelText('E-mail'), 'a@b.com');
    await user.type(screen.getByLabelText('Senha'), 'segredo123');
    await user.click(screen.getByRole('button', { name: /entrar/i }));
    await waitFor(() => expect(loginRequest).toHaveBeenCalled());
    expect(container.innerHTML).not.toMatch(/eyJ|Bearer|accessToken/);
  });
});
