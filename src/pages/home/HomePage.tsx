import type { FC } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  CheckCircle,
  ChevronRight,
  Settings,
  Shield,
  UserCheck,
  Users,
  Workflow
} from 'lucide-react';

const HomePage: FC = () => {
  const features = [
    {
      icon: Users,
      title: 'User Management',
      description:
        'Complete CRUD operations for user accounts with role-based access control and advanced search capabilities.',
      highlights: ['User Registration', 'Profile Management', 'Role Assignment', 'Bulk Operations'],
    },
    {
      icon: Shield,
      title: 'Security & Authentication',
      description: 'Enterprise-grade security with JWT tokens, 2FA support, and comprehensive audit logging.',
      highlights: ['JWT Authentication', 'Two-Factor Auth', 'Session Management', 'Security Audit'],
    },
    {
      icon: BarChart3,
      title: 'Analytics & Insights',
      description: 'Comprehensive analytics dashboard with user behavior tracking, cohort analysis, and churn prediction.',
      highlights: ['User Analytics', 'Cohort Analysis', 'Churn Prediction', 'Activity Tracking'],
    },
    {
      icon: Workflow,
      title: 'Workflow Management',
      description: 'Automated approval workflows for sensitive operations with customizable business rules.',
      highlights: ['Approval Workflows', 'Business Rules', 'Process Automation', 'Task Management'],
    },
    {
      icon: UserCheck,
      title: 'User Onboarding',
      description: 'Streamlined onboarding process with customizable steps and progress tracking.',
      highlights: ['Guided Onboarding', 'Progress Tracking', 'Custom Templates', 'Welcome Flows'],
    },
    {
      icon: Settings,
      title: 'Compliance & Reporting',
      description: 'Built-in compliance tools and comprehensive reporting for regulatory requirements.',
      highlights: ['Compliance Reports', 'Data Export', 'Audit Trails', 'Regulatory Tools'],
    },
  ];

  const stats = [
    { number: '99.9%', label: 'Uptime Guarantee' },
    { number: '10K+', label: 'Active Users' },
    { number: '50+', label: 'Enterprise Features' },
    { number: '24/7', label: 'Support Available' },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 50%, #faf5ff 100%)',
        padding: '0',
      }}
    >
      <section
        style={{
          position: 'relative',
          padding: '5rem 1.5rem',
          maxWidth: '1280px',
          margin: '0 auto',
          textAlign: 'center',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '3.5rem',
              fontWeight: 'bold',
              color: '#111827',
              marginBottom: '1.5rem',
              lineHeight: '1.1',
            }}
          >
            Enterprise User
            <span
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {' '}Management
            </span>
          </h1>
          <p
            style={{
              marginTop: '1.5rem',
              fontSize: '1.125rem',
              lineHeight: '1.75',
              color: '#6b7280',
              maxWidth: '48rem',
              margin: '1.5rem auto 0',
            }}
          >
            A comprehensive FastAPI-powered user management platform with advanced analytics,
            workflow automation, and enterprise-grade security features.
          </p>
          <div
            style={{
              marginTop: '2.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1.5rem',
              flexWrap: 'wrap',
            }}
          >
            <Link
              to="/register"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0.75rem 1.5rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: 'white',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                border: 'none',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #2563eb, #7c3aed)';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #3b82f6, #8b5cf6)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
              }}
            >
              Get Started Free
            </Link>
            <Link
              to="/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#111827',
                textDecoration: 'none',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#3b82f6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#111827';
              }}
            >
              Sign In <ArrowRight style={{ width: '1rem', height: '1rem' }} />
            </Link>
          </div>
        </div>

        <div
          style={{
            marginTop: '5rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2rem',
          }}
        >
          {stats.map((stat, index) => (
            <div key={index} style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: '2.25rem',
                  fontWeight: 'bold',
                  color: '#111827',
                  marginBottom: '0.5rem',
                }}
              >
                {stat.number}
              </div>
              <div
                style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="px-6 mx-auto max-w-7xl lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Comprehensive Feature Set
            </h2>
            <p className="mt-4 text-lg text-gray-600">Everything you need to manage users at enterprise scale</p>
          </div>

          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div key={index} className="relative group">
                <div className="p-8 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:border-blue-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg">
                      <feature.icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
                  </div>

                  <p className="text-gray-600 mb-6">{feature.description}</p>

                  <div className="space-y-2">
                    {feature.highlights.map((highlight, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        {highlight}
                      </div>
                    ))}
                  </div>

                  <div className="mt-6">
                    <button className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all duration-200">
                      Learn More <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="px-6 mx-auto max-w-7xl lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Built with Modern Technology
            </h2>
            <p className="mt-4 text-lg text-gray-600">Powered by FastAPI, React, and enterprise-grade infrastructure</p>
          </div>

          <div className="mt-16 grid gap-8 lg:grid-cols-2">
            <div className="p-8 bg-white rounded-2xl shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Backend Technologies</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-gray-700">FastAPI - High-performance Python API framework</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span className="text-gray-700">SQLAlchemy 2.0 - Modern ORM with async support</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full" />
                  <span className="text-gray-700">JWT Authentication - Secure token-based auth</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full" />
                  <span className="text-gray-700">Alembic - Database migration management</span>
                </div>
              </div>
            </div>

            <div className="p-8 bg-white rounded-2xl shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Frontend Technologies</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full" />
                  <span className="text-gray-700">React 19 - Latest React with modern features</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full" />
                  <span className="text-gray-700">TypeScript - Type-safe development</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                  <span className="text-gray-700">Tailwind CSS - Utility-first styling</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-violet-500 rounded-full" />
                  <span className="text-gray-700">Vite - Lightning fast build tool</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="px-6 mx-auto max-w-7xl lg:px-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Ready to Get Started?</h2>
          <p className="mt-4 text-lg text-blue-100">Join thousands of organizations already using our platform</p>
          <div className="mt-8 flex items-center justify-center gap-x-6">
            <Link
              to="/register"
              className="rounded-md bg-white px-6 py-3 text-sm font-semibold text-blue-600 shadow-sm hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-all duration-200"
            >
              Start Free Trial
            </Link>
            <Link
              to="/contact"
              className="text-sm font-semibold leading-6 text-white hover:text-blue-100 transition-colors duration-200"
            >
              Contact Sales <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
