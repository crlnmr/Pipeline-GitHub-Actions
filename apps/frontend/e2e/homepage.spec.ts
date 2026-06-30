import { test, expect } from '@playwright/test';

test('homepage loads with status 200 and expected title', async ({ page }) => {
  const response = await page.goto('/');
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle(/e-micro-commerce/);
});
