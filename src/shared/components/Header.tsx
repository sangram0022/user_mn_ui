import { ChevronDown, LogOut, Menu, Settings, Shield, UserCircle, X } from 'lucide-react';
import type { FC } from 'react';
import { memo, useCallback, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '@domains/auth/context/AuthContext';
import { ThemeSelector } from './ThemeSelector';

/**
 * Unified Header component used across all layouts
 * Shows appropriate navigation based on authentication state and user role
 *
 * Optimized with React.memo to prevent unnecessary re-renders
 */
const Header: FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = useCallback(async () => {
    await logout();
    navigate('/');
    setIsUserMenuOpen(false);
  }, [logout, navigate]);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev);
  }, []);

  const toggleUserMenu = useCallback(() => {
    setIsUserMenuOpen((prev) => !prev);
  }, []);

  const closeUserMenu = useCallback(() => {
    setIsUserMenuOpen(false);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const handleLogoutAndCloseMobile = useCallback(async () => {
    await handleLogout();
    setIsMobileMenuOpen(false);
  }, [handleLogout]);

  // Navigation items based on user role
  const getNavItems = () => {
    if (!user) {
      return [];
    }

    const baseItems = [
      { name: 'Dashboard', href: '/dashboard' },
      { name: 'Profile', href: '/profile' },
    ];

    // Add admin-specific items
    if (user.is_superuser || user.role === 'admin' || user.role_name === 'admin') {
      baseItems.splice(1, 0, { name: 'Users', href: '/users' });
      baseItems.splice(2, 0, { name: 'Analytics', href: '/analytics' });
    }

    return baseItems;
  };

  const navItems = getNavItems();

  return (
    <header
      className="backdrop-blur-sm border-b sticky top-0 z-50"
      style={{
        background: 'rgba(var(--theme-surface-rgb, 255, 255, 255), 0.8)',
        borderColor: 'var(--theme-border)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo - Always visible */}
          <Link to="/" className="flex items-center space-x-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--theme-primary)' }}
            >
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold" style={{ color: 'var(--theme-text)' }}>
              User Management
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {/* Theme Selector */}
            <ThemeSelector />

            {user ? (
              // Authenticated user navigation
              <>
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-opacity-10"
                    style={{ color: 'var(--theme-textSecondary)' }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.color = 'var(--theme-text)';
                      e.currentTarget.style.background =
                        'rgba(var(--theme-primary-rgb, 59, 130, 246), 0.1)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.color = 'var(--theme-textSecondary)';
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    {item.name}
                  </Link>
                ))}

                {/* User Menu Dropdown */}
                <div className="relative ml-3">
                  <button
                    onClick={toggleUserMenu}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    style={{ color: 'var(--theme-textSecondary)' }}
                  >
                    <UserCircle className="w-5 h-5" />
                    <span>{user.email?.split('@')[0] || 'User'}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {isUserMenuOpen && (
                    <>
                      {/* Backdrop */}
                      <button
                        className="fixed inset-0 z-10 cursor-default"
                        onClick={closeUserMenu}
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') closeUserMenu();
                        }}
                        aria-label="Close menu"
                        tabIndex={-1}
                      />

                      {/* Dropdown Menu */}
                      <div
                        className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 z-20 border"
                        style={{
                          background: 'var(--theme-surface)',
                          borderColor: 'var(--theme-border)',
                        }}
                      >
                        <Link
                          to="/profile"
                          className="flex items-center px-4 py-2 text-sm transition-colors"
                          style={{ color: 'var(--theme-text)' }}
                          onClick={closeUserMenu}
                        >
                          <UserCircle className="w-4 h-4 mr-3" />
                          Profile
                        </Link>
                        <Link
                          to="/settings"
                          className="flex items-center px-4 py-2 text-sm transition-colors"
                          style={{ color: 'var(--theme-text)' }}
                          onClick={closeUserMenu}
                        >
                          <Settings className="w-4 h-4 mr-3" />
                          Settings
                        </Link>
                        <hr className="my-1" style={{ borderColor: 'var(--theme-border)' }} />
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <LogOut className="w-4 h-4 mr-3" />
                          Sign Out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              // Guest user navigation
              <>
                <Link
                  to="/login"
                  className="px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  style={{ color: 'var(--theme-textSecondary)' }}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl text-sm font-semibold shadow-lg transition-all duration-200 hover:opacity-90"
                  style={{ background: 'var(--theme-primary)', color: '#FFFFFF' }}
                >
                  Get Started
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-md transition-colors"
            style={{ color: 'var(--theme-textSecondary)' }}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t" style={{ borderColor: 'var(--theme-border)' }}>
            {user ? (
              <>
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="block px-3 py-2 rounded-md text-base font-medium transition-colors"
                    style={{ color: 'var(--theme-textSecondary)' }}
                    onClick={closeMobileMenu}
                  >
                    {item.name}
                  </Link>
                ))}
                <hr className="my-2" style={{ borderColor: 'var(--theme-border)' }} />
                <div className="px-3 py-2 text-sm" style={{ color: 'var(--theme-textSecondary)' }}>
                  Signed in as {user.email}
                </div>
                <Link
                  to="/settings"
                  className="block px-3 py-2 rounded-md text-base font-medium transition-colors"
                  style={{ color: 'var(--theme-textSecondary)' }}
                  onClick={closeMobileMenu}
                >
                  Settings
                </Link>
                <button
                  onClick={handleLogoutAndCloseMobile}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors"
                  style={{ color: '#ef4444' }}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium transition-colors"
                  style={{ color: 'var(--theme-textSecondary)' }}
                  onClick={closeMobileMenu}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 rounded-xl text-base font-semibold shadow-lg transition-all duration-200 hover:opacity-90 mt-2"
                  style={{ background: 'var(--theme-primary)', color: '#FFFFFF' }}
                  onClick={closeMobileMenu}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

/**
 * Export memoized Header to prevent unnecessary re-renders
 *
 * The Header component will only re-render when:
 * - User authentication state changes (login/logout)
 * - Theme changes (via ThemeSelector)
 * - Navigation occurs (route changes)
 *
 * This improves performance by avoiding re-renders when parent components update
 */
export default memo(Header);
