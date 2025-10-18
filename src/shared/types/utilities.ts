/**
 * Advanced utility types for React and TypeScript best practices
 */

// Generic component props with children
export type PropsWithChildren<P = Record<string, unknown>> = P & { children?: React.ReactNode };

// Component props without children
export type PropsWithoutChildren<P> = Omit<P, 'children'>;

// Optional fields utility
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Required fields utility
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Nullable fields utility
export type Nullable<T> = { [K in keyof T]: T[K] | null };

// Deep partial utility
export type DeepPartial<T> = { [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P] };

// Extract function parameters
export type Parameters<T extends (...args: unknown[]) => unknown> = T extends (
  ...args: infer P
) => unknown
  ? P
  : never;

// Extract function return type
export type ReturnType<T extends (...args: unknown[]) => unknown> = T extends (
  ...args: unknown[]
) => infer R
  ? R
  : unknown;

// API Response types
export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  success: boolean;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T = unknown> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Form field types
export interface FormFieldProps {
  label?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  helperText?: string;
}

// Generic input component props
export type InputProps<T = string> = FormFieldProps & {
  value: T;
  onChange: (value: T) => void;
  onBlur?: () => void;
  onFocus?: () => void;
};

// Component variants and sizes
export type ComponentSize = 'small' | 'medium' | 'large';
export type ComponentVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
export type ComponentColor =
  | 'inherit'
  | 'primary'
  | 'secondary'
  | 'default'
  | 'error'
  | 'info'
  | 'success'
  | 'warning';

// Status types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
export type AsyncState<T> = { data: T | null; status: LoadingState; error: string | null };

// Event handler types
export type EventHandler<T = Event> = (event: T) => void;
export type AsyncEventHandler<T = Event> = (event: T) => Promise<void>;

// Generic ID types
export type ID = string | number;
export type StringID = string;
export type NumericID = number;

// User and authentication types
export interface BaseUser {
  id: ID;
  email: string;
  name: string;
  avatar?: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

// Theme and styling types
export interface ThemeColors {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  background: string;
  surface: string;
  text: {
    primary: string;
    secondary: string;
    disabled: string;
  };
}

// Route and navigation types
export interface RouteConfig {
  path: string;
  component: React.ComponentType<unknown>;
  exact?: boolean;
  guard?: React.ComponentType<unknown>;
  meta?: {
    title?: string;
    requiresAuth?: boolean;
    roles?: string[];
  };
}

// Error types
export interface AppError {
  message: string;
  code?: string;
  status?: number;
  details?: unknown;
  timestamp: string;
}

// Generic service response
export type ServiceResponse<T> = Promise<ApiResponse<T>>;

// Component ref types
export type ComponentRef<T extends HTMLElement = HTMLElement> = React.RefObject<T>;

// Event types
export type ChangeEvent<T = HTMLInputElement> = React.ChangeEvent<T>;
export type FormEvent<T = HTMLFormElement> = React.FormEvent<T>;
export type ClickEvent<T = HTMLButtonElement> = React.MouseEvent<T>;
export type KeyboardEvent<T = HTMLElement> = React.KeyboardEvent<T>;

// Conditional types
export type If<T extends boolean, U, V = never> = T extends true ? U : V;

// Array element type
export type ArrayElement<T> = T extends readonly (infer U)[] ? U : never;

// Object values type
export type ObjectValues<T> = T[keyof T];

// Pick by type
export type PickByType<T, U> = { [K in keyof T as T[K] extends U ? K : never]: T[K] };

// Omit by type
export type OmitByType<T, U> = { [K in keyof T as T[K] extends U ? never : K]: T[K] };

// Function type guards
export type TypeGuard<T> = (value: unknown) => value is T;

// Async function type
export type AsyncFunction<T extends unknown[] = unknown[], R = unknown> = (
  ...args: T
) => Promise<R>;

// Component display name helper
export type WithDisplayName<T> = T & { displayName?: string };
