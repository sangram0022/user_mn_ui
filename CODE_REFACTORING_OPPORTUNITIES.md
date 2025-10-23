# Code Refactoring Opportunities Report

**Generated**: 2024-01-15
**Scope**: UI Codebase (React TypeScript)
**Purpose**: Identify duplicate code patterns that can be converted to reusable utility functions

---

## Executive Summary

After comprehensive analysis of the UI codebase, here are the key refactoring opportunities identified:

### 📊 Summary Statistics

- **Primary Issue**: SessionStorage management scattered across `client.ts`
- **Secondary Issue**: Repeated `new Date().toISOString()` calls
- **Tertiary Issue**: Multiple `typeof window !== 'undefined'` checks
- **Low Priority**: JSON.stringify/parse calls (already acceptable)

### ✅ What's Already Done Well

The codebase already has excellent utility coverage:

- ✅ **safeLocalStorage.ts** - Comprehensive localStorage wrapper with SSR support
- ✅ **dateUtils.ts** - Date formatting utilities (formatDate, formatTime, formatRelativeTime)
- ✅ **validation.ts** - Complete form validation with backend API spec compliance
- ✅ **error-handler.ts** - Centralized error handling
- ✅ **logger.ts** - Logging utilities
- ✅ **sanitization.ts** - Security utilities
- ✅ **performance.ts** - Performance monitoring hooks

---

## 🔴 HIGH PRIORITY: SessionStorage Management

### Current State

**Location**: `src/lib/api/client.ts` (Lines 306-367)

**Issues**:

1. Direct `window.sessionStorage` calls (32 occurrences)
2. No SSR safety checks
3. Repeated token key patterns (`access_token`, `refresh_token`, `token_issued_at`, `token_expires_in`)
4. Manual error handling in `loadSession()` and `persistSession()`

**Current Code**:

```typescript
// Lines 313-323: Loading session
const accessToken =
  window.sessionStorage.getItem('access_token') ??
  window.sessionStorage.getItem('token') ??
  undefined;
const refreshToken = window.sessionStorage.getItem('refresh_token') ?? undefined;
const issuedAt = window.sessionStorage.getItem('token_issued_at') ?? undefined;
const expiresInString = window.sessionStorage.getItem('token_expires_in') ?? undefined;

// Lines 340-363: Persisting session
window.sessionStorage.removeItem('access_token');
window.sessionStorage.removeItem('refresh_token');
window.sessionStorage.removeItem('token_issued_at');
window.sessionStorage.removeItem('token_expires_in');
window.sessionStorage.removeItem('token');

window.sessionStorage.setItem('access_token', session.accessToken);
window.sessionStorage.setItem('token', session.accessToken);
```

### ✅ Recommended Solution

Create **`src/shared/utils/safeSessionStorage.ts`** similar to existing `safeLocalStorage.ts`:

```typescript
/**
 * Safe SessionStorage Utility
 * Provides safe access to sessionStorage with SSR support, error handling, and type safety
 */

import { logger } from './logger';

export interface StoredSession {
  accessToken: string;
  refreshToken?: string;
  issuedAt?: string;
  expiresIn?: number;
}

const TOKEN_KEYS = {
  ACCESS_TOKEN: 'access_token',
  TOKEN: 'token', // Legacy fallback
  REFRESH_TOKEN: 'refresh_token',
  ISSUED_AT: 'token_issued_at',
  EXPIRES_IN: 'token_expires_in',
} as const;

class SafeSessionStorage {
  private isAvailable(): boolean {
    return typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined';
  }

  /**
   * Get item from sessionStorage
   */
  getItem(key: string): string | null {
    if (!this.isAvailable()) return null;

    try {
      return window.sessionStorage.getItem(key);
    } catch (error) {
      logger.warn(`Failed to get sessionStorage item "${key}"`, { error });
      return null;
    }
  }

  /**
   * Set item in sessionStorage
   */
  setItem(key: string, value: string): boolean {
    if (!this.isAvailable()) return false;

    try {
      window.sessionStorage.setItem(key, value);
      return true;
    } catch (error) {
      logger.warn(`Failed to set sessionStorage item "${key}"`, { error });
      return false;
    }
  }

  /**
   * Remove item from sessionStorage
   */
  removeItem(key: string): boolean {
    if (!this.isAvailable()) return false;

    try {
      window.sessionStorage.removeItem(key);
      return true;
    } catch (error) {
      logger.warn(`Failed to remove sessionStorage item "${key}"`, { error });
      return false;
    }
  }

  /**
   * Clear all sessionStorage
   */
  clear(): boolean {
    if (!this.isAvailable()) return false;

    try {
      window.sessionStorage.clear();
      return true;
    } catch (error) {
      logger.error('Failed to clear sessionStorage', { error });
      return false;
    }
  }

  /**
   * Get JSON value from sessionStorage
   */
  getJSON<T = unknown>(key: string): T | null {
    const value = this.getItem(key);
    if (!value) return null;

    try {
      return JSON.parse(value) as T;
    } catch (error) {
      logger.warn(`Failed to parse JSON from sessionStorage key "${key}"`, { error });
      return null;
    }
  }

  /**
   * Set JSON value in sessionStorage
   */
  setJSON<T = unknown>(key: string, value: T): boolean {
    try {
      const serialized = JSON.stringify(value);
      return this.setItem(key, serialized);
    } catch (error) {
      logger.error(`Failed to stringify JSON for sessionStorage key "${key}"`, { error });
      return false;
    }
  }

  // ============================================================================
  // AUTHENTICATION SESSION HELPERS
  // ============================================================================

  /**
   * Load authentication session from sessionStorage
   */
  loadAuthSession(): StoredSession | null {
    const accessToken =
      this.getItem(TOKEN_KEYS.ACCESS_TOKEN) ?? this.getItem(TOKEN_KEYS.TOKEN) ?? null;

    if (!accessToken) return null;

    const refreshToken = this.getItem(TOKEN_KEYS.REFRESH_TOKEN) ?? undefined;
    const issuedAt = this.getItem(TOKEN_KEYS.ISSUED_AT) ?? undefined;
    const expiresInString = this.getItem(TOKEN_KEYS.EXPIRES_IN);
    const expiresIn = expiresInString ? Number(expiresInString) : undefined;

    return { accessToken, refreshToken, issuedAt, expiresIn };
  }

  /**
   * Save authentication session to sessionStorage
   */
  saveAuthSession(session: StoredSession | null): boolean {
    if (!session) {
      // Clear all auth tokens
      this.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
      this.removeItem(TOKEN_KEYS.TOKEN);
      this.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
      this.removeItem(TOKEN_KEYS.ISSUED_AT);
      this.removeItem(TOKEN_KEYS.EXPIRES_IN);
      return true;
    }

    // Save tokens
    this.setItem(TOKEN_KEYS.ACCESS_TOKEN, session.accessToken);
    this.setItem(TOKEN_KEYS.TOKEN, session.accessToken); // Legacy fallback

    if (session.refreshToken) {
      this.setItem(TOKEN_KEYS.REFRESH_TOKEN, session.refreshToken);
    } else {
      this.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
    }

    if (session.issuedAt) {
      this.setItem(TOKEN_KEYS.ISSUED_AT, session.issuedAt);
    }

    if (typeof session.expiresIn === 'number') {
      this.setItem(TOKEN_KEYS.EXPIRES_IN, String(session.expiresIn));
    }

    return true;
  }

  /**
   * Clear authentication session
   */
  clearAuthSession(): boolean {
    return this.saveAuthSession(null);
  }
}

export const safeSessionStorage = new SafeSessionStorage();
export { SafeSessionStorage, TOKEN_KEYS };
```

### 📝 Usage in `client.ts`

**Before**:

```typescript
private loadSession(): StoredSession | null {
  if (typeof window === 'undefined') return null;

  try {
    const accessToken = window.sessionStorage.getItem('access_token') ??
                        window.sessionStorage.getItem('token') ?? undefined;
    // ... 10 more lines
  } catch (error) {
    logger.warn('Failed to load auth session', { error });
    return null;
  }
}

private persistSession(session: StoredSession | null): void {
  if (typeof window === 'undefined') return;

  try {
    if (!session) {
      window.sessionStorage.removeItem('access_token');
      // ... 4 more lines
      return;
    }
    window.sessionStorage.setItem('access_token', session.accessToken);
    // ... 10 more lines
  } catch (error) {
    logger.warn('Failed to persist auth session', { error });
  }
}
```

**After**:

```typescript
import { safeSessionStorage } from '@shared/utils/safeSessionStorage';

private loadSession(): StoredSession | null {
  return safeSessionStorage.loadAuthSession();
}

private persistSession(session: StoredSession | null): void {
  safeSessionStorage.saveAuthSession(session);
  this.session = session;
}
```

**Benefits**:

- ✅ Reduces `client.ts` by ~40 lines
- ✅ Centralized SSR safety checks
- ✅ Reusable across multiple services
- ✅ Consistent error handling with logger
- ✅ Type-safe session management
- ✅ Eliminates all 32 direct `window.sessionStorage` calls

---

## 🟡 MEDIUM PRIORITY: ISO Timestamp Generation

### Current State

**Location**: `src/lib/api/client.ts`

**Issues**:

- Repeated `new Date().toISOString()` calls (8 occurrences at lines 759-780)
- Same pattern used for default timestamps

**Current Code**:

```typescript
// Line 759-760
last_login_at: secureResponse.user.last_login_at || new Date().toISOString(),
issued_at: new Date().toISOString(),

// Line 779-780
last_login_at: new Date().toISOString(),
issued_at: regularResponse.issued_at || new Date().toISOString(),
```

### ✅ Recommended Solution

**Option 1**: Add to existing `dateUtils.ts`:

```typescript
/**
 * Get current ISO timestamp
 * @returns Current date/time in ISO 8601 format
 * @example getCurrentISOTimestamp() // "2024-01-15T10:30:00.000Z"
 */
export function getCurrentISOTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Get ISO timestamp from date or default to current time
 * @param date Optional date to convert
 * @returns ISO 8601 timestamp
 * @example getISOTimestamp() // "2024-01-15T10:30:00.000Z"
 * @example getISOTimestamp(myDate) // "2024-01-10T08:00:00.000Z"
 */
export function getISOTimestamp(date?: string | Date): string {
  if (!date) return new Date().toISOString();

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toISOString();
  } catch {
    return new Date().toISOString();
  }
}
```

**Usage**:

```typescript
import { getCurrentISOTimestamp, getISOTimestamp } from '@shared/utils/dateUtils';

// Instead of: new Date().toISOString()
issued_at: getCurrentISOTimestamp(),

// Instead of: user.last_login_at || new Date().toISOString()
last_login_at: getISOTimestamp(user.last_login_at),
```

**Benefits**:

- ✅ Consistent timestamp format across app
- ✅ Easier to mock in tests
- ✅ Single place to change timestamp logic if needed
- ✅ More readable code

**Priority**: Medium (minor code improvement, not critical)

---

## 🟢 LOW PRIORITY: SSR Window Checks

### Current State

**Location**: `src/lib/api/client.ts`

**Issues**:

- Repeated `typeof window !== 'undefined'` checks (6 occurrences)
- Lines 306, 333, 695

**Current Code**:

```typescript
if (typeof window === 'undefined') {
  return null;
}
```

### ✅ Recommended Solution

**Option 1**: Add to existing utility file (e.g., `validation.ts` or new `env.ts`):

```typescript
/**
 * Environment Utilities
 */

/**
 * Check if code is running in browser environment
 * @returns True if in browser, false if SSR
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Check if code is running in SSR environment
 * @returns True if SSR, false if browser
 */
export function isSSR(): boolean {
  return typeof window === 'undefined';
}

/**
 * Safely execute browser-only code
 * @param callback Function to execute in browser
 * @param fallback Optional fallback value for SSR
 */
export function browserOnly<T>(callback: () => T, fallback?: T): T | undefined {
  if (isBrowser()) {
    return callback();
  }
  return fallback;
}
```

**Usage**:

```typescript
import { isSSR, isBrowser, browserOnly } from '@shared/utils/env';

// Instead of: if (typeof window === 'undefined') return null;
if (isSSR()) return null;

// Or:
return browserOnly(() => window.sessionStorage.getItem('token'), null);
```

**Benefits**:

- ✅ More semantic/readable code
- ✅ Easier to mock in tests
- ✅ Single source of truth for environment checks

**Priority**: Low (nice-to-have, not urgent)

---

## ⚪ ACCEPTABLE: JSON Handling

### Current State

**Location**: Multiple files

**Issues**:

- 50 occurrences of `JSON.parse()` and `JSON.stringify()`
- Most are in API client for request/response handling

**Assessment**: ✅ **ACCEPTABLE - NO ACTION NEEDED**

**Reasoning**:

1. Most JSON operations are context-specific (API requests, responses)
2. Already has safe wrappers where needed:
   - `safeLocalStorage.getJSON()` / `setJSON()`
   - `parseJson()` method in client.ts with error handling
3. Adding utility would add unnecessary abstraction
4. Current usage is clear and maintainable

---

## 🔄 Implementation Priority

### Phase 1: High Impact (Immediate)

1. ✅ **Create `safeSessionStorage.ts`** (Est: 30 min)
   - Reduces code duplication by ~40 lines
   - Improves SSR safety
   - Reusable across services

2. ✅ **Update `client.ts`** (Est: 15 min)
   - Replace `loadSession()` / `persistSession()`
   - Import and use new utility

### Phase 2: Quick Wins (Optional)

3. ✅ **Add timestamp helpers to `dateUtils.ts`** (Est: 10 min)
   - `getCurrentISOTimestamp()`
   - `getISOTimestamp(date?)`

4. ✅ **Update `client.ts` timestamp calls** (Est: 5 min)
   - Replace `new Date().toISOString()`

### Phase 3: Polish (Low Priority)

5. ⚪ **Add SSR utilities** (Est: 10 min)
   - `isBrowser()`, `isSSR()`, `browserOnly()`

6. ⚪ **Refactor window checks** (Est: 10 min)
   - Replace `typeof window` checks

---

## 📊 Code Quality Metrics

### Current State

- **Total lines in `client.ts`**: 1,576 lines
- **SessionStorage calls**: 32 occurrences
- **Date.toISOString calls**: 8 occurrences
- **Window type checks**: 6 occurrences

### After Refactoring (Estimated)

- **Lines saved in `client.ts`**: ~40 lines (-2.5%)
- **SessionStorage calls**: 0 (all in utility)
- **Date.toISOString calls**: 0 (all in utility)
- **Code duplication**: Reduced by ~50%
- **Maintainability**: Significantly improved

---

## 🎯 Conclusion

The UI codebase is already well-structured with excellent utility coverage. The main opportunity is **sessionStorage management** which is currently scattered across `client.ts`.

**Recommended Action**:

1. ✅ Implement `safeSessionStorage.ts` (HIGH PRIORITY)
2. ✅ Add timestamp utilities to `dateUtils.ts` (MEDIUM PRIORITY)
3. ⚪ Consider SSR utilities (LOW PRIORITY)

All other areas (validation, date formatting, error handling, logging) are already well-abstracted and require no changes.

---

**Next Steps**:

1. Review this report
2. Approve Phase 1 implementation
3. Create utility file
4. Update client.ts
5. Test authentication flow
6. Commit changes

---

## 📋 Summary of Findings

| Category                  | Priority      | Occurrences | Solution                       | Impact                                 |
| ------------------------- | ------------- | ----------- | ------------------------------ | -------------------------------------- |
| SessionStorage Management | 🔴 HIGH       | 32 calls    | Create `safeSessionStorage.ts` | Reduces ~40 lines, improves SSR safety |
| ISO Timestamp Generation  | 🟡 MEDIUM     | 8 calls     | Add to `dateUtils.ts`          | Better testability, consistency        |
| SSR Window Checks         | 🟢 LOW        | 6 calls     | Create `env.ts` utilities      | Improved readability                   |
| JSON Operations           | ⚪ ACCEPTABLE | 50 calls    | No action needed               | Already well-handled                   |

**Overall Assessment**: ✅ Codebase is well-maintained with excellent utility coverage. Only one high-priority refactoring opportunity identified.
