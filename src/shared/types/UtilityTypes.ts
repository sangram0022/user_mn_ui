/**
 * Advanced TypeScript Utility Types
 * Expert-level type patterns by 20-year React developer
 */

// ==================== BASIC UTILITY TYPES ====================

/**
 * Make specified properties optional
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Make specified properties required
 */
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

/**
 * Deep partial type
 */
export type DeepPartial<T> = { [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P] };

/**
 * Deep required type
 */
export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object | undefined ? DeepRequired<NonNullable<T[P]>> : T[P];
};

/**
 * Non-nullable keys
 */
export type NonNullableKeys<T> = {
  [K in keyof T]: T[K] extends null | undefined ? never : K;
}[keyof T];

/**
 * Nullable keys
 */
export type NullableKeys<T> = {
  [K in keyof T]: T[K] extends null | undefined ? K : never;
}[keyof T];

/**
 * Extract function parameter types
 */
export type Parameters<T extends (...args: unknown[]) => unknown> = T extends (
  ...args: infer P
) => unknown
  ? P
  : never;

/**
 * Extract function return type
 */
export type ReturnType<T extends (...args: unknown[]) => unknown> = T extends (
  ...args: unknown[]
) => infer R
  ? R
  : unknown;

// ==================== API TYPES ====================

/**
 * API Response wrapper
 */
export type ApiResponse<T = unknown> = {
  data: T;
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
};

/**
 * API Error response
 */
export type ApiError = {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
  code?: string;
  statusCode?: number;
};

/**
 * Pagination parameters
 */
export type PaginationParams = {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
};

/**
 * Filter parameters
 */
export type FilterParams<T = Record<string, unknown>> = { [K in keyof T]?: T[K] | T[K][] } & {
  search?: string;
  dateFrom?: string;
  dateTo?: string;
};

/**
 * Query parameters combining pagination and filters
 */
export type QueryParams<T = Record<string, unknown>> = PaginationParams & FilterParams<T>;

// ==================== FORM TYPES ====================

/**
 * Form field state
 */
export type FormFieldState<T = unknown> = {
  value: T;
  error: string | null;
  touched: boolean;
  dirty: boolean;
  valid: boolean;
};

/**
 * Form state for a given type
 */
export type FormState<T extends Record<string, unknown>> = { [K in keyof T]: FormFieldState<T[K]> };

/**
 * Form validation rules
 */
export type ValidationRule<T = unknown> = {
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: T, formData?: unknown) => string | null;
  asyncValidator?: (value: T, formData?: unknown) => Promise<string | null>;
};

/**
 * Form validation schema
 */
export type ValidationSchema<T extends Record<string, unknown>> = {
  [K in keyof T]?: ValidationRule<T[K]>;
};

// ==================== COMPONENT TYPES ====================

/**
 * Extract props from a component
 */
export type ComponentProps<T> = T extends React.ComponentType<infer P> ? P : never;

/**
 * Make component props optional except for specified keys
 */
export type OptionalProps<T, K extends keyof T> = PartialBy<T, Exclude<keyof T, K>>;

/**
 * Component with children
 */
export type WithChildren<T = object> = T & { children: React.ReactNode };

/**
 * Component with optional children
 */
export type WithOptionalChildren<T = object> = T & { children?: React.ReactNode };

/**
 * Component with className
 */
export type WithClassName<T = object> = T & { className?: string };

/**
 * Component with style
 */
export type WithStyle<T = object> = T & { style?: React.CSSProperties };

/**
 * Component with common HTML attributes
 */
export type WithHTMLAttributes<T = object> = T &
  Pick<
    React.HTMLAttributes<HTMLElement>,
    'id' | 'role' | 'aria-label' | 'aria-labelledby' | 'aria-describedby'
  >;

// ==================== STATE MANAGEMENT TYPES ====================

/**
 * Action type for reducers
 */
export type Action<T = unknown> = {
  type: string;
  payload?: T;
  meta?: Record<string, unknown>;
  error?: boolean;
};

/**
 * Async state
 */
export type AsyncState<T = unknown> = {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastFetch?: number;
};

/**
 * Resource state with CRUD operations
 */
export type ResourceState<T = unknown> = {
  items: T[];
  selectedItem: T | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: Record<string, unknown>;
  sortBy: string | null;
  sortOrder: 'asc' | 'desc';
};

// ==================== UTILITY FUNCTION TYPES ====================

/**
 * Debounced function type
 */
export type DebouncedFunction<T extends (...args: unknown[]) => unknown> = {
  (...args: Parameters<T>): void;
  cancel(): void;
  flush(): ReturnType<T> | undefined;
};

/**
 * Throttled function type
 */
export type ThrottledFunction<T extends (...args: unknown[]) => unknown> = {
  (...args: Parameters<T>): ReturnType<T> | undefined;
  cancel(): void;
};

/**
 * Event handler type
 */
export type EventHandler<T = unknown> = (event: T) => void;

/**
 * Async event handler type
 */
export type AsyncEventHandler<T = unknown> = (event: T) => Promise<void>;

// ==================== DATA TRANSFORMATION TYPES ====================

/**
 * Transform keys of an object
 */
export type TransformKeys<T, U extends string> = {
  [K in keyof T as K extends string ? `${U}${Capitalize<K>}` : K]: T[K];
};

/**
 * Transform values of an object
 */
export type TransformValues<T, U> = { [K in keyof T]: U };

/**
 * Pick by value type
 */
export type PickByValue<T, U> = Pick<T, { [K in keyof T]: T[K] extends U ? K : never }[keyof T]>;

/**
 * Omit by value type
 */
export type OmitByValue<T, U> = Pick<T, { [K in keyof T]: T[K] extends U ? never : K }[keyof T]>;

// ==================== CONDITIONAL TYPES ====================

/**
 * Is type exactly equal to another
 */
export type IsExact<T, U> = T extends U ? (U extends T ? true : false) : false;

/**
 * Is type never
 */
export type IsNever<T> = [T] extends [never] ? true : false;

/**
 * Is type any
 */
export type IsAny<T> = 0 extends 1 & T ? true : false;

/**
 * Is type unknown
 */
export type IsUnknown<T> = IsAny<T> extends true ? false : unknown extends T ? true : false;

// ==================== BRANDED TYPES ====================

/**
 * Brand type for creating nominal types
 */
export type Brand<T, U> = T & { readonly __brand: U };

/**
 * Email brand
 */
export type Email = Brand<string, 'Email'>;

/**
 * URL brand
 */
export type URL = Brand<string, 'URL'>;

/**
 * UUID brand
 */
export type UUID = Brand<string, 'UUID'>;

/**
 * Positive number brand
 */
export type PositiveNumber = Brand<number, 'PositiveNumber'>;

/**
 * Integer brand
 */
export type Integer = Brand<number, 'Integer'>;

// ==================== TYPE GUARDS ====================

/**
 * Type guard for checking if value is defined
 */
export function isDefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null;
}

/**
 * Type guard for checking if value is string
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * Type guard for checking if value is number
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * Type guard for checking if value is boolean
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

/**
 * Type guard for checking if value is object
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Type guard for checking if value is array
 */
export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

/**
 * Type guard for checking if value is function
 */
export function isFunction(value: unknown): value is (...args: unknown[]) => unknown {
  return typeof value === 'function';
}

/**
 * Type guard for checking if value is email
 */
export function isEmail(value: string): value is Email {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

/**
 * Type guard for checking if value is URL
 */
export function isURL(value: string): value is URL {
  try {
    new globalThis.URL(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Type guard for checking if value is UUID
 */
export function isUUID(value: string): value is UUID {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Create a branded type
 */
export function createBrand<T, U extends string>(value: T): Brand<T, U> {
  return value as Brand<T, U>;
}

/**
 * Assert that a value is of a specific type
 */
export function assertType<T>(
  value: unknown,
  guard: (value: unknown) => value is T
): asserts value is T {
  if (!guard(value)) {
    throw new Error(`Type assertion failed`);
  }
}

/**
 * Exhaustive check for switch statements
 */
export function assertNever(value: never): never {
  throw new Error(`Unhandled case: ${JSON.stringify(value)}`);
}

// ==================== EXPORTS ====================

// Export all types as default for convenience
export default {
  isDefined,
  isString,
  isNumber,
  isBoolean,
  isObject,
  isArray,
  isFunction,
  isEmail,
  isURL,
  isUUID,
  createBrand,
  assertType,
  assertNever,
};
