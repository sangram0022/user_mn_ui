import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { getUserRoleName } from '@shared/utils/user';
import {
  BarChart3,
  ChevronDown,
  FileText,
  HelpCircle,
  Home,
  LogOut,
  Menu,
  Settings,
  User,
  UserCircle,
  Users,
  Workflow,
  X,
} from 'lucide-react';
import { useAuth } from '../../domains/auth/context/AuthContext';

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const location = useLocation();
  const navigate = useNavigate();

  const mobileMenuId = 'mobile-navigation';
  const userMenuId = 'user-menu';

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsUserMenuOpen(false);
  };

  const navigationItems = [
    { name: 'Home', href: '/', icon: Home },
    ...(user
      ? [
          { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
          { name: 'Users', href: '/users', icon: Users },
          { name: 'Analytics', href: '/analytics', icon: BarChart3 },
          { name: 'Workflows', href: '/workflows', icon: Workflow },
          { name: 'Reports', href: '/reports', icon: FileText },
        ]
      : []),
  ];

  const userMenuItems = [
    { name: 'Profile', href: '/profile', icon: UserCircle },
    { name: 'Settings', href: '/settings', icon: Settings },
    { name: 'Help & Support', href: '/help', icon: HelpCircle },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <>
      <a
        href="#main-content"
        className="absolute left-[-999px] top-auto z-[100] h-px w-px overflow-hidden rounded-none bg-transparent text-blue-700 focus:left-4 focus:top-2 focus:h-auto focus:w-auto focus:rounded-md focus:bg-blue-700 focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to main content
      </a>
      <nav
        aria-label="Primary navigation"
        className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 shadow-md backdrop-blur-md"
      >
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo and Brand */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-3 no-underline">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/30">
                  <User className="h-6 w-6 text-white" />
                </div>
                <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-2xl font-bold text-transparent">
                  UserMgmt
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className={isDesktop ? 'flex' : 'hidden'}>
              <div className="flex items-center gap-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      role="menuitem"
                      className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium no-underline transition-all duration-200 ${
                        active
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Right side - User menu or Login button */}
            <div className="flex items-center gap-4">
              {user ? (
                /* User is logged in - show user menu */
                <div className="relative">
                  <button
                    type="button"
                    aria-haspopup="menu"
                    aria-expanded={isUserMenuOpen}
                    aria-controls={userMenuId}
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex cursor-pointer items-center gap-2 rounded-xl border-none bg-transparent p-2 transition-colors duration-200 hover:bg-gray-50"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-md">
                      <span className="text-sm font-medium text-white">
                        {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className={`text-left ${isDesktop ? 'block' : 'hidden'}`}>
                      <div className="text-sm font-medium text-gray-900">
                        {user.full_name || user.username || 'User'}
                      </div>
                      <div className="text-xs capitalize text-gray-500">
                        {getUserRoleName(user) || 'Member'}
                      </div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </button>

                  {/* User Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div
                      id={userMenuId}
                      role="menu"
                      aria-label="User menu"
                      className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-gray-200 bg-white p-1 shadow-xl"
                    >
                      <div className="border-b border-gray-100 px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">
                          {user.full_name || user.username || 'User'}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>

                      {userMenuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.name}
                            to={item.href}
                            role="menuitem"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-2 rounded-md px-4 py-2.5 text-sm text-gray-700 no-underline transition-colors duration-200 hover:bg-gray-50"
                          >
                            <Icon className="h-4 w-4" />
                            <span>{item.name}</span>
                          </Link>
                        );
                      })}

                      <div className="mt-1 border-t border-gray-100 pt-1">
                        <button
                          type="button"
                          onClick={handleLogout}
                          role="menuitem"
                          className="flex w-full cursor-pointer items-center gap-2 rounded-md border-none bg-transparent px-4 py-2.5 text-left text-sm text-red-600 transition-colors duration-200 hover:bg-red-50"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* User is not logged in - show login/register buttons */
                <div className="flex items-center gap-3">
                  <Link
                    to="/login"
                    className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 no-underline transition-all duration-200 hover:text-blue-600"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-5 py-2.5 text-sm font-medium text-white no-underline shadow-lg shadow-blue-500/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/40"
                  >
                    Get Started
                  </Link>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-expanded={isMobileMenuOpen}
                aria-controls={mobileMenuId}
                aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                className={`cursor-pointer rounded-lg border-none bg-transparent p-2 text-gray-700 transition-all duration-200 hover:bg-gray-50 hover:text-blue-600 ${
                  isDesktop ? 'hidden' : 'block'
                }`}
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <div
              id={mobileMenuId}
              role="menu"
              aria-label="Mobile navigation"
              className={`border-t border-gray-200 py-4 ${isDesktop ? 'hidden' : 'block'}`}
            >
              <div className="flex flex-col gap-1">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      role="menuitem"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-2 rounded-lg px-3 py-3 text-base font-medium no-underline transition-all duration-200 ${
                        active
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Mobile User Menu */}
              {user && (
                <div className="mt-4 border-t border-gray-200 pt-4">
                  <div className="px-3 py-3">
                    <div className="text-base font-medium text-gray-900">
                      {user.full_name || user.username || 'User'}
                    </div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>

                  {userMenuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        role="menuitem"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-3 text-base text-gray-700 no-underline transition-all duration-200 hover:bg-gray-50 hover:text-blue-600"
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    role="menuitem"
                    className="flex w-full cursor-pointer items-center gap-2 rounded-lg border-none bg-transparent px-3 py-3 text-left text-base text-red-600 transition-colors duration-200 hover:bg-red-50"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}

              {/* Mobile Login/Register for non-authenticated users */}
              {!user && (
                <div className="mt-4 flex flex-col gap-2 border-t border-gray-200 pt-4">
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block rounded-lg px-3 py-3 text-center text-base text-gray-700 no-underline transition-all duration-200 hover:bg-gray-50 hover:text-blue-600"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 px-3 py-3 text-center text-base font-medium text-white no-underline shadow-lg shadow-blue-500/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/40"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Overlay for mobile menu and dropdowns */}
        {(isMobileMenuOpen || isUserMenuOpen) && (
          <div
            className="fixed inset-0 z-40 bg-black/25 backdrop-blur-sm"
            onClick={() => {
              setIsMobileMenuOpen(false);
              setIsUserMenuOpen(false);
            }}
            role="presentation"
          />
        )}
      </nav>
    </>
  );
};

export default Navigation;
