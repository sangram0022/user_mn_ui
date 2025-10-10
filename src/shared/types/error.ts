/**
 * Error-related type definitions
 */

export interface ParsedError { code: string;
  message: string;
  details: string[];
  category: 'validation' | 'authentication' | 'authorization' | 'network' | 'server' | 'client' | 'unknown';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userMessage: string;
  retryable: boolean;
  retryAfterSeconds?: number;
  correlationId?: string;
  timestamp: string; }

export interface ApiErrorResponse { detail?: string;
  message?: string;
  errors?: Record<string, string[]>;
  code?: string;
  status?: number;
  retryAfterSeconds?: number;
  requestId?: string;
  payload?: unknown; }

export interface ErrorDisplayProps { error: ParsedError;
  onRetry?: () => void;
  onDismiss?: () => void;
  showDetails?: boolean;
  className?: string; }