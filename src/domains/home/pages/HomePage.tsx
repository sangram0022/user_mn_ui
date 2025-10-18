import { ArrowRight, BarChart3, Lock, Shield, Users } from 'lucide-react';
import type React from 'react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';

import Header from '@shared/components/Header';
import { PageMetadata } from '@shared/components/PageMetadata';
import { prefetchRoute } from '@shared/utils/resource-loading';

const HomePage: React.FC = () => {
  // Prefetch likely next routes for improved navigation performance
  useEffect(() => {
    prefetchRoute('/register');
    prefetchRoute('/login');
  }, []);

  return (
    <>
      <PageMetadata
        title="User Management System - Secure & Enterprise-Grade"
        description="Streamline user administration with comprehensive role management, permissions, and access controls. Enterprise-grade security with intuitive design."
        keywords="user management, role management, authentication, authorization, security, RBAC"
        ogTitle="User Management System"
        ogDescription="Modern user management platform with enterprise-grade security and intuitive interface."
      />
      <div className="min-h-screen" style={{ background: 'var(--theme-background)' }}>
        {/* Unified Header - Clear separation with shadow */}
        <Header />

        {/* Hero Section */}
        <section
          className="layout-section"
          style={{
            background: 'var(--theme-surface)',
            borderBottom: '1px solid var(--theme-border)',
          }}
          aria-label="Hero section"
        >
          <div className="layout-container text-center">
            <h1
              className="text-4xl md:text-6xl font-bold mb-6 leading-tight"
              style={{ color: 'var(--theme-text)' }}
            >
              Secure User
              <span
                className="bg-clip-text text-transparent ml-2"
                style={{
                  backgroundImage: 'var(--theme-gradient)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Management
              </span>
            </h1>
            <p
              className="text-xl mb-10 max-w-3xl mx-auto leading-relaxed"
              style={{ color: 'var(--theme-textSecondary)' }}
            >
              Streamline user administration with our comprehensive platform. Manage roles,
              permissions, and access controls with enterprise-grade security and intuitive design.
            </p>
            <nav
              className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-xl mx-auto"
              aria-label="Primary call to action"
            >
              <Link
                to="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-lg text-base font-semibold shadow-md transition-all duration-200 hover:opacity-90 hover:shadow-lg hover:transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{
                  background: 'var(--theme-primary)',
                  color: '#FFFFFF',
                  minWidth: '200px',
                }}
                aria-label="Start free trial - Register new account"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" aria-hidden="true" />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-lg text-base font-semibold border-2 transition-all duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{
                  background: 'transparent',
                  borderColor: 'var(--theme-primary)',
                  color: 'var(--theme-primary)',
                  minWidth: '200px',
                }}
                aria-label="Sign in to your account"
              >
                Sign In
              </Link>
            </nav>
          </div>
        </section>

        {/* Features Section */}
        <section
          className="layout-section"
          style={{ background: 'var(--theme-background)' }}
          aria-label="Key features"
        >
          <div className="layout-container">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4" style={{ color: 'var(--theme-text)' }}>
                Why Choose Our Platform?
              </h2>
              <p className="text-xl" style={{ color: 'var(--theme-textSecondary)' }}>
                Everything you need to manage users effectively
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <article className="card text-center hover:-translate-y-1">
                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg"
                  style={{ background: 'var(--theme-primary)' }}
                  aria-hidden="true"
                >
                  <Users className="w-8 h-8 text-white" aria-hidden="true" />
                </div>
                <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--theme-text)' }}>
                  User Management
                </h3>
                <p className="leading-relaxed" style={{ color: 'var(--theme-textSecondary)' }}>
                  Comprehensive user administration with role-based access control and permission
                  management.
                </p>
              </article>

              <article className="card text-center hover:-translate-y-1">
                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg"
                  style={{ background: 'var(--theme-primary)' }}
                  aria-hidden="true"
                >
                  <Shield className="w-8 h-8 text-white" aria-hidden="true" />
                </div>
                <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--theme-text)' }}>
                  Security First
                </h3>
                <p className="leading-relaxed" style={{ color: 'var(--theme-textSecondary)' }}>
                  Enterprise-grade security with multi-factor authentication and advanced threat
                  protection.
                </p>
              </article>

              <article className="card text-center hover:-translate-y-1">
                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg"
                  style={{ background: 'var(--theme-primary)' }}
                  aria-hidden="true"
                >
                  <BarChart3 className="w-8 h-8 text-white" aria-hidden="true" />
                </div>
                <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--theme-text)' }}>
                  Analytics & Insights
                </h3>
                <p className="leading-relaxed" style={{ color: 'var(--theme-textSecondary)' }}>
                  Real-time analytics and reporting to track user activity and system performance.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section
          className="layout-section"
          style={{
            backgroundImage: 'var(--theme-gradient)',
          }}
          aria-label="Call to action"
        >
          <div className="layout-narrow text-center">
            <h2 className="text-4xl font-bold text-white mb-6">Ready to Get Started?</h2>
            <p className="text-xl text-white opacity-90 mb-10 leading-relaxed">
              Join thousands of organizations that trust our platform for secure user management.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-10 py-4 rounded-lg text-lg font-semibold shadow-lg transition-all duration-200 hover:opacity-90 hover:transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
              style={{ background: 'white', color: 'var(--theme-primary)' }}
              aria-label="Create your account - Get started with registration"
            >
              Create Your Account
              <ArrowRight className="w-6 h-6 ml-2" aria-hidden="true" />
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer
          className="layout-section"
          style={{ background: 'var(--theme-surface)', borderTop: `1px solid var(--theme-border)` }}
          role="contentinfo"
        >
          <div className="layout-container text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shadow-lg"
                style={{ background: 'var(--theme-primary)' }}
                aria-hidden="true"
              >
                <Lock className="w-6 h-6 text-white" aria-hidden="true" />
              </div>
              <span className="text-2xl font-bold" style={{ color: 'var(--theme-text)' }}>
                User Management
              </span>
            </div>
            <p className="text-sm" style={{ color: 'var(--theme-textSecondary)' }}>
              © 2024 User Management Platform. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default HomePage;
