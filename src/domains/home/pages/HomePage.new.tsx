import { ArrowRight, BarChart3, Lock, Shield, Users, Zap } from 'lucide-react';
import type React from 'react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';

import Header from '@shared/components/Header';
import { PageMetadata } from '@shared/components/PageMetadata';
import { prefetchRoute } from '@shared/utils/resource-loading';

const HomePage: React.FC = () => {
  // Prefetch likely next routes
  useEffect(() => {
    prefetchRoute('/register');
    prefetchRoute('/login');
  }, []);

  return (
    <>
      <PageMetadata
        title="User Management System - Modern & Secure"
        description="Streamline user administration with comprehensive role management, permissions, and access controls. Enterprise-grade security with intuitive design."
        keywords="user management, role management, authentication, authorization, security, RBAC"
      />

      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-blue-50">
        {/* Header */}
        <Header />

        {/* Hero Section */}
        <section className="flex-1 px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="max-w-7xl mx-auto">
            <div className="text-center space-y-8 animate-fade-in">
              {/* Main Heading */}
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  <Zap className="w-4 h-4" />
                  <span>Modern User Management</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
                  <span className="text-gray-900">Secure User</span>
                  <br />
                  <span className="text-gradient">Management System</span>
                </h1>

                <p className="max-w-2xl mx-auto text-lg sm:text-xl text-gray-600 leading-relaxed">
                  Streamline user administration with comprehensive role management, permissions,
                  and enterprise-grade security.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link to="/register" className="btn btn-primary btn-lg group w-full sm:w-auto">
                  <span>Start Free Trial</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link to="/login" className="btn btn-secondary btn-lg w-full sm:w-auto">
                  Sign In
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap justify-center gap-6 pt-8 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>SOC 2 Certified</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>GDPR Compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>99.9% Uptime</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Everything You Need</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Powerful features to manage users, roles, and permissions with ease
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="card card-body group hover:scale-105 transition-transform duration-300">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
                  <Users className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">User Management</h3>
                <p className="text-gray-600 leading-relaxed">
                  Comprehensive user administration with role-based access control and permission
                  management.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="card card-body group hover:scale-105 transition-transform duration-300">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-600 transition-colors">
                  <Shield className="w-6 h-6 text-green-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Security First</h3>
                <p className="text-gray-600 leading-relaxed">
                  Enterprise-grade security with multi-factor authentication and advanced threat
                  protection.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="card card-body group hover:scale-105 transition-transform duration-300">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-600 transition-colors">
                  <BarChart3 className="w-6 h-6 text-purple-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Analytics & Insights</h3>
                <p className="text-gray-600 leading-relaxed">
                  Real-time analytics and reporting to track user activity and system performance.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-3xl sm:text-4xl font-bold">Ready to Get Started?</h2>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto">
              Join thousands of organizations that trust our platform for secure user management.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-xl hover:shadow-2xl"
            >
              <span>Create Your Account</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-4 sm:px-6 lg:px-8 py-8 bg-gray-900 text-gray-400">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Lock className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-semibold text-white">User Management</span>
              </div>
              <p className="text-sm">© 2024 User Management Platform. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default HomePage;
