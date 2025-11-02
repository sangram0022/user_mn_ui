/**
 * Error Reporting Payload Types
 * 
 * Defines the structure of error reports sent to backend services
 */

/**
 * Breadcrumb entry - tracks user actions leading up to error
 */
export interface ErrorBreadcrumb {
  timestamp: string;
  type: 'console' | 'http' | 'navigation' | 'user-action' | 'custom';
  message: string;
  data?: Record<string, unknown>;
  level?: 'debug' | 'info' | 'warning' | 'error';
}

/**
 * User context for error reporting
 */
export interface ErrorUserContext {
  userId?: string;
  username?: string;
  email?: string;
  ip?: string;
  sessionId?: string;
  timestamp: string;
}

/**
 * Device/Environment context
 */
export interface ErrorEnvironmentContext {
  userAgent: string;
  url: string;
  viewport: {
    width: number;
    height: number;
  };
  timeZone: string;
  language: string;
  platform: string;
  memory?: {
    used: number;
    total: number;
  };
  screen: {
    width: number;
    height: number;
  };
}

/**
 * Performance metrics for error context
 */
export interface ErrorPerformanceContext {
  navigationTiming?: {
    domContentLoaded: number;
    pageLoadComplete: number;
  };
  apiTiming?: {
    method: string;
    url: string;
    duration: number;
    statusCode: number;
  }[];
  renderTiming?: {
    componentName: string;
    duration: number;
  }[];
}

/**
 * Single error in batch
 */
export interface ReportedError {
  // Error identification
  id: string;
  timestamp: string;
  
  // Error details
  type: string;
  message: string;
  stack?: string;
  code?: string | number;
  
  // HTTP status (if applicable)
  statusCode?: number;
  
  // Error context
  context?: Record<string, unknown>;
  
  // Breadcrumbs (actions before error)
  breadcrumbs?: ErrorBreadcrumb[];
  
  // User information
  user?: ErrorUserContext;
  
  // Device/environment information
  environment?: ErrorEnvironmentContext;
  
  // Performance information
  performance?: ErrorPerformanceContext;
  
  // Tags for filtering/grouping
  tags?: Record<string, string>;
  
  // Custom data
  customData?: Record<string, unknown>;
  
  // Source that caught this error
  source: 'error-boundary' | 'global-handler' | 'api-client' | 'unhandled-rejection' | 'custom';
  
  // Severity level
  level: 'fatal' | 'error' | 'warning' | 'info' | 'debug';
}

/**
 * Batch of errors to be reported
 */
export interface ErrorReportBatch {
  // Batch identification
  batchId: string;
  timestamp: string;
  
  // Application info
  application: {
    name: string;
    version: string;
    environment: string;
  };
  
  // Errors in this batch
  errors: ReportedError[];
  
  // Overall batch info
  count: number;
  serverTime?: string;
}

/**
 * Response from error reporting endpoint
 */
export interface ErrorReportingResponse {
  success: boolean;
  batchId: string;
  processedCount: number;
  failedCount: number;
  message?: string;
  errors?: Array<{
    errorId: string;
    reason: string;
  }>;
}

/**
 * Retry metadata for failed error reports
 */
export interface RetryMetadata {
  attempt: number;
  lastAttemptTime: string;
  nextRetryTime?: string;
  error?: string;
}

/**
 * Queued error report (with retry metadata)
 */
export interface QueuedErrorReport extends ReportedError {
  retryMetadata: RetryMetadata;
}

/**
 * Generate unique error report ID
 */
export function generateErrorReportId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate batch ID
 */
export function generateBatchId(): string {
  return `batch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Convert Error to ReportedError
 */
export function createReportedError(
  error: Error | unknown,
  source: ReportedError['source'],
  context?: Record<string, unknown>
): ReportedError {
  const now = new Date().toISOString();
  
  let type = 'Unknown';
  let message = 'An unknown error occurred';
  let stack: string | undefined;
  
  if (error instanceof Error) {
    type = error.name || 'Error';
    message = error.message;
    stack = error.stack;
  } else if (typeof error === 'string') {
    message = error;
  } else if (error && typeof error === 'object' && 'message' in error) {
    message = String(error.message);
  }
  
  return {
    id: generateErrorReportId(),
    timestamp: now,
    type,
    message,
    stack,
    context,
    source,
    level: 'error',
  };
}
