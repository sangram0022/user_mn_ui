// ========================================
// Pages Barrel Export
// Centralized page imports
// ========================================

// Public Pages
export { default as HomePage } from './HomePage';
export { default as ContactPage } from './ContactPage';
export { default as ProductsPage } from './ProductsPage';
export { default as ServicesPage } from './ServicesPage';

// Auth Pages
export { default as ForgotPasswordPage } from './ForgotPasswordPage';
export { default as VerifyEmailPage } from './VerifyEmailPage';
// Note: LoginPage and RegisterPage moved to domains/auth/pages/
// Note: ResetPasswordPage and ChangePasswordPage deprecated (missing components)

// Admin Pages
export { default as AdminDashboard } from './AdminDashboard';
