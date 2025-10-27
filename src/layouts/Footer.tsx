import { BarChart, Github, Heart, Linkedin, Mail, Shield, Twitter, Users, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FooterProps {
  apiVersion?: string;
  buildVersion?: string;
}

const Footer = ({ apiVersion = 'v1.0', buildVersion = '2024.8.2' }: FooterProps) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t-4 border-[var(--color-primary)] bg-gradient-to-br from-[var(--color-surface-secondary)] via-[var(--color-surface-secondary)] to-[var(--color-surface-primary)] text-[var(--color-text-primary)] dark:from-[var(--color-surface-secondary)] dark:via-[var(--color-surface-secondary)] dark:to-[var(--color-surface-secondary)]">
      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Company Info */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Shield className="icon-xl icon-primary" />
              <h3 className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary)] bg-clip-text text-2xl font-bold text-transparent">
                UserManagement
              </h3>
            </div>
            <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
              Enterprise-grade user management system with advanced role-based access control and
              compliance tracking.
            </p>

            {/* Social Links */}
            <div className="flex gap-3 pt-2">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg bg-[var(--color-surface-secondary)] transition-all duration-200 hover:scale-110 hover:bg-[var(--color-surface-secondary)] dark:hover:bg-[var(--color-surface-secondary)]"
                aria-label="GitHub"
              >
                <Github className="icon-md" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg bg-[var(--color-surface-secondary)] transition-all duration-200 hover:scale-110 hover:bg-[var(--color-surface-secondary)]"
                aria-label="Twitter"
              >
                <Twitter className="icon-md" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg bg-[var(--color-surface-secondary)] transition-all duration-200 hover:scale-110 hover:bg-[var(--color-surface-secondary)]"
                aria-label="LinkedIn"
              >
                <Linkedin className="icon-md" />
              </a>
              <a
                href="mailto:support@usermgmt.com"
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg bg-[var(--color-surface-secondary)] transition-all duration-200 hover:scale-110 hover:bg-[var(--color-success)]"
                aria-label="Email"
              >
                <Mail className="icon-md" />
              </a>
            </div>

            {/* System Status Badge */}
            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-secondary)]/50 p-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--color-text-secondary)]">Status:</span>
                <span className="badge badge-success badge-dot">All Systems Operational</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-[var(--color-text-secondary)]">Version:</span>
                <span className="text-[var(--color-text-secondary)]">
                  {apiVersion} Build {buildVersion}
                </span>
              </div>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="mb-4 text-base font-semibold text-[var(--color-text-primary)]">
              <Zap className="mr-2 inline icon-md text-[var(--color-warning)]" />
              Lightning Fast
            </h4>
            <ul className="m-0 flex list-none flex-col gap-3 p-0">
              <li>
                <Link
                  to="/dashboard"
                  className="flex items-center text-sm no-underline transition-colors duration-200"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  <span className="mr-2" />
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/users"
                  className="flex items-center text-sm no-underline transition-colors duration-200"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  <span className="mr-2" />
                  User Management
                </Link>
              </li>
              <li>
                <Link
                  to="/analytics"
                  className="flex items-center text-sm no-underline transition-colors duration-200"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  <span className="mr-2" />
                  Analytics
                </Link>
              </li>
              <li>
                <Link
                  to="/security"
                  className="flex items-center text-sm no-underline transition-colors duration-200"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  <span className="mr-2" />
                  Security Center
                </Link>
              </li>
              <li>
                <a
                  href="#pricing"
                  className="flex items-center text-sm no-underline transition-colors duration-200"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  <span className="mr-2" />
                  Pricing
                </a>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="mb-4 flex items-center text-lg font-semibold text-[var(--color-text-secondary)]">
              <Users className="mr-2 icon-md icon-primary" />
              Company
            </h4>
            <ul className="m-0 flex list-none flex-col gap-3 p-0">
              <li>
                <a
                  href="#about"
                  className="flex items-center text-sm no-underline transition-colors duration-200"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  <span className="mr-2" />
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="#careers"
                  className="flex items-center text-sm no-underline transition-colors duration-200"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  <span className="mr-2" />
                  Careers
                </a>
              </li>
              <li>
                <a
                  href="#blog"
                  className="flex items-center text-sm no-underline transition-colors duration-200"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  <span className="mr-2" />
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="#press"
                  className="flex items-center text-sm no-underline transition-colors duration-200"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  <span className="mr-2" />
                  Press Kit
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  className="flex items-center text-sm no-underline transition-colors duration-200"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  <span className="mr-2" />
                  Contact Us
                </a>
              </li>
              <li>
                <a
                  href="#partners"
                  className="flex items-center text-sm no-underline transition-colors duration-200"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  <span className="mr-2" />
                  Partners
                </a>
              </li>
            </ul>
          </div>

          {/* Legal & Support */}
          <div>
            <h4 className="mb-4 flex items-center text-lg font-semibold text-[var(--color-text-secondary)]">
              <BarChart className="mr-2 icon-md icon-success" />
              Legal & Support
            </h4>
            <ul className="m-0 flex list-none flex-col gap-3 p-0">
              <li>
                <a
                  href="#privacy"
                  className="flex items-center text-sm no-underline transition-colors duration-200"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  <span className="mr-2" />
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#terms"
                  className="flex items-center text-sm no-underline transition-colors duration-200"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  <span className="mr-2" />
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="#cookies"
                  className="flex items-center text-sm no-underline transition-colors duration-200"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  <span className="mr-2" />
                  Cookie Policy
                </a>
              </li>
              <li>
                <a
                  href="#gdpr"
                  className="flex items-center text-sm no-underline transition-colors duration-200"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  <span className="mr-2" />
                  GDPR Compliance
                </a>
              </li>
              <li>
                <Link
                  to="/help"
                  className="flex items-center text-sm no-underline transition-colors duration-200"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  <span className="mr-2" />
                  Help Center
                </Link>
              </li>
              <li>
                <a
                  href="#api-docs"
                  className="flex items-center text-sm no-underline transition-colors duration-200"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  <span className="mr-2" />
                  API Documentation
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Features Banner */}
        <div className="mt-8 rounded-lg border border-[var(--color-primary)]/50 bg-gradient-to-r from-[var(--color-primary)]/30 to-[var(--color-primary)]/30 p-4">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <div className="flex items-center text-[var(--color-text-secondary)]">
              <Shield className="mr-2 icon-sm icon-primary" />
              Enterprise Security
            </div>
            <div className="flex items-center text-[var(--color-text-secondary)]">
              <Users className="mr-2 icon-sm icon-primary" />
              Role-Based Access
            </div>
            <div className="flex items-center text-[var(--color-text-secondary)]">
              <BarChart className="mr-2 icon-sm icon-success" />
              Advanced Analytics
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-8 border-t border-[var(--color-border)] pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            {/* Copyright */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-[var(--color-text-secondary)]">
              <span> {currentYear} UserManagement System. All rights reserved.</span>
              <span className="hidden md:inline" />
              <span className="flex items-center">
                Made with{' '}
                <Heart className="mx-1 icon-sm animate-pulse fill-current text-[var(--color-error)]" />{' '}
                by the UMS Team
              </span>
            </div>

            {/* Additional Links */}
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <a
                href="#sitemap"
                className="no-underline transition-colors duration-200"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Sitemap
              </a>
              <a
                href="#status"
                className="no-underline transition-colors duration-200"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                System Status
              </a>
              <a
                href="#changelog"
                className="no-underline transition-colors duration-200"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Changelog
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Bottom Border */}
      <div className="h-1 bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-primary)] to-[var(--color-error)]" />
    </footer>
  );
};

export default Footer;
