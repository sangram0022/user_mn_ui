import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

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
import { LocaleSelector } from '../../components/common/LocaleSelector';
import { useAuth } from '../../domains/auth';
import { useLocalization } from '../../hooks/localization/useLocalization';
import ThemeSwitcher from '../../shared/components/ui/ThemeSwitcher';

// Types
interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavItemProps extends NavigationItem {
  isActive: boolean;
  onClick?: () => void;
}

interface UserMenuItemProps extends NavigationItem {
  onClick?: () => void;
}

// React Compiler automatically optimizes these components
const NavItem = ({ name, href, icon: Icon, isActive, onClick }: NavItemProps) => (
  <Link
    to={href}
    role="menuitem"
    onClick={onClick}
    aria-current={isActive ? 'page' : undefined}
    className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold no-underline transition-all duration-200 ${
      isActive
        ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700'
        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
    }`}
  >
    <Icon className="h-5 w-5" />
    <span>{name}</span>
  </Link>
);
NavItem.displayName = 'NavItem';

const MobileNavItem = ({ name, href, icon: Icon, isActive, onClick }: NavItemProps) => (
  <Link
    to={href}
    role="menuitem"
    onClick={onClick}
    aria-current={isActive ? 'page' : undefined}
    className={`flex items-center gap-3 rounded-lg px-4 py-3.5 text-base font-semibold no-underline transition-all duration-200 ${
      isActive
        ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700'
        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 border-l-4 border-transparent'
    }`}
  >
    <Icon className="h-5 w-5" />
    <span>{name}</span>
  </Link>
);
MobileNavItem.displayName = 'MobileNavItem';

const UserMenuItem = ({ name, href, icon: Icon, onClick }: UserMenuItemProps) => (
  <Link
    to={href}
    role="menuitem"
    onClick={onClick}
    className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 no-underline transition-colors duration-200 hover:bg-gray-100 hover:text-gray-900"
  >
    <Icon className="h-5 w-5" />
    <span>{name}</span>
  </Link>
);
UserMenuItem.displayName = 'UserMenuItem';

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  const { user, logout } = useAuth();
  const { t } = useLocalization();
  const location = useLocation();
  const navigate = useNavigate();

  const mobileMenuId = 'mobile-navigation';
  const userMenuId = 'user-menu';

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // React Compiler automatically optimizes these functions
  const handleLogout = () => {
    logout();
    navigate('/');
    setIsUserMenuOpen(false);
  };

  const navigationItems: NavigationItem[] = [
    { name: t('navigation.home'), href: '/', icon: Home },
    ...(user
      ? [
          { name: t('navigation.dashboard'), href: '/dashboard', icon: BarChart3 },
          { name: t('navigation.users'), href: '/users', icon: Users },
          { name: t('navigation.analytics'), href: '/analytics', icon: BarChart3 },
          { name: t('navigation.workflows'), href: '/workflows', icon: Workflow },
          { name: t('navigation.reports'), href: '/reports', icon: FileText },
        ]
      : []),
  ];

  const adminNavigationItems: NavigationItem[] =
    user?.role === 'admin' ? [{ name: t('navigation.admin'), href: '/admin', icon: Settings }] : [];

  const userMenuItems: NavigationItem[] = [
    { name: t('navigation.profile'), href: '/profile', icon: UserCircle },
    { name: t('navigation.settings'), href: '/settings', icon: Settings },
    { name: t('navigation.helpAndSupport'), href: '/help', icon: HelpCircle },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const closeUserMenu = () => {
    setIsUserMenuOpen(false);
  };

  const closeAllMenus = () => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  const allNavigationItems: NavigationItem[] = [...navigationItems, ...adminNavigationItems];

  return (
    <>
      <a
        href="#main-content"
        className="absolute left-[-999px] top-auto z-[100] h-px w-px overflow-hidden rounded-none bg-transparent text-blue-700 focus:left-4 focus:top-2 focus:h-auto focus:w-auto focus:rounded-md focus:bg-blue-700 focus:px-4 focus:py-2 focus:text-white"
      >
        {t('navigation.skipToMainContent')}
      </a>
      <nav
        aria-label={t('navigation.primaryNavigation')}
        className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-md"
      >
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo and Brand */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-3 no-underline">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary shadow-lg">
                  <User className="h-6 w-6 text-white" />
                </div>
                <span className="bg-gradient-primary bg-clip-text text-2xl font-bold text-transparent">
                  {t('navigation.userMgmt')}
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className={isDesktop ? 'flex' : 'hidden'}>
              <div className="flex items-center gap-2">
                {allNavigationItems.map((item) => (
                  <NavItem key={item.href} {...item} isActive={isActive(item.href)} />
                ))}
              </div>
            </div>

            {/* Right side - Theme switcher, Locale selector and User menu */}
            <div className="flex items-center gap-4">
              <ThemeSwitcher />
              <LocaleSelector />
              {user ? (
                /* User is logged in - show user menu */
                <div className="relative">
                  <button
                    type="button"
                    aria-haspopup="menu"
                    aria-expanded={isUserMenuOpen}
                    aria-controls={userMenuId}
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex cursor-pointer items-center gap-2 rounded-xl border-none bg-transparent p-2 transition-colors duration-200 hover:bg-gray-100"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-primary shadow-lg">
                      <span className="text-sm font-bold text-white">
                        {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className={`text-left ${isDesktop ? 'block' : 'hidden'}`}>
                      <div className="text-sm font-semibold text-gray-900">
                        {user.full_name || user.username || 'User'}
                      </div>
                      <div className="text-xs text-gray-600 capitalize">
                        {typeof user.role === 'string' ? user.role : user.role?.name || 'Member'}
                      </div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-600" />
                  </button>

                  {/* User Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div
                      id={userMenuId}
                      role="menu"
                      aria-label="User menu"
                      className="absolute right-0 z-50 mt-2 w-64 rounded-xl border border-gray-200 bg-white p-2 shadow-2xl"
                    >
                      <div className="border-b border-gray-200 px-4 py-3 mb-2">
                        <div className="text-sm font-semibold text-gray-900">
                          {user.full_name || user.username || 'User'}
                        </div>
                        <div className="text-sm text-gray-600">{user.email}</div>
                      </div>

                      {userMenuItems.map((item) => (
                        <UserMenuItem key={item.href} {...item} onClick={closeUserMenu} />
                      ))}

                      <div className="mt-2 border-t border-gray-200 pt-2">
                        <button
                          type="button"
                          onClick={handleLogout}
                          role="menuitem"
                          className="flex w-full cursor-pointer items-center gap-3 rounded-lg border-none bg-transparent px-4 py-2.5 text-left text-sm font-medium text-red-600 transition-colors duration-200 hover:bg-red-50"
                        >
                          <LogOut className="h-5 w-5" />
                          <span>{t('auth.signOut')}</span>
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
                    className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 no-underline transition-all duration-200 hover:text-gray-900 hover:bg-gray-100"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="rounded-lg bg-gradient-primary px-6 py-2.5 text-sm font-semibold text-white no-underline shadow-lg transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5"
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
                className={`cursor-pointer rounded-lg border-none bg-gray-100 p-2.5 text-gray-700 transition-all duration-200 hover:bg-gray-200 hover:text-gray-900 ${
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
              className={`border-t border-gray-200 bg-gray-50 py-4 ${isDesktop ? 'hidden' : 'block'}`}
            >
              <div className="flex flex-col gap-2 px-2">
                {allNavigationItems.map((item) => (
                  <MobileNavItem
                    key={item.href}
                    {...item}
                    isActive={isActive(item.href)}
                    onClick={closeMobileMenu}
                  />
                ))}
              </div>

              {/* Mobile User Menu */}
              {user && (
                <div className="mt-4 border-t border-gray-200 bg-white pt-4 mx-2 rounded-lg px-2">
                  <div className="px-4 py-3 mb-2">
                    <div className="text-base font-semibold text-gray-900">
                      {user.full_name || user.username || 'User'}
                    </div>
                    <div className="text-sm text-gray-600">{user.email}</div>
                  </div>

                  {userMenuItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      role="menuitem"
                      onClick={closeMobileMenu}
                      className="flex items-center gap-2 rounded-lg px-3 py-3 text-base text-gray-700 no-underline transition-all duration-200 hover:bg-gray-50 hover:text-blue-600"
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  ))}

                  <button
                    type="button"
                    onClick={() => {
                      handleLogout();
                      closeMobileMenu();
                    }}
                    role="menuitem"
                    className="flex w-full cursor-pointer items-center gap-3 rounded-lg border-none bg-transparent px-4 py-3 text-left text-base font-medium text-red-600 transition-colors duration-200 hover:bg-red-50 mt-2 border-t border-gray-200 pt-2"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}

              {/* Mobile Login/Register for non-authenticated users */}
              {!user && (
                <div className="mt-4 flex flex-col gap-3 border-t border-gray-200 bg-white pt-4 mx-2 px-2 rounded-lg">
                  <Link
                    to="/login"
                    onClick={closeMobileMenu}
                    className="block rounded-lg px-4 py-3 text-center text-base font-semibold text-gray-700 no-underline border-2 border-gray-300 transition-all duration-200 hover:bg-gray-50 hover:text-gray-900"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={closeMobileMenu}
                    className="block rounded-lg bg-gradient-primary px-4 py-3 text-center text-base font-semibold text-white no-underline shadow-lg transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5"
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
            onClick={closeAllMenus}
            role="presentation"
          />
        )}
      </nav>
    </>
  );
};
Navigation.displayName = 'Navigation';

export default Navigation;
