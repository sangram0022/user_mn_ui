import { ArrowRight, BarChart3, Lock, Shield, Users } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

import Header from '@shared/components/Header';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Unified Header */}
      <Header />

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8" aria-label="Hero section">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Secure User
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {' '}
              Management
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Streamline user administration with our comprehensive platform. Manage roles,
            permissions, and access controls with enterprise-grade security and intuitive design.
          </p>
          <nav
            className="flex flex-col sm:flex-row gap-4 justify-center"
            aria-label="Primary call to action"
          >
            <Link
              to="/register"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              aria-label="Start free trial - Register new account"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5 inline ml-2" aria-hidden="true" />
            </Link>
            <Link
              to="/login"
              className="border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-lg text-lg font-medium hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
              aria-label="Sign in to your account"
            >
              Sign In
            </Link>
          </nav>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50" aria-label="Key features">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Our Platform?</h2>
            <p className="text-lg text-gray-600">Everything you need to manage users effectively</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <article className="text-center p-6">
              <div
                className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4"
                aria-hidden="true"
              >
                <Users className="w-6 h-6 text-white" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">User Management</h3>
              <p className="text-gray-600">
                Comprehensive user administration with role-based access control and permission
                management.
              </p>
            </article>

            <article className="text-center p-6">
              <div
                className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4"
                aria-hidden="true"
              >
                <Shield className="w-6 h-6 text-white" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Security First</h3>
              <p className="text-gray-600">
                Enterprise-grade security with multi-factor authentication and advanced threat
                protection.
              </p>
            </article>

            <article className="text-center p-6">
              <div
                className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4"
                aria-hidden="true"
              >
                <BarChart3 className="w-6 h-6 text-white" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Analytics & Insights</h3>
              <p className="text-gray-600">
                Real-time analytics and reporting to track user activity and system performance.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8" aria-label="Call to action">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of organizations that trust our platform for secure user management.
          </p>
          <Link
            to="/register"
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl inline-flex items-center"
            aria-label="Create your account - Get started with registration"
          >
            Create Your Account
            <ArrowRight className="w-5 h-5 ml-2" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-4 sm:px-6 lg:px-8" role="contentinfo">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div
              className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center"
              aria-hidden="true"
            >
              <Lock className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
            <span className="text-xl font-bold">User Management</span>
          </div>
          <p className="text-gray-400">© 2024 User Management Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
