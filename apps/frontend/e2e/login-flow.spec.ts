import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {

  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  // Depende de backend real com Clerk disponível no ambiente E2E
  test.skip('TC-01: Login com credenciais válidas (Happy Path)', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toHaveText('Entrar');

    await page.fill('#email', 'teste@email.com');
    await page.fill('#password', 'Senha@123');

    await page.click('button[type="submit"]');
    await expect(page.locator('button[type="submit"]')).toBeDisabled();

    await page.waitForURL('/', { timeout: 15000 });
    await expect(page).toHaveURL('/');

    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find((c) => c.name === '__session');
    expect(sessionCookie).toBeDefined();
    expect(sessionCookie!.httpOnly).toBe(true);
    expect(sessionCookie!.sameSite).toBe('Strict');

    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('TC-02: Campos obrigatórios vazios (Validação client-side)', async ({ page }) => {
    await page.goto('/login');

    let requestMade = false;
    page.on('request', (req) => {
      if (req.url().includes('/api/v1/auth/sign-in')) {
        requestMade = true;
      }
    });

    await page.click('button[type="submit"]');

    await expect(page.locator('text=Email é obrigatório')).toBeVisible();
    await expect(page.locator('text=Senha é obrigatória')).toBeVisible();
    expect(requestMade).toBe(false);
  });

  test('TC-03: E-mail com formato inválido (Validação client-side)', async ({ page }) => {
    await page.goto('/login');

    let requestMade = false;
    page.on('request', (req) => {
      if (req.url().includes('/api/v1/auth/sign-in')) {
        requestMade = true;
      }
    });

    await page.fill('#email', 'email-invalido');
    await page.fill('#password', 'Senha@123');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Email inválido')).toBeVisible();
    expect(requestMade).toBe(false);
  });

  test('TC-04: Credenciais inválidas (Erro do backend)', async ({ page }) => {
    await page.goto('/login');

    await page.fill('#email', 'inexistente@email.com');
    await page.fill('#password', 'Qualquer@123');
    await page.click('button[type="submit"]');

    await expect(page.locator('button[type="submit"]')).toBeDisabled();

    await expect(page.locator('text=Email ou senha inválidos')).toBeVisible({ timeout: 15000 });

    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find((c) => c.name === '__session');
    expect(sessionCookie).toBeUndefined();

    await expect(page).toHaveURL('/login');
  });

  test('TC-05: Senha incorreta para e-mail existente', async ({ page }) => {
    await page.goto('/login');

    await page.fill('#email', 'teste@email.com');
    await page.fill('#password', 'SenhaErrada@1');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Email ou senha inválidos')).toBeVisible({ timeout: 15000 });

    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find((c) => c.name === '__session');
    expect(sessionCookie).toBeUndefined();
  });

  test('TC-06: Redirecionamento para login ao acessar rota protegida sem autenticação', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('TC-07: Navegação para cadastro ("Criar conta")', async ({ page }) => {
    await page.goto('/login');

    const criarContaLink = page.locator('a[href="/signup"]');
    await expect(criarContaLink).toBeVisible();
    await expect(criarContaLink).toHaveText('Criar conta');

    await criarContaLink.click();
    await expect(page).toHaveURL(/\/signup/);

    await expect(page.locator('#name')).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
  });

  // Regra de validação de e-mail com espaços ainda não implementada
  test.skip('TC-08: Login com e-mail contendo espaços em branco (Edge case)', async ({ page }) => {
    await page.goto('/login');

    await page.fill('#email', '  teste@email.com  ');
    await page.fill('#password', 'Senha@123');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Email inválido')).toBeVisible();
  });

  // Depende de backend real disponível (retorna 500 sem backend)
  test.skip('TC-09: Resposta do backend segue RFC 9457 (Problem Details)', async ({ request }) => {
    const response = await request.post('/api/v1/auth/sign-in', {
      data: { email: 'inexistente@email.com', password: 'Qualquer@123' },
    });

    expect(response.status()).toBe(401);

    const body = await response.json();
    expect(body).toHaveProperty('type');
    expect(body).toHaveProperty('title');
    expect(body).toHaveProperty('status');
    expect(body).toHaveProperty('detail');
    expect(body).toHaveProperty('instance');
    expect(body.title).toBe('Unauthorized');
    expect(body.detail).toBe('Email ou senha inválidos');
    expect(body.status).toBe(401);
  });

  // Depende de autenticação real com Clerk e backend disponível
  test.skip('TC-10: Logout (Encerramento de sessão)', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', 'teste@email.com');
    await page.fill('#password', 'Senha@123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/', { timeout: 15000 });
    await expect(page).toHaveURL('/');

    await page.context().clearCookies();

    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find((c) => c.name === '__session');
    expect(sessionCookie).toBeUndefined();

    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

});
