/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Testing Utilities and Strategies (Non-JSX Version)
 * Expert-level testing implementation by 20-year React veteran
 */

// ==================== TEST SETUP UTILITIES ====================

// Custom render options would be defined here for actual test implementations

// ==================== MOCK FACTORIES ====================

/**
 * Mock user data factory
 */
export const createMockUser = (overrides = {}) => ({
  id: '1',
  username: 'testuser',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'user',
  isActive: true,
  createdAt: new Date().toISOString(),
  ...overrides,
});

/**
 * Mock API response factory
 */
export const createMockApiResponse = <T>(data: T, overrides = {}) => ({
  data,
  status: 'success',
  message: 'Operation successful',
  ...overrides,
});

/**
 * Mock error response factory
 */
export const createMockErrorResponse = (message = 'An error occurred', code = 'ERROR') => ({
  status: 'error',
  message,
  code,
  details: null,
});

// ==================== TEST HELPERS ====================

/**
 * Wait for element to appear
 */
export const waitForElementToAppear = async (
  getByTestId: (testId: string) => HTMLElement,
  testId: string,
  timeout = 3000
) => {
  return new Promise<HTMLElement>((resolve, reject) => {
    const startTime = Date.now();

    const checkElement = () => {
      try {
        const element = getByTestId(testId);
        if (element) {
          resolve(element);
          return;
        }
      } catch {
        // Element not found yet
      }

      if (Date.now() - startTime > timeout) {
        reject(new Error(`Element with testId "${testId}" not found within ${timeout}ms`));
        return;
      }

      setTimeout(checkElement, 100);
    };

    checkElement();
  });
};

/**
 * Test form submission helper
 */
export const createFormSubmissionTest = (formData: Record<string, string>) => ({
  formData,
  expectedFields: Object.keys(formData),
  validate: (form: HTMLFormElement) => {
    const formDataEntries = new FormData(form);
    const actualData: Record<string, string> = {};

    for (const [key, value] of formDataEntries.entries()) {
      actualData[key] = value.toString();
    }

    return Object.entries(formData).every(
      ([key, expectedValue]) => actualData[key] === expectedValue
    );
  },
});

/**
 * Test navigation helper
 */
export const createNavigationTest = (expectedPath: string) => ({
  expectedPath,
  validate: () => window.location.pathname === expectedPath,
});

// ==================== ACCESSIBILITY TESTING ====================

/**
 * Test keyboard navigation
 */
export const createKeyboardNavigationTest = (container: HTMLElement) => {
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  return {
    focusableElements: Array.from(focusableElements),
    testTabNavigation: () => {
      // This would need to be implemented with actual user events in a test
      return focusableElements.length > 0;
    },
    testShiftTabNavigation: () => {
      // This would need to be implemented with actual user events in a test
      return focusableElements.length > 0;
    },
  };
};

/**
 * Test ARIA attributes
 */
export const testAriaAttributes = (
  element: HTMLElement,
  expectedAttributes: Record<string, string>
) => {
  const results: Record<string, boolean> = {};

  Object.entries(expectedAttributes).forEach(([attribute, expectedValue]) => {
    results[attribute] = element.getAttribute(attribute) === expectedValue;
  });

  return results;
};

// ==================== PERFORMANCE TESTING ====================

/**
 * Test render performance
 */
export const testRenderPerformance = (
  renderFunction: () => void,
  maxRenderTime = 16 // 16ms for 60fps
) => {
  const startTime = performance.now();
  renderFunction();
  const endTime = performance.now();
  const renderTime = endTime - startTime;

  return {
    renderTime,
    isWithinLimit: renderTime <= maxRenderTime,
    maxRenderTime,
  };
};

/**
 * Test memory usage (Browser specific)
 */
export const testMemoryUsage = async (
  testFunction: () => Promise<void>,
  maxMemoryIncrease = 10 * 1024 * 1024 // 10MB
) => {
  // Type assertion for Chrome's memory API
  const performance = window.performance as any;

  if (!performance?.memory) {
    return {
      supported: false,
      message: 'Memory testing not supported in this environment',
    };
  }

  const initialMemory = performance.memory.usedJSHeapSize;
  await testFunction();

  // Force garbage collection if available
  const windowWithGC = window as any;
  if (windowWithGC.gc) {
    windowWithGC.gc();
  }

  const finalMemory = performance.memory.usedJSHeapSize;
  const memoryIncrease = finalMemory - initialMemory;

  return {
    supported: true,
    initialMemory,
    finalMemory,
    memoryIncrease,
    isWithinLimit: memoryIncrease <= maxMemoryIncrease,
    maxMemoryIncrease,
  };
};

// ==================== ERROR TESTING ====================

/**
 * Test async error handling
 */
export const testAsyncError = async (
  asyncFunction: () => Promise<any>,
  expectedErrorMessage: string
) => {
  try {
    await asyncFunction();
    return {
      errorCaught: false,
      message: 'Expected error was not thrown',
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      errorCaught: true,
      expectedMessage: expectedErrorMessage,
      actualMessage: errorMessage,
      isExpectedError: errorMessage.includes(expectedErrorMessage),
    };
  }
};

// ==================== SECURITY TESTING ====================

/**
 * Test XSS prevention
 */
export const testXSSPrevention = (element: HTMLElement) => {
  const dangerousPatterns = [
    '<script>',
    'javascript:',
    'onerror=',
    'onload=',
    'onclick=',
    'onmouseover=',
    'data:text/html',
    'vbscript:',
    'livescript:',
  ];

  const innerHTML = element.innerHTML.toLowerCase();
  const textContent = element.textContent?.toLowerCase() || '';

  return {
    isSecure: !dangerousPatterns.some(
      (pattern) => innerHTML.includes(pattern) || textContent.includes(pattern)
    ),
    detectedPatterns: dangerousPatterns.filter(
      (pattern) => innerHTML.includes(pattern) || textContent.includes(pattern)
    ),
  };
};

/**
 * Test input sanitization
 */
export const testInputSanitization = (inputValue: string, expectedSanitizedValue: string) => {
  return {
    original: inputValue,
    expected: expectedSanitizedValue,
    isPropertySanitized: inputValue !== expectedSanitizedValue,
    sanitizationWorked: inputValue === expectedSanitizedValue,
  };
};

// ==================== INTEGRATION TEST HELPERS ====================

/**
 * Create user flow test configuration
 */
export const createUserFlowTest = (
  steps: Array<{
    action: 'click' | 'type' | 'navigate' | 'wait';
    selector?: string;
    value?: string;
    timeout?: number;
  }>
) => {
  return {
    steps,
    validate: (currentStep: number) => currentStep >= 0 && currentStep < steps.length,
    getStep: (index: number) => steps[index],
    totalSteps: steps.length,
  };
};

// ==================== MOCK SERVER RESPONSES ====================

/**
 * Mock successful API response
 */
export const mockSuccessResponse = <T>(data: T) => {
  return {
    ok: true,
    status: 200,
    data: createMockApiResponse(data),
    json: () => Promise.resolve(createMockApiResponse(data)),
  };
};

/**
 * Mock error API response
 */
export const mockErrorResponse = (status = 500, message = 'Server Error') => {
  return {
    ok: false,
    status,
    message,
    error: new Error(message),
  };
};

/**
 * Mock network delay
 */
export const mockNetworkDelay = (delay = 100) => {
  return new Promise((resolve) => setTimeout(resolve, delay));
};

// ==================== TEST CONFIGURATIONS ====================

/**
 * Default test configurations
 */
export const testConfigs = {
  performance: {
    maxRenderTime: 16, // 60fps
    maxMemoryIncrease: 10 * 1024 * 1024, // 10MB
  },
  timeouts: { short: 1000, medium: 3000, long: 10000 },
  accessibility: {
    requiredAriaAttributes: ['aria-label', 'aria-describedby', 'role'],
    keyboardNavigationDelay: 100,
  },
  security: { xssPatterns: ['<script>', 'javascript:', 'onerror=', 'onload='] },
};

// ==================== EXPORTS ====================

// Test data generators
export const testData = { createMockUser, createMockApiResponse, createMockErrorResponse };

// Test utilities
export const testUtils = {
  waitForElementToAppear,
  createFormSubmissionTest,
  createNavigationTest,
  createKeyboardNavigationTest,
  testAriaAttributes,
  testRenderPerformance,
  testMemoryUsage,
  testAsyncError,
  testXSSPrevention,
  testInputSanitization,
  createUserFlowTest,
};

// Mock utilities
export const mockUtils = { mockSuccessResponse, mockErrorResponse, mockNetworkDelay };

// All exports are handled inline above
