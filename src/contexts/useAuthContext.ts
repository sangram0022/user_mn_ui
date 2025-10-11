/**
 * useAuthContext Hook
 * Hook to access authentication context
 */

import { useContext } from 'react';
import { AuthContext } from './AuthContext';

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
};
