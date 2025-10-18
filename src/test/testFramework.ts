/**
 * Advanced Test Framework
 * Enterprise-grade testing utilities by 25-year React veteran
 * Provides comprehensive mocking, fixtures, and testing patterns
 */

import type { Mock } from 'vitest';
import { vi } from 'vitest';

// ==================== TYPE DEFINITIONS ====================

export interface MockFactory<T = any> {
  create: (overrides?: Partial<T>) => T;
  createMany: (count: number, overrides?: Partial<T>) => T[];
  reset: () => void;
}

export interface TestSuiteConfig {
  isolate?: boolean;
  timeout?: number;
  retries?: number;
  mockTimers?: boolean;
}

// ==================== MOCK FACTORIES ====================

/**
 * Create a reusable mock factory with intelligent defaults
 */
export function createMockFactory<T extends Record<string, any>>(
  defaults: T,
  generator?: (index?: number) => Partial<T>
): MockFactory<T> {
  let callCount = 0;

  return {
    create: (overrides = {}) => {
      callCount++;
      const generated = generator ? generator(callCount) : {};
      return { ...defaults, ...generated, ...overrides } as T;
    },

    createMany: (count, overrides = {}) =>
      Array.from({ length: count }, (_, i) => {
        const generated = generator ? generator(i) : {};
        return { ...defaults, ...generated, ...overrides } as T;
      }),

    reset: () => {
      callCount = 0;
    },
  };
}

/**
 * Mock User Factory
 */
export const mockUserFactory = createMockFactory(
  {
    id: '1',
    username: 'testuser',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'user' as const,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  (index) => ({
    id: `user-${index}`,
    username: `testuser${index}`,
    email: `test${index}@example.com`,
  })
);

/**
 * Mock API Response Factory
 */
export const mockApiResponseFactory = createMockFactory({
  data: null,
  status: 'success' as const,
  message: 'Operation successful',
  timestamp: new Date().toISOString(),
});

/**
 * Mock Error Factory
 */
export const mockErrorFactory = createMockFactory({
  message: 'An error occurred',
  code: 'ERROR',
  status: 500,
  details: {},
});

// ==================== MOCK FUNCTIONS ====================

/**
 * Create a comprehensive mock function with tracking
 */
export function createMockFn<T extends (...args: any[]) => any>() {
  const mockFn = vi.fn() as Mock<T>;

  return Object.assign(mockFn, {
    mockResolvedValueOnce: (value: any) => mockFn.mockResolvedValueOnce(value),
    mockRejectedValueOnce: (error: any) => mockFn.mockRejectedValueOnce(error),
    mockImplementationOnce: (impl: T) => mockFn.mockImplementationOnce(impl),
    getCallArgs: (callIndex: number) => mockFn.mock.calls[callIndex],
    getLastCall: () => mockFn.mock.calls[mockFn.mock.calls.length - 1],
    reset: () => mockFn.mockReset(),
    clear: () => mockFn.mockClear(),
  });
}

/**
 * Create mock async function with controlled resolution
 */
export function createMockAsyncFn<T>(
  defaultValue?: T,
  delay = 0
): Mock & { resolveWith: (value: T) => void; rejectWith: (error: Error) => void } {
  let resolver: ((value: T) => void) | null = null;
  let rejecter: ((error: Error) => void) | null = null;

  const mockFn = vi.fn().mockImplementation(
    () =>
      new Promise((resolve, reject) => {
        resolver = resolve as any;
        rejecter = reject;
        if (defaultValue !== undefined && delay === 0) {
          setTimeout(() => resolve(defaultValue as any), 0);
        } else if (defaultValue !== undefined) {
          setTimeout(() => resolve(defaultValue as any), delay);
        }
      })
  );

  return Object.assign(mockFn, {
    resolveWith: (value: T) => resolver?.(value),
    rejectWith: (error: Error) => rejecter?.(error),
  });
}

// ==================== MOCK MODULES ====================

/**
 * Create mock module with all methods as spies
 */
export function createMockModule<T extends Record<string, any>>(
  methods: T
): { [K in keyof T]: Mock } {
  const mockModule = {} as any;

  for (const [key, value] of Object.entries(methods)) {
    if (typeof value === 'function') {
      mockModule[key] = vi.fn().mockReturnValue(value());
    } else {
      mockModule[key] = value;
    }
  }

  return mockModule;
}

// ==================== STORAGE MOCKS ====================

/**
 * Create comprehensive localStorage mock
 */
export function createLocalStorageMock() {
  const store = new Map<string, string>();

  return {
    getItem: vi.fn((key: string) => store.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store.set(key, value);
    }),
    removeItem: vi.fn((key: string) => {
      store.delete(key);
    }),
    clear: vi.fn(() => {
      store.clear();
    }),
    get length() {
      return store.size;
    },
    key: vi.fn((index: number) => Array.from(store.keys())[index] ?? null),
    _getStore: () => store,
    _reset: () => {
      store.clear();
      vi.clearAllMocks();
    },
  };
}

/**
 * Create sessionStorage mock
 */
export const createSessionStorageMock = createLocalStorageMock;

// ==================== API MOCKS ====================

/**
 * Create mock fetch with response builder
 */
export function createMockFetch() {
  const mockFetch = vi.fn();

  return {
    fetch: mockFetch,
    mockResponse: (
      data: any,
      options: { status?: number; headers?: Record<string, string> } = {}
    ) => {
      mockFetch.mockResolvedValueOnce({
        ok: (options.status ?? 200) < 400,
        status: options.status ?? 200,
        headers: new Headers(options.headers),
        json: () => Promise.resolve(data),
        text: () => Promise.resolve(JSON.stringify(data)),
        blob: () => Promise.resolve(new Blob([JSON.stringify(data)])),
      });
    },
    mockError: (error: Error | string) => {
      mockFetch.mockRejectedValueOnce(typeof error === 'string' ? new Error(error) : error);
    },
    reset: () => mockFetch.mockReset(),
  };
}

// ==================== TIMER UTILITIES ====================

/**
 * Advanced timer utilities with precise control
 */
export class TimerController {
  constructor() {
    vi.useFakeTimers();
  }

  advance(ms: number) {
    vi.advanceTimersByTime(ms);
  }

  advanceToNextTimer() {
    vi.advanceTimersToNextTimer();
  }

  runAll() {
    vi.runAllTimers();
  }

  runOnlyPending() {
    vi.runOnlyPendingTimers();
  }

  async flush() {
    await vi.runAllTimersAsync();
  }

  restore() {
    vi.useRealTimers();
  }
}

// ==================== TEST ISOLATION ====================

/**
 * Create isolated test environment
 */
export function createTestEnvironment() {
  const mocks = {
    localStorage: createLocalStorageMock(),
    sessionStorage: createSessionStorageMock(),
    fetch: createMockFetch(),
    console: {
      log: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
      debug: vi.fn(),
    },
  };

  const setup = () => {
    Object.defineProperty(global, 'localStorage', {
      value: mocks.localStorage,
      writable: true,
    });
    Object.defineProperty(global, 'sessionStorage', {
      value: mocks.sessionStorage,
      writable: true,
    });
    global.fetch = mocks.fetch.fetch as any;

    // Mock console methods
    global.console.log = mocks.console.log;
    global.console.warn = mocks.console.warn;
    global.console.error = mocks.console.error;
  };

  const teardown = () => {
    mocks.localStorage._reset();
    mocks.sessionStorage._reset();
    mocks.fetch.reset();
    vi.clearAllMocks();
  };

  return { mocks, setup, teardown };
}

// ==================== ASSERTION HELPERS ====================

/**
 * Wait for condition with timeout
 */
export async function waitFor(
  condition: () => boolean | Promise<boolean>,
  options: { timeout?: number; interval?: number } = {}
): Promise<void> {
  const { timeout = 5000, interval = 50 } = options;
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }

  throw new Error(`Condition not met within ${timeout}ms`);
}

/**
 * Expect function to be called with arguments matching pattern
 */
export function expectCalledWith<T extends (...args: any[]) => any>(
  fn: Mock<T>,
  ...matchers: Array<(arg: any) => boolean>
) {
  const calls = fn.mock.calls;
  const matching = calls.find((call) => matchers.every((matcher, index) => matcher(call[index])));

  if (!matching) {
    throw new Error(
      `Expected function to be called with matching arguments.\nCalls: ${JSON.stringify(calls, null, 2)}`
    );
  }
}

// ==================== EXPORTS ====================

export const testUtils = {
  createMockFactory,
  createMockFn,
  createMockAsyncFn,
  createMockModule,
  createLocalStorageMock,
  createSessionStorageMock,
  createMockFetch,
  TimerController,
  createTestEnvironment,
  waitFor,
  expectCalledWith,
};

export const mockFactories = {
  user: mockUserFactory,
  apiResponse: mockApiResponseFactory,
  error: mockErrorFactory,
};
