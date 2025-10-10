/**
 * API Type Definitions
 * Comprehensive type safety for all API interactions
 */

// Base API response structure
export interface ApiResponse<T = unknown> { data: T;
  success: boolean;
  message?: string;
  timestamp: number;
  requestId: string; }

// Error response structure
export interface ApiError { code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: number;
  requestId: string;
  statusCode: number; }

// Pagination metadata
export interface PaginationMeta { page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean; }

// Paginated response
export interface PaginatedResponse<T> extends ApiResponse<T[]> { meta: PaginationMeta; }

// API request configuration
export interface ApiRequestConfig { method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
  timeout?: number;
  retries?: number;
  cache?: boolean;
  cacheTTL?: number; }

// User types
export interface User { id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string; }

export type UserRole = 'admin' | 'moderator' | 'user' | 'viewer';

export interface CreateUserRequest { email: string;
  firstName: string;
  lastName: string;
  password: string;
  role?: UserRole; }

export interface UpdateUserRequest { firstName?: string;
  lastName?: string;
  role?: UserRole;
  isActive?: boolean; }

// Authentication types
export interface LoginRequest { email: string;
  password: string;
  rememberMe?: boolean; }

export interface LoginResponse { user: User;
  token: string;
  refreshToken: string;
  expiresIn: number; }

export interface RefreshTokenRequest { refreshToken: string; }

export interface RegisterRequest extends CreateUserRequest { confirmPassword: string; }

// Dashboard types
export interface DashboardStats { totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  monthlyRevenue: number;
  conversionRate: number;
  growthMetrics: {
    users: number;
    revenue: number;
    engagement: number;
  };
}

export interface ActivityLog { id: string;
  userId: string;
  user: Pick<User, 'id' | 'firstName' | 'lastName' | 'email'>;
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  timestamp: string; }

// System types
export interface SystemHealth { status: 'healthy' | 'degraded' | 'unhealthy';
  services: {
    database: ServiceStatus;
    cache: ServiceStatus;
    email: ServiceStatus;
    storage: ServiceStatus;
  };
  metrics: { uptime: number;
    responseTime: number;
    errorRate: number;
    memoryUsage: number;
    cpuUsage: number;
  };
}

export interface ServiceStatus { status: 'up' | 'down' | 'degraded';
  responseTime?: number;
  lastChecked: string;
  version?: string; }

// Workflow types
export interface Workflow { id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'draft';
  steps: WorkflowStep[];
  triggers: WorkflowTrigger[];
  createdBy: string;
  createdAt: string;
  updatedAt: string; }

export interface WorkflowStep { id: string;
  name: string;
  type: 'action' | 'condition' | 'delay';
  config: Record<string, unknown>;
  order: number; }

export interface WorkflowTrigger { id: string;
  type: 'manual' | 'scheduled' | 'event';
  config: Record<string, unknown>; }

// Report types
export interface Report { id: string;
  title: string;
  description: string;
  type: 'user_activity' | 'system_performance' | 'financial' | 'custom';
  format: 'pdf' | 'csv' | 'json';
  schedule?: ReportSchedule;
  recipients: string[];
  lastGenerated?: string;
  createdAt: string; }

export interface ReportSchedule { frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  timezone: string;
  isActive: boolean; }

// Notification types
export interface Notification { id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  expiresAt?: string; }

// Search and filter types
export interface SearchFilters { query?: string;
  status?: string[];
  role?: UserRole[];
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc'; }

export interface SearchResults<T> extends PaginatedResponse<T> { filters: SearchFilters;
  totalResults: number;
  searchTime: number; }

// File upload types
export interface FileUpload { id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedBy: string;
  uploadedAt: string; }

export interface UploadProgress { filename: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string; }

// Validation types
export interface ValidationError { field: string;
  message: string;
  code: string; }

export interface ValidationResponse { isValid: boolean;
  errors: ValidationError[]; }

// Generic API endpoints mapping
export interface ApiEndpoints { // Authentication
  login: {
    request: LoginRequest;
    response: ApiResponse<LoginResponse>;
  };
  register: { request: RegisterRequest;
    response: ApiResponse<User>;
  };
  refreshToken: { request: RefreshTokenRequest;
    response: ApiResponse<LoginResponse>;
  };
  
  // Users
  getUsers: { request: SearchFilters;
    response: SearchResults<User>;
  };
  getUser: { request: { id: string };
    response: ApiResponse<User>;
  };
  createUser: { request: CreateUserRequest;
    response: ApiResponse<User>;
  };
  updateUser: { request: { id: string; data: UpdateUserRequest };
    response: ApiResponse<User>;
  };
  deleteUser: { request: { id: string };
    response: ApiResponse<{ deleted: boolean }>;
  };
  
  // Dashboard
  getDashboardStats: { request: { period?: string };
    response: ApiResponse<DashboardStats>;
  };
  getActivityLogs: { request: SearchFilters;
    response: SearchResults<ActivityLog>;
  };
  
  // System
  getSystemHealth: { request: Record<string, never>;
    response: ApiResponse<SystemHealth>;
  };
}

// Type utility for extracting request/response types
export type ApiRequest<T extends keyof ApiEndpoints> = ApiEndpoints[T]['request'];
export type ApiResponseType<T extends keyof ApiEndpoints> = ApiEndpoints[T]['response'];

// HTTP status codes
export const HTTP_STATUS = { OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503 } as const;

export type HttpStatusCode = typeof HTTP_STATUS[keyof typeof HTTP_STATUS];