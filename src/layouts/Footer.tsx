import { BarChart, Github, Heart, Linkedin, Mail, Shield, Twitter, Users, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FooterProps {
  apiVersion?: string;
  buildVersion?: string;
}

const Footer = ({ apiVersion = 'v1.0', buildVersion = '2024.8.2' }: FooterProps) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t-4 border-blue-500 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Company Info */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-blue-400" />
              <h3 className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-2xl font-bold text-transparent">
                UserManagement
              </h3>
            </div>
            <p className="text-sm leading-relaxed text-gray-400">
              Enterprise-grade user management system with advanced role-based access control,
              workflow automation, and compliance tracking.
            </p>

            {/* Social Links */}
            <div className="flex gap-3 pt-2">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg bg-gray-800 transition-all duration-200 hover:scale-110 hover:bg-slate-600 dark:hover:bg-slate-400"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg bg-gray-800 transition-all duration-200 hover:scale-110 hover:bg-slate-500"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg bg-gray-800 transition-all duration-200 hover:scale-110 hover:bg-slate-700"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="mailto:support@usermgmt.com"
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg bg-gray-800 transition-all duration-200 hover:scale-110 hover:bg-emerald-600"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>

            {/* System Status Badge */}
            <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Status:</span>
                <span className="flex items-center text-green-400">
                  <span className="mr-2 h-2 w-2 animate-pulse rounded-full bg-green-400"></span>
                  All Systems Operational
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-gray-400">Version:</span>
                <span className="text-gray-300">
                  {apiVersion} • Build {buildVersion}
                </span>
              </div>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="mb-4 flex items-center text-lg font-semibold text-gray-200">
              <Zap className="mr-2 h-5 w-5 text-yellow-400" />
              Product
            </h4>
            <ul className="m-0 flex list-none flex-col gap-3 p-0">
              <li>
                <Link
                  to="/dashboard"
                  className="flex items-center text-sm no-underline transition-colors duration-200"
                  style={{ color: 'var(--theme-textSecondary)' }}
                >
                  <span className="mr-2">→</span>
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/users"
                  className="flex items-center text-sm no-underline transition-colors duration-200"
                  style={{ color: 'var(--theme-textSecondary)' }}
                >
                  <span className="mr-2">→</span>
                  User Management
                </Link>
              </li>
              <li>
                <Link
                  to="/analytics"
                  className="flex items-center text-sm no-underline transition-colors duration-200"
                  style={{ color: 'var(--theme-textSecondary)' }}
                >
                  <span className="mr-2">→</span>
                  Analytics
                </Link>
              </li>
              <li>
                <Link
                  to="/workflows"
                  className="flex items-center text-sm no-underline transition-colors duration-200"
                  style={{ color: 'var(--theme-textSecondary)' }}
                >
                  <span className="mr-2">→</span>
                  Workflows
                </Link>
              </li>
              <li>
                <Link
                  to="/security"
                  className="flex items-center text-sm no-underline transition-colors duration-200"
                  style={{ color: 'var(--theme-textSecondary)' }}
                >
                  <span className="mr-2">→</span>
                  Security Center
                </Link>
              </li>
              <li>
                <a
                  href="#pricing"
                  className="flex items-center text-sm no-underline transition-colors duration-200"
                  style={{ color: 'var(--theme-textSecondary)' }}
                >
                  <span className="mr-2">→</span>
                  Pricing
                </a>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="mb-4 flex items-center text-lg font-semibold text-gray-200">
              <Users className="mr-2 h-5 w-5 text-purple-400" />
              Company
            </h4>
            <ul className="m-0 flex list-none flex-col gap-3 p-0">
              <li>
                <a
                  href="#about"
                  className="flex items-center text-sm no-underline transition-colors duration-200"
                  style={{ color: 'var(--theme-textSecondary)' }}
                >
                  <span className="mr-2">→</span>
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="#careers"
                  className="flex items-center text-sm no-underline transition-colors duration-200"
                  style={{ color: 'var(--theme-textSecondary)' }}
                >
                  <span className="mr-2">→</span>
                  Careers
                </a>
              </li>
              <li>
                <a
                  href="#blog"
                  className="flex items-center text-sm no-underline transition-colors duration-200"
                  style={{ color: 'var(--theme-textSecondary)' }}
                >
                  <span className="mr-2">→</span>
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="#press"
                  className="flex items-center text-sm no-underline transition-colors duration-200"
                  style={{ color: 'var(--theme-textSecondary)' }}
                >
                  <span className="mr-2">→</span>
                  Press Kit
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  className="flex items-center text-sm no-underline transition-colors duration-200"
                  style={{ color: 'var(--theme-textSecondary)' }}
                >
                  <span className="mr-2">→</span>
                  Contact Us
                </a>
              </li>
              <li>
                <a
                  href="#partners"
                  className="flex items-center text-sm no-underline transition-colors duration-200"
                  style={{ color: 'var(--theme-textSecondary)' }}
                >
                  <span className="mr-2">→</span>
                  Partners
                </a>
              </li>
            </ul>
          </div>

          {/* Legal & Support */}
          <div>
            <h4 className="mb-4 flex items-center text-lg font-semibold text-gray-200">
              <BarChart className="mr-2 h-5 w-5 text-green-400" />
              Legal & Support
            </h4>
            <ul className="m-0 flex list-none flex-col gap-3 p-0">
              <li>
                <a
                  href="#privacy"
                  className="flex items-center text-sm no-underline transition-colors duration-200"
                  style={{ color: 'var(--theme-textSecondary)' }}
                >
                  <span className="mr-2">→</span>
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#terms"
                  className="flex items-center text-sm no-underline transition-colors duration-200"
                  style={{ color: 'var(--theme-textSecondary)' }}
                >
                  <span className="mr-2">→</span>
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="#cookies"
                  className="flex items-center text-sm no-underline transition-colors duration-200"
                  style={{ color: 'var(--theme-textSecondary)' }}
                >
                  <span className="mr-2">→</span>
                  Cookie Policy
                </a>
              </li>
              <li>
                <a
                  href="#gdpr"
                  className="flex items-center text-sm no-underline transition-colors duration-200"
                  style={{ color: 'var(--theme-textSecondary)' }}
                >
                  <span className="mr-2">→</span>
                  GDPR Compliance
                </a>
              </li>
              <li>
                <Link
                  to="/help"
                  className="flex items-center text-sm no-underline transition-colors duration-200"
                  style={{ color: 'var(--theme-textSecondary)' }}
                >
                  <span className="mr-2">→</span>
                  Help Center
                </Link>
              </li>
              <li>
                <a
                  href="#api-docs"
                  className="flex items-center text-sm no-underline transition-colors duration-200"
                  style={{ color: 'var(--theme-textSecondary)' }}
                >
                  <span className="mr-2">→</span>
                  API Documentation
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Features Banner */}
        <div className="mt-8 rounded-lg border border-blue-800/50 bg-gradient-to-r from-blue-900/30 to-purple-900/30 p-4">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <div className="flex items-center text-gray-300">
              <Shield className="mr-2 h-4 w-4 text-blue-400" />
              Enterprise Security
            </div>
            <div className="flex items-center text-gray-300">
              <Users className="mr-2 h-4 w-4 text-purple-400" />
              Role-Based Access
            </div>
            <div className="flex items-center text-gray-300">
              <Zap className="mr-2 h-4 w-4 text-yellow-400" />
              Workflow Automation
            </div>
            <div className="flex items-center text-gray-300">
              <BarChart className="mr-2 h-4 w-4 text-green-400" />
              Advanced Analytics
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-8 border-t border-gray-700 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            {/* Copyright */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-gray-400">
              <span>© {currentYear} UserManagement System. All rights reserved.</span>
              <span className="hidden md:inline">•</span>
              <span className="flex items-center">
                Made with <Heart className="mx-1 h-4 w-4 animate-pulse fill-current text-red-500" />{' '}
                by the UMS Team
              </span>
            </div>

            {/* Additional Links */}
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <a
                href="#sitemap"
                className="no-underline transition-colors duration-200"
                style={{ color: 'var(--theme-textSecondary)' }}
              >
                Sitemap
              </a>
              <a
                href="#status"
                className="no-underline transition-colors duration-200"
                style={{ color: 'var(--theme-textSecondary)' }}
              >
                System Status
              </a>
              <a
                href="#changelog"
                className="no-underline transition-colors duration-200"
                style={{ color: 'var(--theme-textSecondary)' }}
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
