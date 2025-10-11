import { BarChart, Github, Heart, Linkedin, Mail, Shield, Twitter, Users, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FooterProps {
  apiVersion?: string;
  buildVersion?: string;
}

const Footer = ({ apiVersion = 'v1.0', buildVersion = '2024.8.2' }: FooterProps) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      style={{
        background: 'linear-gradient(135deg, #111827 0%, #1f2937 50%, #111827 100%)',
        color: '#ffffff',
        marginTop: 'auto',
        borderTop: '4px solid #3b82f6',
      }}
    >
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
                  className="text-gray-400 hover:text-white transition-colors duration-200 text-sm flex items-center group"
                >
                  <span className="mr-2 group-hover:mr-3 transition-all">→</span>
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/users"
                  className="text-gray-400 hover:text-white transition-colors duration-200 text-sm flex items-center group"
                >
                  <span className="mr-2 group-hover:mr-3 transition-all">→</span>
                  User Management
                </Link>
              </li>
              <li>
                <Link
                  to="/analytics"
                  className="text-gray-400 hover:text-white transition-colors duration-200 text-sm flex items-center group"
                >
                  <span className="mr-2 group-hover:mr-3 transition-all">→</span>
                  Analytics
                </Link>
              </li>
              <li>
                <Link
                  to="/workflows"
                  className="text-gray-400 hover:text-white transition-colors duration-200 text-sm flex items-center group"
                >
                  <span className="mr-2 group-hover:mr-3 transition-all">→</span>
                  Workflows
                </Link>
              </li>
              <li>
                <Link
                  to="/security"
                  className="text-gray-400 hover:text-white transition-colors duration-200 text-sm flex items-center group"
                >
                  <span className="mr-2 group-hover:mr-3 transition-all">→</span>
                  Security Center
                </Link>
              </li>
              <li>
                <a
                  href="#pricing"
                  className="text-gray-400 hover:text-white transition-colors duration-200 text-sm flex items-center group"
                >
                  <span className="mr-2 group-hover:mr-3 transition-all">→</span>
                  Pricing
                </a>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-gray-200 flex items-center">
              <Users className="w-5 h-5 mr-2 text-purple-400" />
              Company
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="#about"
                  className="text-gray-400 hover:text-white transition-colors duration-200 text-sm flex items-center group"
                >
                  <span className="mr-2 group-hover:mr-3 transition-all">→</span>
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="#careers"
                  className="text-gray-400 hover:text-white transition-colors duration-200 text-sm flex items-center group"
                >
                  <span className="mr-2 group-hover:mr-3 transition-all">→</span>
                  Careers
                </a>
              </li>
              <li>
                <a
                  href="#blog"
                  className="text-gray-400 hover:text-white transition-colors duration-200 text-sm flex items-center group"
                >
                  <span className="mr-2 group-hover:mr-3 transition-all">→</span>
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="#press"
                  className="text-gray-400 hover:text-white transition-colors duration-200 text-sm flex items-center group"
                >
                  <span className="mr-2 group-hover:mr-3 transition-all">→</span>
                  Press Kit
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  className="text-gray-400 hover:text-white transition-colors duration-200 text-sm flex items-center group"
                >
                  <span className="mr-2 group-hover:mr-3 transition-all">→</span>
                  Contact Us
                </a>
              </li>
              <li>
                <a
                  href="#partners"
                  className="text-gray-400 hover:text-white transition-colors duration-200 text-sm flex items-center group"
                >
                  <span className="mr-2 group-hover:mr-3 transition-all">→</span>
                  Partners
                </a>
              </li>
            </ul>
          </div>

          {/* Legal & Support */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-gray-200 flex items-center">
              <BarChart className="w-5 h-5 mr-2 text-green-400" />
              Legal & Support
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="#privacy"
                  className="text-gray-400 hover:text-white transition-colors duration-200 text-sm flex items-center group"
                >
                  <span className="mr-2 group-hover:mr-3 transition-all">→</span>
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#terms"
                  className="text-gray-400 hover:text-white transition-colors duration-200 text-sm flex items-center group"
                >
                  <span className="mr-2 group-hover:mr-3 transition-all">→</span>
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="#cookies"
                  className="text-gray-400 hover:text-white transition-colors duration-200 text-sm flex items-center group"
                >
                  <span className="mr-2 group-hover:mr-3 transition-all">→</span>
                  Cookie Policy
                </a>
              </li>
              <li>
                <a
                  href="#gdpr"
                  className="text-gray-400 hover:text-white transition-colors duration-200 text-sm flex items-center group"
                >
                  <span className="mr-2 group-hover:mr-3 transition-all">→</span>
                  GDPR Compliance
                </a>
              </li>
              <li>
                <Link
                  to="/help"
                  className="text-gray-400 hover:text-white transition-colors duration-200 text-sm flex items-center group"
                >
                  <span className="mr-2 group-hover:mr-3 transition-all">→</span>
                  Help Center
                </Link>
              </li>
              <li>
                <a
                  href="#api-docs"
                  className="text-gray-400 hover:text-white transition-colors duration-200 text-sm flex items-center group"
                >
                  <span className="mr-2 group-hover:mr-3 transition-all">→</span>
                  API Documentation
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Features Banner */}
        <div className="mt-8 bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg p-4 border border-blue-800/50">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <div className="flex items-center text-gray-300">
              <Shield className="w-4 h-4 mr-2 text-blue-400" />
              Enterprise Security
            </div>
            <div className="flex items-center text-gray-300">
              <Users className="w-4 h-4 mr-2 text-purple-400" />
              Role-Based Access
            </div>
            <div className="flex items-center text-gray-300">
              <Zap className="w-4 h-4 mr-2 text-yellow-400" />
              Workflow Automation
            </div>
            <div className="flex items-center text-gray-300">
              <BarChart className="w-4 h-4 mr-2 text-green-400" />
              Advanced Analytics
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="text-gray-400 text-sm flex items-center flex-wrap justify-center gap-2">
              <span>© {currentYear} UserManagement System. All rights reserved.</span>
              <span className="hidden md:inline">•</span>
              <span className="flex items-center">
                Made with <Heart className="w-4 h-4 mx-1 text-red-500 fill-current animate-pulse" />{' '}
                by the UMS Team
              </span>
            </div>

            {/* Additional Links */}
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <a
                href="#sitemap"
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                Sitemap
              </a>
              <a
                href="#status"
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                System Status
              </a>
              <a
                href="#changelog"
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                Changelog
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Bottom Border */}
      <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
    </footer>
  );
};

export default Footer;
