# Comprehensive Implementation Plan

**Date:** 2025-01-29  
**Based on:** ERROR_HANDLING_AUDIT.md + API_CALLS_AUDIT.md  
**Duration:** 3-4 weeks  
**Effort:** 60-80 hours

---

## Overview

This plan addresses **32 identified issues** across error handling and API calls, prioritized by impact and dependencies.

**Goals:**
1. ✅ Achieve 95%+ consistency in error handling
2. ✅ Standardize API call patterns to 98%+
3. ✅ Eliminate all DRY violations
4. ✅ Enforce SOLID principles throughout
5. ✅ Zero console.log/warn/error in production code

---

## Phase 1: Foundation (Week 1) - 20 hours

### Priority: CRITICAL

### 1.1 Consolidate Error Utilities (4 hours)

**Issue:** Duplicate error extraction functions in 3 locations

**Files to Modify:**
- ❌ DELETE: `src/domains/auth/utils/error.utils.ts` (extractErrorMessage, extractErrorDetails)
- ❌ DELETE duplicates from: `src/domains/admin/utils/errorHandler.ts`
- ✅ KEEP ONLY: `src/core/error/types.ts`

**Steps:**

```typescript
// Step 1: Update all imports
// Find: import { extractErrorMessage } from '../utils/error.utils'
// Replace: import { extractErrorMessage } from '@/core/error'

// Step 2: Update auth domain
// src/domains/auth/utils/error.utils.ts
// REMOVE functions, keep only domain-specific utilities

// Step 3: Update admin domain
// src/domains/admin/utils/errorHandler.ts
function extractUserMessage(error: unknown, fallback?: string): string {
  // BEFORE: Custom implementation
  // AFTER: Use core utility
  const message = extractErrorMessage(error);
  const errorCode = extractErrorDetails(error).code;
  
  if (errorCode && ERROR_MESSAGES[errorCode]) {
    return ERROR_MESSAGES[errorCode];
  }
  
  return fallback || message;
}
```

**Files Affected:** 15+ files  
**Search Pattern:** `extractErrorMessage|extractErrorDetails`

**Validation:**
```bash
# Should find ONLY in core/error/types.ts
npm run grep "export.*extractErrorMessage"
```

---

### 1.2 Create Centralized Error Messages (5 hours)

**Issue:** Error messages scattered across multiple files

**Create:** `src/core/error/messages.ts`

```typescript
/**
 * Centralized Error Messages - Single Source of Truth
 * All error codes and user-facing messages defined here
 */

export const ERROR_CODES = {
  // User Errors (USER_001 - USER_020)
  USER_NOT_FOUND: 'USER_001',
  USER_EMAIL_EXISTS: 'USER_002',
  USER_ALREADY_APPROVED: 'USER_003',
  // ... all codes
  
  // Role Errors (ROLE_001 - ROLE_020)
  ROLE_NOT_FOUND: 'ROLE_001',
  ROLE_NAME_EXISTS: 'ROLE_002',
  // ... all codes
  
  // Auth Errors (AUTH_001 - AUTH_020)
  AUTH_INVALID_CREDENTIALS: 'AUTH_001',
  AUTH_TOKEN_EXPIRED: 'AUTH_002',
  // ... all codes
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  [ERROR_CODES.USER_NOT_FOUND]: 'User not found',
  [ERROR_CODES.USER_EMAIL_EXISTS]: 'Email address already exists',
  [ERROR_CODES.AUTH_INVALID_CREDENTIALS]: 'Invalid credentials',
  // ... all messages
};

export const SUCCESS_MESSAGES = {
  USER_CREATED: 'User created successfully',
  USER_UPDATED: 'User updated successfully',
  // ... all success messages (move from admin/errorHandler.ts)
} as const;

/**
 * Get user-friendly error message from error code
 */
export function getErrorMessage(code: ErrorCode | string): string {
  return ERROR_MESSAGES[code as ErrorCode] || 'An unexpected error occurred';
}

/**
 * Get success message from operation key
 */
export function getSuccessMessage(key: keyof typeof SUCCESS_MESSAGES): string {
  return SUCCESS_MESSAGES[key];
}
```

**Update:**
- ❌ DELETE: `ERROR_MESSAGES` from `domains/admin/utils/errorHandler.ts`
- ❌ DELETE: `SUCCESS_MESSAGES` from `domains/admin/utils/errorHandler.ts`
- ❌ DELETE: Error message functions from `domains/auth/utils/errorMessages.ts`
- ✅ UPDATE: All imports to use `@/core/error/messages`

**Files Affected:** 8 files

---

### 1.3 Replace Console Logging with Logger (8 hours)

**Issue:** 48 instances of console.log/warn/error

**Create:** `scripts/replace-console-logs.sh`

```bash
#!/bin/bash
# Find all console.log/warn/error and suggest replacements

echo "Finding console logging instances..."
grep -rn "console\.\(log\|warn\|error\|debug\|info\)" src/ \
  --include="*.ts" \
  --include="*.tsx" \
  --exclude-dir="__tests__" \
  --exclude-dir="_reference_backup_ui"
```

**Replacement Patterns:**

```typescript
// Pattern 1: Error logging
// BEFORE:
console.error('[Admin Error]', { message, error });
// AFTER:
logger().error('[Admin Error]', error instanceof Error ? error : undefined, {
  message,
  context: 'adminErrorHandler'
});

// Pattern 2: Warning logging
// BEFORE:
console.warn('Failed to persist form state:', error);
// AFTER:
logger().warn('Failed to persist form state', { error });

// Pattern 3: Success logging (should use toast)
// BEFORE:
console.log('Form submitted:', data);
// AFTER:
logger().debug('Form submitted', { data });
// OR: showSuccess('Form submitted successfully');

// Pattern 4: Debug logging
// BEFORE:
console.log('Predicting permission:', permission);
// AFTER:
logger().debug('Predicting permission', { permission });
```

**Files to Update:** 32 files

**High Priority Files:**
1. `src/shared/hooks/useEnhancedForm.tsx` (4 instances)
2. `src/domains/admin/utils/errorHandler.ts` (1 instance)
3. `src/shared/hooks/useApiModern.ts` (4 instances)
4. `src/shared/hooks/useApi.ts` (4 instances)
5. `src/domains/rbac/utils/predictiveLoading.ts` (4 instances)

**Validation:**
```bash
# After changes, should only find in reference/test files
npm run grep "console\.(log|warn|error)" --exclude="test|reference"
```

---

### 1.4 Implement Toast Notification System (3 hours)

**Issue:** 48 TODO comments for toast integration

**Update:** `src/store/notificationStore.ts` (already exists)

**Create:** `src/shared/hooks/useToast.ts` (enhanced)

```typescript
/**
 * Enhanced Toast Hook
 * Centralized interface for all notifications
 */

import { useNotificationStore } from '@/store/notificationStore';
import { ERROR_CODES, getErrorMessage, getSuccessMessage } from '@/core/error/messages';
import type { ToastType } from '@/store/notificationStore';

export function useToast() {
  const { addToast } = useNotificationStore();
  
  return {
    /**
     * Show success toast
     */
    success: (message: string | keyof typeof SUCCESS_MESSAGES, duration?: number) => {
      const text = typeof message === 'string' ? message : getSuccessMessage(message);
      addToast({ type: 'success', message: text, duration });
    },
    
    /**
     * Show error toast from error object or error code
     */
    error: (errorOrCode: unknown, fallback?: string, duration?: number) => {
      let message: string;
      
      if (typeof errorOrCode === 'string') {
        // Error code or message
        message = getErrorMessage(errorOrCode) || errorOrCode;
      } else {
        // Error object
        const details = extractErrorDetails(errorOrCode);
        message = details.code 
          ? getErrorMessage(details.code)
          : details.message || fallback || 'An error occurred';
      }
      
      addToast({ type: 'error', message, duration });
    },
    
    /**
     * Show info toast
     */
    info: (message: string, duration?: number) => {
      addToast({ type: 'info', message, duration });
    },
    
    /**
     * Show warning toast
     */
    warning: (message: string, duration?: number) => {
      addToast({ type: 'warning', message, duration });
    },
    
    /**
     * Generic toast with custom type
     */
    show: (type: ToastType, message: string, duration?: number) => {
      addToast({ type, message, duration });
    },
  };
}

// Standalone functions for non-hook contexts
export const toast = {
  success: (message: string, duration?: number) => {
    useNotificationStore.getState().addToast({ type: 'success', message, duration });
  },
  error: (errorOrCode: unknown, fallback?: string, duration?: number) => {
    // ... same logic
  },
  info: (message: string, duration?: number) => {
    useNotificationStore.getState().addToast({ type: 'info', message, duration });
  },
  warning: (message: string, duration?: number) => {
    useNotificationStore.getState().addToast({ type: 'warning', message, duration });
  },
};
```

**Update API Hooks:**

```typescript
// src/shared/hooks/useApiModern.ts
import { toast } from '@/shared/hooks/useToast';

export function useApiQuery<TData>(/* ... */) {
  return useQuery({
    queryFn: async () => {
      try {
        const result = await queryFn();
        if (successMessage) {
          toast.success(successMessage); // ✅ Instead of console.log
        }
        return result;
      } catch (error) {
        if (errorToast) {
          toast.error(error); // ✅ Instead of console.error
        }
        throw error;
      }
    }
  });
}
```

---

## Phase 2: Standardization (Week 2) - 20 hours

### Priority: HIGH

### 2.1 Consolidate API Hooks (4 hours)

**Issue:** Duplicate API hook files (useApi.ts vs useApiModern.ts)

**Decision:** Keep `useApiModern.ts`, deprecate `useApi.ts`

**Steps:**

```typescript
// Step 1: Add deprecation notice to useApi.ts
/**
 * @deprecated Use hooks from @/shared/hooks/useApiModern instead
 * This file will be removed in next major version
 */
export function useApiQuery() { /* ... */ }

// Step 2: Create barrel export in useApiModern.ts
export {
  useApiQuery,
  useApiMutation,
  useApiAction,
  useApiPagination,
} from './useApiModern';

// Step 3: Update all imports
// Find: from '@/shared/hooks/useApi'
// Replace: from '@/shared/hooks/useApiModern'
// OR: from '@/shared/hooks' (barrel export)

// Step 4: After migration, delete useApi.ts
```

**Files Affected:** 11 files using `useApi.ts`

---

### 2.2 Migrate Manual Hooks to TanStack Query (10 hours)

**Issue:** 18 hooks with manual state management

**Create Migration Template:**

```typescript
// BEFORE: Manual state management
export function useProfile(autoLoad: boolean = true) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorDetails | null>(null);
  
  const getProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await profileService.getProfile();
      setProfile(response);
      return { success: true, data: response };
    } catch (err) {
      const errorDetails = extractErrorDetails(err);
      setError(errorDetails);
      return { success: false, error: errorDetails };
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (autoLoad) getProfile();
  }, [autoLoad]);
  
  return { profile, loading, error, getProfile, refetch: getProfile };
}

// AFTER: TanStack Query
import { useApiQuery } from '@/shared/hooks/useApiModern';
import profileService from '../services/profileService';

export function useProfile(options?: { enabled?: boolean }) {
  return useApiQuery(
    ['profile', 'me'],
    () => profileService.getProfile(),
    {
      enabled: options?.enabled !== false, // Auto-load by default
      staleTime: 5 * 60 * 1000, // 5 minutes
      errorToast: true,
      ...options
    }
  );
}

// Update mutation hooks similarly
export function useUpdateProfile() {
  return useApiMutation(
    (data: UpdateProfileRequest) => profileService.updateProfile(data),
    {
      onSuccess: () => {
        // Invalidate profile query to refetch
        queryClient.invalidateQueries({ queryKey: ['profile', 'me'] });
      },
      successMessage: 'Profile updated successfully',
      errorToast: true,
    }
  );
}
```

**Hooks to Migrate:**

1. `domains/profile/hooks/useProfile.hooks.ts` (3 hooks)
2. `domains/admin/hooks/useAdmin*.hooks.ts` (8 hooks)
3. `shared/hooks/useStandardLoading.ts` (1 hook)
4. Other manual hooks (6 hooks)

**Benefits:**
- ✅ Automatic caching
- ✅ Request deduplication
- ✅ Background refetching
- ✅ Optimistic updates
- ✅ Consistent error handling

---

### 2.3 Create Reusable Error Handling Hooks (3 hours)

**Create:** `src/shared/hooks/useAsyncOperation.ts`

```typescript
/**
 * Generic async operation hook with standardized error handling
 * Use this for operations that don't fit TanStack Query pattern
 */

import { useState, useCallback } from 'react';
import { handleError } from '@/core/error';
import { toast } from '@/shared/hooks/useToast';
import type { ErrorHandlingResult } from '@/core/error';

export interface UseAsyncOperationOptions<TData, TError = Error> {
  onSuccess?: (data: TData) => void;
  onError?: (error: TError, result: ErrorHandlingResult) => void;
  successMessage?: string;
  errorToast?: boolean;
  loadingInitial?: boolean;
}

export interface UseAsyncOperationResult<TData, TVariables, TError> {
  data: TData | null;
  loading: boolean;
  error: TError | null;
  execute: (variables?: TVariables) => Promise<{ success: boolean; data?: TData; error?: TError }>;
  reset: () => void;
}

export function useAsyncOperation<TData = unknown, TVariables = void, TError = Error>(
  asyncFn: (variables: TVariables) => Promise<TData>,
  options?: UseAsyncOperationOptions<TData, TError>
): UseAsyncOperationResult<TData, TVariables, TError> {
  const [data, setData] = useState<TData | null>(null);
  const [loading, setLoading] = useState(options?.loadingInitial || false);
  const [error, setError] = useState<TError | null>(null);
  
  const execute = useCallback(async (variables?: TVariables) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await asyncFn(variables as TVariables);
      setData(result);
      
      if (options?.successMessage) {
        toast.success(options.successMessage);
      }
      
      options?.onSuccess?.(result);
      
      return { success: true, data: result };
    } catch (err) {
      const errorResult = handleError(err);
      const typedError = err as TError;
      
      setError(typedError);
      
      if (options?.errorToast !== false) {
        toast.error(err);
      }
      
      options?.onError?.(typedError, errorResult);
      
      return { success: false, error: typedError };
    } finally {
      setLoading(false);
    }
  }, [asyncFn, options]);
  
  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);
  
  return { data, loading, error, execute, reset };
}
```

**Usage Example:**

```typescript
// Replace manual try-catch boilerplate
function MyComponent() {
  const { data, loading, error, execute } = useAsyncOperation(
    (userId: string) => userService.deleteUser(userId),
    {
      successMessage: 'User deleted successfully',
      errorToast: true,
      onSuccess: () => refetch(),
    }
  );
  
  return (
    <button onClick={() => execute(userId)} disabled={loading}>
      Delete User
    </button>
  );
}
```

---

### 2.4 Fix Direct fetch() Usage (3 hours)

**Issue:** 5 instances of direct fetch() bypassing apiClient

**Files:**
1. `core/api/diagnosticTool.ts` (3 instances) - Document as exception
2. `shared/hooks/useHealthCheck.ts` (1 instance) - Document as exception
3. `core/error/errorReporting/service.ts` (1 instance) - Document as exception

**Action:** Add JSDoc comments explaining why fetch() is used

```typescript
/**
 * Uses fetch() directly instead of apiClient for these reasons:
 * 1. Health check must work even if apiClient fails
 * 2. Should not trigger token refresh or retry logic
 * 3. Simple binary check (healthy/unhealthy)
 * 
 * @exception fetch-instead-of-apiClient - Documented exception to standard pattern
 */
const response = await fetch(`${apiBaseUrl}/health`, {
  method: 'GET',
  headers: { 'Content-Type': 'application/json' },
});
```

---

## Phase 3: SOLID Enforcement (Week 3) - 15 hours

### Priority: MEDIUM

### 3.1 Split Admin Error Handler (3 hours)

**Issue:** `admin/errorHandler.ts` violates SRP (4 responsibilities)

**Current Structure:**
```
admin/utils/errorHandler.ts (400+ lines)
├── Error handling
├── Toast notifications
├── Error messages
└── Success messages
```

**New Structure:**
```
admin/utils/
├── errorHandler.ts          ← Error handling ONLY
├── toastHelpers.ts          ← Toast notifications
└── (messages moved to core/error/messages.ts)
```

**Implementation:**

```typescript
// admin/utils/errorHandler.ts (reduced to 150 lines)
import { handleError, extractErrorDetails } from '@/core/error';
import { getErrorMessage } from '@/core/error/messages';
import { toast } from '@/shared/hooks/useToast';

export function handleAdminError(
  error: unknown,
  fallback?: string,
  options?: { showToast?: boolean }
): void {
  const result = handleError(error); // Core handler
  
  if (options?.showToast !== false) {
    toast.error(error, fallback);
  }
}

// Export only error handling functions
export { handleAdminError };

// admin/utils/toastHelpers.ts (NEW)
import { toast } from '@/shared/hooks/useToast';

// Re-export toast functions with admin-specific defaults
export const showAdminSuccess = (message: string) => toast.success(message, 3000);
export const showAdminError = (error: unknown) => toast.error(error);
export const showAdminWarning = (message: string) => toast.warning(message);
export const showAdminInfo = (message: string) => toast.info(message);
```

---

### 3.2 Make Error Handler Extensible (4 hours)

**Issue:** Violates Open/Closed Principle

**Current:**
```typescript
export function handleError(error: unknown): ErrorHandlingResult {
  if (isAPIError(error)) return handleAPIError(error);
  if (isValidationError(error)) return handleValidationError(error);
  // Hard-coded if statements - not extensible
}
```

**New Strategy Pattern:**

```typescript
// core/error/strategies.ts (NEW)
export interface ErrorHandlerStrategy {
  name: string;
  canHandle: (error: unknown) => boolean;
  handle: (error: unknown) => ErrorHandlingResult;
  priority: number; // Higher = checked first
}

// Registry of error handlers
const strategies: ErrorHandlerStrategy[] = [];

export function registerErrorStrategy(strategy: ErrorHandlerStrategy): void {
  strategies.push(strategy);
  strategies.sort((a, b) => b.priority - a.priority);
}

export function getErrorStrategy(error: unknown): ErrorHandlerStrategy | null {
  return strategies.find(s => s.canHandle(error)) || null;
}

// Default strategies
registerErrorStrategy({
  name: 'APIError',
  canHandle: isAPIError,
  handle: handleAPIError,
  priority: 100,
});

registerErrorStrategy({
  name: 'ValidationError',
  canHandle: isValidationError,
  handle: handleValidationError,
  priority: 90,
});

// ... register all strategies

// core/error/errorHandler.ts (UPDATED)
import { getErrorStrategy } from './strategies';

export function handleError(error: unknown): ErrorHandlingResult {
  try {
    const strategy = getErrorStrategy(error);
    return strategy 
      ? strategy.handle(error)
      : handleGenericError(error);
  } catch (handlingError) {
    return fallbackHandler(handlingError);
  }
}
```

**Benefits:**
- ✅ Easy to add new error types
- ✅ No modification of core handler
- ✅ Testable strategies
- ✅ Domain-specific error handling possible

---

### 3.3 Fix SRP Violation in assignRoleToUser (2 hours)

**Issue:** Function does 2 things (assign role + fetch user)

**Current:**
```typescript
export const assignRoleToUser = async (userId, roleIds) => {
  // 1. Assign roles
  const response = await apiClient.post(/* ... */);
  
  // 2. Fetch updated user (SHOULD NOT BE HERE)
  const userResponse = await apiClient.get(`/api/v1/admin/users/${userId}`);
  
  return { assignmentResult, updatedUser: userResponse.data };
};
```

**Fixed:**
```typescript
// Split into single-responsibility functions
export const assignRoleToUser = async (userId: string, roleIds: string[]) => {
  const response = await apiClient.post(
    `${API_PREFIX}/rbac/users/${userId}/roles`,
    { role_ids: roleIds }
  );
  return unwrapResponse(response.data);
};

// Let caller decide if they need to refetch user
// Use React Query's invalidation instead:
const assignRoleMutation = useApiMutation(
  ({ userId, roleIds }: { userId: string; roleIds: string[] }) => 
    adminRoleService.assignRoleToUser(userId, roleIds),
  {
    onSuccess: (_, variables) => {
      // Invalidate user query to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['users', variables.userId] });
    },
    successMessage: 'Roles assigned successfully',
  }
);
```

---

### 3.4 Add Error Handling to Utility Files (6 hours)

**Issue:** 12 utility files lack proper error handling

**Files:**
1. `shared/utils/csv/csvExporter.ts`
2. `shared/utils/exportUtils.ts`
3. `shared/utils/dateFormatters.ts`
4. `shared/utils/textFormatters.ts`
5. `domains/rbac/utils/persistentCache.ts`
6. Others...

**Pattern:**

```typescript
// BEFORE: No error handling
export function exportToCsv(data: unknown[]): void {
  const csv = convertToCSV(data); // Could throw
  downloadFile(csv, 'export.csv'); // Could throw
}

// AFTER: Proper error handling
export function exportToCsv(data: unknown[]): void {
  try {
    if (!Array.isArray(data) || data.length === 0) {
      throw new AppError('No data to export', 'EXPORT_NO_DATA', 400);
    }
    
    const csv = convertToCSV(data);
    downloadFile(csv, 'export.csv');
    
    logger().info('CSV export successful', {
      rowCount: data.length,
      context: 'exportUtils.exportToCsv'
    });
  } catch (error) {
    logger().error('CSV export failed', error instanceof Error ? error : undefined, {
      rowCount: data?.length,
      context: 'exportUtils.exportToCsv'
    });
    throw error; // Re-throw for caller to handle
  }
}
```

---

## Phase 4: Final Polish (Week 3-4) - 10 hours

### Priority: LOW

### 4.1 Documentation (4 hours)

**Create:**

1. **ERROR_HANDLING_GUIDE.md** - Developer guide for error handling
2. **API_CALLS_BEST_PRACTICES.md** - Best practices for API calls
3. **MIGRATION_GUIDE.md** - How to migrate old patterns to new ones

**Update:**
- README.md with links to new docs
- ARCHITECTURE.md with error handling section
- Contributing guidelines

---

### 4.2 Add Monitoring (3 hours)

**Create:** `src/core/monitoring/errorMetrics.ts`

```typescript
/**
 * Error monitoring and metrics
 * Tracks error rates, types, and trends
 */

interface ErrorMetrics {
  total: number;
  byType: Record<string, number>;
  byCode: Record<string, number>;
  last24Hours: number;
  criticalErrors: number;
}

class ErrorMonitor {
  private metrics: ErrorMetrics = {
    total: 0,
    byType: {},
    byCode: {},
    last24Hours: 0,
    criticalErrors: 0,
  };
  
  recordError(error: unknown, result: ErrorHandlingResult): void {
    this.metrics.total++;
    
    // Track by type
    const type = error instanceof Error ? error.name : 'Unknown';
    this.metrics.byType[type] = (this.metrics.byType[type] || 0) + 1;
    
    // Track by code
    const code = extractErrorDetails(error).code || 'UNKNOWN';
    this.metrics.byCode[code] = (this.metrics.byCode[code] || 0) + 1;
    
    // Track critical errors
    if (result.action === 'contact_support') {
      this.metrics.criticalErrors++;
    }
  }
  
  getMetrics(): ErrorMetrics {
    return { ...this.metrics };
  }
  
  reset(): void {
    this.metrics = {
      total: 0,
      byType: {},
      byCode: {},
      last24Hours: 0,
      criticalErrors: 0,
    };
  }
}

export const errorMonitor = new ErrorMonitor();
```

**Integrate with error handler:**

```typescript
// core/error/errorHandler.ts
import { errorMonitor } from '../monitoring/errorMetrics';

export function handleError(error: unknown): ErrorHandlingResult {
  const result = /* ... handle error ... */;
  
  // Record metrics
  errorMonitor.recordError(error, result);
  
  return result;
}
```

---

### 4.3 Testing (3 hours)

**Create tests for:**

1. `core/error/errorHandler.test.ts` - Error handling logic
2. `core/error/messages.test.ts` - Message retrieval
3. `shared/hooks/useAsyncOperation.test.ts` - Hook behavior
4. `shared/hooks/useToast.test.ts` - Toast notifications

**Test coverage goal:** 90%+

---

## Phase 5: Validation (Final Week) - 5 hours

### 5.1 Automated Checks (2 hours)

**Create:** `scripts/validate-patterns.sh`

```bash
#!/bin/bash
# Validate code patterns

echo "🔍 Validating patterns..."

# Check 1: No console.log in src (except test/reference)
if grep -r "console\.\(log\|warn\|error\)" src/ \
  --include="*.ts" --include="*.tsx" \
  --exclude-dir="__tests__" \
  --exclude-dir="_reference_backup_ui" | grep -v "logger()"; then
  echo "❌ Found console.log usage (should use logger())"
  exit 1
fi

# Check 2: No duplicate error utilities
if grep -r "export.*extractErrorMessage" src/ \
  --include="*.ts" | grep -v "core/error/types.ts"; then
  echo "❌ Found duplicate extractErrorMessage (should only be in core/error)"
  exit 1
fi

# Check 3: No fetch() except documented exceptions
if grep -r "await fetch(" src/ \
  --include="*.ts" --include="*.tsx" \
  --exclude="diagnosticTool.ts" \
  --exclude="useHealthCheck.ts" \
  --exclude="errorReporting"; then
  echo "❌ Found fetch() usage (should use apiClient)"
  exit 1
fi

# Check 4: All API services use apiClient
if grep -r "axios\." src/domains/*/services/ \
  --include="*.ts"; then
  echo "❌ Found direct axios usage in services (should use apiClient)"
  exit 1
fi

echo "✅ All pattern validations passed"
```

**Add to CI/CD:**
```yaml
# .github/workflows/validate.yml
- name: Validate Code Patterns
  run: npm run validate:patterns
```

---

### 5.2 Manual Review (2 hours)

**Checklist:**

- [ ] All console.log removed (48 instances)
- [ ] All error utilities consolidated (3 files → 1)
- [ ] All error messages centralized (2 files → 1)
- [ ] All API hooks using TanStack Query (18 hooks migrated)
- [ ] Toast notifications integrated (48 TODOs resolved)
- [ ] Error handler extensible (strategy pattern)
- [ ] SRP violations fixed (2 functions)
- [ ] Utility files have error handling (12 files)
- [ ] Documentation complete (3 guides)
- [ ] Tests passing (90%+ coverage)

---

### 5.3 Performance Testing (1 hour)

**Metrics to track:**

1. **API call performance:**
   - Before: Average response time
   - After: Should be same or better (caching helps)

2. **Error handling overhead:**
   - Measure time spent in handleError()
   - Should be < 1ms per error

3. **Bundle size:**
   - Before: Check current size
   - After: Should not increase significantly

---

## Timeline Summary

| Phase | Duration | Priority | Tasks |
|-------|----------|----------|-------|
| 1. Foundation | Week 1 (20h) | CRITICAL | Consolidate utilities, messages, logging, toasts |
| 2. Standardization | Week 2 (20h) | HIGH | Consolidate hooks, migrate to TanStack Query |
| 3. SOLID Enforcement | Week 3 (15h) | MEDIUM | Split files, make extensible, add error handling |
| 4. Final Polish | Week 3-4 (10h) | LOW | Documentation, monitoring, testing |
| 5. Validation | Final (5h) | CRITICAL | Automated checks, review, performance |

**Total:** 70 hours over 3-4 weeks

---

## Success Criteria

### Quantitative

- ✅ **Error handling consistency:** 95%+ (currently 72%)
- ✅ **API call consistency:** 98%+ (currently 87%)
- ✅ **Console logging:** 0 instances (currently 48)
- ✅ **DRY violations:** 0 (currently 3 critical)
- ✅ **Test coverage:** 90%+ (currently ~70%)

### Qualitative

- ✅ All developers follow same patterns
- ✅ New developers onboard easily with docs
- ✅ Code reviews catch violations automatically
- ✅ Error handling is predictable and consistent
- ✅ API calls are standardized and well-typed

---

## Rollout Strategy

### Week 1: Foundation (No Breaking Changes)
- Add new utilities alongside old ones
- Mark old utilities as deprecated
- All new code uses new patterns

### Week 2: Migration (Gradual)
- Migrate hooks one domain at a time
- Test each migration before next
- Keep old hooks working during transition

### Week 3-4: Cleanup (Breaking Changes)
- Remove deprecated utilities
- Delete old hook implementations
- Update all references

---

## Risk Mitigation

### Risk 1: Breaking Existing Functionality
**Mitigation:**
- Comprehensive test suite before changes
- Incremental migration, test each step
- Feature flags for major changes

### Risk 2: Performance Regression
**Mitigation:**
- Performance tests before/after
- Monitor error handling overhead
- Benchmark API call latency

### Risk 3: Team Adoption
**Mitigation:**
- Clear documentation with examples
- Code review checklist
- Pair programming for complex migrations

---

## Post-Implementation

### Continuous Monitoring
- Track error rates with errorMonitor
- Monitor API call latencies
- Review console for any logging leaks

### Maintenance
- Update patterns documentation quarterly
- Review error messages for UX improvements
- Add new error types as needed

### Future Enhancements
- Integrate with Sentry/Rollbar
- Add error replay functionality
- Implement A/B testing for error messages

---

**End of Implementation Plan**
