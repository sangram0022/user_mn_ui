# Implementation Plan: Code Audit Fixes

**Based on:** COMPREHENSIVE_CODE_AUDIT_2025.md  
**Target Completion:** 1 Sprint (2 weeks)  
**Total Effort:** 28 hours

---

## Phase 1: Critical Fixes (Day 1-3) 🔴

### 1.1 Standardize Error Handling (4 hours)

**Priority:** CRITICAL  
**Impact:** High - Affects consistency and user experience

**Files to Fix:**
1. `src/shared/hooks/useOptimisticUpdate.ts`
2. `src/shared/hooks/useEnhancedForm.tsx`
3. `src/shared/hooks/useApiModern.ts`
4. `src/shared/components/forms/EnhancedFormPatterns.tsx`

**Changes:**
```typescript
// BEFORE
try {
  await operation();
} catch (error) {
  // Manual error handling
  throw error;
}

// AFTER
import { useStandardErrorHandler } from '@/shared/hooks/useStandardErrorHandler';

const handleError = useStandardErrorHandler();

try {
  await operation();
} catch (error) {
  handleError(error, { context: { operation: 'operationName' } });
  throw error; // Re-throw if needed
}
```

**Steps:**
1. Import `useStandardErrorHandler` in each file
2. Replace all manual error handling with standard handler
3. Add context to each error for better debugging
4. Test error flows (401, 422, 500, network errors)

**Testing:**
- [ ] 401 redirects to login
- [ ] 422 extracts field errors
- [ ] Toast notifications appear
- [ ] Errors logged correctly

---

### 1.2 Remove console.log Statements (2 hours)

**Priority:** CRITICAL  
**Impact:** Medium - Security and performance

**Files to Fix:**
1. `src/domains/auth/pages/LoginPage.tsx` (Lines 36-42)
2. `src/domains/auth/utils/authDebugger.ts` (Lines 166-170)

**Changes:**
```typescript
// BEFORE
console.log('🔍 RAW LOGIN RESULT:', result);

// AFTER (Production logging)
import { logger } from '@/core/logging';
logger().info('Login result', { hasToken: !!result?.access_token });

// OR (Development diagnostic)
import { diagnostic } from '@/core/logging/diagnostic';
if (import.meta.env.DEV) {
  diagnostic.log('🔍 RAW LOGIN RESULT:', result);
}
```

**Steps:**
1. Find all console.log/warn/error statements
2. Replace with `logger()` or `diagnostic`
3. Add DEV guards for diagnostic logs
4. Update .eslintrc to enforce no-console rule

**ESLint Rule:**
```json
{
  "rules": {
    "no-console": ["error", {
      "allow": [] // No console allowed
    }]
  }
}
```

---

### 1.3 Fix fetch() Usage (1 hour)

**Priority:** CRITICAL  
**Impact:** High - Security (missing token, CSRF)

**File to Fix:**
1. `src/shared/hooks/useHealthCheck.ts` (Line 106)

**Changes:**
```typescript
// BEFORE
const response = await fetch(`${apiBaseUrl}/health`, {
  method: 'GET',
});

// AFTER
import { apiClient } from '@/services/api/apiClient';

const response = await apiClient.get('/health');
```

**Benefits:**
- ✅ Automatic token injection
- ✅ CSRF protection
- ✅ Error handling
- ✅ Retry logic

---

## Phase 2: Medium Priority Fixes (Day 4-7) 🟡

### 2.1 Remove Unnecessary useCallback/useMemo (3 hours)

**Priority:** MEDIUM  
**Impact:** Medium - Code clarity and React 19 optimization

**Files to Review:**
1. `src/shared/hooks/useStandardErrorHandler.ts` ✅ KEEP (hook returns function)
2. `src/domains/auth/context/AuthContext.tsx` ✅ KEEP (context stability)
3. `src/domains/rbac/context/OptimizedRbacProvider.tsx` ✅ KEEP (context value)
4. `src/domains/rbac/components/OptimizedRoleBasedButton.tsx` ❌ REMOVE
5. `src/domains/rbac/components/OptimizedCanAccess.tsx` ❌ REMOVE

**Decision Criteria:**
- **KEEP** if:
  - Context value (object identity)
  - Returned from custom hook
  - Expensive calculation (>10ms)
  - useEffect dependency
  
- **REMOVE** if:
  - Event handler
  - Simple computation
  - Inline function

**Changes:**
```typescript
// REMOVE THIS
const hasAccess = useMemo(() => {
  let hasRoleAccess = true;
  // Simple boolean logic
  return hasRoleAccess && hasPermAccess;
}, [hasRole, hasPermission, requiredRole]);

// REPLACE WITH
const hasAccess = (() => {
  let hasRoleAccess = true;
  return hasRoleAccess && hasPermAccess;
})();
// React Compiler optimizes automatically
```

**Add Comments for Kept Memoization:**
```typescript
const contextValue = useMemo(() => ({
  user, roles, permissions
}), [user, roles, permissions]);
// Kept: Context value identity prevents consumer re-renders
```

---

### 2.2 Centralize localStorage Access (6 hours)

**Priority:** MEDIUM  
**Impact:** Medium - DRY principle, error handling

**Create New File:**
`src/core/storage/storageService.ts`

**Implementation:**
```typescript
import { logger } from '@/core/logging';

export interface StorageService {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T): void;
  remove(key: string): void;
  clear(): void;
  has(key: string): boolean;
}

class LocalStorageService implements StorageService {
  private prefix = 'usermn_';

  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(this.prefix + key);
      if (!item) return null;
      return JSON.parse(item) as T;
    } catch (error) {
      logger().error('Storage read failed', error instanceof Error ? error : undefined, { key });
      return null;
    }
  }

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(value));
    } catch (error) {
      logger().error('Storage write failed', error instanceof Error ? error : undefined, { key });
    }
  }

  remove(key: string): void {
    localStorage.removeItem(this.prefix + key);
  }

  clear(): void {
    Object.keys(localStorage)
      .filter(key => key.startsWith(this.prefix))
      .forEach(key => localStorage.removeItem(key));
  }

  has(key: string): boolean {
    return localStorage.getItem(this.prefix + key) !== null;
  }
}

export const storageService = new LocalStorageService();
```

**Migration:**
1. Create `storageService.ts`
2. Update `tokenService.ts` to use it
3. Find all direct localStorage usage
4. Replace with storageService calls
5. Update tests

**Files to Migrate:**
- `src/domains/auth/services/tokenService.ts`
- `src/shared/hooks/useEnhancedForm.tsx`
- `src/shared/components/forms/EnhancedFormPatterns.tsx`
- `src/store/themeStore.ts`

---

### 2.3 Standardize API Call Pattern (8 hours)

**Priority:** MEDIUM  
**Impact:** High - Consistency

**Create Documentation:**
`src/services/api/API_PATTERNS_GUIDE.md`

**Pattern Guidelines:**

```markdown
# API Call Patterns Guide

## When to Use What

### 1. Service Layer (Always)
- **Location:** `src/domains/{domain}/services/`
- **Purpose:** All API calls go through service functions
- **Pattern:** Direct apiClient usage

```typescript
// src/domains/users/services/userService.ts
export const getCurrentUser = async (): Promise<UserProfile> => {
  const response = await apiClient.get<ApiResponse<UserProfile>>('/api/v1/users/me');
  return response.data.data;
};
```

### 2. TanStack Query Hooks (For Components)
- **Location:** `src/domains/{domain}/hooks/`
- **Purpose:** Data fetching with caching
- **When:** All GET requests

```typescript
// src/domains/users/hooks/useUserProfile.ts
export function useUserProfile() {
  return useQuery({
    queryKey: ['user', 'profile'],
    queryFn: () => userService.getCurrentUser(),
  });
}
```

### 3. TanStack Mutations (For Mutations)
- **Location:** `src/domains/{domain}/hooks/`
- **Purpose:** POST/PUT/DELETE operations
- **When:** All data mutations

```typescript
// src/domains/users/hooks/useUpdateProfile.ts
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const handleError = useStandardErrorHandler();

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => 
      userService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
    },
    onError: handleError,
  });
}
```

### 4. Never Use
- ❌ Direct fetch() calls
- ❌ Direct axios without apiClient
- ❌ API calls in components (always use hooks)
```

**Implementation Steps:**
1. Audit all API calls
2. Create missing service functions
3. Create TanStack Query hooks
4. Migrate components to use hooks
5. Document patterns

---

## Phase 3: Low Priority Improvements (Day 8-10) 🟢

### 3.1 Adopt use() Hook (4 hours)

**Priority:** LOW  
**Impact:** Low - Future-proofing

**Files to Migrate:**
- All context consumers (useContext → use)

**Changes:**
```typescript
// BEFORE
import { useContext } from 'react';
const auth = useContext(AuthContext);

// AFTER
import { use } from 'react';
const auth = use(AuthContext);
```

**Benefits:**
- More flexible (can be conditional)
- Works with Promises (Suspense)
- React 19 recommended pattern

---

### 3.2 Add Request Cancellation (4 hours)

**Priority:** LOW  
**Impact:** Low - User experience

**Implementation:**
```typescript
// src/services/api/cancelManager.ts
import axios from 'axios';

class RequestCancelManager {
  private cancelTokens = new Map<string, axios.CancelTokenSource>();

  createToken(key: string): axios.CancelToken {
    const source = axios.CancelToken.source();
    this.cancelTokens.set(key, source);
    return source.token;
  }

  cancel(key: string): void {
    const source = this.cancelTokens.get(key);
    if (source) {
      source.cancel('Operation canceled by user');
      this.cancelTokens.delete(key);
    }
  }

  cancelAll(): void {
    this.cancelTokens.forEach(source => source.cancel());
    this.cancelTokens.clear();
  }
}

export const cancelManager = new RequestCancelManager();
```

---

### 3.3 Feature Flags System (8 hours)

**Priority:** LOW  
**Impact:** Low - Future capability

**Implementation:**
```typescript
// src/core/featureFlags/featureFlagService.ts
interface FeatureFlags {
  newDashboard: boolean;
  advancedPermissions: boolean;
  betaFeatures: boolean;
}

class FeatureFlagService {
  private flags: FeatureFlags = {
    newDashboard: false,
    advancedPermissions: true,
    betaFeatures: false,
  };

  isEnabled(flag: keyof FeatureFlags): boolean {
    return this.flags[flag] ?? false;
  }

  enable(flag: keyof FeatureFlags): void {
    this.flags[flag] = true;
  }

  disable(flag: keyof FeatureFlags): void {
    this.flags[flag] = false;
  }
}

export const featureFlags = new FeatureFlagService();
```

**Hook:**
```typescript
export function useFeatureFlag(flag: keyof FeatureFlags): boolean {
  return featureFlags.isEnabled(flag);
}
```

---

## Implementation Checklist

### Week 1: Critical & High Priority
- [ ] Day 1: Standardize error handling (4h)
- [ ] Day 2: Remove console.log (2h) + Fix fetch() (1h)
- [ ] Day 3: Remove unnecessary memoization (3h)
- [ ] Day 4-5: Centralize localStorage (6h)
- [ ] Day 5: Testing and verification

### Week 2: Medium & Documentation
- [ ] Day 6-8: Standardize API patterns (8h)
- [ ] Day 9: Documentation updates
- [ ] Day 10: Final testing and PR

### Future Iterations
- [ ] Adopt use() hook (4h)
- [ ] Request cancellation (4h)
- [ ] Feature flags (8h)

---

## Testing Strategy

### Unit Tests
- [ ] Error handler tests (all scenarios)
- [ ] Storage service tests
- [ ] API hook tests
- [ ] Feature flag tests

### Integration Tests
- [ ] Error flows (401, 422, 500)
- [ ] API call flows
- [ ] Token refresh flows
- [ ] Permission checks

### E2E Tests
- [ ] Login/logout flow
- [ ] Protected routes
- [ ] Form submissions
- [ ] Error recovery

---

## Success Metrics

### Code Quality
- ✅ ESLint score: 10/10 (no-console enforced)
- ✅ TypeScript strict: No errors
- ✅ Test coverage: >80%

### Consistency
- ✅ All error handling uses standard handler
- ✅ All API calls through service layer
- ✅ All localStorage through storage service
- ✅ No direct console.log

### Performance
- ✅ No unnecessary re-renders
- ✅ React Compiler optimizations active
- ✅ Bundle size unchanged or smaller

---

## Rollout Plan

### Phase 1: Internal Testing (Week 1)
- Fix critical issues
- Internal QA
- Code review

### Phase 2: Staging Deployment (Week 2)
- Deploy to staging
- Full regression testing
- Performance monitoring

### Phase 3: Production Rollout (Week 3)
- Gradual rollout (10% → 50% → 100%)
- Monitor error rates
- Quick rollback plan ready

---

## Risk Mitigation

### High Risk Areas
1. **Error Handler Migration**
   - Risk: Breaking existing error flows
   - Mitigation: Comprehensive testing, gradual rollout

2. **localStorage Centralization**
   - Risk: Breaking token storage
   - Mitigation: Backward compatibility layer

3. **API Pattern Changes**
   - Risk: Breaking API calls
   - Mitigation: Incremental migration, keep old pattern working

### Rollback Plan
- Keep old implementations alongside new ones
- Feature flag for new patterns
- Quick revert capability

---

**Plan Status:** ✅ Ready for Implementation  
**Approval Required:** Yes  
**Estimated Completion:** 2 weeks  
**Total Effort:** 28 hours
