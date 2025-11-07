PS D:\code\reactjs\usermn1> git diff
diff --git a/src/domains/admin/hooks/useAdminApproval.hooks.ts b/src/domains/admin/hooks/useAdminApproval.hooks.ts
index 251995a..95caa9c 100644
--- a/src/domains/admin/hooks/useAdminApproval.hooks.ts
+++ b/src/domains/admin/hooks/useAdminApproval.hooks.ts
@@ -5,6 +5,7 @@
 
 import { useMutation, useQueryClient } from '@tanstack/react-query';
 import { adminApprovalService } from '../services';
+import { queryKeys } from '../../../services/api/queryClient';
 import type {
   ApproveUserRequest,
   ApproveUserResponse,
@@ -15,7 +16,6 @@ import type {
   BulkRejectionRequest,
   BulkRejectionResult,
 } from '../types';
-import { adminUserKeys } from './useAdminUsers.hooks';
 
 // ============================================================================
 // Mutation Hooks
@@ -32,8 +32,8 @@ export const useApproveUser = () => {
       adminApprovalService.approveUser(userId, data),
     onSuccess: (_response: ApproveUserResponse, { userId }) => {
       // Invalidate user lists (pending count will change)
-      queryClient.invalidateQueries({ queryKey: adminUserKeys.lists() });
-      queryClient.invalidateQueries({ queryKey: adminUserKeys.detail(userId) });
+      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
+      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(userId) });

       // Invalidate analytics (user counts change)
       queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
@@ -52,8 +52,8 @@ export const useRejectUser = () => {
       adminApprovalService.rejectUser(userId, data),
     onSuccess: (_response: RejectUserResponse, { userId }) => {
       // Invalidate user lists
-      queryClient.invalidateQueries({ queryKey: adminUserKeys.lists() });
-      queryClient.invalidateQueries({ queryKey: adminUserKeys.detail(userId) });
+      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
+      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(userId) });

       // Invalidate analytics
       queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
@@ -76,7 +76,7 @@ export const useBulkApproveUsers = () => {
       adminApprovalService.bulkApproveUsers(request),
     onSuccess: (result: BulkApprovalResult) => {
       // Invalidate all user-related queries
-      queryClient.invalidateQueries({ queryKey: adminUserKeys.all });
+      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
       queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });

       // Log results for debugging
@@ -99,7 +99,7 @@ export const useBulkRejectUsers = () => {
       adminApprovalService.bulkRejectUsers(request),
     onSuccess: (result: BulkRejectionResult) => {
       // Invalidate all user-related queries
-      queryClient.invalidateQueries({ queryKey: adminUserKeys.all });
+      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
       queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });

       // Log results
diff --git a/src/domains/admin/hooks/useAdminAudit.hooks.ts b/src/domains/admin/hooks/useAdminAudit.hooks.ts
index 6f7025b..4ad5d8c 100644
--- a/src/domains/admin/hooks/useAdminAudit.hooks.ts
+++ b/src/domains/admin/hooks/useAdminAudit.hooks.ts
@@ -5,20 +5,17 @@

 import { useMutation, useQuery } from '@tanstack/react-query';
 import { adminAuditService } from '../services';
+import { queryKeys } from '../../../services/api/queryClient';
 import type {
   AuditLogFilters,
   ExportAuditLogsRequest,
 } from '../types';

 // ============================================================================
-// Query Keys
+// Query Keys (Using centralized queryKeys from queryClient.ts)
 // ============================================================================

-export const adminAuditKeys = {
-  all: ['admin', 'audit-logs'] as const,
-  lists: () => [...adminAuditKeys.all, 'list'] as const,
-  list: (filters?: AuditLogFilters) => [...adminAuditKeys.lists(), filters] as const,
-};
+// Query keys are now imported from centralized location

 // ============================================================================
 // Query Hooks
@@ -29,7 +26,7 @@ export const adminAuditKeys = {
  */
 export const useAuditLogs = (filters?: AuditLogFilters) => {
   return useQuery({
-    queryKey: adminAuditKeys.list(filters),
+    queryKey: queryKeys.audit.events.list(filters),
     queryFn: () => adminAuditService.getAuditLogs(filters),
     staleTime: 30000, // 30 seconds
     refetchInterval: 60000, // Refetch every minute for real-time monitoring
@@ -41,7 +38,7 @@ export const useAuditLogs = (filters?: AuditLogFilters) => {
  */
 export const useTodaysLogs = () => {
   return useQuery({
-    queryKey: [...adminAuditKeys.all, 'today'] as const,
+    queryKey: [...queryKeys.audit.events.all, 'today'] as const,
     queryFn: () => adminAuditService.getTodaysLogs(),
     staleTime: 30000,
     refetchInterval: 60000,
@@ -53,7 +50,7 @@ export const useTodaysLogs = () => {
  */
 export const useCriticalLogs = (days: number = 7) => {
   return useQuery({
-    queryKey: [...adminAuditKeys.all, 'critical', days] as const,
+    queryKey: [...queryKeys.audit.events.all, 'critical', days] as const,
     queryFn: () => adminAuditService.getCriticalLogs(days),
     staleTime: 60000, // 1 minute
   });
@@ -64,7 +61,7 @@ export const useCriticalLogs = (days: number = 7) => {
  */
 export const useFailedLoginAttempts = (hours: number = 24) => {
   return useQuery({
-    queryKey: [...adminAuditKeys.all, 'failed-logins', hours] as const,
+    queryKey: [...queryKeys.audit.events.all, 'failed-logins', hours] as const,
     queryFn: () => adminAuditService.getFailedLoginAttempts(hours),
     staleTime: 30000,
     refetchInterval: 60000, // Monitor failed logins closely
@@ -76,7 +73,7 @@ export const useFailedLoginAttempts = (hours: number = 24) => {
  */
 export const useUserActionHistory = (userId: string | undefined, days: number = 30) => {
   return useQuery({
-    queryKey: [...adminAuditKeys.all, 'user-history', userId, days] as const,
+    queryKey: [...queryKeys.audit.events.all, 'user-history', userId, days] as const,
     queryFn: () => adminAuditService.getUserActionHistory(userId!, days),
     enabled: !!userId,
     staleTime: 60000,
@@ -88,7 +85,7 @@ export const useUserActionHistory = (userId: string | undefined, days: number =
  */
 export const useSearchAuditLogs = (searchTerm: string | undefined) => {
   return useQuery({
-    queryKey: [...adminAuditKeys.all, 'search', searchTerm] as const,
+    queryKey: [...queryKeys.audit.events.all, 'search', searchTerm] as const,
     queryFn: () => adminAuditService.searchAuditLogs(searchTerm!),
     enabled: !!searchTerm && searchTerm.length >= 3, // Only search if 3+ chars
     staleTime: 30000,
@@ -178,7 +175,7 @@ export const useSecurityMonitoring = () => {
  */
 export const useRealTimeAuditLogs = (filters?: AuditLogFilters, refreshInterval: number = 5000) => {
   return useQuery({
-    queryKey: [...adminAuditKeys.all, 'realtime', filters] as const,
+    queryKey: [...queryKeys.audit.events.all, 'realtime', filters] as const,
     queryFn: () => adminAuditService.getAuditLogs(filters),
     staleTime: 0, // Always consider stale for real-time
     refetchInterval: refreshInterval, // Default 5 seconds
diff --git a/src/domains/admin/hooks/useAdminRoles.hooks.ts b/src/domains/admin/hooks/useAdminRoles.hooks.ts
index d6fa743..ccaba96 100644
--- a/src/domains/admin/hooks/useAdminRoles.hooks.ts
+++ b/src/domains/admin/hooks/useAdminRoles.hooks.ts
@@ -5,6 +5,7 @@

 import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
 import { adminRoleService } from '../services';
+import { queryKeys } from '../../../services/api/queryClient';
 import type {
   ListRolesParams,
   GetRoleParams,
@@ -19,16 +20,10 @@ import type {
 } from '../types';

 // ============================================================================
-// Query Keys
+// Query Keys (Using centralized queryKeys from queryClient.ts)
 // ============================================================================

-export const adminRoleKeys = {
-  all: ['admin', 'roles'] as const,
-  lists: () => [...adminRoleKeys.all, 'list'] as const,
-  list: (params?: ListRolesParams) => [...adminRoleKeys.lists(), params] as const,
-  details: () => [...adminRoleKeys.all, 'detail'] as const,
-  detail: (name: string, params?: GetRoleParams) => [...adminRoleKeys.details(), name, params] as const,
-};
+// Query keys are now imported from centralized location

 // ============================================================================
 // Query Hooks
@@ -39,7 +34,7 @@ export const adminRoleKeys = {
  */
 export const useRoleList = (params?: ListRolesParams) => {
   return useQuery({
-    queryKey: adminRoleKeys.list(params),
+    queryKey: queryKeys.rbac.roles.list(params),
     queryFn: () => adminRoleService.listRoles(params),
     staleTime: 60000, // 1 minute - roles don't change often
   });
@@ -50,7 +45,7 @@ export const useRoleList = (params?: ListRolesParams) => {
  */
 export const useRole = (roleName: string | undefined, params?: GetRoleParams) => {
   return useQuery({
-    queryKey: adminRoleKeys.detail(roleName ?? '', params),
+    queryKey: queryKeys.rbac.roles.detail(roleName ?? ''),
     queryFn: () => adminRoleService.getRole(roleName!, params),
     enabled: !!roleName,
     staleTime: 60000, // 1 minute
@@ -62,7 +57,7 @@ export const useRole = (roleName: string | undefined, params?: GetRoleParams) =>
  */
 export const useRolesByLevel = (minLevel?: number, maxLevel?: number) => {
   return useQuery({
-    queryKey: [...adminRoleKeys.all, 'byLevel', minLevel, maxLevel] as const,
+    queryKey: [...queryKeys.rbac.roles.all, 'byLevel', minLevel, maxLevel] as const,
     queryFn: () => adminRoleService.getRolesByLevel(minLevel, maxLevel),
     staleTime: 60000,
   });
@@ -94,11 +89,11 @@ export const useCreateRole = () => {
     mutationFn: (data: CreateRoleRequest) => adminRoleService.createRole(data),
     onSuccess: (role: AdminRole) => {
       // Invalidate role lists
-      queryClient.invalidateQueries({ queryKey: adminRoleKeys.lists() });
+      queryClient.invalidateQueries({ queryKey: queryKeys.rbac.roles.lists() });

       // Add to cache
       queryClient.setQueryData(
-        adminRoleKeys.detail(role.role_name),
+        queryKeys.rbac.roles.detail(role.role_name),
         role
       );
     },
@@ -116,17 +111,17 @@ export const useUpdateRole = () => {
       adminRoleService.updateRole(roleName, data),
     onMutate: async ({ roleName, data }) => {
       // Cancel outgoing refetches
-      await queryClient.cancelQueries({ queryKey: adminRoleKeys.detail(roleName) });
+      await queryClient.cancelQueries({ queryKey: queryKeys.rbac.roles.detail(roleName) });

       // Snapshot previous value
       const previousRole = queryClient.getQueryData<AdminRole>(
-        adminRoleKeys.detail(roleName)
+        queryKeys.rbac.roles.detail(roleName)
       );

       // Optimistically update
       if (previousRole) {
         queryClient.setQueryData<AdminRole>(
-          adminRoleKeys.detail(roleName),
+          queryKeys.rbac.roles.detail(roleName),
           { ...previousRole, ...data }
         );
       }
@@ -137,17 +132,17 @@ export const useUpdateRole = () => {
       // Rollback on error
       if (context?.previousRole) {
         queryClient.setQueryData(
-          adminRoleKeys.detail(roleName),
+          queryKeys.rbac.roles.detail(roleName),
           context.previousRole
         );
       }
     },
     onSuccess: (_response: UpdateRoleResponse, { roleName }) => {
       // Invalidate to refetch
-      queryClient.invalidateQueries({ queryKey: adminRoleKeys.detail(roleName) });
+      queryClient.invalidateQueries({ queryKey: queryKeys.rbac.roles.detail(roleName) });

       // Invalidate lists
-      queryClient.invalidateQueries({ queryKey: adminRoleKeys.lists() });
+      queryClient.invalidateQueries({ queryKey: queryKeys.rbac.roles.lists() });
     },
   });
 };
@@ -163,10 +158,10 @@ export const useDeleteRole = () => {
       adminRoleService.deleteRole(roleName, options),
     onSuccess: (_response: DeleteRoleResponse, { roleName }) => {
       // Remove from cache
-      queryClient.removeQueries({ queryKey: adminRoleKeys.detail(roleName) });
+      queryClient.removeQueries({ queryKey: queryKeys.rbac.roles.detail(roleName) });

       // Invalidate lists
-      queryClient.invalidateQueries({ queryKey: adminRoleKeys.lists() });
+      queryClient.invalidateQueries({ queryKey: queryKeys.rbac.roles.lists() });
     },
   });
 };
@@ -181,8 +176,8 @@ export const useSafeDeleteRole = () => {
     mutationFn: ({ roleName, options }: { roleName: string; options?: DeleteRoleOptions }) =>
       adminRoleService.safeDeleteRole(roleName, options),
     onSuccess: (_response: DeleteRoleResponse, { roleName }) => {
-      queryClient.removeQueries({ queryKey: adminRoleKeys.detail(roleName) });
-      queryClient.invalidateQueries({ queryKey: adminRoleKeys.lists() });
+      queryClient.removeQueries({ queryKey: queryKeys.rbac.roles.detail(roleName) });
+      queryClient.invalidateQueries({ queryKey: queryKeys.rbac.roles.lists() });
     },
   });
 };
@@ -201,7 +196,7 @@ export const useAssignRoles = () => {
       queryClient.invalidateQueries({ queryKey: ['admin', 'users', 'detail', userId] });

       // Invalidate role queries if include_users was set
-      queryClient.invalidateQueries({ queryKey: adminRoleKeys.all });
+      queryClient.invalidateQueries({ queryKey: queryKeys.rbac.roles.all });
     },
   });
 };
diff --git a/src/domains/admin/hooks/useAdminUsers.hooks.ts b/src/domains/admin/hooks/useAdminUsers.hooks.ts
index 769b155..532b49e 100644
--- a/src/domains/admin/hooks/useAdminUsers.hooks.ts
+++ b/src/domains/admin/hooks/useAdminUsers.hooks.ts
@@ -5,6 +5,7 @@

 import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
 import { adminService } from '../services';
+import { queryKeys } from '../../../services/api/queryClient';
 import type {
   ListUsersFilters,
   CreateUserRequest,
@@ -16,16 +17,10 @@ import type {
 } from '../types';

 // ============================================================================
-// Query Keys
+// Query Keys (Using centralized queryKeys from queryClient.ts)
 // ============================================================================

-export const adminUserKeys = {
-  all: ['admin', 'users'] as const,
-  lists: () => [...adminUserKeys.all, 'list'] as const,
-  list: (filters?: ListUsersFilters) => [...adminUserKeys.lists(), filters] as const,
-  details: () => [...adminUserKeys.all, 'detail'] as const,
-  detail: (id: string) => [...adminUserKeys.details(), id] as const,
-};
+// Query keys are now imported from centralized location

 // ============================================================================
 // Query Hooks
@@ -36,7 +31,7 @@ export const adminUserKeys = {
  */
 export const useUserList = (filters?: ListUsersFilters) => {
   return useQuery({
-    queryKey: adminUserKeys.list(filters),
+    queryKey: queryKeys.users.list(filters),
     queryFn: () => adminService.listUsers(filters),
     staleTime: 30000, // 30 seconds
   });
@@ -47,7 +42,7 @@ export const useUserList = (filters?: ListUsersFilters) => {
  */
 export const useUser = (userId: string | undefined) => {
   return useQuery({
-    queryKey: adminUserKeys.detail(userId ?? ''),
+    queryKey: queryKeys.users.detail(userId ?? ''),
     queryFn: () => adminService.getUser(userId!),
     enabled: !!userId,
     staleTime: 60000, // 1 minute
@@ -71,11 +66,11 @@ export const useCreateUser = () => {
     },
     onSuccess: (user: AdminUser) => {
       // Invalidate user lists to refetch with new user
-      queryClient.invalidateQueries({ queryKey: adminUserKeys.lists() });
+      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });

       // Optimistically add to cache
       queryClient.setQueryData(
-        adminUserKeys.detail(user.user_id),
+        queryKeys.users.detail(user.user_id),
         user
       );
     },
@@ -95,17 +90,17 @@ export const useUpdateUser = () => {
     },
     onMutate: async ({ userId, data }) => {
       // Cancel outgoing refetches
-      await queryClient.cancelQueries({ queryKey: adminUserKeys.detail(userId) });
+      await queryClient.cancelQueries({ queryKey: queryKeys.users.detail(userId) });

       // Snapshot previous value
       const previousUser = queryClient.getQueryData<AdminUser>(
-        adminUserKeys.detail(userId)
+        queryKeys.users.detail(userId)
       );

       // Optimistically update
       if (previousUser) {
         queryClient.setQueryData<AdminUser>(
-          adminUserKeys.detail(userId),
+          queryKeys.users.detail(userId),
           { ...previousUser, ...data }
         );
       }
@@ -117,7 +112,7 @@ export const useUpdateUser = () => {
       const typedContext = context as { previousUser?: AdminUser } | undefined;
       if (typedContext?.previousUser) {
         queryClient.setQueryData(
-          adminUserKeys.detail(userId),
+          queryKeys.users.detail(userId),
           typedContext.previousUser
         );
       }
@@ -125,12 +120,12 @@ export const useUpdateUser = () => {
     onSuccess: (user: AdminUser, { userId }) => {
       // Update cache with server response
       queryClient.setQueryData(
-        adminUserKeys.detail(userId),
+        queryKeys.users.detail(userId),
         user
       );

       // Invalidate lists to reflect changes
-      queryClient.invalidateQueries({ queryKey: adminUserKeys.lists() });
+      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
     },
   });
 };
@@ -146,10 +141,10 @@ export const useDeleteUser = () => {
       adminService.deleteUser(userId, options),
     onSuccess: (_response, { userId }) => {
       // Remove from cache
-      queryClient.removeQueries({ queryKey: adminUserKeys.detail(userId) });
+      queryClient.removeQueries({ queryKey: queryKeys.users.detail(userId) });

       // Invalidate lists
-      queryClient.invalidateQueries({ queryKey: adminUserKeys.lists() });
+      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
     },
   });
 };
@@ -164,8 +159,8 @@ export const useSafeDeleteUser = (currentUserId: string) => {
     mutationFn: ({ userId, options }: { userId: string; options?: DeleteUserOptions }) =>
       adminService.safeDeleteUser(userId, currentUserId, options),
     onSuccess: (_response, { userId }) => {
-      queryClient.removeQueries({ queryKey: adminUserKeys.detail(userId) });
-      queryClient.invalidateQueries({ queryKey: adminUserKeys.lists() });
+      queryClient.removeQueries({ queryKey: queryKeys.users.detail(userId) });
+      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
     },
   });
 };
@@ -185,7 +180,7 @@ export const useBulkUserAction = () => {
       adminService.bulkUserAction(request),
     onSuccess: () => {
       // Invalidate all user queries after bulk action
-      queryClient.invalidateQueries({ queryKey: adminUserKeys.all });
+      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
     },
   });
 };
@@ -200,7 +195,7 @@ export const useBulkDeleteUsers = () => {
     mutationFn: ({ userIds, options }: { userIds: string[]; options?: DeleteUserOptions }) =>
       adminService.bulkDeleteUsers(userIds, options),
     onSuccess: () => {
-      queryClient.invalidateQueries({ queryKey: adminUserKeys.all });
+      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
     },
   });
 };
diff --git a/src/domains/admin/services/adminApprovalService.ts b/src/domains/admin/services/adminApprovalService.ts
index 41e2f58..ca7fee7 100644
--- a/src/domains/admin/services/adminApprovalService.ts
+++ b/src/domains/admin/services/adminApprovalService.ts
@@ -8,6 +8,7 @@
  */

 import { apiClient } from '../../../services/api/apiClient';
+import { unwrapResponse } from '../../../services/api/common';
 import type {
   ApproveUserRequest,
   ApproveUserResponse,
@@ -25,12 +26,7 @@ const API_PREFIX = '/api/v1/admin/users';
 // Response Adapter
 // ============================================================================

-function unwrapResponse<T>(response: unknown): T {
-  if (response && typeof response === 'object' && 'data' in response) {
-    return (response as { data: T }).data;
-  }
-  return response as T;
-}
+// unwrapResponse is now imported from common.ts

 // ============================================================================
 // Approval Endpoints
diff --git a/src/domains/admin/services/adminAuditService.ts b/src/domains/admin/services/adminAuditService.ts
index 0bc9fae..75fd6a0 100644
--- a/src/domains/admin/services/adminAuditService.ts
+++ b/src/domains/admin/services/adminAuditService.ts
@@ -8,6 +8,7 @@
  */

 import { apiClient } from '../../../services/api/apiClient';
+import { API_PREFIXES } from '../../../services/api/common';
 import type {
   AuditLog,
   AuditLogFilters,
@@ -15,7 +16,7 @@ import type {
   ExportAuditLogsRequest,
 } from '../types';

-const API_PREFIX = '/api/v1/admin/audit-logs';
+const API_PREFIX = API_PREFIXES.ADMIN_AUDIT;

 /**
  * Backend returns array with different field names (audit_id, user_id, etc.)
diff --git a/src/domains/admin/services/adminExportService.ts b/src/domains/admin/services/adminExportService.ts
index d0975dc..9c99364 100644
--- a/src/domains/admin/services/adminExportService.ts
+++ b/src/domains/admin/services/adminExportService.ts
@@ -9,8 +9,9 @@
  */

 import { apiClient } from '../../../services/api/apiClient';
+import { API_PREFIXES } from '../../../services/api/common';

-const API_PREFIX = '/api/v1/admin/export';
+const API_PREFIX = API_PREFIXES.ADMIN_EXPORT;

 export type ExportFormat = 'csv' | 'excel' | 'json';

diff --git a/src/domains/admin/services/adminRoleService.ts b/src/domains/admin/services/adminRoleService.ts
index 9f2cea9..4d35aa5 100644
--- a/src/domains/admin/services/adminRoleService.ts
+++ b/src/domains/admin/services/adminRoleService.ts
@@ -12,6 +12,7 @@
  */

 import { apiClient } from '../../../services/api/apiClient';
+import { unwrapResponse, API_PREFIXES } from '../../../services/api/common';
 import type {
   AdminRole,
   ListRolesParams,
@@ -28,18 +29,13 @@ import type {
   AssignRolesResponse,
 } from '../types';

-const API_PREFIX = '/api/v1/admin/rbac';
+const API_PREFIX = API_PREFIXES.ADMIN_RBAC;

 // ============================================================================
 // Response Adapter
 // ============================================================================

-function unwrapResponse<T>(response: unknown): T {
-  if (response && typeof response === 'object' && 'data' in response) {
-    return (response as { data: T }).data;
-  }
-  return response as T;
-}
+// unwrapResponse is now imported from common.ts

 // ============================================================================
 // Role Management Endpoints
diff --git a/src/domains/admin/services/adminService.ts b/src/domains/admin/services/adminService.ts
index 05741a0..37a309f 100644
--- a/src/domains/admin/services/adminService.ts
+++ b/src/domains/admin/services/adminService.ts
@@ -19,6 +19,7 @@
  */

 import { apiClient } from '../../../services/api/apiClient';
+import { unwrapResponse, API_PREFIXES } from '../../../services/api/common';
 import type {
   ListUsersFilters,
   ListUsersResponse,
@@ -36,23 +37,14 @@ import type {
   ExportUsersRequest,
 } from '../types';

-const API_PREFIX = '/api/v1/admin';
+const API_PREFIX = API_PREFIXES.ADMIN;

 // ============================================================================
 // Response Adapter (DRY Principle)
 // Handle both wrapped and unwrapped responses
 // ============================================================================

-/**
- * Unwrap ApiResponse<T> format to just T
- * Backend may return { success, message, data: {...} } or just {...}
- */
-function unwrapResponse<T>(response: unknown): T {
-  if (response && typeof response === 'object' && 'data' in response) {
-    return (response as { data: T }).data;
-  }
-  return response as T;
-}
+// unwrapResponse is now imported from common.ts

 // ============================================================================
 // User Management Endpoints
diff --git a/src/domains/auth/components/LoginForm.tsx b/src/domains/auth/components/LoginForm.tsx
index 6722ec2..28d2c90 100644
--- a/src/domains/auth/components/LoginForm.tsx
+++ b/src/domains/auth/components/LoginForm.tsx
@@ -5,9 +5,10 @@

 import { useState } from 'react';
 import { useLogin } from '../hooks/useAuth.hooks';
+import tokenService from '../services/tokenService';
 import Input from '../../../components/Input';
 import Button from '../../../components/Button';
-import type { LoginRequest } from '../types/auth.types';
+import type { LoginRequest, LoginResponseData } from '../types/auth.types';

 interface LoginFormProps {
   onSuccess?: () => void;
@@ -40,7 +41,23 @@ export function LoginForm({ onSuccess, onError, redirectTo = '/dashboard' }: Log
     };

     loginMutation.mutate(credentials, {
-      onSuccess: () => {
+      onSuccess: (data: LoginResponseData) => {
+        // Store tokens after successful login
+        tokenService.storeTokens({
+          access_token: data.access_token,
+          refresh_token: data.refresh_token,
+          token_type: data.token_type,
+          expires_in: data.expires_in,
+        });
+        
+        // Store user data
+        tokenService.storeUser({
+          user_id: data.user_id,
+          email: data.email,
+          roles: data.roles,
+          last_login_at: data.last_login_at,
+        });
+        
         onSuccess?.();
         if (redirectTo) {
           window.location.href = redirectTo;
diff --git a/src/domains/auth/context/AuthContext.tsx b/src/domains/auth/context/AuthContext.tsx
index 635e6e5..03ff3e1 100644
--- a/src/domains/auth/context/AuthContext.tsx
+++ b/src/domains/auth/context/AuthContext.tsx
@@ -88,7 +88,13 @@ export function AuthProvider({ children }: AuthProviderProps) {
    * Login - Set tokens and user in state & storage
    */
   const login = useCallback((tokens: AuthTokens, user: User) => {
-    authStorage.setTokens(tokens);
+    // Use tokenService.storeTokens to ensure expiry time is stored
+    tokenService.storeTokens({
+      access_token: tokens.access_token,
+      refresh_token: tokens.refresh_token,
+      token_type: tokens.token_type || 'bearer',
+      expires_in: tokens.expires_in || 3600, // Default 1 hour
+    });
     authStorage.setUser(user);

     // Compute permissions from user roles
@@ -114,7 +120,8 @@ export function AuthProvider({ children }: AuthProviderProps) {
         context: 'AuthContext.logout',
       });
     } finally {
-      // Always clear local state
+      // Always clear local state and storage
+      tokenService.clearTokens();
       authStorage.clear();
       setState({
         user: null,
@@ -132,7 +139,8 @@ export function AuthProvider({ children }: AuthProviderProps) {
    * Check Auth - Validate current session
    */
   const checkAuth = useCallback(async () => {
-    const accessToken = authStorage.getAccessToken();
+    // Use tokenService for consistent token retrieval
+    const accessToken = tokenService.getAccessToken();

     if (!accessToken) {
       setState(prev => ({ ...prev, isAuthenticated: false, isLoading: false, permissions: [] }));
@@ -140,9 +148,7 @@ export function AuthProvider({ children }: AuthProviderProps) {
     }

     try {
-      // Verify token by fetching current user profile
-      // Note: You'll need to add this endpoint or use an existing one
-      // For now, we'll just trust the token exists
+      // Verify token by checking stored user data
       const storedUser = authStorage.getUser();
       if (storedUser) {
         // Compute permissions from user roles
@@ -159,6 +165,7 @@ export function AuthProvider({ children }: AuthProviderProps) {
         logger().warn('Token exists but no user data found', {
           context: 'AuthContext.checkAuth',
         });
+        tokenService.clearTokens();
         authStorage.clear();
         setState({
           user: null,
@@ -172,6 +179,7 @@ export function AuthProvider({ children }: AuthProviderProps) {
         context: 'AuthContext.checkAuth',
       });
       // Token is invalid, clear everything
+      tokenService.clearTokens();
       authStorage.clear();
       setState({
         user: null,
@@ -196,11 +204,13 @@ export function AuthProvider({ children }: AuthProviderProps) {
     try {
       const response = await tokenService.refreshToken(refreshToken);

-      // Update tokens in storage
+      // Update tokens in storage using tokenService for consistency
       if (response.data) {
-        authStorage.setTokens({
+        tokenService.storeTokens({
           access_token: response.data.access_token,
           refresh_token: response.data.refresh_token,
+          token_type: response.data.token_type || 'bearer',
+          expires_in: response.data.expires_in || 3600,
         });
       }

diff --git a/src/domains/auth/services/authService.ts b/src/domains/auth/services/authService.ts
index 7fa29d8..9009276 100644
--- a/src/domains/auth/services/authService.ts
+++ b/src/domains/auth/services/authService.ts
@@ -5,6 +5,7 @@
 // ========================================

 import { apiClient } from '../../../services/api/apiClient';
+import { unwrapResponse, API_PREFIXES } from '../../../services/api/common';
 import type {
   LoginRequest,
   LoginResponse,
@@ -27,23 +28,14 @@ import type {
   RefreshTokenResponseData,
 } from '../types/auth.types';

-const API_PREFIX = '/api/v1/auth';
+const API_PREFIX = API_PREFIXES.AUTH;

 // ========================================
 // Response Adapters (DRY Principle)
 // Handle both wrapped and unwrapped responses
 // ========================================

-/**
- * Unwrap ApiResponse<T> format to just T
- * Backend may return { success, message, data: {...} } or just {...}
- */
-function unwrapResponse<T>(response: unknown): T {
-  if (response && typeof response === 'object' && 'data' in response) {
-    return (response as { data: T }).data;
-  }
-  return response as T;
-}
+// unwrapResponse is now imported from common.ts

 /**
  * POST /api/v1/auth/login
diff --git a/src/domains/auth/services/tokenService.ts b/src/domains/auth/services/tokenService.ts
index e4476f5..078fa37 100644
--- a/src/domains/auth/services/tokenService.ts
+++ b/src/domains/auth/services/tokenService.ts
@@ -4,6 +4,7 @@
 // ========================================

 import { apiClient } from '../../../services/api/apiClient';
+import { API_PREFIXES } from '../../../services/api/common';
 import type {
   RefreshTokenResponse,
 } from '../types/auth.types';
@@ -14,7 +15,7 @@ import type {
   TokenStorage,
 } from '../types/token.types';

-const API_PREFIX = '/api/v1/auth';
+const API_PREFIX = API_PREFIXES.AUTH;
 // Storage keys MUST match authStorage.ts (single source of truth)
 const TOKEN_STORAGE_KEY = 'access_token';
 const REFRESH_TOKEN_STORAGE_KEY = 'refresh_token';
diff --git a/src/services/api/apiClient.ts b/src/services/api/apiClient.ts
index 7274950..ba49956 100644
--- a/src/services/api/apiClient.ts
+++ b/src/services/api/apiClient.ts
@@ -3,10 +3,11 @@
 // SINGLE SOURCE OF TRUTH for API configuration
 // ========================================

-import axios, { type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios';
+import axios from 'axios';
+import type { InternalAxiosRequestConfig, AxiosRequestConfig } from 'axios';
+import { APIError } from './common';
 import tokenService from '../../domains/auth/services/tokenService';
 import { logger } from '@/core/logging';
-import { APIError } from '@/core/error';

 const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

@@ -177,7 +178,7 @@ apiClient.interceptors.response.use(
         const refreshToken = tokenService.getRefreshToken();

         if (!refreshToken) {
-          throw new Error('No refresh token available');
+          throw new APIError('No refresh token available');
         }

         // Call refresh token endpoint
@@ -186,7 +187,7 @@ apiClient.interceptors.response.use(
         // Extract token data from response
         const tokenData = response.data;
         if (!tokenData) {
-          throw new Error('Invalid refresh token response');
+          throw new APIError('Invalid refresh token response');
         }

         // Store new tokens
PS D:\code\reactjs\usermn1> 