# 🔧 REFACTORING IMPLEMENTATION GUIDE

**Purpose**: Step-by-step guide to fix SOLID/DRY violations  
**Estimated Time**: 8-10 hours  
**Priority**: Critical  

---

## 📋 PHASE 1: CRITICAL FIXES (Sprint 1)

### Task 1.1: Extract Shared Audit Log Components

**File to Create**: `src/shared/components/audit-logs/AuditStatCard.tsx`

```typescript
/**
 * Reusable Statistics Card Component
 * Used by both Auditor and Admin dashboards
 * SOLID: Single Responsibility - only renders stat card
 */

import type { ReactNode } from 'react';

export interface AuditStatCardProps {
  label: string;
  value: string | number;
  icon: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function AuditStatCard({ label, value, icon, trend }: AuditStatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          {trend && (
            <p
              className={`text-sm mt-2 font-medium ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  );
}
```

**File to Create**: `src/shared/components/audit-logs/AuditLogRow.tsx`

```typescript
/**
 * Reusable Audit Log Table Row Component
 * Used by both Auditor and Admin dashboards
 * SOLID: Single Responsibility - only renders table row
 */

import type { AuditLog } from '../../audit-logs/types/auditLog.types';
import {
  AUDIT_LOG_STATUS_COLORS,
  AUDIT_ACTION_ICONS,
} from '../../constants/auditLogConstants';

export interface AuditLogRowProps {
  log: AuditLog;
}

export function AuditLogRow({ log }: AuditLogRowProps) {
  const statusColor = AUDIT_LOG_STATUS_COLORS[log.status];
  const actionIcon = AUDIT_ACTION_ICONS[log.action] || '📝';

  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {log.timestamp}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
        {log.user}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        <div className="flex items-center gap-2">
          <span>{actionIcon}</span>
          <span className="text-gray-900">
            {log.action.replace(/_/g, ' ')}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
        {log.resource}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}
        >
          {log.status.toUpperCase()}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
        {log.ipAddress}
      </td>
      <td className="px-6 py-4 text-sm text-gray-700">{log.details}</td>
    </tr>
  );
}
```

---

### Task 1.2: Extract Audit Log Constants

**File to Create**: `src/shared/constants/auditLogConstants.ts`

```typescript
/**
 * Centralized Audit Log Constants
 * DRY: Single source of truth for all audit log related constants
 */

export const AUDIT_LOG_STATUS_COLORS = {
  success: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  warning: 'bg-yellow-100 text-yellow-800',
} as const;

export const AUDIT_ACTION_ICONS: Record<string, string> = {
  USER_LOGIN: '🔓',
  USER_CREATED: '👤',
  DATA_EXPORT: '📊',
  UNAUTHORIZED_ACCESS: '⛔',
  ROLE_CHANGED: '🔑',
  SYSTEM_CONFIG_CHANGED: '⚙️',
  REPORT_GENERATED: '📄',
  BRUTE_FORCE_ATTEMPT: '🚨',
} as const;

export const AUDIT_LOG_ACTIONS = [
  'USER_LOGIN',
  'USER_CREATED',
  'DATA_EXPORT',
  'UNAUTHORIZED_ACCESS',
  'ROLE_CHANGED',
  'SYSTEM_CONFIG_CHANGED',
  'REPORT_GENERATED',
  'BRUTE_FORCE_ATTEMPT',
] as const;

export const AUDIT_LOG_STATUS = ['success', 'failed', 'warning'] as const;
```

---

### Task 1.3: Extract Types

**File to Create**: `src/domains/audit-logs/types/auditLog.types.ts`

```typescript
/**
 * Centralized Audit Log Types
 * DRY: Single source of truth for all audit log types
 */

export type AuditStatus = 'success' | 'failed' | 'warning';
export type AuditAction =
  | 'USER_LOGIN'
  | 'USER_CREATED'
  | 'DATA_EXPORT'
  | 'UNAUTHORIZED_ACCESS'
  | 'ROLE_CHANGED'
  | 'SYSTEM_CONFIG_CHANGED'
  | 'REPORT_GENERATED'
  | 'BRUTE_FORCE_ATTEMPT';

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: AuditAction;
  resource: string;
  status: AuditStatus;
  ipAddress: string;
  details: string;
  userId?: string; // Optional for admin
}

export interface AuditFilters {
  dateFrom: string;
  dateTo: string;
  user: string;
  action: string;
  status: 'all' | AuditStatus;
}

export interface AuditStatistics {
  total: number;
  success: number;
  failed: number;
  warning: number;
}
```

---

### Task 1.4: Extract Audit Log Utility Functions

**File to Create**: `src/shared/utils/audit-logs/auditLogFilters.ts`

```typescript
/**
 * Audit Log Filtering Logic
 * DRY: Single source of truth for filtering
 * Testable: Pure functions for easy unit testing
 */

import type { AuditLog, AuditFilters } from '../../audit-logs/types/auditLog.types';

/**
 * Filter audit logs based on provided filters
 */
export const filterAuditLogs = (
  logs: AuditLog[],
  filters: AuditFilters
): AuditLog[] => {
  return logs.filter((log) => {
    // User filter
    if (
      filters.user &&
      !log.user.toLowerCase().includes(filters.user.toLowerCase())
    ) {
      return false;
    }

    // Action filter
    if (filters.action && log.action !== filters.action) {
      return false;
    }

    // Status filter
    if (filters.status !== 'all' && log.status !== filters.status) {
      return false;
    }

    return true;
  });
};

/**
 * Reset all filters to empty state
 */
export const resetFilters = (): AuditFilters => ({
  dateFrom: '',
  dateTo: '',
  user: '',
  action: '',
  status: 'all',
});

/**
 * Check if any filter is active
 */
export const hasActiveFilters = (filters: AuditFilters): boolean => {
  return (
    Boolean(filters.dateFrom) ||
    Boolean(filters.dateTo) ||
    Boolean(filters.user) ||
    Boolean(filters.action) ||
    filters.status !== 'all'
  );
};
```

**File to Create**: `src/shared/utils/audit-logs/auditLogCalculations.ts`

```typescript
/**
 * Audit Log Statistics Calculation
 * DRY: Single source of truth for statistics
 * Testable: Pure functions
 */

import type { AuditLog, AuditStatistics } from '../../audit-logs/types/auditLog.types';

/**
 * Calculate audit log statistics from filtered logs
 */
export const calculateAuditStatistics = (
  logs: AuditLog[]
): AuditStatistics => {
  return {
    total: logs.length,
    success: logs.filter((log) => log.status === 'success').length,
    failed: logs.filter((log) => log.status === 'failed').length,
    warning: logs.filter((log) => log.status === 'warning').length,
  };
};

/**
 * Calculate trend percentage
 */
export const calculateTrend = (
  current: number,
  previous: number
): { value: number; isPositive: boolean } => {
  if (previous === 0) {
    return { value: 0, isPositive: current > 0 };
  }
  const percentage = Math.round(((current - previous) / previous) * 100);
  return {
    value: percentage,
    isPositive: percentage >= 0,
  };
};
```

**File to Create**: `src/shared/utils/csv/csvExporter.ts`

```typescript
/**
 * CSV Export Utility
 * DRY: Single source of truth for CSV export
 * Testable: Pure export logic
 */

import type { AuditLog } from '../../audit-logs/types/auditLog.types';

/**
 * Export audit logs to CSV file
 */
export const exportAuditLogsToCSV = (
  logs: AuditLog[],
  filename?: string
): void => {
  const headers = ['Timestamp', 'User', 'Action', 'Resource', 'Status', 'IP', 'Details'];
  const rows = logs.map((log) => [
    log.timestamp,
    log.user,
    log.action,
    log.resource,
    log.status,
    log.ipAddress,
    log.details,
  ]);

  const csv = [
    headers.join(','),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ),
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    filename || `audit-logs-${new Date().toISOString().split('T')[0]}.csv`
  );
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

/**
 * Convert logs to CSV string (for clipboard or other uses)
 */
export const logsToCSVString = (logs: AuditLog[]): string => {
  const headers = ['Timestamp', 'User', 'Action', 'Resource', 'Status', 'IP', 'Details'];
  const rows = logs.map((log) => [
    log.timestamp,
    log.user,
    log.action,
    log.resource,
    log.status,
    log.ipAddress,
    log.details,
  ]);

  return [
    headers.join(','),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ),
  ].join('\n');
};
```

---

### Task 1.5: Create Centralized Error Handler

**File to Create**: `src/core/error/AppError.ts`

```typescript
/**
 * Application Error Class
 * Used for all application-level errors
 * Provides structured error information
 */

export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public context?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Convert error to JSON for logging/reporting
   */
  toJSON() {
    return {
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      context: this.context,
      stack: this.stack,
    };
  }
}

/**
 * Type guard to check if error is AppError
 */
export const isAppError = (error: unknown): error is AppError => {
  return error instanceof AppError;
};
```

**File to Create**: `src/core/error/errorHandler.ts`

```typescript
/**
 * Centralized Error Handling
 * DRY: Single source of truth for error handling
 * Cross-Cutting Concern: Centralized error management
 */

import { AppError, isAppError } from './AppError';
import { logger } from '../logging/logger';

export type ErrorSeverity = 'info' | 'warn' | 'error' | 'critical';

interface ErrorHandlerOptions {
  severity?: ErrorSeverity;
  context?: string;
  userMessage?: string;
  silent?: boolean; // Don't log to console
}

export const errorHandler = {
  /**
   * Handle any error with proper logging
   */
  handle: (error: unknown, options: ErrorHandlerOptions = {}): AppError => {
    const {
      severity = 'error',
      context,
      userMessage,
      silent = false,
    } = options;

    // Convert to AppError if needed
    let appError: AppError;

    if (isAppError(error)) {
      appError = error;
    } else if (error instanceof Error) {
      appError = new AppError(
        'UNKNOWN_ERROR',
        error.message,
        500,
        { originalError: error }
      );
    } else {
      appError = new AppError(
        'UNKNOWN_ERROR',
        String(error),
        500,
        { originalError: error }
      );
    }

    // Add context if provided
    if (context) {
      appError.context = {
        ...appError.context,
        context,
      };
    }

    // Log error
    if (!silent) {
      logger[severity](
        userMessage || appError.message,
        appError.toJSON()
      );
    }

    return appError;
  },

  /**
   * Handle async errors with try-catch pattern
   */
  async handleAsync<T>(
    fn: () => Promise<T>,
    options: ErrorHandlerOptions = {}
  ): Promise<{ success: boolean; data?: T; error?: AppError }> {
    try {
      const data = await fn();
      return { success: true, data };
    } catch (error) {
      const appError = errorHandler.handle(error, options);
      return { success: false, error: appError };
    }
  },

  /**
   * Create AppError with consistent pattern
   */
  create: (
    code: string,
    message: string,
    statusCode: number = 500,
    context?: Record<string, any>
  ): AppError => {
    return new AppError(code, message, statusCode, context);
  },

  /**
   * Check if error is known type and handle accordingly
   */
  classify: (error: unknown): 'network' | 'validation' | 'auth' | 'unknown' => {
    if (isAppError(error)) {
      if (error.code.includes('NETWORK')) return 'network';
      if (error.code.includes('VALIDATION')) return 'validation';
      if (error.code.includes('AUTH')) return 'auth';
    }

    if (error instanceof TypeError) return 'network';
    if (error instanceof SyntaxError) return 'validation';

    return 'unknown';
  },
};
```

---

### Task 1.6: Create Logger Module

**File to Create**: `src/core/logging/logger.ts`

```typescript
/**
 * Centralized Logger
 * Cross-Cutting Concern: Logging
 * Provides consistent logging interface
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
}

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  /**
   * Debug logs (only in development)
   */
  debug: (message: string, data?: any) => {
    if (isDevelopment) {
      console.debug(`[DEBUG] ${message}`, data);
    }
  },

  /**
   * Info logs
   */
  info: (message: string, data?: any) => {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'info',
      message,
      data,
    };

    if (isDevelopment) {
      console.info(`[INFO] ${message}`, data);
    }

    // Send to monitoring service (e.g., Sentry, LogRocket)
    // sendToMonitoring(entry);
  },

  /**
   * Warning logs
   */
  warn: (message: string, data?: any) => {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'warn',
      message,
      data,
    };

    console.warn(`[WARN] ${message}`, data);

    // Send to monitoring service
    // sendToMonitoring(entry);
  },

  /**
   * Error logs
   */
  error: (message: string, error?: Error | unknown) => {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'error',
      message,
      data: error instanceof Error ? error.stack : error,
    };

    console.error(`[ERROR] ${message}`, error);

    // Send to monitoring service (e.g., Sentry for real-time alerts)
    // sendToMonitoring(entry);
  },
};
```

---

## 📋 PHASE 2: HIGH PRIORITY (Sprint 2)

### Task 2.1: Centralize Permission Checks

**File to Create**: `src/core/permissions/permissionChecker.ts`

```typescript
/**
 * Centralized Permission Checker
 * DRY: Single source of truth for permission checks
 * Cross-Cutting Concern: Authorization
 */

import type { User } from '../../domains/auth/types/auth.types';

export const permissions = {
  /**
   * Check if user has required role(s)
   */
  hasRole: (user: User | null, requiredRoles: string[]): boolean => {
    if (!user) return false;
    return requiredRoles.some((role) => user.roles?.includes(role));
  },

  /**
   * Check if user is admin or super_admin
   */
  isAdmin: (user: User | null): boolean => {
    return permissions.hasRole(user, ['admin', 'super_admin']);
  },

  /**
   * Check if user is auditor
   */
  isAuditor: (user: User | null): boolean => {
    return permissions.hasRole(user, ['auditor']);
  },

  /**
   * Check if user can view audit logs
   */
  canViewAuditLogs: (user: User | null): boolean => {
    return permissions.hasRole(user, ['admin', 'super_admin', 'auditor']);
  },

  /**
   * Check if user can archive audit logs (admin only)
   */
  canArchiveAuditLogs: (user: User | null): boolean => {
    return permissions.isAdmin(user);
  },

  /**
   * Check if user can export audit logs
   */
  canExportAuditLogs: (user: User | null): boolean => {
    return permissions.hasRole(user, ['admin', 'super_admin', 'auditor']);
  },
};
```

**File to Create**: `src/shared/hooks/usePermissions.ts`

```typescript
/**
 * Custom Hook for Permission Checks
 * Makes permission checks easy in components
 */

import { use } from 'react';
import { AuthContext } from '../../domains/auth/context/AuthContext';
import { permissions } from '../../core/permissions/permissionChecker';

export const usePermissions = () => {
  const { user } = use(AuthContext);

  return {
    isAdmin: permissions.isAdmin(user),
    isAuditor: permissions.isAuditor(user),
    canViewAuditLogs: permissions.canViewAuditLogs(user),
    canArchiveAuditLogs: permissions.canArchiveAuditLogs(user),
    canExportAuditLogs: permissions.canExportAuditLogs(user),
    hasRole: (roles: string[]) => permissions.hasRole(user, roles),
  };
};
```

---

### Task 2.2: Extract Mock Data

**File to Create**: `src/shared/utils/mocks/auditLogMocks.ts`

```typescript
/**
 * Mock Audit Log Data
 * DRY: Single source of truth for mock data
 */

import type { AuditLog } from '../../audit-logs/types/auditLog.types';

export const MOCK_AUDIT_LOGS_BASE: AuditLog[] = [
  {
    id: '1',
    timestamp: '2025-01-09 14:30:45',
    user: 'john.doe@example.com',
    action: 'USER_LOGIN',
    resource: 'Authentication',
    status: 'success',
    ipAddress: '192.168.1.100',
    details: 'User successfully logged in',
  },
  {
    id: '2',
    timestamp: '2025-01-09 13:45:22',
    user: 'admin@example.com',
    action: 'USER_CREATED',
    resource: 'User Management',
    status: 'success',
    ipAddress: '192.168.1.50',
    details: 'New user account created for jane.smith@example.com',
  },
  {
    id: '3',
    timestamp: '2025-01-09 12:15:10',
    user: 'jane.smith@example.com',
    action: 'DATA_EXPORT',
    resource: 'Data Management',
    status: 'success',
    ipAddress: '192.168.1.75',
    details: 'User data exported to CSV format',
  },
  {
    id: '4',
    timestamp: '2025-01-09 11:30:00',
    user: 'unauthorized@example.com',
    action: 'UNAUTHORIZED_ACCESS',
    resource: 'Admin Panel',
    status: 'failed',
    ipAddress: '192.168.1.200',
    details: 'Attempted access to restricted resource',
  },
  {
    id: '5',
    timestamp: '2025-01-09 10:20:35',
    user: 'admin@example.com',
    action: 'ROLE_CHANGED',
    resource: 'User Management',
    status: 'success',
    ipAddress: '192.168.1.50',
    details: 'User role updated from user to auditor',
  },
];

export const MOCK_AUDIT_LOGS_ADMIN_ADDITIONAL: AuditLog[] = [
  {
    id: '6',
    timestamp: '2025-01-09 09:15:00',
    user: 'admin@example.com',
    action: 'SYSTEM_CONFIG_CHANGED',
    resource: 'System Settings',
    status: 'success',
    ipAddress: '192.168.1.50',
    details: 'System configuration updated',
  },
  {
    id: '7',
    timestamp: '2025-01-09 08:30:45',
    user: 'auditor@example.com',
    action: 'REPORT_GENERATED',
    resource: 'Reports',
    status: 'success',
    ipAddress: '192.168.1.80',
    details: 'Monthly audit report generated',
  },
  {
    id: '8',
    timestamp: '2025-01-08 23:45:30',
    user: 'attacker@example.com',
    action: 'BRUTE_FORCE_ATTEMPT',
    resource: 'Authentication',
    status: 'failed',
    ipAddress: '203.0.113.45',
    details: 'Multiple failed login attempts detected',
  },
];

// For Auditor Dashboard
export const MOCK_AUDIT_LOGS_AUDITOR = MOCK_AUDIT_LOGS_BASE;

// For Admin Dashboard
export const MOCK_AUDIT_LOGS_ADMIN = [
  ...MOCK_AUDIT_LOGS_BASE,
  ...MOCK_AUDIT_LOGS_ADMIN_ADDITIONAL,
];
```

---

## 🎯 Implementation Checklist

### Phase 1 - Critical (This Sprint)
- [ ] Task 1.1: Create AuditStatCard.tsx
- [ ] Task 1.1: Create AuditLogRow.tsx
- [ ] Task 1.2: Create auditLogConstants.ts
- [ ] Task 1.3: Create auditLog.types.ts
- [ ] Task 1.4: Create auditLogFilters.ts
- [ ] Task 1.4: Create auditLogCalculations.ts
- [ ] Task 1.4: Create csvExporter.ts
- [ ] Task 1.5: Create AppError.ts
- [ ] Task 1.5: Create errorHandler.ts
- [ ] Task 1.6: Create logger.ts
- [ ] Update AuditorDashboardPage.tsx to use shared components
- [ ] Update AdminAuditLogsPage.tsx to use shared components
- [ ] Update both pages to use utility functions
- [ ] Run tests - all pass
- [ ] Code review

### Phase 2 - High Priority (Next Sprint)
- [ ] Task 2.1: Create permissionChecker.ts
- [ ] Task 2.1: Create usePermissions hook
- [ ] Task 2.2: Create auditLogMocks.ts
- [ ] Update archive feature with proper error handling
- [ ] Add ErrorBoundary to dashboards
- [ ] Run tests - all pass

---

## 📊 Success Metrics

✅ After refactoring, you should have:
- 0 duplicate components
- 0 duplicate types
- 0 duplicate constants
- 0 duplicate utility functions
- <5% overall code duplication
- Centralized error handling
- Centralized logging
- Centralized permissions
- All tests passing
