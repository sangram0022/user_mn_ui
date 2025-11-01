// ========================================
// useAuth Hook - React 19 use() pattern
// Consumes AuthContext with proper error handling
// ========================================

import { use } from 'react';
import { AuthContext, type AuthContextValue } from './AuthContext';

/**
 * Custom hook to access auth context
 * Uses React 19's use() hook for context consumption
 * 
 * @throws Error if used outside AuthProvider
 * @returns AuthContextValue with user state and auth methods
 * 
 * @example
 * ```tsx
 * function ProfilePage() {
 *   const { user, logout, isAuthenticated } = useAuth();
 *   
 *   if (!isAuthenticated) {
 *     return <Navigate to="/login" />;
 *   }
 *   
 *   return <div>Welcome {user?.email}</div>;
 * }
 * ```
 */
export function useAuth(): AuthContextValue {
  const context = use(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}
