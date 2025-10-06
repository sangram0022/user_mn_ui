import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin, Mail, Heart, Shield, Zap, Users, BarChart } from 'lucide-react';

interface FooterProps {
  apiVersion?: string;
  buildVersion?: string;
}

const Footer = ({ apiVersion = "v1.0", buildVersion = "2024.8.2" }: FooterProps) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white mt-auto border-t-4 border-blue-500">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-8 h-8 text-blue-400" />
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                UserManagement
              </h3>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Enterprise-grade user management system with advanced role-based access control, workflow automation, and compliance tracking.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-3 pt-2">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-blue-600 flex items-center justify-center transition-all duration-200 transform hover:scale-110"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-blue-400 flex items-center justify-center transition-all duration-200 transform hover:scale-110"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-blue-700 flex items-center justify-center transition-all duration-200 transform hover:scale-110"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="mailto:support@usermgmt.com"
                className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-green-600 flex items-center justify-center transition-all duration-200 transform hover:scale-110"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>

            {/* System Status Badge */}
            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Status:</span>
                <span className="flex items-center text-green-400">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                  All Systems Operational
                </span>
              </div>
              <div className="flex items-center justify-between text-xs mt-2">
                <span className="text-gray-400">Version:</span>
                <span className="text-gray-300">{apiVersion} • Build {buildVersion}</span>
              </div>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-gray-200 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-yellow-400" />
              Product
            </h4>
            <ul className="space-y-3">
              <li>
                <Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm flex items-center group">
                  <span className="mr-2 group-hover:mr-3 transition-all">→</span>
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/users" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm flex items-center group">
                  <span className="mr-2 group-hover:mr-3 transition-all">→</span>
                  User Management
                </Link>
              </li>
              <li>
                <Link to="/analytics" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm flex items-center group">
                  <span className="mr-2 group-hover:mr-3 transition-all">→</span>
                  Analytics
                </Link>
              </li>
              <li>
                <Link to="/workflows" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm flex items-center group">
                  <span className="mr-2 group-hover:mr-3 transition-all">→</span>
                  Workflows
                </Link>
              </li>
              <li>
                <Link to="/security" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm flex items-center group">
                  <span className="mr-2 group-hover:mr-3 transition-all">→</span>
                  Security Center
                </Link>
              </li>
              <li>
                <a href="#pricing" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm flex items-center group">
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
                <a href="#about" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm flex items-center group">
                  <span className="mr-2 group-hover:mr-3 transition-all">→</span>
                  About Us
                </a>
              </li>
              <li>
                <a href="#careers" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm flex items-center group">
                  <span className="mr-2 group-hover:mr-3 transition-all">→</span>
                  Careers
                </a>
              </li>
              <li>
                <a href="#blog" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm flex items-center group">
                  <span className="mr-2 group-hover:mr-3 transition-all">→</span>
                  Blog
                </a>
              </li>
              <li>
                <a href="#press" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm flex items-center group">
                  <span className="mr-2 group-hover:mr-3 transition-all">→</span>
                  Press Kit
                </a>
              </li>
              <li>
                <a href="#contact" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm flex items-center group">
                  <span className="mr-2 group-hover:mr-3 transition-all">→</span>
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#partners" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm flex items-center group">
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
                <a href="#privacy" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm flex items-center group">
                  <span className="mr-2 group-hover:mr-3 transition-all">→</span>
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#terms" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm flex items-center group">
                  <span className="mr-2 group-hover:mr-3 transition-all">→</span>
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#cookies" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm flex items-center group">
                  <span className="mr-2 group-hover:mr-3 transition-all">→</span>
                  Cookie Policy
                </a>
              </li>
              <li>
                <a href="#gdpr" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm flex items-center group">
                  <span className="mr-2 group-hover:mr-3 transition-all">→</span>
                  GDPR Compliance
                </a>
              </li>
              <li>
                <Link to="/help" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm flex items-center group">
                  <span className="mr-2 group-hover:mr-3 transition-all">→</span>
                  Help Center
                </Link>
              </li>
              <li>
                <a href="#api-docs" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm flex items-center group">
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
                Made with <Heart className="w-4 h-4 mx-1 text-red-500 fill-current animate-pulse" /> by the UMS Team
              </span>
            </div>

            {/* Additional Links */}
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <a href="#sitemap" className="text-gray-400 hover:text-white transition-colors duration-200">
                Sitemap
              </a>
              <a href="#status" className="text-gray-400 hover:text-white transition-colors duration-200">
                System Status
              </a>
              <a href="#changelog" className="text-gray-400 hover:text-white transition-colors duration-200">
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
