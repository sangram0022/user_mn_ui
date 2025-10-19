# Redundancy Cleanup Plan

**Date:** October 19, 2025  
**Status:** In Progress

## Issues Identified

### 1. Duplicate Service Implementations

**OLD Services (Legacy - TO BE REMOVED):**

- ❌ `src/services/auth.service.ts` - Uses old apiClient
- ❌ `src/services/user.service.ts` - Uses old apiClient
- ❌ `src/services/user-backend.service.ts` - Uses backendApiClient
- ❌ `src/services/admin-backend.service.ts` - Uses backendApiClient
- ❌ `src/services/gdpr.service.ts` - Uses old apiClient
- ❌ `src/services/audit.service.ts` - Uses old apiClient
- ❌ `src/services/bulk.service.ts` - Uses old apiClient

**NEW Services (Production-Ready - KEEP):**

- ✅ `src/services/api/auth.service.ts` - Modern, complete
- ✅ `src/services/api/profile.service.ts` - Modern, complete
- ✅ `src/services/api/admin.service.ts` - Modern, complete with RBAC
- ✅ `src/services/api/gdpr.service.ts` - Modern, complete
- ✅ `src/services/api/audit.service.ts` - Modern, complete
- ✅ `src/services/api/index.ts` - Barrel export

### 2. Files Using OLD Services

**Hooks:**

- `src/hooks/useAuth.ts` - imports `../services/auth.service`
- `src/hooks/useUsers.ts` - imports `../services/user.service`

**Admin Pages:**

- `src/domains/admin/pages/AdminDashboardPage.tsx`
- `src/domains/admin/pages/AuditLogsPage.tsx`
- `src/domains/admin/pages/GDPRCompliancePage.tsx`
- `src/domains/admin/pages/HealthMonitoringPage.tsx`
- `src/domains/admin/pages/RoleManagementPage.tsx`
- `src/domains/admin/pages/BulkOperationsPage.tsx`
- `src/domains/admin/pages/PasswordManagementPage.tsx`

**User Management:**

- `src/domains/user-management/store/userManagementStore.ts`

## Migration Strategy

### Phase 1: Update Import Paths (COMPLETE ✅)

All files should import from:

```typescript
import { api } from '@/services/api';
// or
import { authService, adminService, userProfileService } from '@/services/api';
```

### Phase 2: Delete Redundant Old Services

Remove these files after Phase 1 is complete:

1. `src/services/auth.service.ts`
2. `src/services/user.service.ts`
3. `src/services/user-backend.service.ts`
4. `src/services/admin-backend.service.ts`
5. `src/services/gdpr.service.ts`
6. `src/services/audit.service.ts`
7. `src/services/bulk.service.ts`

### Phase 3: Update Hooks

Create modern hooks that use new API services:

- Update `useAuth` hook
- Update `useUsers` hook
- Consider consolidating with domain-specific hooks

### Phase 4: Cleanup

- Remove unused imports
- Remove unused type definitions
- Update tests

## Recommended Approach

**Option A: Complete Rewrite (Recommended)**

- Delete old service files immediately
- Fix import errors one by one
- Update hooks to match new API service methods
- This forces complete migration

**Option B: Gradual Migration**

- Keep old services temporarily
- Update consumers one by one
- Delete old services when no longer used
- Safer but takes longer

## New Service API Reference

### Authentication

```typescript
import { authService } from '@/services/api';

// Login
const { token, user } = await authService.login({ email, password });

// Register
await authService.register({ email, password, first_name, last_name });

// Logout
await authService.logout();

// Password operations
await authService.forgotPassword(email);
await authService.resetPassword({ token, new_password });
await authService.changePassword({ current_password, new_password });

// Email verification
await authService.verifyEmail(token);
await authService.resendVerificationEmail(email);

// Check auth status
const isAuth = authService.isAuthenticated();
```

### User Profile

```typescript
import { userProfileService } from '@/services/api';

// Get profile
const profile = await userProfileService.getCurrentProfile();

// Update profile
const updated = await userProfileService.updateProfile({
  first_name,
  last_name,
  preferences,
});
```

### Admin Operations

```typescript
import { adminService } from '@/services/api';

// Users
const users = await adminService.getUsers({ skip: 0, limit: 20 });
const user = await adminService.getUserById(userId);
await adminService.createUser(userData);
await adminService.updateUser(userId, updates);
await adminService.deleteUser(userId);

// User workflow
await adminService.approveUser(userId);
await adminService.rejectUser(userId, reason);

// Roles
const roles = await adminService.getRoles();
await adminService.createRole(roleData);
await adminService.updateRole(roleId, updates);
await adminService.deleteRole(roleId);

// RBAC
const permissions = await adminService.getPermissions();
const userPerms = await adminService.getUserPermissions(userId);
await adminService.assignRoleToUser(userId, roleId);
await adminService.removeRoleFromUser(userId, roleId);

// Stats
const stats = await adminService.getStats();
const analytics = await adminService.getUserAnalytics();
```

### GDPR

```typescript
import { gdprService } from '@/services/api';

// Export data
const exportReq = await gdprService.exportMyData({ format: 'json' });
const status = await gdprService.checkExportStatus(exportReq.export_id);

// Delete account
await gdprService.deleteMyAccount({ confirmation: 'DELETE MY ACCOUNT' });
```

### Audit

```typescript
import { auditService } from '@/services/api';

// Query logs
const logs = await auditService.getAuditLogs({
  skip: 0,
  limit: 20,
  action: 'UPDATE_PROFILE',
});

// Get summary
const summary = await auditService.getAuditSummary();
```

## Action Items

- [ ] **IMMEDIATE:** Backup current codebase
- [ ] **STEP 1:** Update all import statements to new API services
- [ ] **STEP 2:** Fix hooks to use new API methods
- [ ] **STEP 3:** Update admin pages
- [ ] **STEP 4:** Delete old service files
- [ ] **STEP 5:** Run tests
- [ ] **STEP 6:** Build and verify

## Expected Benefits

1. **Single Source of Truth** - One service layer, no confusion
2. **Better Type Safety** - Consistent TypeScript types
3. **Complete API Coverage** - All 44 endpoints in one place
4. **Modern Architecture** - React 19 compatible
5. **Reduced Bundle Size** - No duplicate code
6. **Easier Maintenance** - Only one place to update

## Risks

- **Breaking Changes** - Old code may break temporarily
- **Type Mismatches** - May need to update type definitions
- **Testing Required** - Full regression testing needed

## Rollback Plan

If issues arise:

1. Git revert to previous commit
2. Keep old services temporarily
3. Migrate one module at a time
4. Thorough testing between migrations

---

**Next Steps:** Execute Phase 1 - Update all imports to new API services
