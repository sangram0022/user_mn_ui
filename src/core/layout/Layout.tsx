import { type ReactNode } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useAppStore } from '../../store/appStore';
import Header from '../../shared/components/layout/Header';
import Footer from '../../shared/components/layout/Footer';
import Sidebar from '../../shared/components/layout/Sidebar';
import Toast from '../../shared/components/ui/Toast';
import SkipLinks from '../../shared/components/accessibility/SkipLinks';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { isAuthenticated } = useAuth();
  const { sidebarOpen } = useAppStore();

  return (
    <>
      <SkipLinks />
      <div className="min-h-screen flex flex-col bg-linear-to-br from-gray-50 via-white to-blue-50">
        <Header />
        
        <div className="flex flex-1">
          {isAuthenticated && sidebarOpen && <Sidebar />}
          
          <main 
            id="main-content" 
            className="flex-1"
            role="main"
            aria-label="Main content"
            tabIndex={-1}
          >
            {children}
          </main>
        </div>
        
        <Footer />
        <Toast />
      </div>
    </>
  );
}
