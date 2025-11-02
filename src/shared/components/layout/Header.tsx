import { Link } from 'react-router-dom';
import { useState } from 'react';
import { ROUTE_PATHS } from '../../../core/routing/routes';
import { useAuth } from '../../../hooks/useAuth';
import Button from '../ui/Button';

export default function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header 
      id="navigation"
      className="glass sticky top-0 z-50 shadow-md animate-slide-down"
      role="banner"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Logo */}
          <Link 
            to={isAuthenticated ? '/dashboard' : ROUTE_PATHS.HOME}
            className="flex items-center gap-3 group"
            aria-label="UserMN Home"
          >
            <div 
              className="w-10 h-10 bg-linear-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300"
              aria-hidden="true"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-gradient text-2xl font-bold">UserMN</span>
          </Link>

          {/* Center: Navigation */}
          <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
            {!isAuthenticated ? (
              // Public Navigation
              <>
                <Link
                  to={ROUTE_PATHS.HOME}
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                  aria-label="Go to Home page"
                >
                  Home
                </Link>
                <Link
                  to={ROUTE_PATHS.ABOUT}
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                  aria-label="Go to About page"
                >
                  About
                </Link>
                <Link
                  to={ROUTE_PATHS.CONTACT}
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                  aria-label="Go to Contact page"
                >
                  Contact
                </Link>
              </>
            ) : (
              // Authenticated Navigation - Show admin links for admin users
              <>
                {user?.roles?.includes('admin') || user?.roles?.includes('super_admin') ? (
                  // Admin Navigation
                  <>
                    <Link
                      to={ROUTE_PATHS.ADMIN_DASHBOARD}
                      className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                      aria-label="Go to Dashboard"
                    >
                      Dashboard
                    </Link>
                    <Link
                      to={ROUTE_PATHS.USERS_LIST}
                      className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                      aria-label="Go to Users"
                    >
                      Users
                    </Link>
                    <Link
                      to={ROUTE_PATHS.ROLES_LIST}
                      className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                      aria-label="Go to Roles"
                    >
                      Roles
                    </Link>
                    <Link
                      to={ROUTE_PATHS.AUDIT_LOGS}
                      className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                      aria-label="Go to Audit Logs"
                    >
                      Audits
                    </Link>
                    <Link
                      to={ROUTE_PATHS.REPORTS}
                      className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                      aria-label="Go to Reports"
                    >
                      Reports
                    </Link>
                    <Link
                      to={ROUTE_PATHS.MONITORING_HEALTH}
                      className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                      aria-label="Go to Monitoring"
                    >
                      Monitoring
                    </Link>
                  </>
                ) : (
                  // Regular User Navigation - No links, only dropdown menu
                  <></>
                )}
              </>
            )}
            
            {/* Development Only - Reference UI Pages (Public only) */}
            {import.meta.env.DEV && !isAuthenticated && (
              <Link
                to={ROUTE_PATHS.REFERENCE_INDEX}
                className="text-yellow-600 hover:text-yellow-700 font-medium transition-colors flex items-center gap-1"
                title="Reference UI Pages (Development Only)"
                aria-label="View Reference UI Pages (Development Only)"
              >
                <span>📚</span>
                <span className="text-xs">Reference</span>
              </Link>
            )}
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 text-gray-700 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
              aria-label="Open navigation menu"
              aria-expanded="false"
              aria-controls="mobile-menu"
            >
              <svg 
                className="w-6 h-6" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Auth Buttons / User Menu */}
            <div className="hidden md:flex items-center gap-3">
              {!isAuthenticated ? (
                // Show Login & Get Started for unauthenticated users
                <>
                  <Link to={ROUTE_PATHS.LOGIN} aria-label="Go to Login page">
                    <Button variant="ghost" size="md">Login</Button>
                  </Link>
                  <Link to={ROUTE_PATHS.REGISTER} aria-label="Create a new account">
                    <Button variant="primary" size="md">Get Started</Button>
                  </Link>
                </>
              ) : (
                // Show User Menu for authenticated users
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                    aria-label="User menu"
                    aria-expanded={showUserMenu}
                  >
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                      {user?.first_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {user?.first_name || user?.email?.split('@')[0] || 'User'}
                    </span>
                    <svg 
                      className={`w-4 h-4 text-gray-600 transition-transform ${showUserMenu ? 'rotate-180' : ''}`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                      <Link
                        to={ROUTE_PATHS.PROFILE}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Profile
                      </Link>
                      <hr className="my-1 border-gray-200" />
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
