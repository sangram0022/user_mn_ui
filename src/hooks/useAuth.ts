// React 19 use() hook for AuthContext
import { use } from 'react';
import { AuthContext } from '../domains/auth/context/AuthContext';

export function useAuth() {
  const context = use(AuthContext);
  return context;
}
