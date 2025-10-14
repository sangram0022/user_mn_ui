import { cn } from '@shared/utils';
import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  variant?: 'default' | 'auth' | 'centered' | 'dashboard';
  className?: string;
}

const containerVariants = {
  default: 'min-h-screen bg-gray-50',
  auth: 'min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50',
  centered: 'min-h-screen flex items-center justify-center bg-gray-50',
  dashboard: 'min-h-screen bg-gray-50 px-4 py-8',
};

/**
 * Common page container with consistent styling patterns
 * Consolidates repeated min-h-screen and background patterns
 */
export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  variant = 'default',
  className = '',
}) => {
  return <div className={cn(containerVariants[variant], className)}>{children}</div>;
};
