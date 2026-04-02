import { test, expect } from '@playwright/test';

test.describe('Auth pages (UI structure)', () => {
  test('login page renders email and password fields', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /permitpro fl/i })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('login page links to register', async ({ page }) => {
    await page.goto('/login');
    const registerLink = page.getByRole('link', { name: /^register$/i });
    await expect(registerLink).toBeVisible();
    await expect(registerLink).toHaveAttribute('href', '/register');
  });

  test('register page renders name, email, password, and confirm fields', async ({ page }) => {
    await page.goto('/register');
    await expect(page.getByRole('heading', { name: /permitpro fl/i })).toBeVisible();
    await expect(page.getByLabel('Full Name')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Confirm Password')).toBeVisible();
    await expect(page.getByRole('button', { name: /create account/i })).toBeVisible();
  });

  test('register page links back to login', async ({ page }) => {
    await page.goto('/register');
    const signInLink = page.getByRole('link', { name: /^sign in$/i });
    await expect(signInLink).toBeVisible();
    await expect(signInLink).toHaveAttribute('href', '/login');
  });

  test('unauthenticated user visiting dashboard is redirected to login', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/login\/?$/);
    await expect(page.getByLabel('Email')).toBeVisible();
  });
});
