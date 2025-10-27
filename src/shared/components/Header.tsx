import { ChevronDown, LogOut, Menu, Settings, Shield, UserCircle, X } from 'lucide-react';
import type { FC } from 'react';
import { memo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '@domains/auth/context/AuthContext';

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

  // React 19: Removed useCallback - compiler handles event handler optimization
  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsUserMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen((prev) => !prev);
  };

  const closeUserMenu = () => {
    setIsUserMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogoutAndCloseMobile = async () => {
    await handleLogout();
    setIsMobileMenuOpen(false);
  };

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
    if (user.is_superuser || user.roles?.includes('admin') || user.role_name === 'admin') {
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
        background: 'rgba(var(--color-surface-rgb, 255, 255, 255), 0.8)',
        borderColor: 'var(--color-border-primary)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo - Always visible */}
          <Link to="/" className="flex items-center space-x-2">
            <div
              className="size-8 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--color-primary)' }}
            >
              <Shield className="icon-md text-white" />
            </div>
            <span className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
              User Management
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {user ? (
              <>
                {/* Navigation items for authenticated users */}
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-opacity-10"
                    style={{ color: 'var(--color-text-secondary)' }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.color = 'var(--color-text-primary)';
                      e.currentTarget.style.background =
                        'rgba(var(--color-primary-rgb, 59, 130, 246), 0.1)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.color = 'var(--color-text-secondary)';
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    {item.name}
                  </Link>
                ))}

                {/* User Menu Dropdown - Only for authenticated users */}
                <div className="relative ml-3">
                  <button
                    onClick={toggleUserMenu}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    style={{ color: 'var(--color-text-secondary)' }}
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
                        className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 z-20 border animate-slide-down"
                        style={{
                          background: 'var(--color-background-elevated)',
                          borderColor: 'var(--color-border-primary)',
                        }}
                      >
                        <Link
                          to="/profile"
                          className="flex items-center px-4 py-2 text-sm transition-colors hover:bg-[var(--color-surface-secondary)]"
                          style={{ color: 'var(--color-text-primary)' }}
                          onClick={closeUserMenu}
                        >
                          <UserCircle className="w-4 h-4 mr-3" />
                          Profile
                        </Link>
                        <Link
                          to="/settings"
                          className="flex items-center px-4 py-2 text-sm transition-colors hover:bg-[var(--color-surface-secondary)]"
                          style={{ color: 'var(--color-text-primary)' }}
                          onClick={closeUserMenu}
                        >
                          <Settings className="w-4 h-4 mr-3" />
                          Settings
                        </Link>
                        <hr
                          className="my-1"
                          style={{ borderColor: 'var(--color-border-primary)' }}
                        />
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full text-left px-4 py-2 text-sm transition-colors rounded-md hover:opacity-80"
                          style={{ color: 'var(--color-error)' }}
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
              <>
                {/* Guest user - Show Sign In (outline) and Get Started (solid) buttons with consistent styling */}
                <Link to="/login" className="btn-base btn-secondary">
                  Sign In
                </Link>
                <Link to="/register" className="btn-base btn-primary">
                  Get Started
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Menu Button - Only for authenticated users */}
          {user && (
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded-md transition-colors"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          )}

          {/* Mobile Sign In/Register buttons - Only for guests */}
          {!user && (
            <div className="flex md:hidden items-center gap-2">
              <Link to="/login" className="btn-base btn-secondary btn-sm">
                Sign In
              </Link>
              <Link to="/register" className="btn-base btn-primary btn-sm">
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Navigation - Only for authenticated users */}
        {user && isMobileMenuOpen && (
          <div
            className="md:hidden py-4 border-t"
            style={{ borderColor: 'var(--color-border-primary)' }}
          >
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="block px-3 py-2 rounded-md text-base font-medium transition-colors"
                style={{ color: 'var(--color-text-secondary)' }}
                onClick={closeMobileMenu}
              >
                {item.name}
              </Link>
            ))}
            <hr className="my-2" style={{ borderColor: 'var(--color-border-primary)' }} />
            <div className="px-3 py-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Signed in as {user.email}
            </div>
            <Link
              to="/settings"
              className="block px-3 py-2 rounded-md text-base font-medium transition-colors"
              style={{ color: 'var(--color-text-secondary)' }}
              onClick={closeMobileMenu}
            >
              Settings
            </Link>
            <button
              onClick={handleLogoutAndCloseMobile}
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors"
              style={{ color: 'var(--color-error)' }}
            >
              Sign Out
            </button>
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
