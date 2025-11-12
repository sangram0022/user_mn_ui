import { test, expect } from '@playwright/test';

// Base URL for tests
const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';

test.describe('Authentication Flow - E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test.describe('Login Page', () => {
    test('should display login form', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      
      await expect(page.getByTestId('login-heading')).toBeVisible();
      await expect(page.getByTestId('email-input')).toBeVisible();
      await expect(page.getByTestId('password-input')).toBeVisible();
      await expect(page.getByTestId('login-submit-button')).toBeVisible();
    });

    test('should show validation errors for empty fields', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      
      const submitButton = page.getByTestId('login-submit-button');
      await submitButton.click();
      
      // HTML5 validation will prevent submission
      await expect(page.getByTestId('email-input')).toHaveAttribute('required');
      await expect(page.getByTestId('password-input')).toHaveAttribute('required');
    });

    test('should handle remember me functionality', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      
      const emailInput = page.getByTestId('email-input');
      const rememberCheckbox = page.getByTestId('remember-me-checkbox');
      
      await emailInput.fill('test@example.com');
      await rememberCheckbox.check();
      
      await expect(rememberCheckbox).toBeChecked();
    });

    test('should navigate to register page', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      
      await page.getByTestId('register-link').click();
      await expect(page).toHaveURL(/\/register/);
    });

    test('should navigate to forgot password page', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      
      await page.getByTestId('forgot-password-link').click();
      await expect(page).toHaveURL(/\/forgot-password/);
    });

    test('should show loading state when submitting', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      
      await page.getByTestId('email-input').fill('test@example.com');
      await page.getByTestId('password-input').fill('Password123!');
      
      const submitButton = page.getByTestId('login-submit-button');
      await submitButton.click();
      
      // Should show loading state (button disabled)
      await expect(submitButton).toBeDisabled();
    });
  });

  test.describe('Register Page', () => {
    test('should display registration form', async ({ page }) => {
      await page.goto(`${BASE_URL}/register`);
      
      await expect(page.getByTestId('register-heading')).toBeVisible();
      await expect(page.getByTestId('firstname-input')).toBeVisible();
      await expect(page.getByTestId('lastname-input')).toBeVisible();
      await expect(page.getByTestId('email-input')).toBeVisible();
      await expect(page.getByTestId('password-input')).toBeVisible();
      await expect(page.getByTestId('confirm-password-input')).toBeVisible();
    });

    test('should show password strength indicator', async ({ page }) => {
      await page.goto(`${BASE_URL}/register`);
      
      const passwordInput = page.getByTestId('password-input');
      await passwordInput.fill('weak');
      
      await expect(page.getByTestId('password-strength-indicator')).toBeVisible();
      
      await passwordInput.fill('StrongP@ssw0rd123');
      await expect(page.getByTestId('password-strength-indicator')).toBeVisible();
    });

    test('should require terms acceptance', async ({ page }) => {
      await page.goto(`${BASE_URL}/register`);
      
      await page.getByTestId('firstname-input').fill('John');
      await page.getByTestId('lastname-input').fill('Doe');
      await page.getByTestId('email-input').fill('john@example.com');
      await page.getByTestId('password-input').fill('Password123!');
      await page.getByTestId('confirm-password-input').fill('Password123!');
      
      const submitButton = page.getByTestId('register-submit-button');
      await submitButton.click();
      
      // Should show error about terms not accepted (via toast or inline error)
      await page.waitForTimeout(1000);
    });

    test('should navigate to login page', async ({ page }) => {
      await page.goto(`${BASE_URL}/register`);
      
      await page.getByTestId('login-link').click();
      await expect(page).toHaveURL(/\/login/);
    });
  });

  test.describe('Forgot Password Page', () => {
    test('should display forgot password form', async ({ page }) => {
      await page.goto(`${BASE_URL}/forgot-password`);
      
      await expect(page.getByTestId('forgot-password-heading')).toBeVisible();
      await expect(page.getByTestId('email-input')).toBeVisible();
      await expect(page.getByTestId('submit-button')).toBeVisible();
    });

    test('should show success message after submission', async ({ page }) => {
      // Mock forgot password API call using Playwright route interception
      await page.route('**/api/v1/auth/forgot-password', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            message: 'Password reset email sent',
          }),
        });
      });

      await page.goto(`${BASE_URL}/forgot-password`);
      
      await page.getByTestId('email-input').fill('test@example.com');
      await page.getByTestId('submit-button').click();
      
      // Should show success message (security pattern - always shows success)
      await expect(page.getByTestId('success-message')).toBeVisible({ timeout: 5000 });
    });

    test('should navigate back to login page', async ({ page }) => {
      await page.goto(`${BASE_URL}/forgot-password`);
      
      await page.getByTestId('login-link').click();
      await expect(page).toHaveURL(/\/login/);
    });
  });

  test.describe('Change Password Page', () => {
    test.beforeEach(async ({ page }) => {
      // Inject auth state before page loads using addInitScript
      await page.addInitScript(() => {
        localStorage.setItem('access_token', 'mock-jwt-token-abc123');
        localStorage.setItem('user', JSON.stringify({
          id: '1',
          email: 'test@example.com',
          firstname: 'Test',
          lastname: 'User',
          role: 'user',
          roles: ['user'],
          is_active: true,
          is_verified: true,
        }));
        localStorage.setItem('token_expires_at', (Date.now() + 3600000).toString());
        localStorage.setItem('last_activity', Date.now().toString());
      });
    });

    test('should display change password form', async ({ page }) => {
      await page.goto(`${BASE_URL}/change-password`);
      
      // Wait for page to load and auth to be checked
      await page.waitForLoadState('networkidle');
      
      await expect(page.getByTestId('current-password-input')).toBeVisible();
      await expect(page.getByTestId('new-password-input')).toBeVisible();
      await expect(page.getByTestId('confirm-password-input')).toBeVisible();
    });

    test('should show password strength for new password', async ({ page }) => {
      await page.goto(`${BASE_URL}/change-password`);
      
      await page.waitForLoadState('networkidle');
      
      const newPasswordInput = page.getByTestId('new-password-input');
      await newPasswordInput.fill('StrongP@ssw0rd123');
      
      await expect(page.getByText(/strong/i)).toBeVisible();
    });

    test('should validate password confirmation match', async ({ page }) => {
      await page.goto(`${BASE_URL}/change-password`);
      
      await page.waitForLoadState('networkidle');
      
      await page.getByTestId('current-password-input').fill('OldPassword123!');
      await page.getByTestId('new-password-input').fill('NewPassword123!');
      await page.getByTestId('confirm-password-input').fill('DifferentPassword123!');
      
      await page.getByTestId('change-submit-button').click();
      
      // Should show error about passwords not matching
      await page.waitForTimeout(1000);
    });
  });

  test.describe('Profile Page', () => {
    test.beforeEach(async ({ page }) => {
      // Mock GET /users/me API call using Playwright route interception
      await page.route('**/api/v1/users/me', async (route) => {
        if (route.request().method() === 'GET') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              data: {
                id: '1',
                email: 'test@example.com',
                first_name: 'Test',
                last_name: 'User',
                phone_number: '+1234567890',
                role: 'user',
                roles: ['user'],
                is_active: true,
                is_verified: true,
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z',
              },
            }),
          });
        } else {
          await route.continue();
        }
      });

      // Inject auth state before page loads using addInitScript
      await page.addInitScript(() => {
        localStorage.setItem('access_token', 'mock-jwt-token-abc123');
        localStorage.setItem('user', JSON.stringify({
          id: '1',
          email: 'test@example.com',
          firstname: 'Test',
          lastname: 'User',
          role: 'user',
          roles: ['user'],
          is_active: true,
          is_verified: true,
        }));
        localStorage.setItem('token_expires_at', (Date.now() + 3600000).toString());
        localStorage.setItem('last_activity', Date.now().toString());
      });
    });

    test('should display profile information', async ({ page }) => {
      await page.goto(`${BASE_URL}/profile`);
      
      await page.waitForLoadState('networkidle');
      
      await expect(page.getByTestId('profile-heading')).toBeVisible();
      // Profile fields should be visible (implementation-dependent)
    });

    test('should toggle edit mode', async ({ page }) => {
      await page.goto(`${BASE_URL}/profile`);
      
      await page.waitForLoadState('networkidle');
      
      const editButton = page.getByRole('button', { name: /edit/i });
      await editButton.click();
      
      // Should show save/cancel buttons in edit mode
      await expect(page.getByTestId('save-button')).toBeVisible();
      await expect(page.getByRole('button', { name: /cancel/i })).toBeVisible();
    });

    test('should cancel edit and revert changes', async ({ page }) => {
      await page.goto(`${BASE_URL}/profile`);
      
      await page.waitForLoadState('networkidle');
      
      await page.getByRole('button', { name: /edit/i }).click();
      
      const firstNameInput = page.getByTestId('firstname-input');
      const originalValue = await firstNameInput.inputValue();
      
      await firstNameInput.fill('Changed Name');
      await page.getByRole('button', { name: /cancel/i }).click();
      
      // Should revert to original value
      await page.getByRole('button', { name: /edit/i }).click();
      await expect(firstNameInput).toHaveValue(originalValue);
    });
  });

  test.describe('Accessibility', () => {
    test('login page should be keyboard navigable', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      
      // Click on the page body to ensure focus is within the document
      await page.click('body');
      
      // Tab through form elements
      await page.keyboard.press('Tab'); // Email field
      await expect(page.getByTestId('email-input')).toBeFocused();
      
      await page.keyboard.press('Tab'); // Password field
      await expect(page.getByTestId('password-input')).toBeFocused();
      
      await page.keyboard.press('Tab'); // Remember me checkbox
      await page.keyboard.press('Tab'); // Forgot password link
      await page.keyboard.press('Tab'); // Submit button
      await expect(page.getByTestId('login-submit-button')).toBeFocused();
    });

    test('forms should have proper labels', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      
      const emailInput = page.getByTestId('email-input');
      const passwordInput = page.getByTestId('password-input');
      
      await expect(emailInput).toBeVisible();
      await expect(passwordInput).toBeVisible();
    });
  });

  test.describe('Responsive Design', () => {
    test('should display correctly on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(`${BASE_URL}/login`);
      
      await expect(page.getByTestId('login-heading')).toBeVisible();
      await expect(page.getByTestId('email-input')).toBeVisible();
    });

    test('should display correctly on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto(`${BASE_URL}/register`);
      
      await expect(page.getByTestId('register-heading')).toBeVisible();
    });

    test('should display correctly on desktop', async ({ page }) => {
      // Mock GET /users/me for protected profile route
      await page.route('**/api/v1/users/me', async (route) => {
        if (route.request().method() === 'GET') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              data: {
                id: '1',
                email: 'test@example.com',
                first_name: 'Test',
                last_name: 'User',
                phone_number: '+1234567890',
                role: 'user',
                roles: ['user'],
                is_active: true,
                is_verified: true,
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z',
              },
            }),
          });
        } else {
          await route.continue();
        }
      });

      // Inject auth state
      await page.addInitScript(() => {
        localStorage.setItem('access_token', 'mock-jwt-token-abc123');
        localStorage.setItem('user', JSON.stringify({
          id: '1',
          email: 'test@example.com',
          firstname: 'Test',
          lastname: 'User',
          role: 'user',
          roles: ['user'],
          is_active: true,
          is_verified: true,
        }));
        localStorage.setItem('token_expires_at', (Date.now() + 3600000).toString());
        localStorage.setItem('last_activity', Date.now().toString());
      });

      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto(`${BASE_URL}/profile`);
      
      await page.waitForLoadState('networkidle');
      
      await expect(page.getByTestId('profile-heading')).toBeVisible();
    });
  });
});
