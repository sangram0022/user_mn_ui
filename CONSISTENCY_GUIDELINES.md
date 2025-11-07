# Consistency Guidelines - Quick Reference

**Purpose:** Prevent code duplication and maintain Single Source of Truth (SSOT)

---

## ⚡ Quick Checklist

### When Creating New Service Files

- [ ] Import `unwrapResponse` from `@/services/api/common`
- [ ] Import `API_PREFIXES` from `@/services/api/common`
- [ ] Import `APIError` from `@/services/api/common`
- [ ] Use appropriate `API_PREFIXES.XXX` constant for endpoints
- [ ] Never create local `unwrapResponse` functions
- [ ] Never hardcode API prefix strings

### When Creating New Hook Files

- [ ] Import `queryKeys` from `@/services/api/queryClient`
- [ ] Use centralized query keys (e.g., `queryKeys.users.list()`)
- [ ] Never create local query key factories
- [ ] Follow hierarchical key structure

### When Adding Validation

- [ ] Import from `@/core/validation`
- [ ] Use `ValidationBuilder` for form validation
- [ ] Use `quickValidate` for simple checks
- [ ] Never create local validation functions
- [ ] Never duplicate validation patterns

---

## 📍 Single Source of Truth Locations

| Feature | Location | Usage |
|---------|----------|-------|
| **API Utilities** | `src/services/api/common.ts` | `unwrapResponse`, `API_PREFIXES`, `APIError` |
| **Query Keys** | `src/services/api/queryClient.ts` | `queryKeys.users.*`, `queryKeys.rbac.*`, etc. |
| **Validation** | `src/core/validation/` | `ValidationBuilder`, `quickValidate`, validators |
| **Date Formatters** | `src/shared/utils/dateFormatters.ts` | `formatDate`, `formatDateTime`, etc. |
| **Text Formatters** | `src/shared/utils/textFormatters.ts` | `capitalize`, `truncate`, etc. |
| **Token Management** | `src/services/api/tokenService.ts` | `storeTokens`, `getToken`, `clearTokens` |

---

## 📝 Code Patterns

### API Service Pattern

```typescript
// ✅ CORRECT
import { apiClient } from './apiClient';
import { unwrapResponse, API_PREFIXES } from './common';
import type { User, UserFilters } from '@/types';

const API_PREFIX = API_PREFIXES.ADMIN_USERS;

export const userService = {
  async getUsers(filters?: UserFilters) {
    const response = await apiClient.get(`${API_PREFIX}/users`, { 
      params: filters 
    });
    return unwrapResponse<User[]>(response.data);
  },
};
```

```typescript
// ❌ WRONG - Duplicate unwrapResponse
function unwrapResponse<T>(response: unknown): T { ... }

// ❌ WRONG - Hardcoded prefix
const API_PREFIX = '/api/v1/admin/users';
```

### React Query Hook Pattern

```typescript
// ✅ CORRECT
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/services/api/queryClient';
import { userService } from '@/services/api/userService';

export function useUsers(filters?: UserFilters) {
  return useQuery({
    queryKey: queryKeys.users.list(filters),
    queryFn: () => userService.getUsers(filters),
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: userService.updateUser,
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.users.all 
      });
    },
  });
}
```

```typescript
// ❌ WRONG - Local query key factory
const userKeys = {
  all: ['users'] as const,
  list: (filters?: UserFilters) => [...userKeys.all, 'list', filters] as const,
};
```

### Validation Pattern

```typescript
// ✅ CORRECT
import { ValidationBuilder, quickValidate } from '@/core/validation';

// Form validation
const result = new ValidationBuilder()
  .validateField('email', email, (b) => b.required().email())
  .validateField('password', password, (b) => b.required().password())
  .result();

if (!result.isValid) {
  setErrors(result.errors);
  return;
}

// Quick validation
if (!quickValidate.email(email).isValid) {
  showError('Invalid email');
}
```

```typescript
// ❌ WRONG - Local validation
function validateEmail(email: string): boolean {
  return /^[^@]+@[^@]+$/.test(email);
}
```

### Token Management Pattern

```typescript
// ✅ CORRECT
import { tokenService } from '@/services/api/tokenService';

// Store tokens
tokenService.storeTokens(accessToken, refreshToken);
tokenService.storeUser(userData);

// Get token
const token = tokenService.getToken();

// Clear tokens
tokenService.clearTokens();
```

```typescript
// ❌ WRONG - Direct localStorage
localStorage.setItem('access_token', token);
localStorage.setItem('refresh_token', refreshToken);
```

---

## 🚫 Anti-Patterns to Avoid

### 1. Duplicate Functions

```typescript
// ❌ NEVER DO THIS
function unwrapResponse<T>(response: unknown): T { ... }
function formatDate(date: Date): string { ... }
function validateEmail(email: string): boolean { ... }
```

**Solution:** Always import from centralized location

### 2. Hardcoded Constants

```typescript
// ❌ NEVER DO THIS
const API_URL = '/api/v1/admin/users';
const EMAIL_REGEX = /^[^@]+@[^@]+$/;
const MAX_LENGTH = 100;
```

**Solution:** Use constants from centralized files

### 3. Local Query Keys

```typescript
// ❌ NEVER DO THIS
const myComponentKeys = {
  all: ['myComponent'] as const,
  list: () => [...myComponentKeys.all, 'list'] as const,
};
```

**Solution:** Use `queryKeys` from `queryClient.ts`

### 4. Mixed Token Storage

```typescript
// ❌ NEVER DO THIS
localStorage.setItem('token', accessToken);
tokenService.storeTokens(accessToken, refreshToken); // Mixed approaches
```

**Solution:** Always use `tokenService` exclusively

---

## 🔍 Code Review Checklist

Before submitting PR, verify:

- [ ] No duplicate `unwrapResponse` functions
- [ ] No hardcoded API prefix strings (use `API_PREFIXES`)
- [ ] No local query key factories (use `queryKeys`)
- [ ] No local validation functions (use `@/core/validation`)
- [ ] No direct `localStorage` access for tokens (use `tokenService`)
- [ ] No duplicate utility functions (check `src/shared/utils/`)
- [ ] All imports from centralized locations
- [ ] Build passes with zero TypeScript errors

---

## 📚 Reference Documentation

| Topic | Document |
|-------|----------|
| **Validation Architecture** | `VALIDATION_ARCHITECTURE.md` |
| **Backend Alignment** | `BACKEND_FRONTEND_VALIDATION_ALIGNMENT.md` |
| **API Response Format** | `BACKEND_API_RESPONSE_FORMAT.md` |
| **API Documentation** | `FRONTEND_API_DOCUMENTATION.md` |
| **Architecture** | `ARCHITECTURE.md` |
| **Consistency Summary** | `CONSISTENCY_REFACTORING_SUMMARY.md` |

---

## 🛠️ Tools for Verification

### Search for Duplicates

```bash
# Find duplicate unwrapResponse
grep -r "function unwrapResponse" src/

# Find hardcoded API prefixes
grep -r "'/api/v1/" src/ --exclude-dir=test

# Find local query key factories
grep -r "const.*Keys = {" src/

# Find direct localStorage usage
grep -r "localStorage\.(get|set|remove)Item.*token" src/
```

### Build Validation

```bash
# TypeScript check
npm run build

# Run tests
npm test

# Lint check
npm run lint
```

---

## ✨ Benefits of Following Guidelines

1. **Reduced Code Duplication:** ~100+ lines eliminated already
2. **Easier Maintenance:** Update once, apply everywhere
3. **Consistent Behavior:** Same logic everywhere
4. **Better Testability:** Single source = single test location
5. **Faster Development:** No reinventing the wheel
6. **Clear Architecture:** New developers understand structure quickly

---

## 🎯 Key Principles

### DRY (Don't Repeat Yourself)
Write code once, reuse everywhere

### SSOT (Single Source of Truth)
One authoritative source for each piece of knowledge

### SRP (Single Responsibility)
Each module has one reason to change

### Consistency
Same problems solved the same way everywhere

---

**Last Updated:** November 7, 2025  
**Status:** Active Guidelines - Follow for all new code
