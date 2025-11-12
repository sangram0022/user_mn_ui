/**
 * Error Boundary HOC
 * 
 * Higher-order component for wrapping components with Error Boundary.
 * Separated from ErrorBoundary.tsx to comply with fast-refresh requirements.
 */

import type React from 'react';
import ErrorBoundary, { type ErrorBoundaryProps } from './ErrorBoundary';

/**
 * Higher-order component for wrapping components with Error Boundary
 * 
 * @example
 * ```typescript
 * const SafeUserList = withErrorBoundary(UserList, {
 *   boundaryName: 'UserList',
 *   fallback: <UserListError />,
 * });
 * ```
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
): React.ComponentType<P> {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name || 'Component'})`;

  return WrappedComponent;
}
