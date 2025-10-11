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
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          borderBottom: '1px solid #e5e7eb',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '0 1rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              height: '4rem',
              alignItems: 'center',
            }}
          >
            {/* Logo and Brand */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Link
                to="/"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  textDecoration: 'none',
                }}
              >
                <div
                  style={{
                    width: '2.5rem',
                    height: '2.5rem',
                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    borderRadius: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)',
                  }}
                >
                  <User style={{ width: '1.5rem', height: '1.5rem', color: 'white' }} />
                </div>
                <span
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  UserMgmt
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div
              style={{
                display: isDesktop ? 'flex' : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      role="menuitem"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        textDecoration: 'none',
                        transition: 'all 0.2s ease',
                        color: active ? '#2563eb' : '#374151',
                        backgroundColor: active ? '#eff6ff' : 'transparent',
                      }}
                      onMouseEnter={(e) => {
                        if (!active) {
                          e.currentTarget.style.color = '#2563eb';
                          e.currentTarget.style.backgroundColor = '#f9fafb';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!active) {
                          e.currentTarget.style.color = '#374151';
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      <Icon style={{ width: '1rem', height: '1rem' }} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Right side - User menu or Login button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {user ? (
                /* User is logged in - show user menu */
                <div style={{ position: 'relative' }}>
                  <button
                    type="button"
                    aria-haspopup="menu"
                    aria-expanded={isUserMenuOpen}
                    aria-controls={userMenuId}
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem',
                      borderRadius: '0.75rem',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f9fafb')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <div
                      style={{
                        width: '2.5rem',
                        height: '2.5rem',
                        background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                        borderRadius: '9999px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                      }}
                    >
                      <span
                        style={{
                          color: '#ffffff',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                        }}
                      >
                        {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div
                      style={{
                        display: isDesktop ? 'block' : 'none',
                        textAlign: 'left',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          color: '#111827',
                        }}
                      >
                        {user.full_name || user.username || 'User'}
                      </div>
                      <div
                        style={{
                          fontSize: '0.75rem',
                          color: '#6b7280',
                          textTransform: 'capitalize',
                        }}
                      >
                        {getUserRoleName(user) || 'Member'}
                      </div>
                    </div>
                    <ChevronDown style={{ width: '1rem', height: '1rem', color: '#6b7280' }} />
                  </button>

                  {/* User Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div
                      id={userMenuId}
                      role="menu"
                      aria-label="User menu"
                      style={{
                        position: 'absolute',
                        right: 0,
                        marginTop: '0.5rem',
                        width: '14rem',
                        backgroundColor: '#ffffff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.75rem',
                        boxShadow:
                          '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                        padding: '0.25rem',
                        zIndex: 50,
                      }}
                    >
                      <div
                        style={{
                          padding: '0.75rem 1rem',
                          borderBottom: '1px solid #f3f4f6',
                        }}
                      >
                        <div
                          style={{
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#111827',
                          }}
                        >
                          {user.full_name || user.username || 'User'}
                        </div>
                        <div
                          style={{
                            fontSize: '0.875rem',
                            color: '#6b7280',
                          }}
                        >
                          {user.email}
                        </div>
                      </div>

                      {userMenuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.name}
                            to={item.href}
                            role="menuitem"
                            onClick={() => setIsUserMenuOpen(false)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              padding: '0.625rem 1rem',
                              fontSize: '0.875rem',
                              color: '#374151',
                              textDecoration: 'none',
                              borderRadius: '0.375rem',
                              transition: 'background-color 0.2s ease',
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.backgroundColor = '#f9fafb')
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.backgroundColor = 'transparent')
                            }
                          >
                            <Icon style={{ width: '1rem', height: '1rem' }} />
                            <span>{item.name}</span>
                          </Link>
                        );
                      })}

                      <div
                        style={{
                          borderTop: '1px solid #f3f4f6',
                          marginTop: '0.25rem',
                          paddingTop: '0.25rem',
                        }}
                      >
                        <button
                          type="button"
                          onClick={handleLogout}
                          role="menuitem"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            width: '100%',
                            padding: '0.625rem 1rem',
                            fontSize: '0.875rem',
                            color: '#dc2626',
                            backgroundColor: 'transparent',
                            border: 'none',
                            borderRadius: '0.375rem',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'background-color 0.2s ease',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fef2f2')}
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor = 'transparent')
                          }
                        >
                          <LogOut style={{ width: '1rem', height: '1rem' }} />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* User is not logged in - show login/register buttons */
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Link
                    to="/login"
                    style={{
                      color: '#374151',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      textDecoration: 'none',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#2563eb';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#374151';
                    }}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    style={{
                      background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                      color: '#ffffff',
                      padding: '0.625rem 1.25rem',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      textDecoration: 'none',
                      boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(59, 130, 246, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(59, 130, 246, 0.3)';
                    }}
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
                style={
                  {
                    display: isDesktop ? 'none' : 'block',
                    padding: '0.5rem',
                    borderRadius: '0.5rem',
                    color: '#374151',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  } as React.CSSProperties
                }
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#2563eb';
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#374151';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {isMobileMenuOpen ? (
                  <X style={{ width: '1.5rem', height: '1.5rem' }} />
                ) : (
                  <Menu style={{ width: '1.5rem', height: '1.5rem' }} />
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
              style={{
                display: isDesktop ? 'none' : 'block',
                borderTop: '1px solid #e5e7eb',
                paddingTop: '1rem',
                paddingBottom: '1rem',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      role="menuitem"
                      onClick={() => setIsMobileMenuOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        fontSize: '1rem',
                        fontWeight: '500',
                        textDecoration: 'none',
                        transition: 'all 0.2s ease',
                        color: active ? '#2563eb' : '#374151',
                        backgroundColor: active ? '#eff6ff' : 'transparent',
                      }}
                      onMouseEnter={(e) => {
                        if (!active) {
                          e.currentTarget.style.color = '#2563eb';
                          e.currentTarget.style.backgroundColor = '#f9fafb';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!active) {
                          e.currentTarget.style.color = '#374151';
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      <Icon style={{ width: '1.25rem', height: '1.25rem' }} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Mobile User Menu */}
              {user && (
                <div
                  style={{
                    marginTop: '1rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid #e5e7eb',
                  }}
                >
                  <div style={{ padding: '0.75rem' }}>
                    <div
                      style={{
                        fontSize: '1rem',
                        fontWeight: '500',
                        color: '#111827',
                      }}
                    >
                      {user.full_name || user.username || 'User'}
                    </div>
                    <div
                      style={{
                        fontSize: '0.875rem',
                        color: '#6b7280',
                      }}
                    >
                      {user.email}
                    </div>
                  </div>

                  {userMenuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        role="menuitem"
                        onClick={() => setIsMobileMenuOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.75rem',
                          fontSize: '1rem',
                          color: '#374151',
                          textDecoration: 'none',
                          borderRadius: '0.5rem',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = '#2563eb';
                          e.currentTarget.style.backgroundColor = '#f9fafb';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = '#374151';
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <Icon style={{ width: '1.25rem', height: '1.25rem' }} />
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
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      width: '100%',
                      padding: '0.75rem',
                      fontSize: '1rem',
                      color: '#dc2626',
                      backgroundColor: 'transparent',
                      border: 'none',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background-color 0.2s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fef2f2')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <LogOut style={{ width: '1.25rem', height: '1.25rem' }} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}

              {/* Mobile Login/Register for non-authenticated users */}
              {!user && (
                <div
                  style={{
                    marginTop: '1rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid #e5e7eb',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                  }}
                >
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    style={{
                      display: 'block',
                      padding: '0.75rem',
                      fontSize: '1rem',
                      color: '#374151',
                      textDecoration: 'none',
                      borderRadius: '0.5rem',
                      transition: 'all 0.2s ease',
                      textAlign: 'center',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#2563eb';
                      e.currentTarget.style.backgroundColor = '#f9fafb';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#374151';
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    style={{
                      display: 'block',
                      padding: '0.75rem',
                      fontSize: '1rem',
                      fontWeight: '500',
                      color: '#ffffff',
                      background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                      borderRadius: '0.5rem',
                      textDecoration: 'none',
                      textAlign: 'center',
                      boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(59, 130, 246, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(59, 130, 246, 0.3)';
                    }}
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
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 40,
              backgroundColor: 'rgba(0, 0, 0, 0.25)',
              backdropFilter: 'blur(2px)',
            }}
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
