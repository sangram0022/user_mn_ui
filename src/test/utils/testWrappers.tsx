/* eslint-disable react-refresh/only-export-components */
import type { ReactElement, ReactNode } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

/**
 * Create a new QueryClient for testing with sensible defaults
 */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Disable retries in tests
        gcTime: Infinity, // Keep data in cache for test duration
        staleTime: Infinity, // Data never goes stale during tests
      },
      mutations: {
        retry: false, // Disable retries in tests
      },
    },
  });
}

/**
 * Default test query client
 */
export const testQueryClient = createTestQueryClient();

/**
 * Wrapper with all providers for testing components
 */
interface AllProvidersProps {
  children: ReactNode;
  queryClient?: QueryClient;
}

export function AllProviders({ children, queryClient = testQueryClient }: AllProvidersProps) {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </BrowserRouter>
  );
}

/**
 * Custom render function with all providers
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & {
    queryClient?: QueryClient;
  }
): ReturnType<typeof render> {
  const { queryClient, ...renderOptions } = options || {};

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <AllProviders queryClient={queryClient}>{children}</AllProviders>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

/**
 * Wait for async operations to complete
 * Useful for waiting for queries to finish
 */
export async function waitForLoadingToFinish() {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

/**
 * Re-export everything from @testing-library/react
 */
export * from '@testing-library/react';
