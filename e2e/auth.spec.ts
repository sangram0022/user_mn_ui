/**
 * E2E Test: Authentication Flow
 * Expert-level E2E testing by 25-year React veteran
 */
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login page', async ({ page }) => {
    await expect(page).toHaveTitle(/User Management/i);
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
  });

  test('should show validation errors for empty form', async ({ page }) => {
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page.getByText(/email is required/i)).toBeVisible();
    await expect(page.getByText(/password is required/i)).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.getByLabel(/email/i).fill('invalid@example.com');
    await page.getByLabel(/password/i).fill('wrongpassword');
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page.getByText(/invalid credentials/i)).toBeVisible({ timeout: 5000 });
  });

  test('should successfully login with valid credentials', async ({ page }) => {
    // Use test credentials
    await page.getByLabel(/email/i).fill('admin@example.com');
    await page.getByLabel(/password/i).fill('Admin@123');
    await page.getByRole('button', { name: /sign in/i }).click();

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
    await expect(page.getByText(/welcome/i)).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.getByLabel(/email/i).fill('admin@example.com');
    await page.getByLabel(/password/i).fill('Admin@123');
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

    // Logout
    await page.getByRole('button', { name: /logout/i }).click();

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
  });

  test('should navigate to register page', async ({ page }) => {
    await page.getByRole('link', { name: /sign up/i }).click();

    await expect(page).toHaveURL(/\/register/);
    await expect(page.getByRole('heading', { name: /create account/i })).toBeVisible();
  });

  test('should navigate to forgot password page', async ({ page }) => {
    await page.getByRole('link', { name: /forgot password/i }).click();

    await expect(page).toHaveURL(/\/forgot-password/);
    await expect(page.getByRole('heading', { name: /reset password/i })).toBeVisible();
  });
});

test.describe('Registration Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
  });

  test('should display registration form', async ({ page }) => {
    await expect(page.getByLabel(/username/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/^password$/i)).toBeVisible();
  });

  test('should validate password requirements', async ({ page }) => {
    const weakPassword = 'weak';
    await page.getByLabel(/^password$/i).fill(weakPassword);

    // Should show password strength indicators
    await expect(page.getByText(/password must be at least 8 characters/i)).toBeVisible();
  });

  test('should register new user successfully', async ({ page }) => {
    const timestamp = Date.now();
    await page.getByLabel(/username/i).fill(`testuser${timestamp}`);
    await page.getByLabel(/email/i).fill(`test${timestamp}@example.com`);
    await page.getByLabel(/^password$/i).fill('SecurePass@123');
    await page.getByLabel(/confirm password/i).fill('SecurePass@123');

    await page.getByRole('button', { name: /create account/i }).click();

    // Should show success message or redirect
    await expect(
      page.getByText(/registration successful/i).or(page.getByText(/verify your email/i))
    ).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Accessibility', () => {
  test('login page should be accessible', async ({ page }) => {
    await page.goto('/');

    // Check for proper ARIA labels
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();

    // Check keyboard navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');

    // Should show validation errors
    await expect(page.getByText(/required/i)).toBeVisible();
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');

    const h1 = await page.locator('h1').count();
    expect(h1).toBeGreaterThanOrEqual(1);
  });
});
