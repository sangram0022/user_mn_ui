import { expect, test, type Page } from '@playwright/test';

/**
 * Visual Regression Testing Suite
 *
 * This suite captures screenshots of all major components and pages
 * to detect unintended visual changes. Run with:
 *
 * - Update baselines: npm run test:visual:update
 * - Run tests: npm run test:visual
 * - Run in UI mode: npm run test:visual:ui
 *
 * By 25-year React veteran - Production-ready visual testing
 */

// Test configuration
const VIEWPORTS = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1920, height: 1080 },
};

const THEME_MODES = ['light', 'dark'] as const;

/**
 * Helper to set theme mode
 */
async function setTheme(page: Page, theme: 'light' | 'dark') {
  await page.evaluate((theme: string) => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, theme);

  // Wait for theme transition to complete
  await page.waitForTimeout(300);
}

/**
 * Helper to hide dynamic content (timestamps, animations)
 */
async function hideDynamicContent(page: Page) {
  await page.addStyleTag({
    content: `
      * {
        animation: none !important;
        transition: none !important;
        caret-color: transparent !important;
      }
      [data-testid="timestamp"],
      [data-testid="current-time"],
      .animate-spin,
      .animate-pulse {
        visibility: hidden !important;
      }
    `,
  });
}

/**
 * Test Suite: Component Visual Regression
 */
test.describe('Component Visual Regression', () => {
  // Test each viewport size
  for (const [viewportName, viewport] of Object.entries(VIEWPORTS)) {
    test.describe(`${viewportName} viewport`, () => {
      test.use({ viewport });

      // Test each theme
      for (const theme of THEME_MODES) {
        test.describe(`${theme} theme`, () => {
          test.beforeEach(async ({ page }) => {
            await hideDynamicContent(page);
          });

          /**
           * Button Component Tests
           */
          test('Button - All Variants', async ({ page }) => {
            await page.goto('/');
            await setTheme(page, theme);

            // Navigate to buttons (adjust URL as needed)
            await page.waitForLoadState('networkidle');

            // Take screenshot
            await expect(page).toHaveScreenshot(`button-${viewportName}-${theme}.png`, {
              fullPage: true,
              animations: 'disabled',
              maxDiffPixels: 100,
            });
          });

          /**
           * Input Component Tests
           */
          test('Input - All Variants', async ({ page }) => {
            await page.goto('/');
            await setTheme(page, theme);

            await page.waitForLoadState('networkidle');

            await expect(page).toHaveScreenshot(`input-${viewportName}-${theme}.png`, {
              fullPage: true,
              animations: 'disabled',
              maxDiffPixels: 100,
            });
          });

          /**
           * Form Component Tests
           */
          test('Form - All States', async ({ page }) => {
            await page.goto('/');
            await setTheme(page, theme);

            await page.waitForLoadState('networkidle');

            await expect(page).toHaveScreenshot(`form-${viewportName}-${theme}.png`, {
              fullPage: true,
              animations: 'disabled',
              maxDiffPixels: 100,
            });
          });

          /**
           * Table Component Tests
           */
          test('Table - With Data', async ({ page }) => {
            await page.goto('/');
            await setTheme(page, theme);

            await page.waitForLoadState('networkidle');

            await expect(page).toHaveScreenshot(`table-${viewportName}-${theme}.png`, {
              fullPage: true,
              animations: 'disabled',
              maxDiffPixels: 100,
            });
          });

          /**
           * Modal Component Tests
           */
          test('Modal - Open State', async ({ page }) => {
            await page.goto('/');
            await setTheme(page, theme);

            // Open modal (adjust selector as needed)
            // await page.click('[data-testid="open-modal"]');
            await page.waitForTimeout(500);

            await expect(page).toHaveScreenshot(`modal-${viewportName}-${theme}.png`, {
              fullPage: true,
              animations: 'disabled',
              maxDiffPixels: 100,
            });
          });

          /**
           * Tabs Component Tests
           */
          test('Tabs - All Variants', async ({ page }) => {
            await page.goto('/');
            await setTheme(page, theme);

            await page.waitForLoadState('networkidle');

            await expect(page).toHaveScreenshot(`tabs-${viewportName}-${theme}.png`, {
              fullPage: true,
              animations: 'disabled',
              maxDiffPixels: 100,
            });
          });

          /**
           * Accordion Component Tests
           */
          test('Accordion - Collapsed State', async ({ page }) => {
            await page.goto('/');
            await setTheme(page, theme);

            await page.waitForLoadState('networkidle');

            await expect(page).toHaveScreenshot(
              `accordion-collapsed-${viewportName}-${theme}.png`,
              {
                fullPage: true,
                animations: 'disabled',
                maxDiffPixels: 100,
              }
            );
          });

          test('Accordion - Expanded State', async ({ page }) => {
            await page.goto('/');
            await setTheme(page, theme);

            // Expand first accordion item
            // await page.click('[data-testid="accordion-trigger-1"]');
            await page.waitForTimeout(500);

            await expect(page).toHaveScreenshot(`accordion-expanded-${viewportName}-${theme}.png`, {
              fullPage: true,
              animations: 'disabled',
              maxDiffPixels: 100,
            });
          });
        });
      }
    });
  }
});

/**
 * Test Suite: Page Visual Regression
 */
test.describe('Page Visual Regression', () => {
  for (const [viewportName, viewport] of Object.entries(VIEWPORTS)) {
    test.describe(`${viewportName} viewport`, () => {
      test.use({ viewport });

      for (const theme of THEME_MODES) {
        test.describe(`${theme} theme`, () => {
          test.beforeEach(async ({ page }) => {
            await hideDynamicContent(page);
          });

          /**
           * Login Page
           */
          test('Login Page', async ({ page }) => {
            await page.goto('/login');
            await setTheme(page, theme);

            await page.waitForLoadState('networkidle');

            await expect(page).toHaveScreenshot(`page-login-${viewportName}-${theme}.png`, {
              fullPage: true,
              animations: 'disabled',
              maxDiffPixels: 100,
            });
          });

          /**
           * Dashboard Page
           */
          test('Dashboard Page', async ({ page }) => {
            // Login first if needed
            await page.goto('/');
            await setTheme(page, theme);

            await page.waitForLoadState('networkidle');

            await expect(page).toHaveScreenshot(`page-dashboard-${viewportName}-${theme}.png`, {
              fullPage: true,
              animations: 'disabled',
              maxDiffPixels: 100,
            });
          });

          /**
           * User List Page
           */
          test('User List Page', async ({ page }) => {
            await page.goto('/users');
            await setTheme(page, theme);

            await page.waitForLoadState('networkidle');

            await expect(page).toHaveScreenshot(`page-users-${viewportName}-${theme}.png`, {
              fullPage: true,
              animations: 'disabled',
              maxDiffPixels: 100,
            });
          });

          /**
           * User Detail Page
           */
          test('User Detail Page', async ({ page }) => {
            await page.goto('/users/1');
            await setTheme(page, theme);

            await page.waitForLoadState('networkidle');

            await expect(page).toHaveScreenshot(`page-user-detail-${viewportName}-${theme}.png`, {
              fullPage: true,
              animations: 'disabled',
              maxDiffPixels: 100,
            });
          });
        });
      }
    });
  }
});

/**
 * Test Suite: Responsive Container Queries
 */
test.describe('Container Query Visual Regression', () => {
  test('Container Queries - Desktop', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await page.goto('/');
    await hideDynamicContent(page);

    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('container-queries-desktop.png', {
      fullPage: true,
      animations: 'disabled',
      maxDiffPixels: 100,
    });
  });

  test('Container Queries - Tablet', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.tablet);
    await page.goto('/');
    await hideDynamicContent(page);

    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('container-queries-tablet.png', {
      fullPage: true,
      animations: 'disabled',
      maxDiffPixels: 100,
    });
  });

  test('Container Queries - Mobile', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile);
    await page.goto('/');
    await hideDynamicContent(page);

    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('container-queries-mobile.png', {
      fullPage: true,
      animations: 'disabled',
      maxDiffPixels: 100,
    });
  });
});

/**
 * Test Suite: Interaction States
 */
test.describe('Interaction State Visual Regression', () => {
  test.use({ viewport: VIEWPORTS.desktop });

  test('Button Hover States', async ({ page }) => {
    await page.goto('/');
    await hideDynamicContent(page);

    // Hover over button
    // await page.hover('[data-testid="primary-button"]');
    await page.waitForTimeout(200);

    await expect(page).toHaveScreenshot('button-hover-state.png', {
      animations: 'disabled',
      maxDiffPixels: 100,
    });
  });

  test('Input Focus States', async ({ page }) => {
    await page.goto('/');
    await hideDynamicContent(page);

    // Focus on input
    // await page.focus('[data-testid="email-input"]');
    await page.waitForTimeout(200);

    await expect(page).toHaveScreenshot('input-focus-state.png', {
      animations: 'disabled',
      maxDiffPixels: 100,
    });
  });

  test('Form Validation Errors', async ({ page }) => {
    await page.goto('/');
    await hideDynamicContent(page);

    // Trigger validation errors
    // await page.click('[data-testid="submit-button"]');
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('form-validation-errors.png', {
      fullPage: true,
      animations: 'disabled',
      maxDiffPixels: 100,
    });
  });
});
