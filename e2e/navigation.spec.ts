import { test, expect } from '@playwright/test';

test.describe('Public routes', () => {
  test('/login renders the login form', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
  });

  test('/register renders the register form', async ({ page }) => {
    await page.goto('/register');
    await expect(page.getByRole('button', { name: /create account/i })).toBeVisible();
    await expect(page.getByLabel('Full Name')).toBeVisible();
  });

  test('unknown route shows the 404 page', async ({ page }) => {
    await page.goto('/this-route-should-not-exist-xyz');
    await expect(page.getByTestId('not-found-page')).toBeVisible();
    await expect(page.getByRole('heading', { name: /404/i })).toBeVisible();
  });
});
