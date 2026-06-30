import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('protected route redirects to /login without auth', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('login page shows error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', 'invalid@test.com');
    await page.fill('#password', 'wrongpassword');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Email ou senha inválidos')).toBeVisible();
  });

  test('login page validates empty fields', async ({ page }) => {
    await page.goto('/login');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Email é obrigatório')).toBeVisible();
    await expect(page.locator('text=Senha é obrigatória')).toBeVisible();
  });
});
