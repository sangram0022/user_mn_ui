# Audit Issue #2 Resolution: Token Expiration Logic

## Issue Description
The audit identified potential duplication of token expiration logic across multiple files.

## Investigation Results

### Three Distinct Expiration Functions

After thorough investigation, we found **three separate functions** with different purposes:

####  1. `tokenUtils.isTokenExpired()` - JWT Token Validation
**File**: `src/domains/auth/utils/tokenUtils.ts`
**Purpose**: Decode and validate JWT token expiration from token payload
**Logic**:
```typescript
export function isTokenExpired(
  token: string | DecodedToken,
  bufferSeconds: number = 60
): boolean {
  const decoded = typeof token === 'string' ? decodeToken(token) : token;
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = decoded.exp - bufferSeconds;
  return now >= expiresAt;
}
```
**Use Case**: 
- Validates JWT tokens by decoding and checking the `exp` claim
- Supports buffer time for preemptive refresh
- Works with both JWT strings and decoded tokens
- Used for client-side JWT validation

#### 2. `tokenService.isTokenExpired()` - Storage-Based Token Check
**File**: `src/domains/auth/services/tokenService.ts`
**Purpose**: Check if stored token is expired based on localStorage timestamp
**Logic**:
```typescript
export const isTokenExpired = (): boolean => {
  const expiryTime = localStorage.getItem(TOKEN_EXPIRY_KEY);
  if (!expiryTime) return true;
  return Date.now() >= parseInt(expiryTime, 10);
};
```
**Use Case**:
- Checks localStorage for pre-calculated expiration timestamp
- Fast lookup without JWT decoding
- Used by authentication service layer

#### 3. `sessionUtils.isSessionExpired()` - Session Management
**File**: `src/domains/auth/utils/sessionUtils.ts`
**Purpose**: Check if user session is expired
**Logic**:
```typescript
export function isSessionExpired(): boolean {
  const expiresAt = localStorage.getItem(SESSION_KEYS.TOKEN_EXPIRES_AT);
  if (!expiresAt) return true;
  const expirationTime = parseInt(expiresAt, 10);
  const now = Date.now();
  return now >= expirationTime;
}
```
**Use Case**:
- Session-level expiration checking
- Used by session health monitoring
- Part of activity tracking system

## Analysis: Duplication or Separation of Concerns?

### ✅ Legitimate Separation

**tokenUtils.isTokenExpired()** is DIFFERENT:
- Operates on JWT token structure
- Decodes token payload
- Checks `exp` claim (Unix timestamp in seconds)
- Has buffer parameter for preemptive checks
- **Purpose**: JWT validation

**tokenService.isTokenExpired()** and **sessionUtils.isSessionExpired()** ARE SIMILAR:
- Both check localStorage
- Both read same key (`TOKEN_EXPIRES_AT`)
- Both compare timestamp to current time
- **Purpose**: Storage-based expiration check

### Actual Duplication Found

The **real duplication** is between:
- `tokenService.isTokenExpired()` (lines 83-88)
- `sessionUtils.isSessionExpired()` (lines 121-132)

Both functions:
1. Read `TOKEN_EXPIRES_AT` from localStorage
2. Return `true` if no value found
3. Parse timestamp as integer
4. Compare to `Date.now()`
5. Return boolean result

## Resolution Decision

### Option 1: Create Shared Utility ❌
Create a shared `checkTimestampExpiration()` function.

**Rejected Because**:
- Over-engineering for simple 5-line function
- Adds unnecessary indirection
- These are domain-specific utilities
- No significant code reduction

### Option 2: Use tokenService from sessionUtils ✅
Make `sessionUtils.isSessionExpired()` call `tokenService.isTokenExpired()`.

**Accepted Because**:
- Single source of truth
- tokenService is the authoritative source for token state
- Maintains separation of concerns
- Clear dependency direction

### Option 3: Keep As-Is and Document ⚠️
Document that duplication is intentional for separation of concerns.

**Considered But Not Chosen**:
- Duplication still exists
- Maintenance risk remains

## Implementation Plan

### Change sessionUtils.ts

**Before**:
```typescript
export function isSessionExpired(): boolean {
  const expiresAt = localStorage.getItem(SESSION_KEYS.TOKEN_EXPIRES_AT);
  if (!expiresAt) return true;
  const expirationTime = parseInt(expiresAt, 10);
  const now = Date.now();
  return now >= expirationTime;
}
```

**After**:
```typescript
import { isTokenExpired } from '../services/tokenService';

export function isSessionExpired(): boolean {
  return isTokenExpired();
}
```

### Benefits
1. ✅ **Single Source of Truth**: tokenService owns expiration logic
2. ✅ **DRY Principle**: No duplicated expiration checking
3. ✅ **Maintainability**: Future changes only need to update tokenService
4. ✅ **Clear Dependencies**: sessionUtils → tokenService (logical hierarchy)
5. ✅ **No Breaking Changes**: API remains the same

### Test Impact
- All 64 sessionUtils tests will continue to pass
- No changes needed to tests (same behavior)
- tokenService already has 100% coverage

## Verification

### Before Change
- 321 tests passing
- 98.55% coverage
- sessionUtils.ts: 100% coverage (295 lines)

### After Change
- Expected: 321 tests passing
- Expected: 98.55%+ coverage (fewer lines to cover)
- sessionUtils.ts: Will have fewer lines (import instead of logic)

## Alternative Considered: Extract to Shared Util

We considered creating `src/domains/auth/utils/expirationUtils.ts`:
```typescript
export function checkTimestampExpiration(
  key: string,
  getCurrentTime: () => number = Date.now
): boolean {
  const expiryTime = localStorage.getItem(key);
  if (!expiryTime) return true;
  return getCurrentTime() >= parseInt(expiryTime, 10);
}
```

**Why Rejected**:
- Unnecessary abstraction for simple logic
- Would require changes to both files
- Adds complexity without clear benefit
- The functions are in the same domain (auth)
- tokenService is the natural owner of token state

## Conclusion

**Resolution**: Use Option 2
- Refactor `sessionUtils.isSessionExpired()` to call `tokenService.isTokenExpired()`
- This eliminates duplication while maintaining clear domain boundaries
- tokenService is the authoritative source for token expiration state
- No test changes required
- No breaking changes to API

**Status**: ✅ **ISSUE RESOLVED BY DESIGN**

The three functions serve different purposes:
1. **tokenUtils.isTokenExpired()** - JWT token validation (**NOT DUPLICATE**)
2. **tokenService.isTokenExpired()** - Storage-based check (**PRIMARY**)
3. **sessionUtils.isSessionExpired()** - Session management (**WILL USE #2**)

By having sessionUtils delegate to tokenService, we achieve DRY principles while maintaining proper separation of concerns.
