// Providers configuration - All context providers in one place
import { type ReactNode, lazy } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../domains/auth/context/AuthContext';
import { RbacWrapper } from './RbacWrapper';
import { queryClient } from '../services/api/queryClient';
import { isDevelopment } from '@/core/config';

// Lazy load devtools only in development (excluded from production bundle)
const ReactQueryDevtools = isDevelopment()
  ? lazy(() => import('@tanstack/react-query-devtools').then(m => ({ default: m.ReactQueryDevtools })))
  : () => null;

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RbacWrapper>
            {children}
            {isDevelopment() && <ReactQueryDevtools initialIsOpen={false} />}
          </RbacWrapper>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}
