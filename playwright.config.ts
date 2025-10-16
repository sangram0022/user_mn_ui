import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E & Visual Regression Testing Configuration
 * Expert-level testing by 25-year React veteran
 *
 * Visual regression testing with automatic screenshot comparison.
 * Detects unintended visual changes across browsers and viewports.
 */
export default defineConfig({
  testDir: './e2e',

  // Maximum time one test can run for
  timeout: 30 * 1000,

  // Test execution settings
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['list'],
  ],

  // Screenshot comparison settings
  expect: {
    toHaveScreenshot: {
      // Maximum allowed pixel difference
      maxDiffPixels: 100,

      // Maximum allowed pixel ratio (0-1)
      maxDiffPixelRatio: 0.1,

      // Threshold for pixel color difference (0-1)
      threshold: 0.2,

      // Animation handling
      animations: 'disabled',

      // Scale handling
      scale: 'css',
    },
  },

  // Shared settings for all tests
  use: {
    // Base URL for navigation
    baseURL: 'http://127.0.0.1:5173',

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video on failure
    video: 'retain-on-failure',
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // Mobile viewports
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  // Run local dev server before starting tests
  webServer: {
    command: 'npm run dev',
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
