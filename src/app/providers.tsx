// Providers configuration - All context providers in one place
import { type ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider } from '../domains/auth/context/AuthContext';
import { RbacWrapper } from './RbacWrapper';
import { queryClient } from '../services/api/queryClient';

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
            {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
          </RbacWrapper>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}
