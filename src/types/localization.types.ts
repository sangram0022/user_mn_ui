/**
 * Localization Types and Interfaces
 *
 * Comprehensive type definitions for the localization system
 * supporting messages, errors, validation, and API responses.
 *
 * @author GitHub Copilot
 */

// ============================================================================
// Base Localization Types
// ============================================================================

export type LocaleCode = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'ja' | 'ko' | 'zh' | 'hi' | 'ar';

export type MessageNamespace =
  | 'common'
  | 'auth'
  | 'users'
  | 'admin'
  | 'audit'
  | 'roles'
  | 'bulk'
  | 'gdpr'
  | 'health'
  | 'password'
  | 'errors'
  | 'validation'
  | 'success'
  | 'navigation';

// ============================================================================
// Message Key Types
// ============================================================================

export interface LocalizationKey {
  key: string;
  namespace: MessageNamespace;
  interpolation?: Record<string, string | number>;
  fallback?: string;
}

export interface ApiMessageKey {
  messageKey: string;
  namespace: MessageNamespace;
  severity: 'info' | 'success' | 'warning' | 'error';
  interpolationData?: Record<string, unknown>;
}

// ============================================================================
// Localized Message Structure
// ============================================================================

export interface LocalizedMessage {
  id: string;
  message: string;
  description?: string;
  context?: string;
  interpolation?: string[];
  pluralRules?: {
    zero?: string;
    one?: string;
    two?: string;
    few?: string;
    many?: string;
    other: string;
  };
}

// ============================================================================
// API Response Message Types
// ============================================================================

export interface ApiResponseWithMessage {
  message?: string;
  messageKey?: string;
  messageNamespace?: MessageNamespace;
  messageData?: Record<string, unknown>;
  details?: string | string[] | ValidationError[];
  correlationId?: string;
  success?: boolean;
  data?: unknown;
}

export interface ApiErrorWithMessage extends ApiResponseWithMessage {
  error: {
    code: string;
    message: string;
    messageKey?: string;
    messageNamespace?: MessageNamespace;
    details?: string[];
    field?: string;
    validation?: ValidationError[];
  };
}

export interface ValidationError {
  field: string;
  code: string;
  message: string;
  messageKey?: string;
  messageNamespace?: MessageNamespace;
  messageData?: Record<string, string | number | boolean | null | undefined>;
  value?: unknown;
}

// ============================================================================
// Localization Context Types
// ============================================================================

export interface LocalizationContextValue {
  locale: LocaleCode;
  setLocale: (locale: LocaleCode) => void;
  t: (key: string, namespace?: MessageNamespace, interpolation?: Record<string, unknown>) => string;
  formatMessage: (messageKey: ApiMessageKey) => string;
  formatError: (error: ApiErrorWithMessage) => string;
  formatValidationErrors: (errors: ValidationError[]) => Record<string, string>;
  isRTL: boolean;
  dateFormat: string;
  timeFormat: string;
  numberFormat: Intl.NumberFormatOptions;
  currencyFormat: Intl.NumberFormatOptions;
}

// ============================================================================
// Message Bundle Types
// ============================================================================

export interface MessageBundle {
  [namespace: string]: {
    [key: string]: LocalizedMessage | string;
  };
}

export interface LocaleBundle {
  meta: {
    locale: LocaleCode;
    name: string;
    nativeName: string;
    direction: 'ltr' | 'rtl';
    completeness: number;
    lastUpdated: string;
  };
  messages: MessageBundle;
}

// ============================================================================
// Interpolation Types
// ============================================================================

export interface InterpolationOptions {
  escapeValue?: boolean;
  formatSeparator?: string;
  format?: (value: unknown, format?: string, lng?: string) => string;
  formatters?: Record<string, (value: unknown, lng?: string, options?: unknown) => string>;
}

// ============================================================================
// Utility Types
// ============================================================================

export type MessageKey = string;
export type MessagePath = string;

// ============================================================================
// Configuration Types
// ============================================================================

export interface LocalizationConfig {
  defaultLocale: LocaleCode;
  fallbackLocale: LocaleCode;
  supportedLocales: LocaleCode[];
  namespaces: MessageNamespace[];
  interpolation: InterpolationOptions;
  detection: {
    order: ('localStorage' | 'navigator' | 'htmlTag' | 'path' | 'subdomain')[];
    lookupLocalStorage?: string;
    lookupFromPathIndex?: number;
    lookupFromSubdomainIndex?: number;
    caches: ('localStorage' | 'cookie')[];
  };
  backend: {
    loadPath: string;
    addPath?: string;
    allowMultiLoading?: boolean;
  };
  debug: boolean;
}

// ============================================================================
// Additional Formatting Types
// ============================================================================

export interface FormattedMessage {
  key: MessageKey;
  interpolation?: MessageInterpolation;
  defaultMessage?: string;
}

export type MessageInterpolation = Record<string, string | number | boolean | null | undefined>;

export type NumberFormatOptions = Intl.NumberFormatOptions;

export type DateFormatOptions = Intl.DateTimeFormatOptions;
