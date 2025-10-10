/**
 * Advanced Loading States and Skeleton Components
 * Production-ready loading UX with accessibility
 */

import { useState, useCallback } from 'react';

// Base Skeleton Component
export interface SkeletonProps { className?: string;
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  animation?: 'pulse' | 'wave' | 'none';
  'aria-label'?: string; }

export const Skeleton: React.FC<SkeletonProps> = ({ className = '',
  width = '100%',
  height = '1rem',
  variant = 'rectangular',
  animation = 'pulse',
  'aria-label': ariaLabel = 'Loading content' }) => { const baseClasses = 'bg-gray-200 dark:bg-gray-700';
  
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: '',
    rounded: 'rounded-lg'
  };

  const animationClasses = { pulse: 'animate-pulse',
    wave: 'animate-pulse', // Could implement wave animation
    none: ''
  };

  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height
  };

  return (
    <div
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${animationClasses[animation]}
        ${className}
      `.trim()}
      style={style}
      role="status"
      aria-label={ariaLabel}
      aria-live="polite"
    />
  );
};

// Text Skeleton
export interface TextSkeletonProps { lines?: number;
  className?: string;
  lastLineWidth?: string; }

export const TextSkeleton: React.FC<TextSkeletonProps> = ({ lines = 3,
  className = '',
  lastLineWidth = '75%' }) => {
  return (
    <div className={`space-y-2 ${className}`} role="status" aria-label="Loading text content">
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton
          key={index}
          height="1rem"
          width={index === lines - 1 ? lastLineWidth : '100%'}
          variant="text"
        />
      ))}
    </div>
  );
};

// Avatar Skeleton
export const AvatarSkeleton: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => { const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <Skeleton
      className={sizes[size]}
      variant="circular"
      aria-label="Loading profile picture"
    />
  );
};

// Card Skeleton
export interface CardSkeletonProps { hasImage?: boolean;
  hasAvatar?: boolean;
  textLines?: number;
  className?: string; }

export const CardSkeleton: React.FC<CardSkeletonProps> = ({ hasImage = false,
  hasAvatar = false,
  textLines = 3,
  className = '' }) => {
  return (
    <div className={`p-4 border border-gray-200 rounded-lg space-y-4 ${className}`}>
      {hasImage && (
        <Skeleton height="200px" variant="rounded" aria-label="Loading image" />
      )}
      
      {hasAvatar && (
        <div className="flex items-center space-x-3">
          <AvatarSkeleton />
          <div className="flex-1">
            <Skeleton height="1rem" width="40%" variant="text" />
            <Skeleton height="0.875rem" width="60%" variant="text" className="mt-1" />
          </div>
        </div>
      )}
      
      <div className="space-y-2">
        <Skeleton height="1.25rem" width="80%" variant="text" />
        <TextSkeleton lines={textLines} />
      </div>
    </div>
  );
};

// Table Skeleton
export interface TableSkeletonProps { rows?: number;
  columns?: number;
  hasHeader?: boolean;
  className?: string; }

export const TableSkeleton: React.FC<TableSkeletonProps> = ({ rows = 5,
  columns = 4,
  hasHeader = true,
  className = '' }) => {
  return (
    <div className={`w-full ${className}`} role="status" aria-label="Loading table data">
      <div className="overflow-hidden border border-gray-200 rounded-lg">
        {hasHeader && (
          <div className="bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-4 gap-4 p-4">
              {Array.from({ length: columns }, (_, index) => (
                <Skeleton key={index} height="1rem" variant="text" />
              ))}
            </div>
          </div>
        )}
        
        <div className="divide-y divide-gray-200">
          {Array.from({ length: rows }, (_, rowIndex) => (
            <div key={rowIndex} className="grid grid-cols-4 gap-4 p-4">
              {Array.from({ length: columns }, (_, colIndex) => (
                <Skeleton key={colIndex} height="1rem" variant="text" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// List Skeleton
export interface ListSkeletonProps { items?: number;
  hasAvatar?: boolean;
  hasSecondaryText?: boolean;
  className?: string; }

export const ListSkeleton: React.FC<ListSkeletonProps> = ({ items = 5,
  hasAvatar = true,
  hasSecondaryText = true,
  className = '' }) => {
  return (
    <div className={`space-y-3 ${className}`} role="status" aria-label="Loading list items">
      {Array.from({ length: items }, (_, index) => (
        <div key={index} className="flex items-center space-x-3 p-3 border-b border-gray-100 last:border-b-0">
          {hasAvatar && <AvatarSkeleton size="sm" />}
          
          <div className="flex-1 space-y-1">
            <Skeleton height="1rem" width="60%" variant="text" />
            {hasSecondaryText && (
              <Skeleton height="0.875rem" width="40%" variant="text" />
            )}
          </div>
          
          <Skeleton height="2rem" width="4rem" variant="rounded" />
        </div>
      ))}
    </div>
  );
};

// Loading States Hook
export interface LoadingState { isLoading: boolean;
  loadingText?: string;
  progress?: number;
  stage?: string; }

export function useLoadingState(initialState: Partial<LoadingState> = {}) { const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    loadingText: 'Loading...',
    progress: 0,
    stage: '',
    ...initialState
  });

  const startLoading = useCallback((text?: string, stage?: string) => { setLoadingState(prev => ({
      ...prev,
      isLoading: true,
      loadingText: text || prev.loadingText,
      stage: stage || '',
      progress: 0
    }));
  }, []);

  const updateProgress = useCallback((progress: number, stage?: string) => { setLoadingState(prev => ({
      ...prev,
      progress: Math.min(100, Math.max(0, progress)),
      stage: stage || prev.stage
    }));
  }, []);

  const stopLoading = useCallback(() => { setLoadingState(prev => ({
      ...prev,
      isLoading: false,
      progress: 100
    }));
  }, []);

  return { ...loadingState,
    startLoading,
    updateProgress,
    stopLoading
  };
}

// Advanced Loading Spinner
export interface LoadingSpinnerProps { size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white';
  text?: string;
  showText?: boolean;
  className?: string; }

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md',
  color = 'primary',
  text = 'Loading...',
  showText = true,
  className = '' }) => { const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const colors = { primary: 'text-blue-600',
    secondary: 'text-gray-600',
    white: 'text-white'
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-2 ${className}`}>
      <div
        className={`animate-spin ${sizes[size]} ${colors[color]}`}
        role="status"
        aria-label={text}
      >
        <svg
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
      
      {showText && (
        <p className={`text-sm ${colors[color]} font-medium`} aria-live="polite">
          {text}
        </p>
      )}
    </div>
  );
};

// Progress Bar
export interface ProgressBarProps { progress: number;
  showPercentage?: boolean;
  color?: 'primary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string; }

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress,
  showPercentage = true,
  color = 'primary',
  size = 'md',
  className = '',
  label = 'Progress' }) => { const normalizedProgress = Math.min(100, Math.max(0, progress));
  
  const colorClasses = {
    primary: 'bg-blue-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-600',
    error: 'bg-red-600'
  };

  const sizeClasses = { sm: 'h-1',
    md: 'h-2',
    lg: 'h-4'
  };

  return (
    <div className={`w-full ${className}`}>
      {showPercentage && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {Math.round(normalizedProgress)}%
          </span>
        </div>
      )}
      
      <div 
        className={`w-full bg-gray-200 rounded-full dark:bg-gray-700 ${sizeClasses[size]}`}
        role="progressbar"
        aria-valuenow={normalizedProgress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label}: ${Math.round(normalizedProgress)}% complete`}
      >
        <div
          className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full transition-all duration-300 ease-out`}
          style={{ width: `${normalizedProgress}%` }}
        />
      </div>
    </div>
  );
};

// Full Page Loading
export interface FullPageLoadingProps { text?: string;
  showProgress?: boolean;
  progress?: number;
  className?: string; }

export const FullPageLoading: React.FC<FullPageLoadingProps> = ({ text = 'Loading...',
  showProgress = false,
  progress = 0,
  className = '' }) => {
  return (
    <div className={`
      fixed inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm
      flex items-center justify-center z-50 ${className}
    `}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-sm w-full mx-4">
        <div className="text-center">
          <LoadingSpinner size="lg" text={text} />
          
          {showProgress && (
            <div className="mt-6">
              <ProgressBar progress={progress} label="" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Loading Overlay for components
export interface LoadingOverlayProps { isLoading: boolean;
  text?: string;
  children: React.ReactNode;
  className?: string; }

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isLoading,
  text = 'Loading...',
  children,
  className = '' }) => {
  return (
    <div className={`relative ${className}`}>
      {children}
      
      {isLoading && (
        <div className="absolute inset-0 bg-white/75 dark:bg-gray-900/75 backdrop-blur-sm flex items-center justify-center z-10">
          <LoadingSpinner text={text} />
        </div>
      )}
    </div>
  );
};

export default { Skeleton,
  TextSkeleton,
  AvatarSkeleton,
  CardSkeleton,
  TableSkeleton,
  ListSkeleton,
  LoadingSpinner,
  ProgressBar,
  FullPageLoading,
  LoadingOverlay,
  useLoadingState };