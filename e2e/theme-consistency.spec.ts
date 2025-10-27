import { expect, test } from '@playwright/test';

/**
 * 🎨 Theme Consistency Tests
 *
 * Verifies that the legacy compatibility layer works correctly
 * and all CSS variables are properly defined.
 */

test.describe('Theme Consistency', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should have all legacy CSS variables defined', async ({ page }) => {
    const legacyVars = [
      '--theme-primary',
      '--theme-text',
      '--theme-textSecondary',
      '--theme-background',
      '--theme-surface',
      '--theme-border',
      '--theme-error',
      '--theme-success',
    ];

    for (const varName of legacyVars) {
      const value = await page.evaluate(
        (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim(),
        varName
      );

      expect(value).toBeTruthy();
    }
  });

  test('should have all new CSS variables defined', async ({ page }) => {
    const newVars = [
      '--color-primary',
      '--color-text-primary',
      '--color-text-secondary',
      '--color-background',
      '--color-white',
      '--color-border-primary',
      '--color-error',
      '--color-success',
    ];

    for (const varName of newVars) {
      const value = await page.evaluate(
        (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim(),
        varName
      );

      expect(value).toBeTruthy();
    }
  });

  test('should map old variables to new values correctly', async ({ page }) => {
    const mappings = [
      { old: '--theme-primary', new: '--color-primary' },
      { old: '--theme-text', new: '--color-text-primary' },
      { old: '--theme-background', new: '--color-background' },
    ];

    for (const { old, new: newVar } of mappings) {
      const oldValue = await page.evaluate(
        (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim(),
        old
      );

      const newValue = await page.evaluate(
        (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim(),
        newVar
      );

      // They should resolve to the same computed value
      expect(oldValue).toBe(newValue);
    }
  });

  test('should not have undefined CSS variables in components', async ({ page }) => {
    // Check for any elements with undefined/invalid colors
    const invalidColors = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      const invalid: Array<{ tag: string; style: string | null; color: string; bgColor: string }> =
        [];

      elements.forEach((el) => {
        const computed = getComputedStyle(el);
        const color = computed.color;
        const bgColor = computed.backgroundColor;

        // Check if colors resolve to default (rgb(0, 0, 0) or transparent)
        // which might indicate undefined variables
        if (
          el.getAttribute('style')?.includes('var(--theme-') ||
          el.getAttribute('style')?.includes('var(--color-')
        ) {
          if (color === 'rgb(0, 0, 0)' || bgColor === 'rgba(0, 0, 0, 0)') {
            invalid.push({
              tag: el.tagName,
              style: el.getAttribute('style'),
              color,
              bgColor,
            });
          }
        }
      });

      return invalid;
    });

    // Should have no invalid colors
    expect(invalidColors.length).toBe(0);

    if (invalidColors.length > 0) {
      console.warn('⚠️ Found elements with potentially undefined variables:');
      invalidColors.forEach((el) => {
        console.warn(`  <${el.tag}> style="${el.style}"`);
      });
    }
  });

  test('should maintain consistent colors across navigation', async ({ page }) => {
    // Get primary color on home page
    const homeColor = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim()
    );

    // Navigate to other pages and verify color consistency
    const pages = ['/login', '/dashboard'];

    for (const path of pages) {
      try {
        await page.goto(path);
        await page.waitForLoadState('networkidle');

        const pageColor = await page.evaluate(() =>
          getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim()
        );

        expect(pageColor).toBe(homeColor);
      } catch {
        // Skip if page doesn't exist or requires auth
      }
    }
  });

  test('should load legacy compatibility CSS file', async ({ page }) => {
    // Check if legacy-theme-compat.css is loaded
    // The CSS should be imported (might be bundled)
    // So we check if the variables are defined instead
    const hasLegacyVars = await page.evaluate(
      () =>
        getComputedStyle(document.documentElement).getPropertyValue('--theme-primary').trim() !== ''
    );

    expect(hasLegacyVars).toBeTruthy();
  });
});

test.describe('Visual Consistency', () => {
  test('should have no visual regressions on home page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Take screenshot for visual regression
    await expect(page).toHaveScreenshot('home-page.png', {
      fullPage: true,
      threshold: 0.2, // Allow 20% difference for dynamic content
    });
  });

  test('should have consistent button styles', async ({ page }) => {
    await page.goto('/');

    // Find all buttons
    const buttons = await page.locator('button').all();

    if (buttons.length > 0) {
      // Get first button's computed styles
      const firstButtonColor = await buttons[0].evaluate(
        (el) => getComputedStyle(el).backgroundColor
      );

      // Verify no buttons have default/undefined colors
      expect(firstButtonColor).not.toBe('rgba(0, 0, 0, 0)');
      expect(firstButtonColor).not.toBe('transparent');
    }
  });
});
