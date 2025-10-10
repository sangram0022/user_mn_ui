import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '@features/auth';
import { getUserRoleName } from '@shared/utils/user';
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  Settings, 
  HelpCircle, 
  UserCircle,
  Home,
  Users,
  BarChart3,
  Workflow,
  FileText,
  ChevronDown
} from 'lucide-react';

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();
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
    ...(user ? [
      { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
      { name: 'Users', href: '/users', icon: Users },
      { name: 'Analytics', href: '/analytics', icon: BarChart3 },
      { name: 'Workflows', href: '/workflows', icon: Workflow },
      { name: 'Reports', href: '/reports', icon: FileText },
    ] : [])
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
        style={{
          position: 'absolute',
          left: '-999px',
          top: 'auto',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
          zIndex: 100,
          color: '#1d4ed8',
          backgroundColor: 'transparent',
          borderRadius: '0',
        }}
        onFocus={(event) => {
          event.currentTarget.style.left = '1rem';
          event.currentTarget.style.top = '0.5rem';
          event.currentTarget.style.width = 'auto';
          event.currentTarget.style.height = 'auto';
          event.currentTarget.style.padding = '0.5rem 1rem';
          event.currentTarget.style.backgroundColor = '#1d4ed8';
          event.currentTarget.style.color = '#ffffff';
          event.currentTarget.style.borderRadius = '0.375rem';
        }}
        onBlur={(event) => {
          event.currentTarget.style.left = '-999px';
          event.currentTarget.style.top = 'auto';
          event.currentTarget.style.width = '1px';
          event.currentTarget.style.height = '1px';
          event.currentTarget.style.padding = '0';
          event.currentTarget.style.backgroundColor = 'transparent';
          event.currentTarget.style.color = '#1d4ed8';
          event.currentTarget.style.borderRadius = '0';
        }}
      >
        Skip to main content
      </a>
      <nav
        aria-label="Primary navigation"
        style={{ 
      backgroundColor: 'white', 
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', 
      borderBottom: '1px solid #e5e7eb',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div style={{ 
        maxWidth: '1280px', 
        margin: '0 auto', 
        padding: '0 1rem'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          height: '4rem',
          alignItems: 'center'
        }}>
          {/* Logo and Brand */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Link to="/" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              textDecoration: 'none'
            }}>
              <div style={{ 
                width: '2rem', 
                height: '2rem', 
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', 
                borderRadius: '0.5rem', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center'
              }}>
                <User style={{ width: '1.25rem', height: '1.25rem', color: 'white' }} />
              </div>
              <span style={{ 
                fontSize: '1.25rem', 
                fontWeight: 'bold', 
                color: '#111827'
              }}>
                UserMgmt
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    isActive(item.href)
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                  role="menuitem"
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Right side - User menu or Login button */}
          <div className="flex items-center space-x-4">
            {user ? (
              /* User is logged in - show user menu */
              <div className="relative">
                <button
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={isUserMenuOpen}
                  aria-controls={userMenuId}
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-medium text-gray-900">
                      {user.full_name || user.username || 'User'}
                    </div>
                    <div className="text-xs text-gray-500 capitalize">
                      {getUserRoleName(user) || 'Member'}
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div
                    id={userMenuId}
                    role="menu"
                    aria-label="User menu"
                    className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50"
                  >
                    <div className="px-4 py-3 border-b border-gray-100">
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
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                          role="menuitem"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{item.name}</span>
                        </Link>
                      );
                    })}
                    
                    <div className="border-t border-gray-100 mt-1">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                        role="menuitem"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* User is not logged in - show login/register buttons */
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
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
              className="md:hidden p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors duration-200"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div
            id={mobileMenuId}
            role="menu"
            aria-label="Mobile navigation"
            className="md:hidden border-t border-gray-200 py-4"
          >
            <div className="space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                      isActive(item.href)
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                    }`}
                    role="menuitem"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Mobile User Menu */}
            {user && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="px-3 py-2">
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
                      className="flex items-center space-x-2 px-3 py-2 text-base text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors duration-200"
                      role="menuitem"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Icon className="w-5 h-5" />
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
                  className="flex items-center space-x-2 w-full px-3 py-2 text-base text-red-600 hover:bg-red-50 transition-colors duration-200"
                  role="menuitem"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}

            {/* Mobile Login/Register for non-authenticated users */}
            {!user && (
              <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                <Link
                  to="/login"
                  className="block px-3 py-2 text-base text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 text-base font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-md hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
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
          className="fixed inset-0 z-40 bg-black bg-opacity-25"
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
