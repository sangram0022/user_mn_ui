/**
 * @deprecated Legacy monitoring helpers.
 * Prefer importing directly from `monitoring/sentry` which contains the maintained implementation.
 */

import {
  addBreadcrumb,
  clearUser,
  initSentry,
  captureException as sentryCaptureException,
  setUser,
  startSpan,
} from '../monitoring/sentry';

export function initializeMonitoring(): void {
  initSentry();
}

export function setUserContext(userId: string, role?: string): void {
  setUser({ id: userId, username: role });
}

export function clearUserContext(): void {
  clearUser();
}

export function logEvent(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info',
  data?: Record<string, unknown>
): void {
  addBreadcrumb(message, { ...data, level }, 'monitoring');
}

export function captureException(error: Error, context?: Record<string, unknown>): void {
  if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
    sentryCaptureException(error, context);
  } else {
    console.error('Error captured:', error, context);
  }
}

export function startTransaction(_name: string, _op: string): null {
  startSpan(_name, _op, () => {});
  return null;
}

export async function measurePerformance<T>(
  _name: string,
  operation: () => Promise<T>
): Promise<T> {
  return operation();
}

export default initializeMonitoring;
