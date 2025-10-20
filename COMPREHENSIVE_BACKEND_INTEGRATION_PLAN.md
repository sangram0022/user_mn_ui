# 🎯 COMPREHENSIVE BACKEND API INTEGRATION PLAN

## Zero Tolerance - Every Detail Implemented

**Created:** October 20, 2025  
**Status:** 🚀 COMPREHENSIVE ANALYSIS COMPLETE  
**Requirement:** No 0.001% mistake permitted - Every tiny detail implemented

---

## 📋 EXECUTIVE SUMMARY

### Current State Analysis

After deep analysis of all 8 backend API documentation files and current frontend implementation:

**✅ COMPLETED (86%):**

- 48/48 API endpoints defined in client.ts
- Basic type definitions created
- Core authentication flow implemented
- User management features functional
- Error handling framework in place

**❌ CRITICAL GAPS IDENTIFIED (14%):**

1. **Error Code Localization:** Backend sends codes, but UI shows generic messages
2. **UI-Side Filtering:** Missing comprehensive filters for list APIs
3. **GDPR Features:** Export/Delete incomplete
4. **Audit Log Viewer:** No advanced filtering UI
5. **Health Monitoring:** No visual dashboard
6. **Role Management:** UI incomplete
7. **Validation:** Client-side validation incomplete
8. **Rate Limiting:** No UI feedback
9. **Security:** CSRF handling incomplete
10. **Testing:** Integration tests missing

---

## 🔴 CRITICAL REQUIREMENT: LOCALIZATION-FIRST APPROACH

### Backend → Frontend Message Flow

**BACKEND SENDS:**

```json
{
  "error_code": "INVALID_CREDENTIALS",
  "message": "Invalid email or password", // ← NEVER DISPLAY THIS
  "status_code": 401
}
```

**FRONTEND DOES:**

```typescript
// ✅ CORRECT: Map error_code to localized message
const errorCode = error.error_code; // "INVALID_CREDENTIALS"
const localizedMessage = t(`errors.${errorCode}`); // From en/errors.json

// ❌ WRONG: Display backend message directly
const message = error.message; // DON'T DO THIS!
```

**WHY:**

- ✅ Multi-language support (en, fr, es, de, etc.)
- ✅ Consistent UI messages
- ✅ Customizable per locale
- ✅ Backend-independent UI

**IMPLEMENTATION:**

```typescript
// src/locales/en/errors.json
{
  "errors": {
    "INVALID_CREDENTIALS": "Invalid email or password. Please check your credentials and try again.",
    "USER_NOT_FOUND": "User account not found. Please check your email address.",
    "EMAIL_NOT_VERIFIED": "Please verify your email address before logging in.",
    "RATE_LIMIT_EXCEEDED": "Too many requests. Please wait {{retry_after}} seconds.",
    "TOKEN_INVALID": "Your session has expired. Please log in again.",
    // ... all 50+ error codes mapped
  }
}
```

---

## 📊 DETAILED GAP ANALYSIS

### 1. Error Code Localization System ❌ CRITICAL

**Backend API Error Codes (50+ codes):**

```
AUTH_*: INVALID_CREDENTIALS, EMAIL_NOT_VERIFIED, TOKEN_INVALID, etc.
USER_*: USER_NOT_FOUND, USER_ALREADY_EXISTS, USER_INACTIVE, etc.
ADMIN_*: PERMISSION_DENIED, USER_LIST_FAILED, CREATION_FAILED, etc.
VALIDATION_*: VALIDATION_ERROR, INVALID_EMAIL, INVALID_PASSWORD, etc.
SYSTEM_*: DATABASE_ERROR, INTERNAL_ERROR, SERVICE_UNAVAILABLE, etc.
```

**Current State:**

- ✅ errors.json has 30+ error codes
- ❌ Missing 20+ backend error codes
- ❌ No systematic mapping in API client
- ❌ Some components display backend messages directly

**Required Implementation:**

**Step 1: Complete errors.json**

```json
{
  "errors": {
    // ✅ EXISTING (keep these)
    "INVALID_CREDENTIALS": "Invalid email or password...",
    "USER_NOT_FOUND": "User account not found...",

    // ❌ MISSING - ADD THESE:

    // Authentication Errors
    "LOGIN_FAILED": "Login failed due to system error. Please try again.",
    "REGISTRATION_FAILED": "Registration failed. Please try again or contact support.",
    "PASSWORD_RESET_FAILED": "Password reset failed. Please request a new reset link.",
    "EMAIL_VERIFICATION_FAILED": "Email verification failed. Please try again.",
    "LOGOUT_FAILED": "Logout failed. Your session may have already expired.",
    "TOKEN_REFRESH_FAILED": "Token refresh failed. Please log in again.",

    // User Errors
    "USER_ALREADY_EXISTS": "An account with this email already exists. Please log in or use a different email.",
    "USER_INACTIVE": "Your account is inactive. Please contact support for assistance.",
    "PROFILE_NOT_FOUND": "User profile not found. Please contact support.",
    "PROFILE_RETRIEVAL_FAILED": "Failed to load profile. Please refresh and try again.",
    "PROFILE_UPDATE_FAILED": "Failed to update profile. Please try again.",
    "SELF_DELETE_FORBIDDEN": "You cannot delete your own admin account. Please have another administrator perform this action.",
    "NOT_VERIFIED": "Your email address is not verified. Please check your inbox for the verification link.",

    // Admin Errors
    "PERMISSION_DENIED": "You don't have permission to perform this action. Admin access required.",
    "USER_LIST_FAILED": "Failed to load user list. Please try again.",
    "CREATION_FAILED": "Failed to create user. Please verify the information and try again.",
    "USER_DETAIL_FAILED": "Failed to load user details. Please try again.",
    "USER_UPDATE_FAILED": "Failed to update user. Please try again.",
    "USER_DELETE_FAILED": "Failed to delete user. Please try again.",
    "APPROVAL_FAILED": "Failed to approve user. Please try again.",

    // Validation Errors
    "VALIDATION_ERROR": "Validation failed. Please check the form for errors.",
    "INVALID_EMAIL": "Please enter a valid email address.",
    "INVALID_PASSWORD": "Password must be at least 8 characters with uppercase, lowercase, and a number.",
    "INVALID_NAME": "Name must contain only letters and spaces.",
    "FIELD_REQUIRED": "This field is required.",
    "FIELD_TOO_LONG": "This field exceeds the maximum length of {{max}} characters.",
    "FIELD_TOO_SHORT": "This field must be at least {{min}} characters.",

    // Rate Limiting
    "RATE_LIMIT_EXCEEDED": "Too many requests. Please wait {{retry_after}} seconds before trying again.",

    // Audit Errors
    "INVALID_RANGE": "Invalid date range. Start date must be before end date.",
    "RETRIEVAL_FAILED": "Failed to retrieve data. Please try again.",

    // System Errors
    "DATABASE_ERROR": "Database connection error. Please try again later.",
    "INTERNAL_ERROR": "An internal server error occurred. Please try again later.",
    "SERVICE_UNAVAILABLE": "Service is temporarily unavailable. Please try again later.",

    // Role Errors
    "ROLE_NOT_FOUND": "Role not found. Please verify the role name.",
    "ROLE_ALREADY_EXISTS": "A role with this name already exists.",
    "SYSTEM_ROLE_DELETE_FORBIDDEN": "System roles (user, admin, auditor) cannot be deleted.",
    "ROLE_IN_USE": "This role is assigned to users and cannot be deleted.",

    // GDPR Errors
    "EXPORT_FAILED": "Data export failed. Please try again or contact support.",
    "DELETE_CONFIRMATION_INVALID": "Invalid confirmation. You must type 'DELETE MY ACCOUNT' exactly.",
    "ACCOUNT_DELETION_FAILED": "Account deletion failed. Please contact support."
  }
}
```

**Step 2: Create Error Mapping Utility**

```typescript
// src/shared/utils/errorMapper.ts
import type { ApiError } from '@lib/api/error';

/**
 * Map backend error codes to localized messages
 *
 * Backend sends: { error_code: "INVALID_CREDENTIALS", message: "..." }
 * Frontend displays: t('errors.INVALID_CREDENTIALS')
 */
export function mapErrorToLocalizedMessage(
  error: ApiError,
  t: (key: string, params?: Record<string, unknown>) => string
): string {
  const errorCode = error.code || 'UNKNOWN_ERROR';

  // Build localization key
  const locKey = `errors.${errorCode}`;

  // Get interpolation params from error data
  const params = error.data || {};

  // Return localized message
  const message = t(locKey, params);

  // Fallback if translation missing
  if (message === locKey) {
    return t('errors.DEFAULT');
  }

  return message;
}

/**
 * Map validation field errors to localized messages
 */
export function mapValidationErrors(
  errors: Array<{ field: string; message: string; code: string }>,
  t: (key: string) => string
): Record<string, string> {
  const result: Record<string, string> = {};

  for (const error of errors) {
    const locKey = `validation.${error.code.toUpperCase()}`;
    result[error.field] = t(locKey);
  }

  return result;
}
```

**Step 3: Update API Client**

```typescript
// src/lib/api/client.ts
import { mapErrorToLocalizedMessage } from '@shared/utils/errorMapper';

class ApiClient {
  private async request<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    try {
      // ... existing request logic
    } catch (error) {
      // ✅ DON'T display error.message directly
      // ✅ DO store error_code for localization
      const apiError = normalizeApiError(error);
      throw apiError; // Contains error_code
    }
  }
}
```

**Step 4: Update Components**

```typescript
// Example: Login Component
function LoginForm() {
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (email: string, password: string) => {
    try {
      await apiClient.login(email, password);
    } catch (err) {
      // ✅ CORRECT: Use localization
      const localizedError = mapErrorToLocalizedMessage(err as ApiError, t);
      setError(localizedError);

      // ❌ WRONG: Don't do this
      // setError((err as ApiError).message);
    }
  };

  return (
    <form>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {/* ... */}
    </form>
  );
}
```

---

### 2. UI-Side Filtering for List APIs ❌ CRITICAL

**Backend APIs Returning Lists:**

1. `GET /admin/users` - List all users
2. `GET /admin/roles` - List all roles
3. `GET /audit/logs` - Audit log entries
4. `GET /admin/audit-logs` - Admin audit logs

**Backend Query Parameters:**

```typescript
// GET /admin/users?page=1&limit=20&role=user&is_active=true
interface AdminUsersQuery {
  page?: number;
  limit?: number;
  role?: 'user' | 'admin' | 'auditor';
  is_active?: boolean;
}

// GET /audit/logs?action=USER_LOGIN&start_date=...&end_date=...&severity=info
interface AuditLogsQueryParams {
  action?: string;
  resource?: string;
  user_id?: string;
  start_date?: string; // ISO 8601
  end_date?: string; // ISO 8601
  severity?: 'info' | 'warning' | 'error' | 'critical';
  page?: number;
  limit?: number;
}
```

**Required Implementation:**

**Step 1: User List Filter Component**

```typescript
// src/domains/admin/components/UserListFilters.tsx
interface UserListFilters {
  search: string;
  role: 'all' | 'user' | 'admin' | 'auditor';
  status: 'all' | 'active' | 'inactive';
  verified: 'all' | 'verified' | 'unverified';
  approved: 'all' | 'approved' | 'pending' | 'rejected';
  sortBy: 'email' | 'created_at' | 'last_login';
  sortOrder: 'asc' | 'desc';
}

export function UserListFilters({
  filters,
  onFilterChange,
}: {
  filters: UserListFilters;
  onFilterChange: (filters: UserListFilters) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="filters-container">
      {/* Search Input */}
      <input
        type="text"
        placeholder={t('common.search')}
        value={filters.search}
        onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
      />

      {/* Role Filter */}
      <select
        value={filters.role}
        onChange={(e) => onFilterChange({ ...filters, role: e.target.value as any })}
      >
        <option value="all">{t('users.allRoles')}</option>
        <option value="user">{t('roles.userRole')}</option>
        <option value="admin">{t('roles.adminRole')}</option>
        <option value="auditor">{t('roles.auditorRole')}</option>
      </select>

      {/* Status Filter */}
      <select
        value={filters.status}
        onChange={(e) => onFilterChange({ ...filters, status: e.target.value as any })}
      >
        <option value="all">{t('users.allStatuses')}</option>
        <option value="active">{t('common.active')}</option>
        <option value="inactive">{t('common.inactive')}</option>
      </select>

      {/* Verification Filter */}
      <select
        value={filters.verified}
        onChange={(e) => onFilterChange({ ...filters, verified: e.target.value as any })}
      >
        <option value="all">{t('users.allVerificationStatuses')}</option>
        <option value="verified">{t('auth.emailVerified')}</option>
        <option value="unverified">{t('auth.emailNotVerified')}</option>
      </select>

      {/* Approval Filter */}
      <select
        value={filters.approved}
        onChange={(e) => onFilterChange({ ...filters, approved: e.target.value as any })}
      >
        <option value="all">{t('users.allApprovalStatuses')}</option>
        <option value="approved">{t('common.approved')}</option>
        <option value="pending">{t('common.pending')}</option>
        <option value="rejected">{t('common.rejected')}</option>
      </select>

      {/* Sort Controls */}
      <select
        value={filters.sortBy}
        onChange={(e) => onFilterChange({ ...filters, sortBy: e.target.value as any })}
      >
        <option value="email">{t('users.email')}</option>
        <option value="created_at">{t('users.createdAt')}</option>
        <option value="last_login">{t('users.lastLogin')}</option>
      </select>

      <button
        onClick={() => onFilterChange({
          ...filters,
          sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc'
        })}
      >
        {filters.sortOrder === 'asc' ? '↑' : '↓'}
      </button>

      {/* Clear Filters */}
      <button onClick={() => onFilterChange(getDefaultFilters())}>
        {t('common.clear')}
      </button>
    </div>
  );
}
```

**Step 2: Client-Side Filtering Logic**

```typescript
// src/domains/admin/hooks/useUserListFilters.ts
export function useUserListFilters(users: UserListResponse[]) {
  const [filters, setFilters] = useState<UserListFilters>(getDefaultFilters());

  const filteredUsers = useMemo(() => {
    let result = [...users];

    // Search filter (client-side)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (user) =>
          user.email.toLowerCase().includes(searchLower) ||
          user.first_name.toLowerCase().includes(searchLower) ||
          user.last_name.toLowerCase().includes(searchLower)
      );
    }

    // Role filter
    if (filters.role !== 'all') {
      result = result.filter((user) => user.role === filters.role);
    }

    // Status filter
    if (filters.status !== 'all') {
      const isActive = filters.status === 'active';
      result = result.filter((user) => user.is_active === isActive);
    }

    // Verification filter
    if (filters.verified !== 'all') {
      const isVerified = filters.verified === 'verified';
      result = result.filter((user) => user.is_verified === isVerified);
    }

    // Approval filter
    if (filters.approved !== 'all') {
      if (filters.approved === 'approved') {
        result = result.filter((user) => user.is_approved === true);
      } else if (filters.approved === 'pending') {
        result = result.filter((user) => user.is_approved === false && !user.rejected_at);
      } else if (filters.approved === 'rejected') {
        result = result.filter((user) => user.rejected_at != null);
      }
    }

    // Sort
    result.sort((a, b) => {
      const aVal = a[filters.sortBy];
      const bVal = b[filters.sortBy];
      const order = filters.sortOrder === 'asc' ? 1 : -1;
      return aVal > bVal ? order : -order;
    });

    return result;
  }, [users, filters]);

  return { filters, setFilters, filteredUsers };
}
```

**Step 3: Audit Log Advanced Filters**

```typescript
// src/domains/admin/components/AuditLogFilters.tsx
interface AuditLogFilters {
  action: string;
  resource: string;
  user_id: string;
  start_date: string;
  end_date: string;
  severity: 'all' | 'info' | 'warning' | 'error' | 'critical';
  outcome: 'all' | 'success' | 'failure';
  search: string; // Search IP, user agent, etc.
}

export function AuditLogFilters({
  filters,
  onFilterChange,
  availableActions,
  availableResources,
}: {
  filters: AuditLogFilters;
  onFilterChange: (filters: AuditLogFilters) => void;
  availableActions: string[];
  availableResources: string[];
}) {
  const { t } = useTranslation();

  return (
    <div className="audit-filters">
      {/* Date Range */}
      <div className="date-range">
        <label>{t('audit.startDate')}</label>
        <input
          type="datetime-local"
          value={filters.start_date}
          onChange={(e) => onFilterChange({ ...filters, start_date: e.target.value })}
        />

        <label>{t('audit.endDate')}</label>
        <input
          type="datetime-local"
          value={filters.end_date}
          onChange={(e) => onFilterChange({ ...filters, end_date: e.target.value })}
        />

        {/* Quick Date Ranges */}
        <button onClick={() => setLast24Hours()}>Last 24h</button>
        <button onClick={() => setLast7Days()}>Last 7 days</button>
        <button onClick={() => setLast30Days()}>Last 30 days</button>
      </div>

      {/* Action Filter */}
      <select
        value={filters.action}
        onChange={(e) => onFilterChange({ ...filters, action: e.target.value })}
      >
        <option value="">{t('audit.allActions')}</option>
        {availableActions.map(action => (
          <option key={action} value={action}>{action}</option>
        ))}
      </select>

      {/* Resource Filter */}
      <select
        value={filters.resource}
        onChange={(e) => onFilterChange({ ...filters, resource: e.target.value })}
      >
        <option value="">{t('audit.allResources')}</option>
        {availableResources.map(resource => (
          <option key={resource} value={resource}>{resource}</option>
        ))}
      </select>

      {/* Severity Filter */}
      <select
        value={filters.severity}
        onChange={(e) => onFilterChange({ ...filters, severity: e.target.value as any })}
      >
        <option value="all">{t('audit.allSeverities')}</option>
        <option value="info">{t('audit.infoEvents')}</option>
        <option value="warning">{t('audit.warningEvents')}</option>
        <option value="error">{t('audit.errorEvents')}</option>
        <option value="critical">{t('audit.criticalEvents')}</option>
      </select>

      {/* Outcome Filter */}
      <select
        value={filters.outcome}
        onChange={(e) => onFilterChange({ ...filters, outcome: e.target.value as any })}
      >
        <option value="all">{t('audit.allOutcomes')}</option>
        <option value="success">{t('audit.successEvents')}</option>
        <option value="failure">{t('audit.failedEvents')}</option>
      </select>

      {/* User ID Filter */}
      <input
        type="text"
        placeholder={t('audit.filterByUserId')}
        value={filters.user_id}
        onChange={(e) => onFilterChange({ ...filters, user_id: e.target.value })}
      />

      {/* Search (IP, User Agent) */}
      <input
        type="text"
        placeholder={t('audit.searchLogs')}
        value={filters.search}
        onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
      />

      {/* Export Filtered Data */}
      <button onClick={() => exportFilteredLogs()}>
        {t('audit.exportLogs')}
      </button>
    </div>
  );
}
```

---

### 3. GDPR Compliance Features ❌ HIGH PRIORITY

**Backend GDPR Endpoints:**

```
POST /gdpr/export/my-data - Export personal data (JSON/CSV)
DELETE /gdpr/delete/my-account - Delete account permanently
GET /gdpr/export/status/{export_id} - Check export status
```

**Required Implementation:**

**Step 1: GDPR Data Export Component**

```typescript
// src/domains/profile/components/GDPRDataExport.tsx
export function GDPRDataExport() {
  const { t } = useTranslation();
  const [format, setFormat] = useState<'json' | 'csv'>('json');
  const [includeAuditLogs, setIncludeAuditLogs] = useState(true);
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [exportId, setExportId] = useState<string | null>(null);

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await apiClient.exportGDPRData({
        format,
        include_audit_logs: includeAuditLogs,
        include_metadata: includeMetadata,
      });

      // Backend returns file directly with headers:
      // Content-Disposition: attachment; filename="gdpr_export_usr_123_exp_abc.json"
      // X-Export-ID: exp_abc123
      // X-Record-Count: 142

      const exportId = response.headers['X-Export-ID'];
      const recordCount = response.headers['X-Record-Count'];
      const filename = extractFilename(response.headers['Content-Disposition']);

      // Download file
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(url);

      toast.success(t('gdpr.exportSuccess', { count: recordCount }));
      setExportId(exportId);
    } catch (error) {
      const localizedError = mapErrorToLocalizedMessage(error as ApiError, t);
      toast.error(localizedError);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="gdpr-export">
      <h2>{t('gdpr.exportPersonalData')}</h2>
      <p>{t('gdpr.exportDescription')}</p>

      {/* Format Selection */}
      <div className="format-selection">
        <label>
          <input
            type="radio"
            value="json"
            checked={format === 'json'}
            onChange={() => setFormat('json')}
          />
          {t('bulk.jsonFormat')}
        </label>
        <label>
          <input
            type="radio"
            value="csv"
            checked={format === 'csv'}
            onChange={() => setFormat('csv')}
          />
          {t('bulk.csvFormat')}
        </label>
      </div>

      {/* Options */}
      <div className="export-options">
        <label>
          <input
            type="checkbox"
            checked={includeAuditLogs}
            onChange={(e) => setIncludeAuditLogs(e.target.checked)}
          />
          {t('gdpr.includeAuditLogs')}
        </label>
        <label>
          <input
            type="checkbox"
            checked={includeMetadata}
            onChange={(e) => setIncludeMetadata(e.target.checked)}
          />
          {t('gdpr.includeMetadata')}
        </label>
      </div>

      {/* Export Button */}
      <button
        onClick={handleExport}
        disabled={exporting}
        className="btn-primary"
      >
        {exporting ? t('common.processing') : t('gdpr.exportData')}
      </button>

      {/* Export ID (for tracking) */}
      {exportId && (
        <div className="export-info">
          <p>{t('gdpr.exportId')}: {exportId}</p>
        </div>
      )}

      {/* GDPR Info */}
      <div className="gdpr-info">
        <h3>{t('gdpr.yourRights')}</h3>
        <ul>
          <li>{t('gdpr.rightToAccess')}</li>
          <li>{t('gdpr.rightToPortability')}</li>
          <li>{t('gdpr.rightToRectification')}</li>
          <li>{t('gdpr.rightToErasure')}</li>
        </ul>
      </div>
    </div>
  );
}
```

**Step 2: GDPR Account Deletion Component**

```typescript
// src/domains/profile/components/GDPRAccountDeletion.tsx
export function GDPRAccountDeletion() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');
  const [reason, setReason] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [understood, setUnderstood] = useState(false);

  const REQUIRED_CONFIRMATION = 'DELETE MY ACCOUNT';

  const handleDelete = async () => {
    if (confirmationText !== REQUIRED_CONFIRMATION) {
      toast.error(t('gdpr.invalidConfirmation'));
      return;
    }

    if (!understood) {
      toast.error(t('gdpr.mustUnderstandWarning'));
      return;
    }

    setDeleting(true);
    try {
      const response = await apiClient.deleteGDPRAccount({
        confirmation: confirmationText,
        reason: reason || undefined,
      });

      // Response: {
      //   deletion_id: "del_xyz789",
      //   user_id: "usr_123456",
      //   deletion_date: "2025-10-19T10:30:00Z",
      //   records_deleted: 142,
      //   categories_deleted: ["user_profile", "activity_logs", ...],
      //   anonymization_applied: true
      // }

      toast.success(t('gdpr.accountDeletedSuccess', {
        count: response.records_deleted
      }));

      // Log out and redirect
      await apiClient.logout();
      navigate('/account-deleted');
    } catch (error) {
      const localizedError = mapErrorToLocalizedMessage(error as ApiError, t);
      toast.error(localizedError);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="gdpr-deletion">
      <div className="danger-zone">
        <h2 className="text-red-600">{t('gdpr.dangerZone')}</h2>
        <p>{t('gdpr.deleteAccountWarning')}</p>

        {!showConfirmation ? (
          <button
            onClick={() => setShowConfirmation(true)}
            className="btn-danger"
          >
            {t('gdpr.deleteMyAccount')}
          </button>
        ) : (
          <div className="deletion-confirmation">
            {/* Warnings */}
            <div className="warnings">
              <h3>{t('gdpr.beforeYouProceed')}</h3>
              <ul>
                <li>⚠️ {t('gdpr.warningPermanent')}</li>
                <li>⚠️ {t('gdpr.warningDataLoss')}</li>
                <li>⚠️ {t('gdpr.warningAuditRetention')}</li>
                <li>⚠️ {t('gdpr.warningNoUndo')}</li>
              </ul>
            </div>

            {/* What Gets Deleted */}
            <div className="deletion-details">
              <h3>{t('gdpr.whatGetsDeleted')}</h3>
              <ul>
                <li>✅ {t('gdpr.personalInformation')}</li>
                <li>✅ {t('gdpr.activityHistory')}</li>
                <li>✅ {t('gdpr.preferences')}</li>
                <li>⚠️ {t('gdpr.auditLogsAnonymized')}</li>
              </ul>
            </div>

            {/* Reason (Optional) */}
            <div className="deletion-reason">
              <label>{t('gdpr.deletionReason')} ({t('common.optional')})</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                maxLength={500}
                placeholder={t('gdpr.reasonPlaceholder')}
              />
            </div>

            {/* Understanding Checkbox */}
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={understood}
                onChange={(e) => setUnderstood(e.target.checked)}
              />
              {t('gdpr.iUnderstandConsequences')}
            </label>

            {/* Confirmation Text */}
            <div className="confirmation-input">
              <label>
                {t('gdpr.typeToConfirm', { text: REQUIRED_CONFIRMATION })}
              </label>
              <input
                type="text"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                placeholder={REQUIRED_CONFIRMATION}
                className={confirmationText === REQUIRED_CONFIRMATION ? 'valid' : 'invalid'}
              />
            </div>

            {/* Buttons */}
            <div className="button-group">
              <button
                onClick={() => setShowConfirmation(false)}
                className="btn-secondary"
                disabled={deleting}
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleDelete}
                disabled={
                  deleting ||
                  confirmationText !== REQUIRED_CONFIRMATION ||
                  !understood
                }
                className="btn-danger"
              >
                {deleting ? t('common.processing') : t('gdpr.permanentlyDelete')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

### 4. Health Monitoring Dashboard ❌ HIGH PRIORITY

**Backend Health Endpoints:**

```
GET /health/ - Basic health check
GET /health/ready - Readiness probe
GET /health/live - Liveness probe
GET /health/detailed - Detailed health status
GET /health/database - Database health
GET /health/system - System resources (CPU, memory, disk)
```

**Required Implementation:**

```typescript
// src/domains/admin/components/HealthMonitoringDashboard.tsx
export function HealthMonitoringDashboard() {
  const { t } = useTranslation();
  const [health, setHealth] = useState<DetailedHealthResponse | null>(null);
  const [dbHealth, setDbHealth] = useState<DatabaseHealthResponse | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchHealthData = async () => {
    try {
      const [detailedHealth, database, system] = await Promise.all([
        apiClient.detailedHealthCheck(),
        apiClient.databaseHealthCheck(),
        apiClient.systemHealthCheck(),
      ]);

      setHealth(detailedHealth);
      setDbHealth(database);
      setSystemHealth(system);
    } catch (error) {
      toast.error(t('errors.HEALTH_CHECK_FAILED'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData();

    if (autoRefresh) {
      const interval = setInterval(fetchHealthData, 30000); // Refresh every 30s
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  if (loading) return <Spinner />;

  return (
    <div className="health-dashboard">
      <div className="dashboard-header">
        <h1>{t('health.healthMonitoring')}</h1>
        <div className="controls">
          <label>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            {t('health.autoRefresh')}
          </label>
          <button onClick={fetchHealthData}>{t('common.refresh')}</button>
        </div>
      </div>

      {/* Overall Status */}
      <HealthStatusCard
        status={health?.status}
        environment={health?.environment}
        uptime={health?.uptime_seconds}
        lastCheck={health?.timestamp}
      />

      {/* Database Health */}
      <DatabaseHealthCard
        status={dbHealth?.status}
        connected={dbHealth?.connected}
        responseTime={dbHealth?.response_time_ms}
      />

      {/* System Resources */}
      <SystemResourcesCard
        cpu={systemHealth?.cpu_usage_percent}
        memory={systemHealth?.memory_usage_percent}
        disk={systemHealth?.disk_usage_percent}
      />

      {/* Detailed Checks */}
      <SubsystemChecksGrid checks={health?.checks} />
    </div>
  );
}
```

---

### 5. Complete Implementation Checklist

**Phase 1: Localization (Week 1) ✅ HIGHEST PRIORITY**

- [ ] Add all 50+ backend error codes to errors.json
- [ ] Create errorMapper utility
- [ ] Update API client to use error codes
- [ ] Update all components to use localized messages
- [ ] Add validation message localization
- [ ] Test with missing translations
- [ ] Add fallback messages

**Phase 2: UI Filtering (Week 1-2)**

- [ ] Create UserListFilters component
- [ ] Create AuditLogFilters component
- [ ] Create RoleListFilters component
- [ ] Implement client-side filtering logic
- [ ] Add search functionality
- [ ] Add sort functionality
- [ ] Add export filtered data
- [ ] Test performance with large datasets

**Phase 3: GDPR Features (Week 2)**

- [ ] Implement GDPR data export flow
- [ ] Implement GDPR account deletion flow
- [ ] Add confirmation dialogs
- [ ] Add file download handling
- [ ] Add export status checking
- [ ] Test data export (JSON/CSV)
- [ ] Test account deletion flow

**Phase 4: Health Monitoring (Week 2-3)**

- [ ] Create health dashboard component
- [ ] Implement auto-refresh
- [ ] Add system metrics visualization
- [ ] Add database health monitoring
- [ ] Add alerting for critical issues
- [ ] Test with different health states

**Phase 5: Role Management (Week 3)**

- [ ] Complete role list UI
- [ ] Implement create role form
- [ ] Implement edit role form
- [ ] Implement delete role confirmation
- [ ] Add permission matrix
- [ ] Add role assignment UI
- [ ] Test role operations

**Phase 6: Security & Validation (Week 3-4)**

- [ ] Add client-side validation for all forms
- [ ] Implement CSRF token handling
- [ ] Add request sanitization
- [ ] Add rate limit detection
- [ ] Add rate limit UI feedback
- [ ] Add retry logic
- [ ] Test security features

**Phase 7: Testing (Week 4)**

- [ ] Write unit tests for utilities
- [ ] Write integration tests for API client
- [ ] Write component tests
- [ ] Write E2E tests for critical flows
- [ ] Test error scenarios
- [ ] Test edge cases
- [ ] Performance testing

**Phase 8: Documentation (Week 4)**

- [ ] Add JSDoc comments
- [ ] Update README
- [ ] Create integration guide
- [ ] Document error codes
- [ ] Document validation rules
- [ ] Create user guide
- [ ] Add inline code comments

---

## 📊 SUCCESS CRITERIA

### Zero Tolerance Achieved When:

✅ All 50+ backend error codes mapped to localized messages  
✅ All components display localized messages (never backend messages)  
✅ All list APIs have comprehensive UI filters  
✅ GDPR export/delete flows fully functional  
✅ Health monitoring dashboard operational  
✅ Role management UI complete  
✅ Client-side validation matches backend 100%  
✅ Rate limiting handled with user feedback  
✅ Integration tests pass 100%  
✅ Documentation complete

### Quality Metrics:

- **Type Safety:** 100% (no `any` types)
- **Test Coverage:** >90%
- **Localization Coverage:** 100% (all messages localized)
- **API Coverage:** 100% (all 48 endpoints used)
- **Validation Coverage:** 100% (all backend rules matched)
- **Error Handling:** 100% (all error codes handled)

---

## 🚀 NEXT STEPS

**IMMEDIATE ACTION (DO NOW):**

1. ✅ Read this comprehensive plan
2. ✅ Review backend API docs
3. ⏭️ Start Phase 1: Error Code Localization (CRITICAL)
4. ⏭️ Create branch: `feat/comprehensive-backend-integration`
5. ⏭️ Begin implementation

**DEVELOPMENT WORKFLOW:**

```bash
# 1. Create feature branch
git checkout -b feat/comprehensive-backend-integration

# 2. Implement Phase 1 (Localization)
# - Update errors.json
# - Create errorMapper utility
# - Update components

# 3. Test thoroughly
npm test
npm run build

# 4. Commit with detailed messages
git add .
git commit -m "feat: Complete error code localization system

- Add all 50+ backend error codes to errors.json
- Create errorMapper utility for code-to-message mapping
- Update API client to use error codes
- Update all components to use localized messages
- Add validation message localization
- Add fallback for missing translations

Closes #XXX"

# 5. Repeat for each phase
```

---

**STATUS:** 🎯 READY TO IMPLEMENT  
**PRIORITY:** 🔴 CRITICAL - START IMMEDIATELY  
**GOAL:** 100% Backend Integration - Zero Tolerance for Errors
