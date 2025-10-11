import { BarChart, Github, Heart, Linkedin, Mail, Shield, Twitter, Users, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FooterProps {
  apiVersion?: string;
  buildVersion?: string;
}

const Footer = ({ apiVersion = 'v1.0', buildVersion = '2024.8.2' }: FooterProps) => {
  const currentYear = new Date().getFullYear();

  const linkStyle = {
    color: '#9ca3af',
    textDecoration: 'none',
    fontSize: '0.875rem',
    display: 'flex',
    alignItems: 'center',
    transition: 'color 0.2s ease',
  };

  const iconStyle = {
    marginRight: '0.5rem',
    transition: 'margin-right 0.2s ease',
  };

  return (
    <footer
      style={{
        background: 'linear-gradient(135deg, #111827 0%, #1f2937 50%, #111827 100%)',
        color: '#ffffff',
        marginTop: 'auto',
        borderTop: '4px solid #3b82f6',
      }}
    >
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>

      {/* Main Footer Content */}
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '3rem 1rem',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '2rem',
          }}
        >
          {/* Company Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield style={{ width: '2rem', height: '2rem', color: '#60a5fa' }} />
              <h3
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                UserManagement
              </h3>
            </div>
            <p
              style={{
                color: '#9ca3af',
                fontSize: '0.875rem',
                lineHeight: '1.5',
              }}
            >
              Enterprise-grade user management system with advanced role-based access control,
              workflow automation, and compliance tracking.
            </p>

            {/* Social Links */}
            <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.5rem' }}>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  borderRadius: '0.5rem',
                  backgroundColor: '#1f2937',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#2563eb';
                  e.currentTarget.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#1f2937';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                aria-label="GitHub"
              >
                <Github style={{ width: '1.25rem', height: '1.25rem' }} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  borderRadius: '0.5rem',
                  backgroundColor: '#1f2937',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#60a5fa';
                  e.currentTarget.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#1f2937';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                aria-label="Twitter"
              >
                <Twitter style={{ width: '1.25rem', height: '1.25rem' }} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  borderRadius: '0.5rem',
                  backgroundColor: '#1f2937',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1d4ed8';
                  e.currentTarget.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#1f2937';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                aria-label="LinkedIn"
              >
                <Linkedin style={{ width: '1.25rem', height: '1.25rem' }} />
              </a>
              <a
                href="mailto:support@usermgmt.com"
                style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  borderRadius: '0.5rem',
                  backgroundColor: '#1f2937',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#059669';
                  e.currentTarget.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#1f2937';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                aria-label="Email"
              >
                <Mail style={{ width: '1.25rem', height: '1.25rem' }} />
              </a>
            </div>

            {/* System Status Badge */}
            <div
              style={{
                backgroundColor: 'rgba(31, 41, 55, 0.5)',
                borderRadius: '0.5rem',
                padding: '0.75rem',
                border: '1px solid #374151',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.75rem',
                }}
              >
                <span style={{ color: '#9ca3af' }}>Status:</span>
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    color: '#4ade80',
                  }}
                >
                  <span
                    style={{
                      width: '0.5rem',
                      height: '0.5rem',
                      backgroundColor: '#4ade80',
                      borderRadius: '9999px',
                      marginRight: '0.5rem',
                      animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                    }}
                  ></span>
                  All Systems Operational
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.75rem',
                  marginTop: '0.5rem',
                }}
              >
                <span style={{ color: '#9ca3af' }}>Version:</span>
                <span style={{ color: '#d1d5db' }}>
                  {apiVersion} • Build {buildVersion}
                </span>
              </div>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4
              style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                marginBottom: '1rem',
                color: '#e5e7eb',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Zap
                style={{
                  width: '1.25rem',
                  height: '1.25rem',
                  marginRight: '0.5rem',
                  color: '#facc15',
                }}
              />
              Product
            </h4>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              <li>
                <Link
                  to="/dashboard"
                  style={linkStyle}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#ffffff';
                    const span = e.currentTarget.querySelector('span');
                    if (span) (span as HTMLElement).style.marginRight = '0.75rem';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#9ca3af';
                    const span = e.currentTarget.querySelector('span');
                    if (span) (span as HTMLElement).style.marginRight = '0.5rem';
                  }}
                >
                  <span style={iconStyle}>→</span>
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/users"
                  style={linkStyle}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#ffffff';
                    const span = e.currentTarget.querySelector('span');
                    if (span) (span as HTMLElement).style.marginRight = '0.75rem';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#9ca3af';
                    const span = e.currentTarget.querySelector('span');
                    if (span) (span as HTMLElement).style.marginRight = '0.5rem';
                  }}
                >
                  <span style={iconStyle}>→</span>
                  User Management
                </Link>
              </li>
              <li>
                <Link
                  to="/analytics"
                  style={linkStyle}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#ffffff';
                    const span = e.currentTarget.querySelector('span');
                    if (span) (span as HTMLElement).style.marginRight = '0.75rem';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#9ca3af';
                    const span = e.currentTarget.querySelector('span');
                    if (span) (span as HTMLElement).style.marginRight = '0.5rem';
                  }}
                >
                  <span style={iconStyle}>→</span>
                  Analytics
                </Link>
              </li>
              <li>
                <Link
                  to="/workflows"
                  style={linkStyle}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#ffffff';
                    const span = e.currentTarget.querySelector('span');
                    if (span) (span as HTMLElement).style.marginRight = '0.75rem';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#9ca3af';
                    const span = e.currentTarget.querySelector('span');
                    if (span) (span as HTMLElement).style.marginRight = '0.5rem';
                  }}
                >
                  <span style={iconStyle}>→</span>
                  Workflows
                </Link>
              </li>
              <li>
                <Link
                  to="/security"
                  style={linkStyle}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#ffffff';
                    const span = e.currentTarget.querySelector('span');
                    if (span) (span as HTMLElement).style.marginRight = '0.75rem';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#9ca3af';
                    const span = e.currentTarget.querySelector('span');
                    if (span) (span as HTMLElement).style.marginRight = '0.5rem';
                  }}
                >
                  <span style={iconStyle}>→</span>
                  Security Center
                </Link>
              </li>
              <li>
                <a
                  href="#pricing"
                  style={linkStyle}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#ffffff';
                    const span = e.currentTarget.querySelector('span');
                    if (span) (span as HTMLElement).style.marginRight = '0.75rem';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#9ca3af';
                    const span = e.currentTarget.querySelector('span');
                    if (span) (span as HTMLElement).style.marginRight = '0.5rem';
                  }}
                >
                  <span style={iconStyle}>→</span>
                  Pricing
                </a>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4
              style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                marginBottom: '1rem',
                color: '#e5e7eb',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Users
                style={{
                  width: '1.25rem',
                  height: '1.25rem',
                  marginRight: '0.5rem',
                  color: '#c084fc',
                }}
              />
              Company
            </h4>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              {['About Us', 'Careers', 'Blog', 'Press Kit', 'Contact Us', 'Partners'].map(
                (item, idx) => (
                  <li key={idx}>
                    <a
                      href={`#${item.toLowerCase().replace(' ', '-')}`}
                      style={linkStyle}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#ffffff';
                        const span = e.currentTarget.querySelector('span');
                        if (span) (span as HTMLElement).style.marginRight = '0.75rem';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#9ca3af';
                        const span = e.currentTarget.querySelector('span');
                        if (span) (span as HTMLElement).style.marginRight = '0.5rem';
                      }}
                    >
                      <span style={iconStyle}>→</span>
                      {item}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Legal & Support */}
          <div>
            <h4
              style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                marginBottom: '1rem',
                color: '#e5e7eb',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <BarChart
                style={{
                  width: '1.25rem',
                  height: '1.25rem',
                  marginRight: '0.5rem',
                  color: '#4ade80',
                }}
              />
              Legal & Support
            </h4>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              <li>
                <a
                  href="#privacy"
                  style={linkStyle}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#ffffff';
                    const span = e.currentTarget.querySelector('span');
                    if (span) (span as HTMLElement).style.marginRight = '0.75rem';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#9ca3af';
                    const span = e.currentTarget.querySelector('span');
                    if (span) (span as HTMLElement).style.marginRight = '0.5rem';
                  }}
                >
                  <span style={iconStyle}>→</span>
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#terms"
                  style={linkStyle}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#ffffff';
                    const span = e.currentTarget.querySelector('span');
                    if (span) (span as HTMLElement).style.marginRight = '0.75rem';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#9ca3af';
                    const span = e.currentTarget.querySelector('span');
                    if (span) (span as HTMLElement).style.marginRight = '0.5rem';
                  }}
                >
                  <span style={iconStyle}>→</span>
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="#cookies"
                  style={linkStyle}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#ffffff';
                    const span = e.currentTarget.querySelector('span');
                    if (span) (span as HTMLElement).style.marginRight = '0.75rem';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#9ca3af';
                    const span = e.currentTarget.querySelector('span');
                    if (span) (span as HTMLElement).style.marginRight = '0.5rem';
                  }}
                >
                  <span style={iconStyle}>→</span>
                  Cookie Policy
                </a>
              </li>
              <li>
                <a
                  href="#gdpr"
                  style={linkStyle}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#ffffff';
                    const span = e.currentTarget.querySelector('span');
                    if (span) (span as HTMLElement).style.marginRight = '0.75rem';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#9ca3af';
                    const span = e.currentTarget.querySelector('span');
                    if (span) (span as HTMLElement).style.marginRight = '0.5rem';
                  }}
                >
                  <span style={iconStyle}>→</span>
                  GDPR Compliance
                </a>
              </li>
              <li>
                <Link
                  to="/help"
                  style={linkStyle}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#ffffff';
                    const span = e.currentTarget.querySelector('span');
                    if (span) (span as HTMLElement).style.marginRight = '0.75rem';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#9ca3af';
                    const span = e.currentTarget.querySelector('span');
                    if (span) (span as HTMLElement).style.marginRight = '0.5rem';
                  }}
                >
                  <span style={iconStyle}>→</span>
                  Help Center
                </Link>
              </li>
              <li>
                <a
                  href="#api-docs"
                  style={linkStyle}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#ffffff';
                    const span = e.currentTarget.querySelector('span');
                    if (span) (span as HTMLElement).style.marginRight = '0.75rem';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#9ca3af';
                    const span = e.currentTarget.querySelector('span');
                    if (span) (span as HTMLElement).style.marginRight = '0.5rem';
                  }}
                >
                  <span style={iconStyle}>→</span>
                  API Documentation
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Features Banner */}
        <div
          style={{
            marginTop: '2rem',
            background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.3), rgba(88, 28, 135, 0.3))',
            borderRadius: '0.5rem',
            padding: '1rem',
            border: '1px solid rgba(59, 130, 246, 0.5)',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1.5rem',
              fontSize: '0.875rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', color: '#d1d5db' }}>
              <Shield
                style={{ width: '1rem', height: '1rem', marginRight: '0.5rem', color: '#60a5fa' }}
              />
              Enterprise Security
            </div>
            <div style={{ display: 'flex', alignItems: 'center', color: '#d1d5db' }}>
              <Users
                style={{ width: '1rem', height: '1rem', marginRight: '0.5rem', color: '#c084fc' }}
              />
              Role-Based Access
            </div>
            <div style={{ display: 'flex', alignItems: 'center', color: '#d1d5db' }}>
              <Zap
                style={{ width: '1rem', height: '1rem', marginRight: '0.5rem', color: '#facc15' }}
              />
              Workflow Automation
            </div>
            <div style={{ display: 'flex', alignItems: 'center', color: '#d1d5db' }}>
              <BarChart
                style={{ width: '1rem', height: '1rem', marginRight: '0.5rem', color: '#4ade80' }}
              />
              Advanced Analytics
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid #374151', marginTop: '2rem', paddingTop: '2rem' }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1rem',
            }}
          >
            {/* Copyright */}
            <div
              style={{
                color: '#9ca3af',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              <span>© {currentYear} UserManagement System. All rights reserved.</span>
              <span style={{ display: 'none' }}>•</span>
              <span style={{ display: 'flex', alignItems: 'center' }}>
                Made with{' '}
                <Heart
                  style={{
                    width: '1rem',
                    height: '1rem',
                    margin: '0 0.25rem',
                    color: '#ef4444',
                    fill: 'currentColor',
                    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                  }}
                />{' '}
                by the UMS Team
              </span>
            </div>

            {/* Additional Links */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: '1rem',
                fontSize: '0.875rem',
              }}
            >
              <a
                href="#sitemap"
                style={{ color: '#9ca3af', textDecoration: 'none', transition: 'color 0.2s ease' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#9ca3af')}
              >
                Sitemap
              </a>
              <a
                href="#status"
                style={{ color: '#9ca3af', textDecoration: 'none', transition: 'color 0.2s ease' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#9ca3af')}
              >
                System Status
              </a>
              <a
                href="#changelog"
                style={{ color: '#9ca3af', textDecoration: 'none', transition: 'color 0.2s ease' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#9ca3af')}
              >
                Changelog
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Bottom Border */}
      <div
        style={{
          height: '0.25rem',
          background: 'linear-gradient(90deg, #3b82f6, #a78bfa, #ec4899)',
        }}
      ></div>
    </footer>
  );
};

export default Footer;
