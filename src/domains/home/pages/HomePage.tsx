import {
  ArrowRight,
  BarChart3,
  CheckCircle,
  ChevronRight,
  Settings,
  Shield,
  UserCheck,
  Users,
  Workflow,
} from 'lucide-react';
import type { FC } from 'react';
import { Link } from 'react-router-dom';

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
      description:
        'Enterprise-grade security with JWT tokens, 2FA support, and comprehensive audit logging.',
      highlights: ['JWT Authentication', 'Two-Factor Auth', 'Session Management', 'Security Audit'],
    },
    {
      icon: BarChart3,
      title: 'Analytics & Insights',
      description:
        'Comprehensive analytics dashboard with user behavior tracking, cohort analysis, and churn prediction.',
      highlights: ['User Analytics', 'Cohort Analysis', 'Churn Prediction', 'Activity Tracking'],
    },
    {
      icon: Workflow,
      title: 'Workflow Management',
      description:
        'Automated approval workflows for sensitive operations with customizable business rules.',
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
      description:
        'Built-in compliance tools and comprehensive reporting for regulatory requirements.',
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
              {' '}
              Management
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
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '5rem 0', backgroundColor: '#ffffff' }}>
        <div style={{ padding: '0 1.5rem', margin: '0 auto', maxWidth: '1280px' }}>
          <div style={{ textAlign: 'center' }}>
            <h2
              style={{
                fontSize: '2.25rem',
                fontWeight: 'bold',
                color: '#111827',
                lineHeight: '1.25',
              }}
            >
              Comprehensive Feature Set
            </h2>
            <p style={{ marginTop: '1rem', fontSize: '1.125rem', color: '#4b5563' }}>
              Everything you need to manage users at enterprise scale
            </p>
          </div>

          <div
            style={{
              marginTop: '4rem',
              display: 'grid',
              gap: '2rem',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            }}
          >
            {features.map((feature, index) => (
              <div key={index} style={{ position: 'relative' }}>
                <article
                  style={{
                    padding: '2rem',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '1rem',
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                    e.currentTarget.style.borderColor = '#93c5fd';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
                    e.currentTarget.style.borderColor = '#e5e7eb';
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      marginBottom: '1rem',
                    }}
                  >
                    <div
                      style={{
                        padding: '0.75rem',
                        background: 'linear-gradient(135deg, #dbeafe, #f3e8ff)',
                        borderRadius: '0.5rem',
                      }}
                      aria-hidden="true"
                    >
                      <feature.icon
                        style={{ width: '1.5rem', height: '1.5rem', color: '#2563eb' }}
                      />
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827' }}>
                      {feature.title}
                    </h3>
                  </div>

                  <p style={{ color: '#4b5563', marginBottom: '1.5rem' }}>{feature.description}</p>

                  <ul
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                      listStyle: 'none',
                      padding: 0,
                      margin: 0,
                    }}
                  >
                    {feature.highlights.map((highlight, idx) => (
                      <li
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          fontSize: '0.875rem',
                          color: '#374151',
                        }}
                      >
                        <CheckCircle
                          style={{ width: '1rem', height: '1rem', color: '#10b981', flexShrink: 0 }}
                          aria-hidden="true"
                        />
                        {highlight}
                      </li>
                    ))}
                  </ul>

                  <div style={{ marginTop: '1.5rem' }}>
                    <button
                      style={{
                        color: '#2563eb',
                        fontWeight: '500',
                        fontSize: '0.875rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0.5rem',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#1d4ed8';
                        e.currentTarget.style.gap = '0.5rem';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#2563eb';
                        e.currentTarget.style.gap = '0.25rem';
                      }}
                      aria-label={`Learn more about ${feature.title}`}
                    >
                      Learn More{' '}
                      <ChevronRight style={{ width: '1rem', height: '1rem' }} aria-hidden="true" />
                    </button>
                  </div>
                </article>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '5rem 0', backgroundColor: '#f9fafb' }}>
        <div style={{ padding: '0 1.5rem', margin: '0 auto', maxWidth: '1280px' }}>
          <div style={{ textAlign: 'center' }}>
            <h2
              style={{
                fontSize: '2.25rem',
                fontWeight: 'bold',
                color: '#111827',
                lineHeight: '1.25',
              }}
            >
              Built with Modern Technology
            </h2>
            <p style={{ marginTop: '1rem', fontSize: '1.125rem', color: '#4b5563' }}>
              Powered by FastAPI, React, and enterprise-grade infrastructure
            </p>
          </div>

          <div
            style={{
              marginTop: '4rem',
              display: 'grid',
              gap: '2rem',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            }}
          >
            <div
              style={{
                padding: '2rem',
                backgroundColor: '#ffffff',
                borderRadius: '1rem',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
              }}
            >
              <h3
                style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: '1rem',
                }}
              >
                Backend Technologies
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: '0.5rem',
                      height: '0.5rem',
                      backgroundColor: '#10b981',
                      borderRadius: '9999px',
                    }}
                  />
                  <span style={{ color: '#374151' }}>
                    FastAPI - High-performance Python API framework
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: '0.5rem',
                      height: '0.5rem',
                      backgroundColor: '#3b82f6',
                      borderRadius: '9999px',
                    }}
                  />
                  <span style={{ color: '#374151' }}>
                    SQLAlchemy 2.0 - Modern ORM with async support
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: '0.5rem',
                      height: '0.5rem',
                      backgroundColor: '#8b5cf6',
                      borderRadius: '9999px',
                    }}
                  />
                  <span style={{ color: '#374151' }}>
                    JWT Authentication - Secure token-based auth
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: '0.5rem',
                      height: '0.5rem',
                      backgroundColor: '#f97316',
                      borderRadius: '9999px',
                    }}
                  />
                  <span style={{ color: '#374151' }}>Alembic - Database migration management</span>
                </div>
              </div>
            </div>

            <div
              style={{
                padding: '2rem',
                backgroundColor: '#ffffff',
                borderRadius: '1rem',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
              }}
            >
              <h3
                style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: '1rem',
                }}
              >
                Frontend Technologies
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: '0.5rem',
                      height: '0.5rem',
                      backgroundColor: '#06b6d4',
                      borderRadius: '9999px',
                    }}
                  />
                  <span style={{ color: '#374151' }}>
                    React 19 - Latest React with modern features
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: '0.5rem',
                      height: '0.5rem',
                      backgroundColor: '#2563eb',
                      borderRadius: '9999px',
                    }}
                  />
                  <span style={{ color: '#374151' }}>TypeScript - Type-safe development</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: '0.5rem',
                      height: '0.5rem',
                      backgroundColor: '#10b981',
                      borderRadius: '9999px',
                    }}
                  />
                  <span style={{ color: '#374151' }}>Tailwind CSS - Utility-first styling</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: '0.5rem',
                      height: '0.5rem',
                      backgroundColor: '#8b5cf6',
                      borderRadius: '9999px',
                    }}
                  />
                  <span style={{ color: '#374151' }}>Vite - Lightning fast build tool</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        style={{ padding: '5rem 0', background: 'linear-gradient(135deg, #2563eb, #8b5cf6)' }}
      >
        <div
          style={{ padding: '0 1.5rem', margin: '0 auto', maxWidth: '1280px', textAlign: 'center' }}
        >
          <h2
            style={{
              fontSize: '2.25rem',
              fontWeight: 'bold',
              color: '#ffffff',
              lineHeight: '1.25',
            }}
          >
            Ready to Get Started?
          </h2>
          <p style={{ marginTop: '1rem', fontSize: '1.125rem', color: '#dbeafe' }}>
            Join thousands of organizations already using our platform
          </p>
          <div
            style={{
              marginTop: '2rem',
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
                borderRadius: '0.375rem',
                backgroundColor: '#ffffff',
                padding: '0.75rem 1.5rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#2563eb',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#eff6ff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
              }}
            >
              Start Free Trial
            </Link>
            <Link
              to="/contact"
              style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#ffffff',
                textDecoration: 'none',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#dbeafe';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#ffffff';
              }}
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
