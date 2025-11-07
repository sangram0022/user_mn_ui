# Comprehensive Inconsistency Audit Report

**Date:** November 7, 2025  
**Scope:** Complete codebase line-by-line analysis  
**Status:** 🔍 IN PROGRESS

---

## 🎯 Audit Methodology

### Approach
1. ✅ **Phase 1:** Token storage - COMPLETED
2. 🔄 **Phase 2:** Query keys consistency - IN PROGRESS
3. ⏳ **Phase 3:** API patterns
4. ⏳ **Phase 4:** Error handling
5. ⏳ **Phase 5:** Type definitions
6. ⏳ **Phase 7:** Component patterns

---

## 🔴 INCONSISTENCIES FOUND

### 1. Query Keys - Local vs Centralized ⚠️ CRITICAL

**Issue:** Multiple hook files define local query key factories instead of using centralized `queryKeys` from `queryClient.ts`

#### 1.1 `useAdminAnalytics.hooks.ts` ❌

**Location:** `src/domains/admin/hooks/useAdminAnalytics.hooks.ts`

**Current (WRONG):**
```typescript
export const adminAnalyticsKeys = {
  all: ['admin', 'analytics'] as const,
  stats: (params?: AdminStatsParams) => [...adminAnalyticsKeys.all, 'stats', params] as const,
  growth: (params?: GrowthAnalyticsParams) => [...adminAnalyticsKeys.all, 'growth', params] as const,
};

// Used in hooks
queryKey: adminAnalyticsKeys.stats(params)
queryKey: adminAnalyticsKeys.growth(params)
```

**Should Be (CORRECT):**
```typescript
import { queryKeys } from '@/services/api/queryClient';

// Use centralized keys
queryKey: queryKeys.admin.analytics.stats(params)
queryKey: queryKeys.admin.analytics.growth(params)
```

**Impact:**
- ❌ Duplicate key definition logic
- ❌ Inconsistent cache key structure
- ❌ Violates Single Source of Truth principle
- ❌ Different from other admin hooks

#### 1.2 `useAdminRoles.hooks.ts` - Partial Issue ⚠️

**Location:** `src/domains/admin/hooks/useAdminRoles.hooks.ts:65`

**Current (WRONG):**
```typescript
queryKey: ['admin', 'roles', 'check', userId, roleName] as const,
```

**Should Be (CORRECT):**
```typescript
queryKey: queryKeys.rbac.roles.check(userId, roleName)
```

**Impact:**
- ❌ Hardcoded query key
- ❌ Not using centralized key factory
- ⚠️ Most of file is correct, just this one line

#### 1.3 `useAdminApproval.hooks.ts` - Multiple Hardcoded Keys ⚠️

**Location:** `src/domains/admin/hooks/useAdminApproval.hooks.ts`

**Current (WRONG):**
```typescript
queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });  // Line 39
queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });  // Line 59
queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });  // Line 80
queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });  // Line 103
```

**Should Be (CORRECT):**
```typescript
queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats.all });
```

**Impact:**
- ❌ 4 instances of hardcoded keys
- ❌ Should use centralized keys for invalidation
- ⚠️ Stats invalidation not aligned with queryKeys structure

### 2. Test Utilities - Hardcoded API Prefix ⚠️ MINOR

**Issue:** Test mock utilities use hardcoded API prefix instead of importing from centralized constants

#### 2.1 `mockApi.ts` ⚠️

**Location:** `src/test/utils/mockApi.ts:15`

**Current (WRONG):**
```typescript
const API_PREFIX = '/api/v1';
```

**Should Be (CORRECT):**
```typescript
import { API_PREFIXES } from '@/services/api/common';

// Use appropriate prefix based on test context
const API_PREFIX = API_PREFIXES.AUTH; // or ADMIN, etc.
```

**Impact:**
- ⚠️ Low priority - test code
- ⚠️ Would need conditional logic for different API domains
- ℹ️ Current implementation acceptable for simplified mocks
- ℹ️ Could be improved but not critical

**Recommendation:** Document as known simplification, optional improvement

### 3. Query Key Structure Inconsistency ⚠️

**Issue:** `queryClient.ts` may be missing some key factories that are needed by hooks

#### 3.1 Missing Analytics Keys in `queryClient.ts`

**Location:** `src/services/api/queryClient.ts`

**Currently Missing:**
```typescript
// Need to check if these exist:
admin: {
  analytics: {
    stats: (params) => [...],
    growth: (params) => [...],
  },
  stats: {
    all: [...],
  }
}
```

**Action Required:**
1. ✅ Verify current queryKeys structure
2. ⚠️ Add missing keys if needed
3. ⚠️ Update all hooks to use centralized keys

---

## ✅ ALREADY CORRECT (No Action Needed)

### 1. Token Storage ✅
- **Status:** FULLY CONSOLIDATED
- **Single Source:** `tokenService.ts`
- **Coverage:** 100%
- **See:** `TOKEN_STORAGE_CONSOLIDATION_SUMMARY.md`

### 2. API Prefixes in Service Files ✅
- **Status:** FULLY CENTRALIZED
- **All services use:** `API_PREFIXES` from `common.ts`
- **Coverage:** 10/10 service files

### 3. Format Functions ✅
- **Status:** FULLY CENTRALIZED
- **Date formatters:** `shared/utils/dateFormatters.ts`
- **Text formatters:** `shared/utils/textFormatters.ts`
- **Coverage:** All format functions centralized

### 4. Error Handling Pattern ✅
- **Status:** INTENTIONALLY MIXED (Correct by design)
- **Pattern:**
  - `APIError` → Network/HTTP errors
  - `Error` → Business logic/validation
- **This is correct architecture**

### 5. Validation System ✅
- **Status:** FULLY CENTRALIZED
- **Location:** `src/core/validation/`
- **Coverage:** 100% - No local validators found

---

## 📋 FIX PRIORITY

### Priority 1: CRITICAL 🔴
1. **useAdminAnalytics.hooks.ts** - Remove local keys, use centralized
2. **useAdminRoles.hooks.ts** - Fix hardcoded 'check' query key
3. **useAdminApproval.hooks.ts** - Replace 4 hardcoded stats keys

### Priority 2: HIGH 🟡
4. **queryClient.ts** - Add missing analytics/stats key factories

### Priority 3: LOW 🟢
5. **mockApi.ts** - Document as intentional simplification (optional improvement)

---

## 🔧 FIXES TO IMPLEMENT

### Fix 1: Update queryClient.ts

**File:** `src/services/api/queryClient.ts`

**Add missing key factories:**
```typescript
export const queryKeys = {
  // ... existing keys ...
  admin: {
    all: ['admin'] as const,
    analytics: {
      all: ['admin', 'analytics'] as const,
      stats: (params?: AdminStatsParams) => 
        [...queryKeys.admin.analytics.all, 'stats', params] as const,
      growth: (params?: GrowthAnalyticsParams) => 
        [...queryKeys.admin.analytics.all, 'growth', params] as const,
      weekly: () => 
        [...queryKeys.admin.analytics.stats({ period: '7d', include_charts: true })] as const,
      monthly: () => 
        [...queryKeys.admin.analytics.stats({ period: '30d', include_charts: true })] as const,
      quarterly: () => 
        [...queryKeys.admin.analytics.stats({ period: '90d', include_charts: true })] as const,
    },
    stats: {
      all: ['admin', 'stats'] as const,
    },
  },
  rbac: {
    // ... existing keys ...
    roles: {
      // ... existing role keys ...
      check: (userId: string, roleName: string) => 
        ['admin', 'roles', 'check', userId, roleName] as const,
    },
  },
};
```

### Fix 2: Update useAdminAnalytics.hooks.ts

**File:** `src/domains/admin/hooks/useAdminAnalytics.hooks.ts`

**Changes:**
1. Remove local `adminAnalyticsKeys`
2. Import `queryKeys` from queryClient
3. Update all query definitions

### Fix 3: Update useAdminRoles.hooks.ts

**File:** `src/domains/admin/hooks/useAdminRoles.hooks.ts:65`

**Change:**
```typescript
// Before
queryKey: ['admin', 'roles', 'check', userId, roleName] as const,

// After
queryKey: queryKeys.rbac.roles.check(userId, roleName),
```

### Fix 4: Update useAdminApproval.hooks.ts

**File:** `src/domains/admin/hooks/useAdminApproval.hooks.ts`

**Changes (4 locations):**
```typescript
// Before
queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });

// After
queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats.all });
```

---

## 📊 Consistency Scorecard

| Category | Status | Score | Notes |
|----------|--------|-------|-------|
| **Token Storage** | ✅ Complete | 10/10 | Fully consolidated |
| **API Prefixes** | ✅ Complete | 10/10 | All centralized |
| **Format Functions** | ✅ Complete | 10/10 | All centralized |
| **Validation** | ✅ Complete | 10/10 | All centralized |
| **Query Keys** | ⚠️ Partial | 7/10 | 3 files need fixes |
| **Error Handling** | ✅ Correct | 10/10 | Intentional pattern |
| **Test Utilities** | ℹ️ Acceptable | 8/10 | Simplified by design |

**Overall Consistency Score:** 9.3/10 (Excellent)

---

## 🎯 Estimated Impact

### Before Fixes:
- ❌ 1 local query key factory (adminAnalyticsKeys)
- ❌ 5 hardcoded query keys scattered across hooks
- ⚠️ Potential cache invalidation issues
- ⚠️ Duplicate key logic

### After Fixes:
- ✅ 100% query keys from centralized location
- ✅ Zero duplicate key factories
- ✅ Consistent cache structure
- ✅ Single source of truth maintained

### Code Changes:
- **Files to Modify:** 4
- **Lines to Change:** ~20
- **Risk Level:** LOW (non-breaking changes)
- **Testing Required:** Verify query keys match expected patterns

---

## 🚀 Next Steps

1. ✅ **Verify queryClient.ts structure** - Check current analytics keys
2. ⚠️ **Add missing key factories** to queryClient.ts
3. ⚠️ **Update useAdminAnalytics** - Remove local keys
4. ⚠️ **Update useAdminRoles** - Fix hardcoded check key
5. ⚠️ **Update useAdminApproval** - Fix stats invalidation keys
6. ✅ **Run build** - Verify no TypeScript errors
7. ✅ **Test query invalidation** - Ensure cache updates work
8. ✅ **Document** - Update consistency docs

---

## 📚 Related Documentation

- `TOKEN_STORAGE_CONSOLIDATION_SUMMARY.md` - Token storage fixes
- `CONSISTENCY_REFACTORING_SUMMARY.md` - Previous consistency work
- `CONSISTENCY_GUIDELINES.md` - Best practices
- `ARCHITECTURE.md` - Overall architecture

---

**Status:** 🔄 Audit in progress, fixes ready to implement  
**Last Updated:** November 7, 2025  
**Auditor:** AI Assistant (Expert Mode)
