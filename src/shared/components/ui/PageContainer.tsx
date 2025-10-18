import { cn } from '@shared/utils';
import type React from 'react';

/**
 * PageContainer component props
 */
interface PageContainerProps {
  /**
   * Page content
   */
  children: React.ReactNode;

  /**
   * Visual variant for different page types
   * - default: Standard gray background
   * - auth: Gradient background for authentication pages
   * - centered: Centered content with gray background
   * - dashboard: Gray background with padding for dashboard layouts
   * @default 'default'
   */
  variant?: 'default' | 'auth' | 'centered' | 'dashboard';

  /**
   * Additional CSS classes
   */
  className?: string;
}

const containerVariants = {
  default: 'min-h-screen bg-gray-50',
  auth: 'min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50',
  centered: 'min-h-screen flex items-center justify-center bg-gray-50',
  dashboard: 'min-h-screen bg-gray-50 px-4 py-8',
};

/**
 * PageContainer Component
 *
 * A page-level container component with consistent styling patterns.
 * Consolidates repeated min-h-screen and background patterns across different page types.
 *
 * Features:
 * - Multiple layout variants (default, auth, centered, dashboard)
 * - Full viewport height (min-h-screen)
 * - Consistent backgrounds and padding
 * - Easy customization with className prop
 *
 * @example
 * // Standard page
 * <PageContainer>
 *   <YourContent />
 * </PageContainer>
 *
 * @example
 * // Authentication page with gradient
 * <PageContainer variant="auth">
 *   <LoginForm />
 * </PageContainer>
 *
 * @example
 * // Centered content
 * <PageContainer variant="centered">
 *   <ErrorMessage />
 * </PageContainer>
 *
 * @example
 * // Dashboard layout with padding
 * <PageContainer variant="dashboard">
 *   <DashboardContent />
 * </PageContainer>
 */
export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  variant = 'default',
  className = '',
}) => <div className={cn(containerVariants[variant], className)}>{children}</div>;
