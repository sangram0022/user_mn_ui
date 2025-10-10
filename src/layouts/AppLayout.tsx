import type { FC, ReactNode } from 'react';

import PrimaryNavigation from '@app/navigation/PrimaryNavigation';

import Footer from './Footer';

export interface AppLayoutProps { children: ReactNode; }

const AppLayout: FC<AppLayoutProps> = ({ children }) => (
  <div className="min-h-screen bg-gray-50 flex flex-col">
    <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:rounded-md focus:bg-white focus:text-blue-600 focus:shadow-lg">
      Skip to main content
    </a>
  <PrimaryNavigation />
    <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
      {children}
    </main>
    <Footer />
  </div>
);

export default AppLayout;
