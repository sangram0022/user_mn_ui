import type { FC, ReactNode } from 'react';

import Header from '@shared/components/Header';
import Footer from './Footer';

export interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout: FC<AuthLayoutProps> = ({ children }) => (
  <div className="min-h-screen flex flex-col bg-gradient-to-b from-[var(--color-surface-secondary)] via-white to-[var(--color-surface-secondary)]">
    <Header />
    <main className="flex-1" role="main">
      {children}
    </main>
    <Footer />
  </div>
);

export default AuthLayout;
