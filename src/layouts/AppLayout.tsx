import type { FC, ReactNode } from 'react';

import PrimaryNavigation from '@app/navigation/PrimaryNavigation';

import Footer from './Footer';

export interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout: FC<AppLayoutProps> = ({ children }) => (
  <div className="flex min-h-screen flex-col bg-gray-50">
    <a
      href="#main-content"
      className="sr-only z-50 focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-blue-600 focus:shadow-lg"
    >
      Skip to main content
    </a>
    <PrimaryNavigation />
    <main id="main-content" role="main" tabIndex={-1} className="flex-1 outline-none">
      {children}
    </main>
    <Footer />
  </div>
);

export default AppLayout;
