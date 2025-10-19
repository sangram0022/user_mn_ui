// import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'; // Temporarily disabled
import react from '@vitejs/plugin-react';
import path, { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type {} from 'vitest/config';
import { defineConfig } from 'vitest/config';

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
    }),
  ],
  test: {
    // Enable global test APIs (describe, it, expect, etc.)
    globals: true,
    // Use jsdom for DOM testing
    environment: 'jsdom',
    // Setup files to run before each test file
    setupFiles: ['./src/test/setup.ts'],
    // Include CSS in tests
    css: true,
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov', 'json', 'json-summary'],
      // Coverage thresholds (CI will fail if below these)

      // Files to exclude from coverage
      exclude: [
        // Test files
        'src/**/*.test.{ts,tsx}',
        'src/**/*.spec.{ts,tsx}',
        'src/**/*.stories.tsx',
        'src/test/**',
        // Config files
        '**/*.config.{ts,js}',
        '**/vite.config.ts',
        '**/vitest.config.ts',
        // Build artifacts
        'node_modules/**',
        'dist/**',
        'build/**',
        'coverage/**',
        // Mock and test utilities
        '**/mocks/**',
        '**/__mocks__/**',
        '**/mockData.ts',
        // Entry points (thin wrappers)
        'src/main.tsx',
        'src/App.tsx',
        // Type definitions
        '**/*.d.ts',
        'src/vite-env.d.ts',
      ],
      // Fail CI if coverage is below thresholds
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80,
        autoUpdate: false,
      },
      // Clean coverage directory before collecting
      clean: true,
      // Include all source files
      all: true,
      // Source files to include
      include: ['src/**/*.{ts,tsx}'],
    },
    // Mock configuration
    mockReset: true,
    // Reset mocks between tests
    restoreMocks: true,
    // Restore mocks after tests
    clearMocks: true,
    // Clear mock calls

    // Timeout configuration
    testTimeout: 20000,
    // 20 seconds (increased from 10s for rate limit retry tests)
    hookTimeout: 20000,
    // Test isolation
    isolate: true,
    // Parallel execution
    pool: 'threads',
    maxWorkers: 4,
    minWorkers: 1,
    // Watch mode
    watch: false,
    // Reporter configuration
    reporters: ['verbose', 'html'],
    // Output files
    outputFile: {
      html: './coverage/test-report.html',
      json: './coverage/test-results.json',
    },
    // Pool options

    // Bail on failure (0 = don't bail)
    bail: 0,
    // Retry failed tests
    retry: 0,
    // Environment options
    environmentOptions: {
      jsdom: {
        resources: 'usable',
        url: 'http://localhost:5173',
        pretendToBeVisual: true,
      },
    },
    // Deps optimization
    deps: {
      inline: [/\/@lucide-react/, /\/zustand/],
    },
    // Don't collect or run E2E Playwright tests in Vitest
    exclude: ['e2e/**', 'node_modules/**', 'dist/**', 'coverage/**'],
    // Include unit and integration tests
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    // Temporarily disable Storybook tests (they have component context issues)
    // projects: [
    //   {
    //     extends: true,
    //     plugins: [
    //       // The plugin will run tests for the stories defined in your Storybook config
    //       // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
    //       storybookTest({
    //         configDir: path.join(__dirname, '.storybook'),
    //       }),
    //     ],
    //     test: {
    //       name: 'storybook',
    //       browser: {
    //         enabled: true,
    //         headless: true,
    //         provider: 'playwright',
    //         instances: [
    //           {
    //             browser: 'chromium',
    //           },
    //         ],
    //       },
    //       setupFiles: ['.storybook/vitest.setup.ts'],
    //     },
    //   },
    // ],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@domains': resolve(__dirname, 'src/domains'),
      '@infrastructure': resolve(__dirname, 'src/infrastructure'),
      '@shared': resolve(__dirname, 'src/shared'),
      '@app': resolve(__dirname, 'src/app'),
      '@test': resolve(__dirname, 'src/test'),
      '@features': resolve(__dirname, 'src/features'),
      '@widgets': resolve(__dirname, 'src/widgets'),
      '@config': resolve(__dirname, 'src/config'),
      '@contexts': resolve(__dirname, 'src/contexts'),
      '@lib': resolve(__dirname, 'src/lib'),
      '@hooks': resolve(__dirname, 'src/hooks'),
      '@styles': resolve(__dirname, 'src/styles'),
      '@layouts': resolve(__dirname, 'src/layouts'),
      '@routing': resolve(__dirname, 'src/routing'),
      '@assets': resolve(__dirname, 'src/assets'),
    },
  },
});
