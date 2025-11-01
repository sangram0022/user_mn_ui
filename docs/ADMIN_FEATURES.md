# 🔐 Admin Features Documentation

**Complete Admin Functionality Guide**

---

## 📋 Overview

This document details ALL admin functionality for the User Management System.

### **Admin Capabilities**

1. ✅ **List Users** - View all users with pagination & filters
2. ✅ **Create New User** - Create user with auto-generated password
3. ✅ **Approve User** - Approve pending user registrations
4. ✅ **Delete Users** - Soft or hard delete users
5. ✅ **Assign Roles** - Assign initial role to users
6. ✅ **Change Roles** - Modify existing user roles
7. ✅ **Send Password** - Resend auto-generated password via email
8. ✅ **Bulk Operations** - Approve/delete multiple users at once

---

## 🏗️ Architecture

### **Admin Domain Structure**

```
domains/
├── users/                     # User Management (Admin operations)
│   ├── pages/
│   │   ├── UserListPage.tsx      # Main admin page
│   │   ├── CreateUserPage.tsx    # Create new user
│   │   ├── ApproveUsersPage.tsx  # Approve pending
│   │   └── UserDetailPage.tsx    # View/Edit user
│   ├── components/
│   │   ├── UserTable.tsx         # Table with inline actions
│   │   ├── RoleSelector.tsx      # Dropdown to assign/change roles
│   │   ├── BulkActions.tsx       # Checkbox selection + bulk ops
│   │   ├── UserFilters.tsx       # Filter by role, status, date
│   │   └── PasswordActions.tsx   # Send/resend password
│   ├── hooks/
│   │   ├── useUsers.ts           # CRUD operations
│   │   ├── useUserApproval.ts    # Approval logic
│   │   └── useRoleAssignment.ts  # Role management
│   └── services/
│       └── userService.ts        # API calls
│
└── admin/                     # Admin Dashboard & Settings
    ├── pages/
    │   ├── DashboardPage.tsx     # Overview stats
    │   ├── RolesPage.tsx         # Manage roles
    │   ├── AuditLogsPage.tsx     # System logs
    │   └── SettingsPage.tsx      # System settings
    └── components/
        ├── StatsCard.tsx
        └── ActivityFeed.tsx
```

---

## 🎯 Feature Implementation

### **1. List Users**

**File:** `domains/users/pages/UserListPage.tsx`

```typescript
import { useUsers } from '../hooks/useUsers';
import { UserTable } from '../components/UserTable';
import { UserFilters } from '../components/UserFilters';
import { BulkActions } from '../components/BulkActions';

export default function UserListPage() {
  const {
    users,
    pagination,
    filters,
    selectedUsers,
    isLoading,
    updateFilters,
    toggleUserSelection,
    selectAllUsers,
  } = useUsers();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">User Management</h1>
        <Button asChild>
          <Link to="/users/create">
            <Plus className="w-4 h-4 mr-2" />
            Create User
          </Link>
        </Button>
      </div>

      <UserFilters filters={filters} onChange={updateFilters} />
      
      {selectedUsers.length > 0 && (
        <BulkActions 
          selectedCount={selectedUsers.length} 
          userIds={selectedUsers}
        />
      )}

      <UserTable
        users={users}
        selectedUsers={selectedUsers}
        onToggleSelection={toggleUserSelection}
        onSelectAll={selectAllUsers}
        isLoading={isLoading}
      />

      <Pagination {...pagination} />
    </div>
  );
}
```

**Hook:** `domains/users/hooks/useUsers.ts`

```typescript
import { useState, useEffect } from 'react';
import { userService } from '../services/userService';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
  });
  const [filters, setFilters] = useState<UserFilters>({
    role: null,
    status: null,
    search: '',
  });
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      setIsLoading(true);
      try {
        const response = await userService.listUsers({
          page: pagination.page,
          pageSize: pagination.pageSize,
          ...filters,
        });
        
        setUsers(response.data);
        setPagination(prev => ({ ...prev, total: response.total }));
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUsers();
  }, [pagination.page, pagination.pageSize, filters]);

  const updateFilters = (newFilters: Partial<UserFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to page 1
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAllUsers = (select: boolean) => {
    setSelectedUsers(select ? users.map(u => u.id) : []);
  };

  return {
    users,
    pagination,
    filters,
    selectedUsers,
    isLoading,
    updateFilters,
    toggleUserSelection,
    selectAllUsers,
  };
}
```

---

### **2. Create New User**

**File:** `domains/users/pages/CreateUserPage.tsx`

```typescript
import { useActionState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../services/userService';

interface FormState {
  error: string | null;
  success: boolean;
  password?: string;
}

export default function CreateUserPage() {
  const navigate = useNavigate();
  
  const [state, formAction, isPending] = useActionState(
    async (_prevState: FormState, formData: FormData): Promise<FormState> => {
      try {
        const userData = {
          name: formData.get('name') as string,
          email: formData.get('email') as string,
          role: formData.get('role') as string,
          sendEmail: formData.get('sendEmail') === 'on',
        };

        const response = await userService.createUser(userData);
        
        // Backend generates password and optionally sends email
        // Password returned ONLY if sendEmail is false
        
        if (!userData.sendEmail && response.temporaryPassword) {
          return {
            success: true,
            error: null,
            password: response.temporaryPassword,
          };
        }

        // Redirect after showing success
        setTimeout(() => navigate('/users'), 2000);
        
        return { success: true, error: null };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to create user',
        };
      }
    },
    { success: false, error: null }
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Create New User</h1>

      <form action={formAction} className="glass p-8 rounded-2xl space-y-6">
        <Input
          label="Full Name"
          name="name"
          required
          placeholder="John Doe"
        />

        <Input
          label="Email Address"
          name="email"
          type="email"
          required
          placeholder="john@example.com"
        />

        <div>
          <label className="block text-sm font-medium mb-2">Role</label>
          <select
            name="role"
            required
            className="w-full px-4 py-2 border rounded-lg"
          >
            <option value="">Select role...</option>
            <option value="user">User</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="sendEmail"
            defaultChecked
            className="w-4 h-4"
          />
          <span className="text-sm">
            Send welcome email with auto-generated password
          </span>
        </label>

        {state.error && (
          <Alert variant="error">{state.error}</Alert>
        )}

        {state.success && !state.password && (
          <Alert variant="success">
            ✅ User created successfully! Welcome email sent.
          </Alert>
        )}

        {state.success && state.password && (
          <Alert variant="warning">
            ⚠️ User created. Temporary password: <code>{state.password}</code>
            <br />
            <small>Share this password securely with the user.</small>
          </Alert>
        )}

        <div className="flex gap-3">
          <Button
            type="submit"
            variant="primary"
            disabled={isPending}
            loading={isPending}
          >
            Create User
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/users')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
```

---

### **3. Approve User**

**File:** `domains/users/hooks/useUserApproval.ts`

```typescript
import { useOptimistic } from 'react';
import { useState } from 'react';
import { userService } from '../services/userService';

export function useUserApproval() {
  const [users, setUsers] = useState<User[]>([]);
  const [optimisticUsers, approveOptimistic] = useOptimistic(
    users,
    (state, userId: string) =>
      state.map(user =>
        user.id === userId ? { ...user, status: 'active' } : user
      )
  );

  const approveUser = async (userId: string) => {
    // Instant UI update
    approveOptimistic(userId);

    try {
      // Save to backend
      const updatedUser = await userService.approveUser(userId);
      
      // Update actual state
      setUsers(prev =>
        prev.map(u => (u.id === userId ? updatedUser : u))
      );
      
      toast.success('User approved successfully');
    } catch (error) {
      // Auto-reverts on error
      toast.error('Failed to approve user');
    }
  };

  const bulkApprove = async (userIds: string[]) => {
    try {
      await userService.bulkApprove(userIds);
      
      // Refresh users list
      setUsers(prev =>
        prev.map(u =>
          userIds.includes(u.id) ? { ...u, status: 'active' } : u
        )
      );
      
      toast.success(`${userIds.length} users approved`);
    } catch (error) {
      toast.error('Failed to approve users');
    }
  };

  return {
    users: optimisticUsers,
    approveUser,
    bulkApprove,
  };
}
```

---

### **4. Delete Users**

**Component:** `domains/users/components/DeleteUserButton.tsx`

```typescript
import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { userService } from '../services/userService';
import { Modal } from '@/components/Modal';
import { Button } from '@/components/Button';

interface DeleteUserButtonProps {
  userId: string;
  userName: string;
  onSuccess: () => void;
}

export function DeleteUserButton({ 
  userId, 
  userName, 
  onSuccess 
}: DeleteUserButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [deleteType, setDeleteType] = useState<'soft' | 'hard'>('soft');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await userService.deleteUser(userId, deleteType === 'hard');
      toast.success(`User ${deleteType === 'soft' ? 'deactivated' : 'deleted'}`);
      onSuccess();
      setShowModal(false);
    } catch (error) {
      toast.error('Failed to delete user');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="p-2 text-semantic-error hover:bg-red-50 rounded-lg"
        aria-label="Delete user"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Delete User"
      >
        <div className="space-y-4">
          <p>Are you sure you want to delete <strong>{userName}</strong>?</p>

          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={deleteType === 'soft'}
                onChange={() => setDeleteType('soft')}
                className="w-4 h-4"
              />
              <div>
                <div className="font-medium">Soft Delete (Recommended)</div>
                <div className="text-sm text-gray-600">
                  User is deactivated but data is preserved
                </div>
              </div>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={deleteType === 'hard'}
                onChange={() => setDeleteType('hard')}
                className="w-4 h-4"
              />
              <div>
                <div className="font-medium">Hard Delete</div>
                <div className="text-sm text-gray-600">
                  ⚠️ Permanently removes all user data (irreversible)
                </div>
              </div>
            </label>
          </div>

          <div className="flex gap-3">
            <Button
              variant="error"
              onClick={handleDelete}
              disabled={isDeleting}
              loading={isDeleting}
            >
              Delete User
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
```

---

### **5. Assign/Change Role**

**Component:** `domains/users/components/RoleSelector.tsx`

```typescript
import { useState } from 'react';
import { userService } from '../services/userService';
import { ROLES } from '@/core/auth/roles';

interface RoleSelectorProps {
  userId: string;
  currentRole: string;
  onSuccess: () => void;
}

export function RoleSelector({ 
  userId, 
  currentRole, 
  onSuccess 
}: RoleSelectorProps) {
  const [selectedRole, setSelectedRole] = useState(currentRole);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleRoleChange = async (newRole: string) => {
    if (newRole === currentRole) return;

    setIsUpdating(true);
    try {
      if (currentRole) {
        // Change existing role
        await userService.changeRole(userId, newRole);
      } else {
        // Assign initial role
        await userService.assignRole(userId, newRole);
      }

      setSelectedRole(newRole);
      toast.success('Role updated successfully');
      onSuccess();
    } catch (error) {
      toast.error('Failed to update role');
      setSelectedRole(currentRole); // Revert
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <select
      value={selectedRole}
      onChange={(e) => handleRoleChange(e.target.value)}
      disabled={isUpdating}
      className="px-3 py-1.5 border rounded-lg text-sm"
    >
      <option value="">No Role</option>
      <option value={ROLES.USER}>User</option>
      <option value={ROLES.MANAGER}>Manager</option>
      <option value={ROLES.ADMIN}>Admin</option>
    </select>
  );
}
```

---

### **6. Send/Resend Password**

**Component:** `domains/users/components/PasswordActions.tsx`

```typescript
import { useState } from 'react';
import { Mail } from 'lucide-react';
import { userService } from '../services/userService';

interface PasswordActionsProps {
  userId: string;
  userEmail: string;
}

export function PasswordActions({ userId, userEmail }: PasswordActionsProps) {
  const [isSending, setIsSending] = useState(false);

  const handleResendPassword = async () => {
    setIsSending(true);
    try {
      await userService.resendPassword(userId);
      toast.success(`Password sent to ${userEmail}`);
    } catch (error) {
      toast.error('Failed to send password');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <button
      onClick={handleResendPassword}
      disabled={isSending}
      className="p-2 text-brand-primary hover:bg-blue-50 rounded-lg"
      aria-label="Resend password"
      title="Send auto-generated password via email"
    >
      <Mail className="w-4 h-4" />
    </button>
  );
}
```

---

### **7. Bulk Operations**

**Component:** `domains/users/components/BulkActions.tsx`

```typescript
import { useState } from 'react';
import { Check, Trash2 } from 'lucide-react';
import { userService } from '../services/userService';

interface BulkActionsProps {
  selectedCount: number;
  userIds: string[];
}

export function BulkActions({ selectedCount, userIds }: BulkActionsProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBulkApprove = async () => {
    setIsProcessing(true);
    try {
      await userService.bulkApprove(userIds);
      toast.success(`${selectedCount} users approved`);
      // Parent component should refresh list
    } catch (error) {
      toast.error('Failed to approve users');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedCount} users?`)) return;

    setIsProcessing(true);
    try {
      await userService.bulkDelete(userIds);
      toast.success(`${selectedCount} users deleted`);
    } catch (error) {
      toast.error('Failed to delete users');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <span className="font-medium">
        {selectedCount} user{selectedCount !== 1 ? 's' : ''} selected
      </span>

      <div className="flex gap-2 ml-auto">
        <Button
          size="sm"
          variant="primary"
          onClick={handleBulkApprove}
          disabled={isProcessing}
        >
          <Check className="w-4 h-4 mr-1" />
          Approve All
        </Button>

        <Button
          size="sm"
          variant="error"
          onClick={handleBulkDelete}
          disabled={isProcessing}
        >
          <Trash2 className="w-4 h-4 mr-1" />
          Delete All
        </Button>
      </div>
    </div>
  );
}
```

---

## 🔐 Permission System

### **Role Hierarchy**

```typescript
// core/auth/roles.ts
export const ROLE_HIERARCHY = {
  super_admin: 5,
  admin: 4,
  manager: 3,
  user: 2,
  guest: 1,
};

export function canManageRole(userRole: string, targetRole: string): boolean {
  return ROLE_HIERARCHY[userRole] > ROLE_HIERARCHY[targetRole];
}
```

### **Usage in Components**

```typescript
import { canManageRole } from '@/core/auth/roles';
import { useAuth } from '@/domains/auth';

function UserRow({ user }: UserRowProps) {
  const { user: currentUser } = useAuth();
  
  const canManage = canManageRole(currentUser.role, user.role);

  return (
    <tr>
      <td>{user.name}</td>
      <td>
        {canManage ? (
          <RoleSelector userId={user.id} currentRole={user.role} />
        ) : (
          <Badge>{user.role}</Badge>
        )}
      </td>
    </tr>
  );
}
```

---

## 🎨 UI/UX Best Practices

### **Loading States**

```typescript
// Show skeleton while loading
{isLoading ? (
  <TableSkeleton rows={10} />
) : (
  <UserTable users={users} />
)}
```

### **Empty States**

```typescript
// No users found
{users.length === 0 && (
  <EmptyState
    icon={<Users className="w-12 h-12" />}
    title="No users found"
    description="Create your first user to get started"
    action={<Button asChild><Link to="/users/create">Create User</Link></Button>}
  />
)}
```

### **Confirmation Modals**

```typescript
// Destructive actions always need confirmation
const handleDelete = async () => {
  const confirmed = await showConfirmDialog({
    title: 'Delete User',
    message: 'This action cannot be undone.',
    confirmText: 'Delete',
    variant: 'error',
  });

  if (confirmed) {
    // Proceed with deletion
  }
};
```

---

## 📊 Admin Dashboard

### **Stats Overview**

```typescript
// domains/admin/pages/DashboardPage.tsx
export default function DashboardPage() {
  const { stats } = useAdminData();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Users"
          value={stats.totalUsers}
          trend={stats.usersTrend}
          icon={<Users />}
        />
        <StatsCard
          title="Pending Approval"
          value={stats.pendingUsers}
          trend={stats.pendingTrend}
          icon={<Clock />}
        />
        <StatsCard
          title="Active Today"
          value={stats.activeToday}
          trend={stats.activeTrend}
          icon={<Activity />}
        />
        <StatsCard
          title="New This Month"
          value={stats.newThisMonth}
          trend={stats.newTrend}
          icon={<TrendingUp />}
        />
      </div>

      <ActivityFeed activities={stats.recentActivity} />
    </div>
  );
}
```

---

## ✅ Implementation Checklist

- [ ] Create user service with all CRUD operations
- [ ] Implement user list with pagination
- [ ] Add user creation form with auto-password
- [ ] Build approval workflow
- [ ] Add role assignment/change functionality
- [ ] Implement delete (soft/hard) with confirmation
- [ ] Add bulk operations (approve, delete)
- [ ] Create permission guards
- [ ] Build admin dashboard with stats
- [ ] Add audit logging
- [ ] Write tests for all operations

---

**Ready to implement!** 🚀
