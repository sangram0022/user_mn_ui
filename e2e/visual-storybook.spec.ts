import { expect, Page, test } from '@playwright/test';

/**
 * Storybook Visual Regression Testing
 *
 * This suite tests Storybook stories for visual regressions.
 * More reliable than testing live app since Storybook provides isolated components.
 *
 * Run commands:
 * - Update baselines: npm run test:visual:update
 * - Run tests: npm run test:visual:storybook
 * - Debug: npm run test:visual:debug
 *
 * By 25-year React veteran
 */

// Configuration
const STORYBOOK_URL = 'http://localhost:6006';
const VIEWPORTS = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1920, height: 1080 },
};

/**
 * Helper to navigate to a story
 */
async function navigateToStory(page: Page, storyId: string) {
  await page.goto(`${STORYBOOK_URL}/iframe.html?id=${storyId}&viewMode=story`);
  await page.waitForLoadState('networkidle');

  // Wait for story to render
  await page.waitForSelector('#storybook-root', { timeout: 10000 });
  await page.waitForTimeout(500); // Allow animations to settle
}

/**
 * Helper to hide dynamic content
 */
async function stabilizeVisuals(page: Page) {
  await page.addStyleTag({
    content: `
      * {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
        caret-color: transparent !important;
      }
    `,
  });
}

/**
 * Test Suite: Button Component
 */
test.describe('Button Component - Visual Regression', () => {
  test.use({ viewport: VIEWPORTS.desktop });

  test.beforeEach(async ({ page }) => {
    await stabilizeVisuals(page);
  });

  test('Button - Primary Variant', async ({ page }) => {
    await navigateToStory(page, 'components-button--primary');

    await expect(page.locator('#storybook-root')).toHaveScreenshot('button-primary.png');
  });

  test('Button - Secondary Variant', async ({ page }) => {
    await navigateToStory(page, 'components-button--secondary');

    await expect(page.locator('#storybook-root')).toHaveScreenshot('button-secondary.png');
  });

  test('Button - All Sizes', async ({ page }) => {
    await navigateToStory(page, 'components-button--all-sizes');

    await expect(page.locator('#storybook-root')).toHaveScreenshot('button-all-sizes.png');
  });

  test('Button - Disabled State', async ({ page }) => {
    await navigateToStory(page, 'components-button--disabled');

    await expect(page.locator('#storybook-root')).toHaveScreenshot('button-disabled.png');
  });

  test('Button - Loading State', async ({ page }) => {
    await navigateToStory(page, 'components-button--loading');

    await expect(page.locator('#storybook-root')).toHaveScreenshot('button-loading.png');
  });
});

/**
 * Test Suite: Tabs Component
 */
test.describe('Tabs Component - Visual Regression', () => {
  test.use({ viewport: VIEWPORTS.desktop });

  test.beforeEach(async ({ page }) => {
    await stabilizeVisuals(page);
  });

  test('Tabs - Line Variant', async ({ page }) => {
    await navigateToStory(page, 'components-tabs--default');

    await expect(page.locator('#storybook-root')).toHaveScreenshot('tabs-line-variant.png', {
      fullPage: true,
    });
  });

  test('Tabs - Enclosed Variant', async ({ page }) => {
    await navigateToStory(page, 'components-tabs--enclosed');

    await expect(page.locator('#storybook-root')).toHaveScreenshot('tabs-enclosed-variant.png', {
      fullPage: true,
    });
  });

  test('Tabs - Pills Variant', async ({ page }) => {
    await navigateToStory(page, 'components-tabs--pills');

    await expect(page.locator('#storybook-root')).toHaveScreenshot('tabs-pills-variant.png', {
      fullPage: true,
    });
  });

  test('Tabs - Vertical Orientation', async ({ page }) => {
    await navigateToStory(page, 'components-tabs--vertical');

    await expect(page.locator('#storybook-root')).toHaveScreenshot(
      'tabs-vertical-orientation.png',
      { fullPage: true }
    );
  });

  test('Tabs - With Icons', async ({ page }) => {
    await navigateToStory(page, 'components-tabs--with-icons');

    await expect(page.locator('#storybook-root')).toHaveScreenshot('tabs-with-icons.png', {
      fullPage: true,
    });
  });

  test('Tabs - Dark Mode', async ({ page }) => {
    await navigateToStory(page, 'components-tabs--dark-mode');

    await expect(page.locator('#storybook-root')).toHaveScreenshot('tabs-dark-mode.png', {
      fullPage: true,
    });
  });
});

/**
 * Test Suite: Accordion Component
 */
test.describe('Accordion Component - Visual Regression', () => {
  test.use({ viewport: VIEWPORTS.desktop });

  test.beforeEach(async ({ page }) => {
    await stabilizeVisuals(page);
  });

  test('Accordion - Default (Single Mode)', async ({ page }) => {
    await navigateToStory(page, 'components-accordion--default');

    await expect(page.locator('#storybook-root')).toHaveScreenshot('accordion-default.png', {
      fullPage: true,
    });
  });

  test('Accordion - Multiple Expansion', async ({ page }) => {
    await navigateToStory(page, 'components-accordion--multiple');

    await expect(page.locator('#storybook-root')).toHaveScreenshot('accordion-multiple.png', {
      fullPage: true,
    });
  });

  test('Accordion - Collapsible Mode', async ({ page }) => {
    await navigateToStory(page, 'components-accordion--collapsible');

    await expect(page.locator('#storybook-root')).toHaveScreenshot('accordion-collapsible.png', {
      fullPage: true,
    });
  });

  test('Accordion - With Icons', async ({ page }) => {
    await navigateToStory(page, 'components-accordion--with-icons');

    await expect(page.locator('#storybook-root')).toHaveScreenshot('accordion-with-icons.png', {
      fullPage: true,
    });
  });

  test('Accordion - Dark Mode', async ({ page }) => {
    await navigateToStory(page, 'components-accordion--dark-mode');

    await expect(page.locator('#storybook-root')).toHaveScreenshot('accordion-dark-mode.png', {
      fullPage: true,
    });
  });

  test('Accordion - Rich Content', async ({ page }) => {
    await navigateToStory(page, 'components-accordion--rich-content');

    await expect(page.locator('#storybook-root')).toHaveScreenshot('accordion-rich-content.png', {
      fullPage: true,
    });
  });
});

/**
 * Test Suite: Form Components
 */
test.describe('Form Components - Visual Regression', () => {
  test.use({ viewport: VIEWPORTS.desktop });

  test.beforeEach(async ({ page }) => {
    await stabilizeVisuals(page);
  });

  test('Input - All Variants', async ({ page }) => {
    await navigateToStory(page, 'components-input--all-variants');

    await expect(page.locator('#storybook-root')).toHaveScreenshot('input-all-variants.png', {
      fullPage: true,
    });
  });

  test('Input - With Error', async ({ page }) => {
    await navigateToStory(page, 'components-input--with-error');

    await expect(page.locator('#storybook-root')).toHaveScreenshot('input-with-error.png');
  });

  test('Input - Disabled State', async ({ page }) => {
    await navigateToStory(page, 'components-input--disabled');

    await expect(page.locator('#storybook-root')).toHaveScreenshot('input-disabled.png');
  });
});

/**
 * Test Suite: Table Component
 */
test.describe('Table Component - Visual Regression', () => {
  test.use({ viewport: VIEWPORTS.desktop });

  test.beforeEach(async ({ page }) => {
    await stabilizeVisuals(page);
  });

  test('Table - Basic Table', async ({ page }) => {
    await navigateToStory(page, 'components-table--basic');

    await expect(page.locator('#storybook-root')).toHaveScreenshot('table-basic.png', {
      fullPage: true,
    });
  });

  test('Table - With Sorting', async ({ page }) => {
    await navigateToStory(page, 'components-table--with-sorting');

    await expect(page.locator('#storybook-root')).toHaveScreenshot('table-with-sorting.png', {
      fullPage: true,
    });
  });

  test('Table - With Pagination', async ({ page }) => {
    await navigateToStory(page, 'components-table--with-pagination');

    await expect(page.locator('#storybook-root')).toHaveScreenshot('table-with-pagination.png', {
      fullPage: true,
    });
  });
});

/**
 * Test Suite: Modal Component
 */
test.describe('Modal Component - Visual Regression', () => {
  test.use({ viewport: VIEWPORTS.desktop });

  test.beforeEach(async ({ page }) => {
    await stabilizeVisuals(page);
  });

  test('Modal - Default', async ({ page }) => {
    await navigateToStory(page, 'components-modal--default');

    await expect(page.locator('#storybook-root')).toHaveScreenshot('modal-default.png', {
      fullPage: true,
    });
  });

  test('Modal - Large Size', async ({ page }) => {
    await navigateToStory(page, 'components-modal--large');

    await expect(page.locator('#storybook-root')).toHaveScreenshot('modal-large.png', {
      fullPage: true,
    });
  });
});

/**
 * Test Suite: Responsive Visual Tests
 */
test.describe('Responsive Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    await stabilizeVisuals(page);
  });

  for (const [viewportName, viewport] of Object.entries(VIEWPORTS)) {
    test(`Tabs - ${viewportName}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await navigateToStory(page, 'components-tabs--default');

      await expect(page.locator('#storybook-root')).toHaveScreenshot(`tabs-${viewportName}.png`, {
        fullPage: true,
      });
    });

    test(`Accordion - ${viewportName}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await navigateToStory(page, 'components-accordion--default');

      await expect(page.locator('#storybook-root')).toHaveScreenshot(
        `accordion-${viewportName}.png`,
        { fullPage: true }
      );
    });
  }
});

/**
 * Test Suite: Container Queries Visual Test
 */
test.describe('Container Queries - Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    await stabilizeVisuals(page);
  });

  test('Container Queries Demo - Desktop', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await navigateToStory(page, 'components-containerqueriesdemo--default');

    await expect(page.locator('#storybook-root')).toHaveScreenshot(
      'container-queries-desktop.png',
      { fullPage: true }
    );
  });

  test('Container Queries Demo - Tablet', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.tablet);
    await navigateToStory(page, 'components-containerqueriesdemo--default');

    await expect(page.locator('#storybook-root')).toHaveScreenshot('container-queries-tablet.png', {
      fullPage: true,
    });
  });

  test('Container Queries Demo - Mobile', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile);
    await navigateToStory(page, 'components-containerqueriesdemo--default');

    await expect(page.locator('#storybook-root')).toHaveScreenshot('container-queries-mobile.png', {
      fullPage: true,
    });
  });
});
