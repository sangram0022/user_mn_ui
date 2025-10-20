# Quick Start Guide - Backend Integration Components

This guide shows you how to integrate the newly created components into your application.

## 📦 Components Overview

### ✅ Phase 1: Error Handling

- `errorMapper.ts` - Error localization utility

### ✅ Phase 2: Filtering

- `UserListFilters.tsx` + `useUserListFilters.ts` - User list filtering
- `AuditLogFilters.tsx` + `useAuditLogFilters.ts` - Audit log filtering

### ✅ Phase 3: GDPR

- `GDPRDataExport.tsx` - Data export component
- `GDPRAccountDeletion.tsx` - Account deletion component

### ✅ Phase 4: Monitoring

- `HealthMonitoringDashboard.tsx` - System health dashboard

---

## 🚀 Integration Examples

### 1. Using Error Mapper

**In API Client** (`src/lib/api/client.ts`):

```typescript
import { mapApiErrorToMessage } from '@shared/utils/errorMapper';

// In your error handling:
catch (error) {
  const userMessage = mapApiErrorToMessage(error);
  toast.error(userMessage);
}
```

**In React Components**:

```typescript
import { useErrorMapper } from '@shared/utils/errorMapper';

function MyComponent() {
  const { mapApiError, formatErrors } = useErrorMapper();

  try {
    await apiCall();
  } catch (error) {
    const message = mapApiError(error);
    toast.error(message);

    // For validation errors:
    const { message, fieldErrors } = formatErrors(error);
    setFormErrors(fieldErrors);
  }
}
```

---

### 2. Using User List Filters

**In Admin User List Page**:

```typescript
import { UserListFilters } from '@domains/admin/components/UserListFilters';
import { useUserListFilters, downloadUsersAsCSV } from '@domains/admin/hooks/useUserListFilters';
import { useState } from 'react';

function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({
    searchText: '',
    role: 'all',
    status: 'all',
    verified: 'all',
    approved: 'all',
    sortBy: 'created_at',
    sortOrder: 'desc',
  });

  const { filteredUsers, filteredCount, totalCount } = useUserListFilters({
    users,
    filters,
  });

  return (
    <div>
      <UserListFilters
        onFilterChange={setFilters}
        totalCount={totalCount}
        filteredCount={filteredCount}
      />

      <button onClick={() => downloadUsersAsCSV(filteredUsers)}>
        Export to CSV
      </button>

      <UserList users={filteredUsers} />
    </div>
  );
}
```

---

### 3. Using Audit Log Filters

**In Admin Audit Log Page**:

```typescript
import { AuditLogFilters } from '@domains/admin/components/AuditLogFilters';
import {
  useAuditLogFilters,
  downloadAuditLogsAsCSV,
  getAuditLogStats,
} from '@domains/admin/hooks/useAuditLogFilters';
import { useState } from 'react';

function AdminAuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    action: 'all',
    resourceType: 'all',
    severity: 'all',
    outcome: 'all',
    userId: '',
    sortOrder: 'desc',
  });

  const { filteredLogs, filteredCount, totalCount } = useAuditLogFilters({
    logs,
    filters,
  });

  const stats = getAuditLogStats(filteredLogs);

  return (
    <div>
      <AuditLogFilters
        onFilterChange={setFilters}
        totalCount={totalCount}
        filteredCount={filteredCount}
      />

      <div className="stats">
        Success Rate: {stats.successRate}%
        Total: {stats.total}
      </div>

      <button onClick={() => downloadAuditLogsAsCSV(filteredLogs, 'audit-logs.csv')}>
        Export to CSV
      </button>

      <AuditLogTable logs={filteredLogs} />
    </div>
  );
}
```

---

### 4. Using GDPR Components

**In Profile Settings Page**:

```typescript
import { GDPRDataExport } from '@domains/profile/components/GDPRDataExport';
import { GDPRAccountDeletion } from '@domains/profile/components/GDPRAccountDeletion';

function ProfileSettingsPage() {
  const navigate = useNavigate();

  const handleDeleteSuccess = () => {
    // Logout user
    logout();
    // Redirect to home
    navigate('/');
  };

  return (
    <div className="space-y-6">
      <h1>Privacy & Data</h1>

      <section>
        <h2>Export Your Data</h2>
        <GDPRDataExport />
      </section>

      <section>
        <h2>Delete Your Account</h2>
        <GDPRAccountDeletion onDeleteSuccess={handleDeleteSuccess} />
      </section>
    </div>
  );
}
```

---

### 5. Using Health Monitoring Dashboard

**In Admin Dashboard Page**:

```typescript
import { HealthMonitoringDashboard } from '@domains/admin/components/HealthMonitoringDashboard';

function AdminDashboardPage() {
  return (
    <div>
      <h1>System Dashboard</h1>

      <HealthMonitoringDashboard />

      {/* Other dashboard widgets */}
    </div>
  );
}
```

---

## 🔧 API Integration

### Connect to Real API Endpoints

Update these components to use your actual API client:

#### GDPR Data Export

```typescript
// In GDPRDataExport.tsx, replace mock call:
const response = await apiClient.gdprExport({
  format: options.format,
  include_audit_logs: options.includeAuditLogs,
  include_login_history: options.includeLoginHistory,
});
```

#### GDPR Account Deletion

```typescript
// In GDPRAccountDeletion.tsx, replace mock call:
const response = await apiClient.gdprDelete({
  confirmation: confirmationText,
});
```

#### Health Monitoring

```typescript
// In HealthMonitoringDashboard.tsx, replace mock call:
const response = await apiClient.getHealth();
setHealth(response);
```

---

## 🎨 Customization

### Styling

All components use Tailwind CSS and support dark mode. Customize by:

```typescript
// Change colors
className = 'bg-blue-600 hover:bg-blue-700'; // Change to your brand colors

// Change spacing
className = 'p-6'; // Adjust padding

// Change text size
className = 'text-xl'; // Adjust heading sizes
```

### Functionality

```typescript
// Change auto-refresh interval (Health Dashboard)
const AUTO_REFRESH_INTERVAL = 60000; // 60 seconds instead of 30

// Change CSV export format
const csvContent = exportUsersToCSV(users); // Modify CSV headers/fields

// Change filter defaults
const defaultFilters = {
  sortBy: 'email', // Default sort column
  sortOrder: 'asc', // Default sort order
};
```

---

## 📝 TypeScript Types

All components are fully typed. Import types as needed:

```typescript
import type { UserFilters } from '@domains/admin/components/UserListFilters';
import type { AuditLogFilters } from '@domains/admin/components/AuditLogFilters';
import type { BackendApiErrorResponse } from '@shared/types/api-backend.types';
```

---

## ✅ Checklist for Integration

- [ ] Import component into your page
- [ ] Add necessary state management
- [ ] Connect to actual API endpoints
- [ ] Test with real data
- [ ] Test error states
- [ ] Test loading states
- [ ] Test dark mode
- [ ] Test on mobile devices
- [ ] Add to navigation/routing
- [ ] Update documentation

---

## 🐛 Troubleshooting

### Error Mapper Not Working

```typescript
// Make sure you're importing from the correct path:
import { mapApiErrorToMessage } from '@shared/utils/errorMapper';

// Check that error has error_code field:
console.log(error.error_code); // Should be a string like 'INVALID_CREDENTIALS'
```

### Filters Not Updating

```typescript
// Make sure you're passing the filter state:
const [filters, setFilters] = useState(defaultFilters);

// And updating it in callback:
<UserListFilters onFilterChange={setFilters} />
```

### GDPR Components Not Working

```typescript
// Check that API client methods exist:
apiClient.gdprExport();
apiClient.gdprDelete();

// If not, add them to your API client
```

### Health Dashboard Showing Errors

```typescript
// Check that health endpoint is available:
GET /health

// And returns proper structure:
{
  status: 'healthy',
  database: { ... },
  system: { ... }
}
```

---

## 🎯 Best Practices

1. **Error Handling**: Always use `errorMapper` for user-facing errors
2. **Performance**: Use filtering hooks for client-side filtering (reduces backend load)
3. **UX**: Show loading states during async operations
4. **Accessibility**: Keep ARIA labels and keyboard support
5. **Security**: Require proper confirmation for destructive actions (account deletion)
6. **GDPR**: Keep legal compliance notices visible
7. **Testing**: Test all edge cases (empty lists, errors, no data)

---

## 📚 Additional Resources

- [Backend API Documentation](./backend_api_details/)
- [Implementation Progress](./IMPLEMENTATION_PROGRESS.md)
- [Session Summary](./SESSION_SUMMARY.md)
- [Comprehensive Plan](./COMPREHENSIVE_BACKEND_INTEGRATION_PLAN.md)

---

**Last Updated:** October 20, 2025
