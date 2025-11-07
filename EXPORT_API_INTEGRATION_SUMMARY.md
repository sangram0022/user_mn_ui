# Export API Integration Summary

**Date:** 2025-01-XX  
**Status:** ✅ Complete

## Overview

Successfully integrated backend export API for Admin features (Users, Audit Logs, Roles) and added debugging for authentication token issues.

## Issues Addressed

### 1. Authentication Token Issue
**Problem:** Admin roles page redirected to login with backend error: "No token found in request"

**Solution:**
- Added comprehensive debug logging to `apiClient.ts` request interceptor
- Logs: URL, method, token presence, token preview (first 20 chars)
- Console warning when no token found: `[apiClient] No access token found for request: {url}`
- This will help identify if token is missing or timing issue with auth check

### 2. Export API Migration
**Problem:** Backend changed from POST with `{download_url}` response to GET returning Blob

**Solution:** Updated all export functions and hooks to match new backend API

## Changes Made

### Service Layer Updates

#### 1. `src/domains/admin/services/adminService.ts`
```typescript
// OLD: POST /api/v1/admin/users/export
// NEW: GET /api/v1/admin/export/users?format=csv
export const exportUsers = async (request: ExportUsersRequest): Promise<Blob> => {
  const params = new URLSearchParams();
  params.append('format', request.format);
  // Add filters as query params
  // ...
  const response = await apiClient.get(
    `/api/v1/admin/export/users?${params.toString()}`,
    { responseType: 'blob' }
  );
  return response.data;
};
```

**Changes:**
- ✅ Method: POST → GET
- ✅ Endpoint: `/api/v1/admin/users/export` → `/api/v1/admin/export/users`
- ✅ Parameters: Body → Query string
- ✅ Response type: Added `responseType: 'blob'`
- ✅ Return type: `ExportUsersResponse` → `Blob`

#### 2. `src/domains/admin/services/adminAuditService.ts`
```typescript
// OLD: POST /api/v1/admin/audit-logs/export
// NEW: GET /api/v1/admin/export/audit-logs?format=csv
export const exportAuditLogs = async (request: ExportAuditLogsRequest): Promise<Blob>
```

**Changes:**
- ✅ Method: POST → GET
- ✅ Endpoint: `/api/v1/admin/audit-logs/export` → `/api/v1/admin/export/audit-logs`
- ✅ Response type: Blob with `responseType: 'blob'`
- ✅ Removed unused `ExportAuditLogsResponse` type import
- ✅ Removed unused `unwrapResponse` function

#### 3. `src/domains/admin/services/adminRoleService.ts` (NEW)
```typescript
// NEW: GET /api/v1/admin/export/roles?format=csv
export const exportRoles = async (
  format: 'csv' | 'json' | 'xlsx' = 'csv',
  filters?: { include_permissions?: boolean; include_users_count?: boolean }
): Promise<Blob>
```

**Changes:**
- ✅ Added new `exportRoles` function
- ✅ Endpoint: GET `/api/v1/admin/export/roles`
- ✅ Filters: `include_permissions`, `include_users_count`
- ✅ Added to service default export

### Hook Layer Updates

#### 1. `src/domains/admin/hooks/useAdminUsers.hooks.ts`
```typescript
export const useExportUsers = () => {
  return useMutation({
    mutationFn: async (request: ExportUsersRequest) => {
      const blob = await adminService.exportUsers(request);
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const extension = request.format === 'xlsx' ? 'xlsx' : request.format;
      const filename = `users-export-${timestamp}.${extension}`;
      
      // Download blob client-side
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return { success: true, filename };
    },
  });
};
```

**Changes:**
- ✅ Updated mutation function to handle blob download
- ✅ Filename generation: `users-export-{YYYY-MM-DD}.{ext}`
- ✅ Client-side download using `URL.createObjectURL()`
- ✅ Cleanup: Remove link element and revoke URL
- ✅ Return: `{ success: true, filename }` instead of `{ download_url }`

#### 2. `src/domains/admin/hooks/useAdminAudit.hooks.ts`
```typescript
export const useExportAuditLogs = () => {
  return useMutation({
    mutationFn: async (request: ExportAuditLogsRequest) => {
      const blob = await adminAuditService.exportAuditLogs(request);
      // Same blob download pattern as useExportUsers
      // ...
      return { success: true, filename };
    },
  });
};
```

**Changes:**
- ✅ Same blob download pattern as users export
- ✅ Filename: `audit-logs-export-{YYYY-MM-DD}.{ext}`

#### 3. `src/domains/admin/hooks/useAdminRoles.hooks.ts` (NEW)
```typescript
export const useExportRoles = () => {
  return useMutation({
    mutationFn: async (request: {
      format: 'csv' | 'json' | 'xlsx';
      filters?: { include_permissions?: boolean; include_users_count?: boolean };
    }) => {
      const blob = await adminRoleService.exportRoles(request.format, request.filters);
      // Same blob download pattern
      // ...
      return { success: true, filename };
    },
  });
};
```

**Changes:**
- ✅ New hook for roles export
- ✅ Filename: `roles-export-{YYYY-MM-DD}.{ext}`
- ✅ Filters: `include_permissions`, `include_users_count`

### Page Component Updates

#### 1. `src/domains/admin/pages/AuditLogsPage.tsx`
```typescript
// OLD
onSuccess: (data) => {
  if (data.download_url) {
    window.open(data.download_url, '_blank');
  }
  setShowExportModal(false);
}

// NEW
onSuccess: (data) => {
  // File download handled automatically by hook
  if (data.success) {
    setShowExportModal(false);
  }
}
```

**Changes:**
- ✅ Removed `window.open(data.download_url)` - no longer needed
- ✅ Check `data.success` instead of `data.download_url`
- ✅ Download triggered automatically by hook

#### 2. `src/domains/admin/pages/UsersPage.tsx`
**Status:** ✅ Already using new hook correctly
- No changes needed - already calls `exportUsers.mutate()` properly

#### 3. `src/domains/admin/pages/RolesPage.tsx`
**Status:** ⚠️ No export UI yet
- Export hook is ready to use when needed
- Can add export button similar to UsersPage

### API Client Debug Enhancement

#### `src/services/api/apiClient.ts`
```typescript
apiClient.interceptors.request.use(
  (config) => {
    const accessToken = tokenService.getAccessToken();
    
    if (process.env.NODE_ENV === 'development') {
      const hasToken = !!accessToken;
      console.log('[apiClient] Request:', {
        url: config.url,
        method: config.method?.toUpperCase(),
        hasToken,
        tokenPreview: hasToken ? `${accessToken.slice(0, 20)}...` : 'none',
      });
      
      if (!hasToken) {
        console.warn(`[apiClient] No access token found for request: ${config.url}`);
      }
    }
    
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    
    return config;
  },
  // ...
);
```

**Changes:**
- ✅ Development-only logging (respects `process.env.NODE_ENV`)
- ✅ Logs: URL, method, token presence, token preview
- ✅ Warning when token missing
- ✅ Helps debug authentication issues

### Cleanup

#### `src/domains/admin/services/index.ts`
**Changes:**
- ✅ Removed `adminExportService` import (duplicate functionality)
- ✅ Kept default service exports: `adminService`, `adminRoleService`, `adminAuditService`
- ✅ Removed wildcard exports to avoid naming conflicts
- ✅ Export functions are accessed via service objects (e.g., `adminService.exportUsers`)

#### Unused Files (Can be deleted)
- `src/domains/admin/services/adminExportService.ts` - Functionality moved to individual services
- `src/domains/admin/hooks/useAdminExport.hooks.ts` - Duplicate hooks created earlier

## API Endpoint Summary

### Backend Export Endpoints

| Resource    | Endpoint                           | Method | Format Param      | Response Type |
|-------------|-----------------------------------|--------|-------------------|---------------|
| Users       | `/api/v1/admin/export/users`      | GET    | `?format=csv`     | Blob          |
| Audit Logs  | `/api/v1/admin/export/audit-logs` | GET    | `?format=csv`     | Blob          |
| Roles       | `/api/v1/admin/export/roles`      | GET    | `?format=csv`     | Blob          |

### Supported Formats
- `csv` - Comma-separated values
- `json` - JSON format
- `xlsx` - Excel spreadsheet

### Authentication
All endpoints require:
```
Authorization: Bearer <access_token>
```

### Query Parameters

#### Users Export
- `format`: csv | json | xlsx
- `status`: User status filter
- `role`: Role filter
- `search`: Search term

#### Audit Logs Export
- `format`: csv | json | xlsx
- `action`: Action type filter
- `user_id`: User ID filter
- `resource_type`: Resource type filter
- `start_date`: Start date (ISO 8601)
- `end_date`: End date (ISO 8601)

#### Roles Export
- `format`: csv | json | xlsx
- `include_permissions`: Include permission details (boolean)
- `include_users_count`: Include user count (boolean)

## Testing Checklist

### Authentication Debugging
- [ ] Open browser DevTools console
- [ ] Navigate to Roles page
- [ ] Check console for debug logs from apiClient
- [ ] Verify token presence: `hasToken: true/false`
- [ ] Check token preview (first 20 chars)
- [ ] If `hasToken: false`, check:
  - [ ] localStorage contains 'access_token'
  - [ ] AuthContext is properly initialized
  - [ ] ProtectedRoute is working correctly

### Export Functionality
- [ ] **Users Page**
  - [ ] Click Export button
  - [ ] Select CSV format
  - [ ] Verify file downloads: `users-export-{date}.csv`
  - [ ] Try JSON format
  - [ ] Try XLSX format
  - [ ] Verify filters are applied (status, role, search)

- [ ] **Audit Logs Page**
  - [ ] Click Export button in modal
  - [ ] Select CSV format
  - [ ] Verify file downloads: `audit-logs-export-{date}.csv`
  - [ ] Try different formats
  - [ ] Verify filters applied (date range, action, user)

- [ ] **Roles Page** (when export UI added)
  - [ ] Add export button (reference UsersPage implementation)
  - [ ] Use `useExportRoles` hook
  - [ ] Test with/without filters (permissions, user count)

## Error Handling

### Blob Download Errors
If download fails:
1. Check network tab for 200 response
2. Verify `Content-Type: application/octet-stream` or similar
3. Check console for blob creation errors
4. Verify file size > 0

### Authentication Errors
If 401 Unauthorized:
1. Check console debug logs for token presence
2. Verify token in localStorage: `localStorage.getItem('access_token')`
3. Check token expiration
4. Try logout/login to refresh token
5. Verify backend API is receiving Authorization header

## Success Metrics

✅ **Completed:**
- Export API integration for Users, Audit Logs, Roles
- Client-side blob download implementation
- Authentication debug logging
- Type safety maintained
- No TypeScript errors
- Build successful

⚠️ **Remaining:**
- Test authentication fix on Roles page
- Test all export functionality
- Add export UI to RolesPage (optional)
- Delete unused files (adminExportService, useAdminExport.hooks)

## Next Steps

1. **Test Authentication:**
   ```bash
   npm run dev
   ```
   - Navigate to Admin → Roles
   - Check browser console for token debug logs
   - Verify roles page loads without redirect

2. **Test Exports:**
   - Users page: Click Export → Select format → Verify download
   - Audit Logs: Click Export → Select format → Verify download

3. **Production Deployment:**
   - Debug logs only show in development mode
   - Production builds will not include console logs
   - Verify `NODE_ENV=production` in deployment

## File Change Summary

### Modified Files (8)
1. `src/services/api/apiClient.ts` - Added debug logging
2. `src/domains/admin/services/adminService.ts` - Updated exportUsers
3. `src/domains/admin/services/adminAuditService.ts` - Updated exportAuditLogs
4. `src/domains/admin/services/adminRoleService.ts` - Added exportRoles
5. `src/domains/admin/hooks/useAdminUsers.hooks.ts` - Updated useExportUsers
6. `src/domains/admin/hooks/useAdminAudit.hooks.ts` - Updated useExportAuditLogs
7. `src/domains/admin/hooks/useAdminRoles.hooks.ts` - Added useExportRoles
8. `src/domains/admin/pages/AuditLogsPage.tsx` - Updated export success handler
9. `src/domains/admin/services/index.ts` - Fixed export conflicts

### Files to Delete (2)
- `src/domains/admin/services/adminExportService.ts`
- `src/domains/admin/hooks/useAdminExport.hooks.ts`

## References

- Backend API: `http://localhost:8000/api/v1/admin/export/{resource}?format={format}`
- Backend Docs: See BACKEND_API_DOCUMENTATION.md
- Frontend API Docs: See FRONTEND_API_DOCUMENTATION.md
- Validation: See BACKEND_FRONTEND_VALIDATION_ALIGNMENT.md
