// ========================================
// Home Domain Localization
// HomePage and AboutPage translations
// ========================================

export const home = {
  // Home Page
  homePage: {
    // Hero Section
    hero: {
      badge: 'New: AI-Powered User Insights Available!',
      title: 'Manage Users with',
      titleHighlight: 'Confidence & Style',
      subtitle: 'The modern solution for user management. Built with React 19, Vite, and Tailwind CSS v4.1.16',
      ctaPrimary: 'Start Free Trial →',
      ctaSecondary: 'View Demo',
    },

    // Stats
    stats: {
      activeUsers: {
        value: '50K+',
        label: 'Active Users',
      },
      uptime: {
        value: '99.9%',
        label: 'Uptime',
      },
      support: {
        value: '24/7',
        label: 'Support',
      },
      countries: {
        value: '150+',
        label: 'Countries',
      },
    },

    // Features Section
    features: {
      title: 'Everything You Need',
      subtitle: 'Powerful features to manage your users effectively',
      items: {
        lightningFast: {
          title: 'Lightning Fast',
          description: 'Optimized performance with React 19 and Vite',
        },
        secure: {
          title: 'Secure by Default',
          description: 'Enterprise-grade security built-in',
        },
        responsive: {
          title: 'Fully Responsive',
          description: 'Perfect on all devices and screen sizes',
        },
        modernDesign: {
          title: 'Modern Design',
          description: 'Beautiful UI with Tailwind CSS v4.1.16',
        },
        realtime: {
          title: 'Real-time Updates',
          description: 'Live data synchronization',
        },
        customizable: {
          title: 'Easy to Customize',
          description: 'Flexible and extensible architecture',
        },
      },
    },

    // CTA Section
    cta: {
      title: 'Ready to Get Started?',
      subtitle: 'Join thousands of teams already using UserMN to manage their users',
      ctaPrimary: 'Create Free Account',
      ctaSecondary: 'Sign In',
    },
  },

  // About Page
  aboutPage: {
    title: 'About',
    subtitle: 'A modern, enterprise-grade user management system built with cutting-edge technologies and following best practices for scalability, security, and maintainability.',
    badges: {
      productionReady: 'Production Ready',
      typeSafe: 'Type Safe',
      cloudNative: 'Cloud Native',
    },

    // Technology Stack
    technologyStack: {
      title: 'Technology Stack',
      subtitle: 'Built with the latest and greatest technologies',
      technologies: {
        react: {
          name: 'React 19.1.1',
          badge: 'Frontend',
        },
        typescript: {
          name: 'TypeScript 5.9.3',
          badge: 'Type Safety',
        },
        reactRouter: {
          name: 'React Router v7',
          badge: 'Routing',
        },
        reactQuery: {
          name: 'React Query 5.59.0',
          badge: 'State',
        },
        zustand: {
          name: 'Zustand 5.0.0',
          badge: 'State',
        },
        i18next: {
          name: 'i18next',
          badge: 'i18n',
        },
        tailwind: {
          name: 'Tailwind CSS v4',
          badge: 'Styling',
        },
        vite: {
          name: 'Vite 6',
          badge: 'Build Tool',
        },
      },
    },

    // Architecture Principles
    architecture: {
      title: 'Architecture Principles',
      subtitle: 'Following industry best practices for maintainable code',
      principles: {
        ddd: 'Domain-Driven Design with 8 business domains',
        sot: 'Single Source of Truth for routes, query keys, translations',
        dry: "DRY (Don't Repeat Yourself) principles throughout",
        apiMapping: 'Perfect 1:1 backend-to-frontend API mapping',
        verticalSlice: 'Vertical slice architecture per domain',
      },
    },

    // Key Features
    features: {
      title: 'Key Features',
      subtitle: 'Everything you need for enterprise user management',
      items: {
        secureAuth: {
          title: 'Secure Authentication',
          description: 'Comprehensive auth with secure sessions',
        },
        rbac: {
          title: 'Role-Based Access',
          description: 'Granular permissions and RBAC',
        },
        userManagement: {
          title: 'User Management',
          description: 'Complete workflows with approvals',
        },
        auditLogging: {
          title: 'Audit Logging',
          description: 'Compliance and security tracking',
        },
        gdpr: {
          title: 'GDPR Compliance',
          description: 'Data export and deletion',
        },
        monitoring: {
          title: 'System Monitoring',
          description: 'Real-time health checks',
        },
        multiLanguage: {
          title: 'Multi-Language',
          description: 'English, Spanish, French support',
        },
        darkMode: {
          title: 'Dark Mode',
          description: 'System and manual theme switching',
        },
      },
    },

    // CTA Section
    cta: {
      title: 'Ready to Get Started?',
      subtitle: 'Join thousands of teams using our platform to manage users efficiently and securely.',
      ctaPrimary: 'Start Free Trial',
      ctaSecondary: 'View Documentation',
    },
  },
} as const;
