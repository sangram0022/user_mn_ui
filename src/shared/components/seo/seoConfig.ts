/**
 * SEO Configuration Constants
 * Pre-configured SEO for common pages
 */

export const SEO_CONFIG = {
  home: {
    title: 'Home',
    description: 'User Management System - Secure, scalable user authentication and authorization',
    keywords: ['user management', 'authentication', 'authorization', 'react', 'typescript'],
  },
  login: {
    title: 'Login',
    description: 'Sign in to your account',
    keywords: ['login', 'sign in', 'authentication'],
    noindex: true,
  },
  register: {
    title: 'Register',
    description: 'Create a new account',
    keywords: ['register', 'sign up', 'create account'],
    noindex: true,
  },
  dashboard: {
    title: 'Dashboard',
    description: 'User dashboard - Manage your account and settings',
    keywords: ['dashboard', 'user dashboard', 'account management'],
    noindex: true,
  },
  forgotPassword: {
    title: 'Forgot Password',
    description: 'Reset your password',
    keywords: ['forgot password', 'password reset'],
    noindex: true,
  },
  adminDashboard: {
    title: 'Admin Dashboard',
    description: 'Administrative dashboard for system management',
    keywords: ['admin', 'dashboard', 'management'],
    noindex: true,
  },
};
