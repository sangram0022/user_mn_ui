import { useAuthStore } from '../store/authStore';

export const useAuthState = () => {
  const { user, isAuthenticated, isLoading, error } = useAuthStore();

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    hasRole: (role: string) => user?.role === role,
    hasPermission: (permission: string) => user?.permissions?.includes(permission) ?? false,
  };
};
