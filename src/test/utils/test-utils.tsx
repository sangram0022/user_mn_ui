/* eslint-disable react-refresh/only-export-components */
/**
 * Test Utilities
 *
 * Custom render function and test helpers that wrap components
 * with necessary providers (Router, Auth, Theme, etc.)
 */

import { ReactElement, ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

// ============================================================================
// Types
// ============================================================================

/**
 * Extended render options
 */
interface ExtendedRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  /**
   * Initial route for MemoryRouter
   */
  initialRoute?: string;

  /**
   * Initial routes for MemoryRouter
   */
  initialRoutes?: string[];

  /**
   * Use BrowserRouter instead of MemoryRouter
   */
  useBrowserRouter?: boolean;

  /**
   * Mock authentication state
   */
  mockAuth?: {
    isAuthenticated: boolean;
    user?: unknown;
    token?: string;
  };

  /**
   * Additional wrapper components
   */
  additionalWrappers?: React.ComponentType<{ children: ReactNode }>[];
}

/**
 * Mock user object
 */
const testMockUser = {
  id: '1',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'admin',
  status: 'active',
};

export { testMockUser as mockUser };

// ============================================================================
// Providers Wrapper
// ============================================================================

/**
 * All Providers wrapper for testing
 */
interface AllProvidersProps {
  children: ReactNode;
  initialRoute?: string;
  initialRoutes?: string[];
  useBrowserRouter?: boolean;
  mockAuth?: ExtendedRenderOptions['mockAuth'];
}

function AllProviders({
  children,
  initialRoute = '/',
  initialRoutes = ['/'],
  useBrowserRouter = false,
}: AllProvidersProps) {
  // Choose router based on options
  const Router = useBrowserRouter ? BrowserRouter : MemoryRouter;
  const routerProps = useBrowserRouter
    ? {}
    : { initialEntries: initialRoutes, initialIndex: initialRoutes.indexOf(initialRoute) };

  // TODO: Add AuthProvider mock if mockAuth is provided
  // TODO: Add other providers as needed (Theme, Query, etc.)

  return <Router {...routerProps}>{children}</Router>;
}

// ============================================================================
// Custom Render Function
// ============================================================================

/**
 * Custom render function that wraps components with providers
 *
 * @example
 * ```tsx
 * const { getByText } = renderWithProviders(<MyComponent />)
 * ```
 *
 * @example With initial route
 * ```tsx
 * const { getByText } = renderWithProviders(<MyComponent />, {
 *   initialRoute: '/users'
 * })
 * ```
 *
 * @example With mock authentication
 * ```tsx
 * const { getByText } = renderWithProviders(<MyComponent />, {
 *   mockAuth: {
 *     isAuthenticated: true,
 *     user: mockUser
 *   }
 * })
 * ```
 */
export function renderWithProviders(ui: ReactElement, options?: ExtendedRenderOptions) {
  const {
    initialRoute = '/',
    initialRoutes = ['/'],
    useBrowserRouter = false,
    mockAuth,
    additionalWrappers = [],
    ...renderOptions
  } = options || {};

  // Create wrapper with all providers
  const Wrapper = ({ children }: { children: ReactNode }) => {
    let wrappedChildren = children;

    // Apply additional wrappers
    for (const AdditionalWrapper of additionalWrappers) {
      wrappedChildren = <AdditionalWrapper>{wrappedChildren}</AdditionalWrapper>;
    }

    return (
      <AllProviders
        initialRoute={initialRoute}
        initialRoutes={initialRoutes}
        useBrowserRouter={useBrowserRouter}
        mockAuth={mockAuth}
      >
        {wrappedChildren}
      </AllProviders>
    );
  };

  // Create user event instance
  const user = userEvent.setup();

  // Render with wrapper
  return {
    user,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}

// ============================================================================
// Test Helpers
// ============================================================================

/**
 * Wait for a condition to be true
 */
export async function waitFor<T>(
  callback: () => T | Promise<T>,
  options: { timeout?: number; interval?: number } = {}
): Promise<T> {
  const { timeout = 5000, interval = 50 } = options;
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    try {
      const result = await callback();
      if (result) return result;
    } catch (_) {
      // Continue waiting
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }

  throw new Error(`Timeout waiting for condition after ${timeout}ms`);
}

/**
 * Create mock API response
 */
export function createMockResponse<T>(
  data: T,
  options: { success?: boolean; error?: unknown; status?: number } = {}
): any {
  const { success = true, error = null, status = 200 } = options;

  return {
    success,
    data: success ? data : undefined,
    error: error || undefined,
    status,
  };
}

/**
 * Create mock error response
 */
export function createMockError(code: string, message: string, status = 400): any {
  return createMockResponse(null, {
    success: false,
    error: { code, message },
    status,
  });
}

/**
 * Mock console methods
 */
export function mockConsole() {
  const originalConsole = { ...console };

  beforeEach(() => {
    global.console = {
      ...console,
      log: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      info: vi.fn(),
      debug: vi.fn(),
    };
  });

  afterEach(() => {
    global.console = originalConsole;
  });

  return {
    getLogCalls: () => (console.log as any).mock.calls,
    getErrorCalls: () => (console.error as any).mock.calls,
    getWarnCalls: () => (console.warn as any).mock.calls,
  };
}

/**
 * Create mock file
 */
export function createMockFile(name = 'test.png', size = 1024, type = 'image/png'): File {
  const blob = new Blob(['a'.repeat(size)], { type });
  return new File([blob], name, { type });
}

/**
 * Create mock FormData
 */
export function createMockFormData(data: Record<string, unknown>): FormData {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value instanceof File) {
      formData.append(key, value);
    } else {
      formData.append(key, String(value));
    }
  });
  return formData;
}

/**
 * Simulate file upload
 */
export async function simulateFileUpload(input: HTMLInputElement, files: File[]) {
  Object.defineProperty(input, 'files', {
    value: files,
    writable: false,
  });

  const event = new Event('change', { bubbles: true });
  input.dispatchEvent(event);
}

/**
 * Test ID selector
 */
export function testId(id: string): string {
  return `[data-testid="${id}"]`;
}

/**
 * Get element by test ID
 */
export function getByTestId(id: string): HTMLElement | null {
  return document.querySelector(testId(id));
}

/**
 * Mock intersection observer entry
 */
export function createMockIntersectionObserverEntry(
  isIntersecting: boolean,
  target: Element = document.createElement('div')
): IntersectionObserverEntry {
  return {
    isIntersecting,
    target,
    intersectionRatio: isIntersecting ? 1 : 0,
    boundingClientRect: target.getBoundingClientRect(),
    intersectionRect: target.getBoundingClientRect(),
    rootBounds: null,
    time: Date.now(),
  };
}

/**
 * Mock resize observer entry
 */
export function createMockResizeObserverEntry(
  target: Element = document.createElement('div'),
  width = 100,
  height = 100
): ResizeObserverEntry {
  return {
    target,
    contentRect: new DOMRectReadOnly(0, 0, width, height),
    borderBoxSize: [{ blockSize: height, inlineSize: width }],
    contentBoxSize: [{ blockSize: height, inlineSize: width }],
    devicePixelContentBoxSize: [{ blockSize: height, inlineSize: width }],
  };
}

/**
 * Delay execution
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Flush promises
 */
export async function flushPromises(): Promise<void> {
  await new Promise((resolve) => setImmediate(resolve));
}

// ============================================================================
// Exports
// ============================================================================

// Re-export everything from React Testing Library
export * from '@testing-library/react';
export { userEvent };

// Export custom render as default
export { renderWithProviders as render };
