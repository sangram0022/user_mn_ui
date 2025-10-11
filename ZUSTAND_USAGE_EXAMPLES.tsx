/* eslint-disable react-refresh/only-export-components */
/**
 * Zustand Store Usage Examples
 * 
 * Quick reference for using the new Zustand stores
 * Replaces Context API with better performance
 * 
 * @module examples/zustand-usage
 */

import { useAuthStore, useAuthActions, authSelectors } from '@domains/authentication/store';
import { useUserManagementStore } from '@domains/user-management/store';

// ============================================================================
// AUTHENTICATION STORE EXAMPLES
// ============================================================================

/**
 * Example 1: Full Store Access
 * 
 * Use this when you need multiple pieces of state
 * Re-renders when ANY auth state changes
 */
export function AuthStatusBadge() {
  const { user, isAuthenticated, isLoading, error } = useAuthStore();
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!isAuthenticated) return <div>Not logged in</div>;
  
  return <div>Welcome, {user?.email}!</div>;
}

/**
 * Example 2: Actions Only (Recommended for buttons)
 * 
 * Use this when you only need actions, no state
 * Component NEVER re-renders (best performance)
 */
export function LogoutButton() {
  const { logout } = useAuthActions();
  
  return (
    <button onClick={logout}>
      Logout
    </button>
  );
}

/**
 * Example 3: Selector-Based (Recommended for optimized reads)
 * 
 * Re-renders ONLY when the selected value changes
 * Best for high-frequency updates
 */
export function UserEmail() {
  // Only re-renders when user changes
  const user = useAuthStore(authSelectors.user);
  
  return <span>{user?.email}</span>;
}

/**
 * Example 4: Custom Selector (Most Flexible)
 * 
 * Re-renders only when the computed value changes
 * Perfect for derived state
 */
export function UserInitials() {
  const initials = useAuthStore((state) => {
    if (!state.user) return '?';
    const first = state.user.firstName?.[0] || '';
    const last = state.user.lastName?.[0] || '';
    return `${first}${last}`.toUpperCase();
  });
  
  return <div className="avatar">{initials}</div>;
}

/**
 * Example 5: Role-Based Access
 * 
 * Use built-in role selector
 */
export function AdminPanel() {
  const isAdmin = useAuthStore(authSelectors.hasRole('admin'));
  
  if (!isAdmin) return null;
  
  return <div>Admin Controls</div>;
}

/**
 * Example 6: Login Form
 * 
 * Complete login flow with error handling
 */
export function LoginForm() {
  const { login } = useAuthStore();
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      await login({
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        rememberMe: formData.get('remember') === 'on',
      });
      // Redirect on success
    } catch (err) {
      // Error already set in store
      console.error('Login failed', err);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      <input name="remember" type="checkbox" />
      {error && <div className="error">{error}</div>}
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}

// ============================================================================
// USER MANAGEMENT STORE EXAMPLES
// ============================================================================

/**
 * Example 7: User List with Pagination
 * 
 * Complete CRUD example
 */
export function UserList() {
  const { users, pagination, isLoading } = useUserManagementStore();
  const { fetchUsers, deleteUser, setPage } = useUserManagementStore();
  
  // Fetch users on mount
  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);
  
  if (isLoading) return <div>Loading users...</div>;
  
  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>{user.status}</td>
              <td>
                <button onClick={() => deleteUser(user.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Pagination */}
      <div>
        <button
          onClick={() => setPage(pagination.page - 1)}
          disabled={pagination.page === 1}
        >
          Previous
        </button>
        <span>
          Page {pagination.page} of {pagination.totalPages}
        </span>
        <button
          onClick={() => setPage(pagination.page + 1)}
          disabled={pagination.page === pagination.totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}

/**
 * Example 8: User Filters
 * 
 * Advanced filtering example
 */
export function UserFilters() {
  const { filters } = useUserManagementStore();
  const { setFilters, clearFilters } = useUserManagementStore();
  
  return (
    <div className="filters">
      <input
        type="text"
        placeholder="Search..."
        value={filters.search || ''}
        onChange={(e) => setFilters({ search: e.target.value })}
      />
      
      <select
        value={filters.role || ''}
        onChange={(e) => setFilters({ role: e.target.value as any })}
      >
        <option value="">All Roles</option>
        <option value="admin">Admin</option>
        <option value="user">User</option>
        <option value="moderator">Moderator</option>
      </select>
      
      <select
        value={filters.status || ''}
        onChange={(e) => setFilters({ status: e.target.value as any })}
      >
        <option value="">All Status</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
        <option value="suspended">Suspended</option>
      </select>
      
      <button onClick={clearFilters}>Clear Filters</button>
    </div>
  );
}

/**
 * Example 9: Create User Modal
 * 
 * Create user with validation
 */
export function CreateUserModal({ onClose }: { onClose: () => void }) {
  const { createUser } = useUserManagementStore();
  const isLoading = useUserManagementStore((state) => state.isLoading);
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      await createUser({
        email: formData.get('email') as string,
        firstName: formData.get('firstName') as string,
        lastName: formData.get('lastName') as string,
        role: formData.get('role') as any,
        status: 'active',
      });
      onClose();
    } catch (err) {
      console.error('Failed to create user', err);
    }
  };
  
  return (
    <div className="modal">
      <form onSubmit={handleSubmit}>
        <h2>Create New User</h2>
        <input name="email" type="email" placeholder="Email" required />
        <input name="firstName" placeholder="First Name" required />
        <input name="lastName" placeholder="Last Name" required />
        <select name="role" required>
          <option value="user">User</option>
          <option value="admin">Admin</option>
          <option value="moderator">Moderator</option>
        </select>
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Creating...' : 'Create User'}
        </button>
        <button type="button" onClick={onClose}>
          Cancel
        </button>
      </form>
    </div>
  );
}

// ============================================================================
// ADVANCED PATTERNS
// ============================================================================

/**
 * Example 10: Multiple Store Access
 * 
 * Access multiple stores in one component
 */
export function DashboardSummary() {
  // Auth store
  const user = useAuthStore(authSelectors.user);
  const isAdmin = useAuthStore(authSelectors.hasRole('admin'));
  
  // User management store
  const totalUsers = useUserManagementStore((state) => state.pagination.total);
  
  return (
    <div className="dashboard">
      <h1>Welcome, {user?.firstName}!</h1>
      {isAdmin && (
        <div>
          <p>Total Users: {totalUsers}</p>
        </div>
      )}
    </div>
  );
}

/**
 * Example 11: Outside React (in services)
 * 
 * Access store state outside React components
 */
export class NotificationService {
  static notify(message: string) {
    const { user } = useAuthStore.getState();
    
    console.log(`[${user?.email}] ${message}`);
  }
  
  static async checkAuth() {
    const { isAuthenticated, refreshToken } = useAuthStore.getState();
    
    if (!isAuthenticated) {
      return false;
    }
    
    // Refresh token if needed
    await refreshToken();
    
    return true;
  }
}

/**
 * Example 12: Subscribe to Changes (outside React)
 * 
 * Watch for state changes in services
 */
export function setupAuthMonitoring() {
  // Subscribe to auth changes
  const unsubscribe = useAuthStore.subscribe(
    (state) => state.isAuthenticated,
    (isAuthenticated) => {
      if (!isAuthenticated) {
        console.log('User logged out, clearing cache...');
        // Clear cache, redirect, etc.
      } else {
        console.log('User logged in, initializing...');
        // Initialize services, load data, etc.
      }
    }
  );
  
  // Cleanup
  return unsubscribe;
}

// ============================================================================
// MIGRATION FROM CONTEXT API
// ============================================================================

/**
 * Before (Context API):
 * 
 * const AuthContext = createContext();
 * 
 * function AuthProvider({ children }) {
 *   const [user, setUser] = useState(null);
 *   const [isAuthenticated, setIsAuthenticated] = useState(false);
 *   
 *   const login = async (credentials) => { ... };
 *   
 *   return (
 *     <AuthContext.Provider value={{ user, isAuthenticated, login }}>
 *       {children}
 *     </AuthContext.Provider>
 *   );
 * }
 * 
 * function MyComponent() {
 *   const { user, login } = useContext(AuthContext);
 *   ...
 * }
 */

/**
 * After (Zustand):
 * 
 * // No Provider needed!
 * 
 * function MyComponent() {
 *   const { user, login } = useAuthStore();
 *   ...
 * }
 * 
 * // Or optimized:
 * function MyComponent() {
 *   const user = useAuthStore(authSelectors.user);
 *   const { login } = useAuthActions();
 *   ...
 * }
 */

// ============================================================================
// BENEFITS SUMMARY
// ============================================================================

/**
 * Zustand Benefits:
 * 
 * 1. Performance:
 *    - No Provider nesting
 *    - Fine-grained subscriptions
 *    - Only re-renders when needed
 * 
 * 2. Developer Experience:
 *    - Less boilerplate
 *    - TypeScript-first
 *    - DevTools support
 *    - Easy testing
 * 
 * 3. Flexibility:
 *    - Use outside React
 *    - Multiple stores
 *    - Middleware support
 *    - Persist state easily
 * 
 * 4. Bundle Size:
 *    - ~1kB gzipped
 *    - No dependencies
 *    - Tree-shakeable
 */
