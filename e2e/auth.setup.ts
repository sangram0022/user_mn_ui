import { test as setup } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  // Navigate to login page
  await page.goto('http://localhost:5173/login');

  // Fill in login form using data-testid
  await page.getByTestId('email-input').fill('test@example.com');
  await page.getByTestId('password-input').fill('TestPassword123!');

  // Click login button
  await page.getByTestId('login-submit-button').click();

  // Wait for successful login - navigate away from login page
  // Could go to home (/) or profile (/profile)
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 10000 });

  // Save authentication state
  await page.context().storageState({ path: authFile });
});
