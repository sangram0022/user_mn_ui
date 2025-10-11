/**
 * React Testing Utilities
 * Advanced React component testing by 25-year veteran
 */

import {
  RenderHookOptions,
  RenderOptions,
  render as rtlRender,
  renderHook as rtlRenderHook,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactElement, ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { ToastProvider } from '../app/providers/ToastProvider';
import { AuthProvider } from '../contexts';

// ==================== TYPE DEFINITIONS ====================

export interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialRoute?: string;
  withAuth?: boolean;
  withToast?: boolean;
  withRouter?: boolean;
  mockAuthValue?: {
    isAuthenticated: boolean;
    user: any | null;
    login: ReturnType<typeof vi.fn>;
    logout: ReturnType<typeof vi.fn>;
    register: ReturnType<typeof vi.fn>;
  };
}

export interface CustomHookOptions<TProps> extends RenderHookOptions<TProps> {
  withRouter?: boolean;
  withAuth?: boolean;
}

// ==================== WRAPPER COMPONENTS ====================

/**
 * Create wrapper with all necessary providers
 */
function createWrapper(options: CustomRenderOptions = {}) {
  const { withRouter = true, withAuth = false, withToast = true, initialRoute = '/' } = options;

  return function Wrapper({ children }: { children: ReactNode }) {
    let wrapped = <>{children}</>;

    // Add Toast Provider
    if (withToast) {
      wrapped = <ToastProvider>{wrapped}</ToastProvider>;
    }

    // Add Auth Provider
    if (withAuth) {
      wrapped = <AuthProvider>{wrapped}</AuthProvider>;
    }

    // Add Router
    if (withRouter) {
      // Set initial route
      window.history.pushState({}, 'Test page', initialRoute);
      wrapped = <BrowserRouter>{wrapped}</BrowserRouter>;
    }

    return wrapped;
  };
}

// ==================== CUSTOM RENDER ====================

/**
 * Custom render with all providers
 */
export function render(ui: ReactElement, options: CustomRenderOptions = {}) {
  const Wrapper = createWrapper(options);

  const utils = rtlRender(ui, {
    wrapper: Wrapper,
    ...options,
  });

  return {
    ...utils,
    user: userEvent.setup(),
  };
}

// ==================== CUSTOM RENDER HOOK ====================

/**
 * Custom renderHook with providers
 */
export function renderHook<TResult, TProps>(
  hook: (props: TProps) => TResult,
  options: CustomHookOptions<TProps> = {}
) {
  const { withRouter = false, withAuth = false, ...renderOptions } = options;

  const Wrapper = createWrapper({ withRouter, withAuth });

  return rtlRenderHook(hook, {
    wrapper: Wrapper as any,
    ...renderOptions,
  });
}

// ==================== MOCK COMPONENTS ====================

/**
 * Create mock component that tracks renders
 */
export function createMockComponent(name: string) {
  const renderSpy = vi.fn();

  const MockComponent = (props: any) => {
    renderSpy(props);
    return <div data-testid={`mock-${name}`}>{name}</div>;
  };

  MockComponent.displayName = `Mock${name}`;

  return { component: MockComponent, renderSpy };
}

// ==================== USER INTERACTION HELPERS ====================

/**
 * Fill form with data
 */
export async function fillForm(
  form: HTMLElement,
  data: Record<string, string>,
  user = userEvent.setup()
) {
  for (const [name, value] of Object.entries(data)) {
    const input = form.querySelector(`[name="${name}"]`) as HTMLInputElement;
    if (input) {
      await user.clear(input);
      await user.type(input, value);
    }
  }
}

/**
 * Submit form
 */
export async function submitForm(form: HTMLElement, user = userEvent.setup()) {
  const submitButton = form.querySelector('[type="submit"]') as HTMLButtonElement;
  if (submitButton) {
    await user.click(submitButton);
  }
}

// ==================== QUERY HELPERS ====================

/**
 * Find element by test id with error
 */
export function getByTestId(container: HTMLElement, testId: string): HTMLElement {
  const element = container.querySelector(`[data-testid="${testId}"]`);
  if (!element) {
    throw new Error(`Element with test id "${testId}" not found`);
  }
  return element as HTMLElement;
}

/**
 * Find element by text content
 */
export function getByTextContent(container: HTMLElement, text: string | RegExp): HTMLElement {
  const elements = Array.from(container.querySelectorAll('*'));
  const element = elements.find((el) => {
    const textContent = el.textContent || '';
    return typeof text === 'string' ? textContent.includes(text) : text.test(textContent);
  });

  if (!element) {
    throw new Error(`Element with text "${text}" not found`);
  }

  return element as HTMLElement;
}

// ==================== ASSERTION HELPERS ====================

/**
 * Wait for element to appear
 */
export async function waitForElement(
  container: HTMLElement,
  selector: string,
  timeout = 3000
): Promise<HTMLElement> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const element = container.querySelector(selector);
    if (element) {
      return element as HTMLElement;
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  throw new Error(`Element "${selector}" not found within ${timeout}ms`);
}

/**
 * Wait for element to disappear
 */
export async function waitForElementToBeRemoved(
  container: HTMLElement,
  selector: string,
  timeout = 3000
): Promise<void> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const element = container.querySelector(selector);
    if (!element) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  throw new Error(`Element "${selector}" still exists after ${timeout}ms`);
}

// ==================== SNAPSHOT HELPERS ====================

/**
 * Create snapshot with normalized whitespace
 */
export function normalizeSnapshot(html: string): string {
  return html.replace(/\s+/g, ' ').replace(/>\s+</g, '><').trim();
}

// ==================== EXPORTS ====================

export const reactTestUtils = {
  render,
  renderHook,
  createMockComponent,
  fillForm,
  submitForm,
  getByTestId,
  getByTextContent,
  waitForElement,
  waitForElementToBeRemoved,
  normalizeSnapshot,
};

// Re-export testing library utilities
export { fireEvent, screen, waitFor, within } from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
