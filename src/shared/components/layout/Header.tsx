import { Link } from 'react-router-dom';
import { ROUTE_PATHS } from '../../../core/routing/routes';
import Button from '../ui/Button';

export default function Header() {
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
            to={ROUTE_PATHS.HOME} 
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
            <Link
              to={ROUTE_PATHS.ADMIN_DASHBOARD}
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              aria-label="Go to Admin Dashboard"
            >
              Admin
            </Link>
            {/* Development Only - Reference UI Pages */}
            <Link
              to={ROUTE_PATHS.REFERENCE_INDEX}
              className="text-yellow-600 hover:text-yellow-700 font-medium transition-colors flex items-center gap-1"
              title="Reference UI Pages (Development Only)"
              aria-label="View Reference UI Pages (Development Only)"
            >
              <span>📚</span>
              <span className="text-xs">Reference</span>
            </Link>
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            {/* Menu Toggle for Mobile/Sidebar */}
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

            {/* Auth Buttons - Using Design System */}
            <div className="hidden md:flex items-center gap-3">
              <Link to={ROUTE_PATHS.LOGIN} aria-label="Go to Login page">
                <Button variant="ghost" size="md">Login</Button>
              </Link>
              <Link to={ROUTE_PATHS.REGISTER} aria-label="Create a new account">
                <Button variant="primary" size="md">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
