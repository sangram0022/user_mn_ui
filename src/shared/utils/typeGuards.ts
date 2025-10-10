/**
 * Advanced type guards for runtime type checking and validation
 */

// Basic type guards
export const isString = (value: unknown): value is string => typeof value === 'string';
export const isNumber = (value: unknown): value is number => typeof value === 'number' && !isNaN(value);
export const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean';
export const isNull = (value: unknown): value is null => value === null;
export const isUndefined = (value: unknown): value is undefined => value === undefined;
export const isNullish = (value: unknown): value is null | undefined => value == null;

// Object type guards
export const isObject = (value: unknown): value is Record<string, unknown> => 
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const isArray = <T>(value: unknown, itemGuard?: (item: unknown) => item is T): value is T[] => { if (!Array.isArray(value)) return false;
  if (!itemGuard) return true;
  return value.every(itemGuard); };

export const isEmptyObject = (value: unknown): value is Record<string, never> => 
  isObject(value) && Object.keys(value).length === 0;

export const isFunction = (value: unknown): value is (...args: unknown[]) => unknown => 
  typeof value === 'function';

// Advanced type guards for common patterns
export const hasProperty = <K extends string>(
  obj: unknown,
  key: K
): obj is Record<K, unknown> => { return isObject(obj) && key in obj; };

export const hasProperties = <K extends string[]>(
  obj: unknown,
  keys: K
): obj is Record<K[number], unknown> => { return isObject(obj) && keys.every(key => key in obj); };

export const isArrayOf = <T>(
  value: unknown,
  guard: (item: unknown) => item is T
): value is T[] => { return Array.isArray(value) && value.every(guard); };

// API response type guards
export interface ApiResponse<T = unknown> { data: T;
  message?: string;
  success: boolean;
  errors?: Record<string, string[]>; }

export const isApiResponse = <T>(
  value: unknown,
  dataGuard?: (data: unknown) => data is T
): value is ApiResponse<T> => { if (!isObject(value)) return false;
  
  const hasRequiredFields = hasProperties(value, ['data', 'success']) && isBoolean(value.success);
  
  if (!hasRequiredFields) return false;
  
  if (dataGuard && !dataGuard(value.data)) return false;
  
  // Check optional fields
  if ('message' in value && !isString(value.message) && !isUndefined(value.message)) {
    return false;
  }
  
  if ('errors' in value && !isObject(value.errors) && !isUndefined(value.errors)) { return false;
  }
  
  return true;
};

// User type guards
export interface User { id: string | number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean; }

export const isUser = (value: unknown): value is User => { if (!isObject(value)) return false;
  
  return hasProperty(value, 'id') && (isString(value.id) || isNumber(value.id)) &&
         hasProperty(value, 'email') && isString(value.email) &&
         hasProperty(value, 'first_name') && isString(value.first_name) &&
         hasProperty(value, 'last_name') && isString(value.last_name) &&
         hasProperty(value, 'role') && isString(value.role) &&
         hasProperty(value, 'is_active') && isBoolean(value.is_active); };

// Error type guards
export interface ApiError { message: string;
  code?: string;
  status?: number;
  details?: unknown; }

export const isApiError = (value: unknown): value is ApiError => { if (!isObject(value)) return false;
  
  const hasMessage = hasProperty(value, 'message') && isString(value.message);
  if (!hasMessage) return false;
  
  // Check optional fields
  if ('code' in value && !isString(value.code) && !isUndefined(value.code)) {
    return false;
  }
  
  if ('status' in value && !isNumber(value.status) && !isUndefined(value.status)) { return false;
  }
  
  return true;
};

// Form validation type guards
export interface FormFieldValidation { value: unknown;
  error?: string;
  touched: boolean;
  valid: boolean; }

export const isFormFieldValidation = (value: unknown): value is FormFieldValidation => { if (!isObject(value)) return false;
  
  return hasProperty(value, 'touched') && isBoolean(value.touched) &&
         hasProperty(value, 'valid') && isBoolean(value.valid) &&
         'value' in value &&
         (!('error' in value) || isString(value.error) || isUndefined(value.error)); };

// Utility functions for type narrowing
export const assertIsString = (value: unknown): asserts value is string => {
  if (!isString(value)) {
    throw new Error(`Expected string, got ${typeof value}`);
  }
};

export const assertIsNumber = (value: unknown): asserts value is number => {
  if (!isNumber(value)) {
    throw new Error(`Expected number, got ${typeof value}`);
  }
};

export const assertIsObject = (value: unknown): asserts value is Record<string, unknown> => {
  if (!isObject(value)) {
    throw new Error(`Expected object, got ${typeof value}`);
  }
};

// Generic type guard creator
export const createTypeGuard = <T>(
  validator: (value: unknown) => boolean
) => (value: unknown): value is T => validator(value);

// Conditional type guards
export const isOneOf = <T extends readonly unknown[]>(
  value: unknown,
  options: T
): value is T[number] => { return options.includes(value); };

export const isInstanceOf = <T>(
  value: unknown,
  constructor: new (...args: unknown[]) => T
): value is T => { return value instanceof constructor; };

// Date type guard
export const isDate = (value: unknown): value is Date => { return value instanceof Date && !isNaN(value.getTime()); };

export const isValidDateString = (value: unknown): value is string => { return isString(value) && !isNaN(Date.parse(value)); };

// Environment-specific type guards
export const isDevelopment = (): boolean => { return import.meta.env.DEV; };

export const isProduction = (): boolean => { return import.meta.env.PROD; };

// Async type guard wrapper
export const asyncTypeGuard = <T>(
  guard: (value: unknown) => value is T
) => { return async (value: unknown): Promise<boolean> => {
    return Promise.resolve(guard(value));
  };
};

// Compose type guards
export const everyOf = (
  value: unknown,
  guards: Array<(value: unknown) => boolean>
): boolean => { return guards.every(guard => guard(value)); };

export const anyOf = (
  value: unknown,
  guards: Array<(value: unknown) => boolean>
): boolean => { return guards.some(guard => guard(value)); };

// Export all type guards as a namespace
export const TypeGuards = { isString,
  isNumber,
  isBoolean,
  isNull,
  isUndefined,
  isNullish,
  isObject,
  isArray,
  isEmptyObject,
  isFunction,
  hasProperty,
  hasProperties,
  isArrayOf,
  isApiResponse,
  isUser,
  isApiError,
  isFormFieldValidation,
  assertIsString,
  assertIsNumber,
  assertIsObject,
  createTypeGuard,
  isOneOf,
  isInstanceOf,
  isDate,
  isValidDateString,
  isDevelopment,
  isProduction,
  asyncTypeGuard,
  everyOf,
  anyOf } as const;