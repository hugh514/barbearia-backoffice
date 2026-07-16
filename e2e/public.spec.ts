import { test, expect } from '@playwright/test';

test.describe('Fluxos públicos (sem sessão)', () => {
  test('rota protegida sem sessão redireciona para /login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('button', { name: /entrar/i })).toBeVisible();
  });

  test('login inválido mostra erro e não redireciona', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('E-mail').fill('admin@barbearia.example');
    await page.getByLabel('Senha').fill('senha-errada');
    await page.getByRole('button', { name: /entrar/i }).click();
    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test('esqueci a senha mostra confirmação genérica', async ({ page }) => {
    await page.goto('/forgot-password');
    await page.getByLabel('E-mail').fill('qualquer@email.com');
    await page.getByRole('button', { name: /enviar link/i }).click();
    await expect(page.getByRole('status')).toContainText(/se existir uma conta/i);
  });
});
