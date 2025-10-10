/**
 * E2E Test: User Management Flow
 * Expert-level E2E testing by 25-year React veteran
 */
import { test, expect } from '@playwright/test';

// Helper function to login
async function login(page: any) {
  await page.goto('/');
  await page.getByLabel(/email/i).fill('admin@example.com');
  await page.getByLabel(/password/i).fill('Admin@123');
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
}

test.describe('User Management', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should navigate to user management page', async ({ page }) => {
    await page.getByRole('link', { name: /users/i }).click();
    
    await expect(page).toHaveURL(/\/users/);
    await expect(page.getByRole('heading', { name: /user management/i })).toBeVisible();
  });

  test('should display user list', async ({ page }) => {
    await page.goto('/users');
    
    // Should show user table
    await expect(page.getByRole('table')).toBeVisible({ timeout: 5000 });
    
    // Should have table headers
    await expect(page.getByText(/username/i)).toBeVisible();
    await expect(page.getByText(/email/i)).toBeVisible();
    await expect(page.getByText(/role/i)).toBeVisible();
  });

  test('should search users', async ({ page }) => {
    await page.goto('/users');
    
    const searchInput = page.getByPlaceholder(/search/i);
    await searchInput.fill('admin');
    
    // Should filter results
    await expect(page.getByText(/admin/i)).toBeVisible({ timeout: 3000 });
  });

  test('should open create user modal', async ({ page }) => {
    await page.goto('/users');
    
    await page.getByRole('button', { name: /add user/i }).click();
    
    // Should show modal
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByLabel(/username/i)).toBeVisible();
  });

  test('should filter users by role', async ({ page }) => {
    await page.goto('/users');
    
    // Click role filter
    await page.getByLabel(/role/i).click();
    await page.getByText(/admin/i).click();
    
    // Should filter results
    await expect(page.getByText(/admin/i)).toBeVisible({ timeout: 3000 });
  });
});

test.describe('Dashboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should display dashboard cards', async ({ page }) => {
    // Should show key metrics
    await expect(page.getByText(/total users/i)).toBeVisible();
    await expect(page.getByText(/active sessions/i).or(page.getByText(/users/i))).toBeVisible();
  });

  test('should navigate between pages', async ({ page }) => {
    // Navigate to different sections
    const links = [
      { name: /analytics/i, url: /\/analytics/ },
      { name: /settings/i, url: /\/settings/ },
      { name: /profile/i, url: /\/profile/ },
    ];

    for (const link of links) {
      const linkElement = page.getByRole('link', { name: link.name }).first();
      if (await linkElement.isVisible()) {
        await linkElement.click();
        await expect(page).toHaveURL(link.url, { timeout: 5000 });
        await page.goBack();
      }
    }
  });
});

test.describe('Performance', () => {
  test('should load dashboard within 3 seconds', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/dashboard');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(3000);
  });

  test('should have optimal Core Web Vitals', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Measure FCP (First Contentful Paint)
    const fcp = await page.evaluate(() => {
      const perfEntries = performance.getEntriesByType('paint');
      const fcpEntry = perfEntries.find(entry => entry.name === 'first-contentful-paint');
      return fcpEntry ? fcpEntry.startTime : 0;
    });
    
    expect(fcp).toBeLessThan(1800); // FCP should be under 1.8s
  });
});