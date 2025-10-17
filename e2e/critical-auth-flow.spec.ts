import { test, expect } from '@playwright/test';

/**
 * Critical Authentication Flow E2E Test
 *
 * This test covers the complete authentication journey:
 * 1. User visits login page
 * 2. Enters credentials
 * 3. Submits form
 * 4. Gets redirected to dashboard
 * 5. Sees authenticated content
 * 6. Logs out successfully
 */

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing auth state
    await page.context().clearCookies();
    await page.goto('/login');
  });

  test('should complete full login flow successfully', async ({ page }) => {
    // ============================================================
    // Step 1: Verify login page loads correctly
    // ============================================================
    await expect(page).toHaveTitle(/Login/i);
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();

    // ============================================================
    // Step 2: Fill in login form
    // ============================================================
    const emailInput = page.getByLabel(/email/i);
    const passwordInput = page.getByLabel(/password/i);
    const submitButton = page.getByRole('button', { name: /sign in/i });

    await emailInput.fill('admin@example.com');
    await passwordInput.fill('Admin@123');

    // ============================================================
    // Step 3: Submit form
    // ============================================================
    await submitButton.click();

    // ============================================================
    // Step 4: Verify redirect to dashboard
    // ============================================================
    await expect(page).toHaveURL(/\/dashboard/);

    // ============================================================
    // Step 5: Verify authenticated content is visible
    // ============================================================
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
    await expect(page.getByText(/welcome/i)).toBeVisible();

    // Verify user menu is present
    const userMenu = page.getByRole('button', { name: /admin@example\.com/i });
    await expect(userMenu).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    // Fill in invalid credentials
    await page.getByLabel(/email/i).fill('invalid@example.com');
    await page.getByLabel(/password/i).fill('wrongpassword');

    // Submit form
    await page.getByRole('button', { name: /sign in/i }).click();

    // Verify error message is shown
    await expect(page.getByText(/invalid credentials/i)).toBeVisible();

    // Verify still on login page
    await expect(page).toHaveURL(/\/login/);
  });

  test('should validate required fields', async ({ page }) => {
    // Try to submit empty form
    await page.getByRole('button', { name: /sign in/i }).click();

    // Verify validation errors
    await expect(page.getByText(/email is required/i)).toBeVisible();
    await expect(page.getByText(/password is required/i)).toBeVisible();
  });

  test('should handle logout successfully', async ({ page }) => {
    // First login
    await page.getByLabel(/email/i).fill('admin@example.com');
    await page.getByLabel(/password/i).fill('Admin@123');
    await page.getByRole('button', { name: /sign in/i }).click();

    // Wait for dashboard
    await expect(page).toHaveURL(/\/dashboard/);

    // Open user menu
    await page.getByRole('button', { name: /admin@example\.com/i }).click();

    // Click logout
    await page.getByRole('menuitem', { name: /logout/i }).click();

    // Verify redirect to login page
    await expect(page).toHaveURL(/\/login/);

    // Verify cannot access dashboard without auth
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should persist session after page refresh', async ({ page }) => {
    // Login
    await page.getByLabel(/email/i).fill('admin@example.com');
    await page.getByLabel(/password/i).fill('Admin@123');
    await page.getByRole('button', { name: /sign in/i }).click();

    // Wait for dashboard
    await expect(page).toHaveURL(/\/dashboard/);

    // Refresh page
    await page.reload();

    // Should still be on dashboard (session persisted)
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
  });
});

test.describe('Password Reset Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should navigate to password reset page', async ({ page }) => {
    // Click "Forgot Password" link
    await page.getByRole('link', { name: /forgot password/i }).click();

    // Verify navigation
    await expect(page).toHaveURL(/\/reset-password/);
    await expect(page.getByRole('heading', { name: /reset password/i })).toBeVisible();
  });

  test('should request password reset successfully', async ({ page }) => {
    // Navigate to reset page
    await page.goto('/reset-password');

    // Fill in email
    await page.getByLabel(/email/i).fill('user@example.com');

    // Submit
    await page.getByRole('button', { name: /send reset link/i }).click();

    // Verify success message
    await expect(page.getByText(/check your email/i)).toBeVisible();
  });

  test('should validate email format in password reset', async ({ page }) => {
    await page.goto('/reset-password');

    // Enter invalid email
    await page.getByLabel(/email/i).fill('invalid-email');
    await page.getByRole('button', { name: /send reset link/i }).click();

    // Verify validation error
    await expect(page.getByText(/invalid email/i)).toBeVisible();
  });
});

test.describe('Protected Routes', () => {
  test('should redirect unauthenticated users to login', async ({ page }) => {
    const protectedRoutes = ['/dashboard', '/users', '/admin', '/profile'];

    for (const route of protectedRoutes) {
      await page.goto(route);
      await expect(page).toHaveURL(/\/login/);
    }
  });

  test('should allow authenticated users to access protected routes', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('admin@example.com');
    await page.getByLabel(/password/i).fill('Admin@123');
    await page.getByRole('button', { name: /sign in/i }).click();

    // Wait for dashboard
    await expect(page).toHaveURL(/\/dashboard/);

    // Try accessing protected routes
    await page.goto('/users');
    await expect(page).toHaveURL(/\/users/);

    await page.goto('/profile');
    await expect(page).toHaveURL(/\/profile/);
  });
});

test.describe('Session Timeout', () => {
  test('should handle token expiration gracefully', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('admin@example.com');
    await page.getByLabel(/password/i).fill('Admin@123');
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page).toHaveURL(/\/dashboard/);

    // Simulate token expiration by clearing cookies
    await page.context().clearCookies();

    // Try to access protected route
    await page.goto('/users');

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);

    // Should show session expired message
    await expect(page.getByText(/session expired/i)).toBeVisible();
  });
});
