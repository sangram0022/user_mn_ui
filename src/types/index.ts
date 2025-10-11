/**
 * Core Type Definitions
 * Centralized type definitions for the application
 */

// Authentication Types
export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 'admin' | 'moderator' | 'user' | 'guest';

export interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  acceptTerms: boolean;
}

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface PasswordResetData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
  confirmPassword: string;
}

// API Types
export interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  success: boolean;
  message?: string;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: unknown;
  timestamp?: string;
}

export interface PaginatedResponse<T> {
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

// Permission and Role Types
export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  hierarchy: number;
}

// Storage Types
export interface StorageOptions {
  encrypt?: boolean;
  compress?: boolean;
  expiry?: number;
  namespace?: string;
}

export interface StorageItem<T = unknown> {
  value: T;
  timestamp: number;
  expiry?: number;
  encrypted?: boolean;
  compressed?: boolean;
}

// Monitoring Types
export interface LogLevel {
  DEBUG: 'debug';
  INFO: 'info';
  WARN: 'warn';
  ERROR: 'error';
}

export interface LogEntry {
  level: keyof LogLevel;
  message: string;
  timestamp: Date;
  context?: Record<string, unknown>;
  userId?: string;
  sessionId?: string;
}

export interface PerformanceMetrics {
  coreWebVitals: {
    lcp?: number; // Largest Contentful Paint
    fid?: number; // First Input Delay
    cls?: number; // Cumulative Layout Shift
    fcp?: number; // First Contentful Paint
    ttfb?: number; // Time to First Byte
    inp?: number; // Interaction to Next Paint
  };
  customMetrics: Record<string, number>;
  timestamp: number;
}

export interface ErrorInfo {
  error: Error;
  errorInfo: {
    componentStack: string;
  };
  timestamp: Date;
  userId?: string;
  sessionId?: string;
  url: string;
  userAgent: string;
}

// UI Types
export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    info: string;
    background: string;
    surface: string;
    text: string;
  };
  spacing: Record<string, string>;
  typography: Record<string, unknown>;
  breakpoints: Record<string, string>;
}

export interface IconProps {
  size?: number | string;
  color?: string;
  className?: string;
}

// Form Types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'checkbox' | 'radio';
  placeholder?: string;
  required?: boolean;
  validation?: {
    pattern?: RegExp;
    minLength?: number;
    maxLength?: number;
    custom?: (value: unknown) => boolean | string;
  };
  options?: Array<{ label: string; value: string | number }>;
}

export interface FormData {
  [fieldName: string]: unknown;
}

export interface ValidationError {
  field: string;
  message: string;
}

// Navigation Types
export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon?: string;
  children?: NavigationItem[];
  permissions?: string[];
  roles?: UserRole[];
}

// Workflow Types
export interface Workflow {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'draft';
  steps: WorkflowStep[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: 'approval' | 'notification' | 'action' | 'condition';
  config: Record<string, unknown>;
  order: number;
}

// Analytics Types
export interface AnalyticsEvent {
  event: string;
  properties?: Record<string, unknown>;
  userId?: string;
  sessionId?: string;
  timestamp: Date;
}

export interface AnalyticsData {
  events: AnalyticsEvent[];
  metrics: Record<string, number>;
  dimensions: Record<string, string>;
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type NonNullable<T> = T extends null | undefined ? never : T;

export type ValueOf<T> = T[keyof T];

// Event Types
export interface BaseEvent {
  type: string;
  timestamp: Date;
  source: string;
}

export interface UserEvent extends BaseEvent {
  userId: string;
  action: string;
  resource?: string;
}

export interface SystemEvent extends BaseEvent {
  level: 'info' | 'warn' | 'error';
  message: string;
  context?: Record<string, unknown>;
}

// Configuration Types
export interface AppConfig {
  api: {
    baseUrl: string;
    timeout: number;
    retries: number;
  };
  auth: {
    tokenStorageKey: string;
    refreshThreshold: number;
    sessionTimeout: number;
  };
  features: {
    analytics: boolean;
    monitoring: boolean;
    notifications: boolean;
  };
  ui: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    dateFormat: string;
  };
}

// Export commonly used types as default
export type {
  ApiError as DefaultApiError,
  ApiResponse as DefaultApiResponse,
  AuthToken as DefaultAuthToken,
  LoginData as DefaultLoginData,
  RegisterData as DefaultRegisterData,
  User as DefaultUser,
};
