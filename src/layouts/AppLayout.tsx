import type { FC, ReactNode } from 'react';

import PrimaryNavigation from '@app/navigation/PrimaryNavigation';

import Footer from './Footer';

export interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout: FC<AppLayoutProps> = ({ children }) => (
  <div
    style={{
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      display: 'flex',
      flexDirection: 'column',
    }}
  >
    <a
      href="#main-content"
      style={{
        position: 'absolute',
        left: '-999px',
        top: 'auto',
        width: '1px',
        height: '1px',
        overflow: 'hidden',
        zIndex: 50,
      }}
      onFocus={(e) => {
        e.currentTarget.style.position = 'absolute';
        e.currentTarget.style.top = '1rem';
        e.currentTarget.style.left = '1rem';
        e.currentTarget.style.width = 'auto';
        e.currentTarget.style.height = 'auto';
        e.currentTarget.style.padding = '0.5rem 1rem';
        e.currentTarget.style.borderRadius = '0.375rem';
        e.currentTarget.style.backgroundColor = '#ffffff';
        e.currentTarget.style.color = '#2563eb';
        e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
      }}
      onBlur={(e) => {
        e.currentTarget.style.left = '-999px';
        e.currentTarget.style.top = 'auto';
        e.currentTarget.style.width = '1px';
        e.currentTarget.style.height = '1px';
        e.currentTarget.style.padding = '0';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      Skip to main content
    </a>
    <PrimaryNavigation />
    <main
      id="main-content"
      role="main"
      tabIndex={-1}
      style={{
        flex: 1,
        outline: 'none',
      }}
    >
      {children}
    </main>
    <Footer />
  </div>
);

export default AppLayout;
