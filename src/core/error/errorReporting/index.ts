/**
 * Error Reporting Module - Public Exports
 */

export { getErrorReportingService, reportErrorToService, flushErrors } from './service';
export type { ErrorReportingConfig } from './config';
export { getErrorReportingConfig, updateErrorReportingConfig, DEFAULT_ERROR_REPORTING_CONFIG } from './config';
export type {
  ErrorReportBatch,
  ReportedError,
  QueuedErrorReport,
  ErrorBreadcrumb,
  ErrorUserContext,
  ErrorEnvironmentContext,
  ErrorPerformanceContext,
  ErrorReportingResponse,
} from './types';
