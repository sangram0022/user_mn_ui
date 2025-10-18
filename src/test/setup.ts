/**
 * Vitest Test Setup
 *
 * This file runs before each test file and sets up:
 * - React Testing Library
 * - MSW (Mock Service Worker) for API mocking
 * - Custom matchers and utilities
 * - Global test configuration
 */

import '@testing-library/jest-dom';
import * as matchers from '@testing-library/jest-dom/matchers';
import { cleanup } from '@testing-library/react';
import { toHaveNoViolations } from 'jest-axe';
import { afterEach, beforeEach, expect, vi } from 'vitest';

// Extend expect with jest-dom matchers
expect.extend(matchers);

// Extend expect with jest-axe matchers for accessibility testing
expect.extend(toHaveNoViolations);

// ============================================================================
// DOM Setup
// ============================================================================

/**
 * Ensure document.body exists before each test
 * React 19 + jsdom v27: Fixed DOM initialization
 */
beforeEach(() => {
  // jsdom v27: Ensure document and documentElement exist
  if (typeof document !== 'undefined' && document.documentElement && !document.body) {
    const body = document.createElement('body');
    document.documentElement.appendChild(body);
  }
});

// ============================================================================
// MSW Server Setup (Disabled - Install msw package to enable)
// ============================================================================

/**
 * Create MSW server with default handlers
 * This intercepts HTTP requests during tests and returns mocked responses
 */
// export const server = setupServer(...handlers);

// Start MSW server before all tests
// beforeAll(() => {
//   server.listen({
//     onUnhandledRequest: 'warn', // Warn about unhandled requests
//   });
// });

// Reset handlers after each test to ensure test isolation
afterEach(() => {
  // server.resetHandlers();
  cleanup(); // Clean up React Testing Library
  localStorage.clear(); // Clear localStorage between tests
  sessionStorage.clear(); // Clear sessionStorage between tests
});

// Close MSW server after all tests
// afterAll(() => {
//   server.close();
// });

// ============================================================================
// Global Test Configuration
// ============================================================================

declare global {
  interface Window {
    matchMedia: (query: string) => MediaQueryList;
  }
}

/**
 * Mock window.matchMedia (not available in jsdom)
 */
if (!window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

/**
 * Mock window.scrollTo (not available in jsdom)
 */
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: vi.fn(),
});

/**
 * Mock IntersectionObserver (not available in jsdom)
 */
globalThis.IntersectionObserver = class IntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];

  constructor() {
    // Mock implementation
  }

  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn().mockReturnValue([]);
} as unknown as typeof IntersectionObserver;

/**
 * Mock ResizeObserver (not available in jsdom)
 */
globalThis.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
})) as unknown as typeof ResizeObserver;

/**
 * Mock crypto.randomUUID (not available in older jsdom versions)
 */
if (!globalThis.crypto) {
  globalThis.crypto = {} as Crypto;
}

if (!globalThis.crypto.randomUUID) {
  globalThis.crypto.randomUUID = (() =>
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    })) as () => `${string}-${string}-${string}-${string}-${string}`;
}

/**
 * Set default test environment variables
 * Note: In Vite, use import.meta.env instead of process.env
 * These are set in vitest.config.ts via define or env config
 */
// process.env.VITE_API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
// process.env.NODE_ENV = 'test';

// ============================================================================
// Custom Test Utilities
// ============================================================================

/**
 * Wait for async updates in tests
 */
export const waitForNextUpdate = () => new Promise((resolve) => setTimeout(resolve, 0));

/**
 * Create mock file for file upload tests
 */
export const createMockFile = (name = 'test.png', size = 1024, type = 'image/png'): File => {
  const blob = new Blob(['a'.repeat(size)], { type });
  return new File([blob], name, { type });
};

/**
 * Test ID selector helper
 */
export const testId = (id: string) => `[data-testid="${id}"]`;
