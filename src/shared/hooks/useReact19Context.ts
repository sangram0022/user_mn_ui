/**
 * React 19: use() Hook Wrappers for Context
 *
 * React 19's use() hook provides a simpler API for reading context values
 * compared to useContext. It can also be used conditionally (unlike useContext)
 * and for unwrapping promises in Suspense boundaries.
 *
 * Benefits:
 * - [DONE] Simpler syntax than useContext
 * - [DONE] Can be used conditionally (inside if/else)
 * - [DONE] Better TypeScript inference
 * - [DONE] Supports promise unwrapping
 *
 * @module useReact19Context
 */

import type { Context } from 'react';
import { use } from 'react';

/**
 * React 19: Generic use() wrapper for any context
 *
 * @example
 * ```tsx
 * import { useContextValue } from '@shared/hooks/useReact19Context';
 *
 * function MyComponent() {
 *   const theme = useContextValue(ThemeContext);
 *   return <div className={theme}>Content</div>;
 * }
 * ```
 */
export function useContextValue<T>(context: Context<T>): T {
  return use(context);
}

/**
 * React 19: Conditional context reading
 *
 * Unlike useContext, use() can be called conditionally.
 * This helper provides a safe way to read context only when needed.
 *
 * @example
 * ```tsx
 * function MyComponent({ useTheme }: { useTheme: boolean }) {
 *   // [DONE] React 19: Can use conditionally!
 *   const theme = useConditionalContext(ThemeContext, useTheme);
 *
 *   if (!theme) return <div>Default theme</div>;
 *   return <div className={theme}>Themed content</div>;
 * }
 * ```
 */
export function useConditionalContext<T>(context: Context<T>, condition: boolean): T | null {
  if (condition) {
    return use(context);
  }
  return null;
}

/**
 * React 19: Promise unwrapping with use()
 *
 * use() can unwrap promises for Suspense-compatible data fetching
 *
 * @example
 * ```tsx
 * function DataDisplay({ dataPromise }: { dataPromise: Promise<Data> }) {
 *   // [DONE] React 19: Unwrap promise with use()
 *   const data = usePromise(dataPromise);
 *   return <div>{data.value}</div>;
 * }
 *
 * // Wrap in Suspense
 * <Suspense fallback={<Loading />}>
 *   <DataDisplay dataPromise={fetchData()} />
 * </Suspense>
 * ```
 */
export function usePromise<T>(promise: Promise<T>): T {
  return use(promise);
}

/**
 * React 19: Helper for optional promise
 * Returns null if no promise provided
 */
export function useOptionalPromise<T>(promise: Promise<T> | null): T | null {
  if (promise === null) {
    return null;
  }
  return use(promise);
}
