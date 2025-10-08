import type { FC, ReactNode } from 'react';

import Footer from './Footer';

export interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout: FC<AuthLayoutProps> = ({ children }) => (
  <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 via-white to-gray-100">
    <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" role="main">
      {children}
    </main>
    <Footer />
  </div>
);

export default AuthLayout;
