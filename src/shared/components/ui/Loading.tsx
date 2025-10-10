/**
 * Enhanced Loading component with skeletons and React 19 features
 */
import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import type { ComponentSize } from '@shared/types';

export interface LoadingProps { size?: ComponentSize;
  text?: string;
  variant?: 'spinner' | 'skeleton' | 'dots';
  fullScreen?: boolean;
  className?: string; }

export interface SkeletonProps { className?: string;
  lines?: number;
  width?: string | number;
  height?: string | number;
  circular?: boolean;
  animation?: 'pulse' | 'wave' | 'none'; }

// Main Loading component
const Loading: React.FC<LoadingProps> = ({ size = 'medium',
  text = 'Loading...',
  variant = 'spinner',
  fullScreen = false,
  className = '', }) => { const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
  };

  const containerClasses = fullScreen
    ? 'fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50'
    : 'flex items-center justify-center p-4';

  if (variant === 'spinner') {
    return (
      <div className={`${containerClasses} ${className}`}>
        <div className="text-center">
          <Loader2 className={`${sizeClasses[size]} animate-spin text-indigo-600 mx-auto`} />
          {text && <p className="mt-2 text-sm text-gray-600">{text}</p>}
        </div>
      </div>
    );
  }

  if (variant === 'dots') {
    return (
      <div className={`${containerClasses} ${className}`}>
        <div className="text-center">
          <div className="flex space-x-1 justify-center items-center">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
          {text && <p className="mt-2 text-sm text-gray-600">{text}</p>}
        </div>
      </div>
    );
  }

  // Skeleton variant
  return (
    <div className={`${containerClasses} ${className}`}>
      <Skeleton />
    </div>
  );
};

// Skeleton component
export const Skeleton: React.FC<SkeletonProps> = ({ className = '',
  lines = 3,
  width = '100%',
  height = '1rem',
  circular = false,
  animation = 'pulse', }) => { const baseClasses = [
    'bg-gray-200 rounded',
    circular ? 'rounded-full' : 'rounded',
  ];

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-pulse', // Could be enhanced with custom wave animation
    none: '',
  };

  const skeletonClasses = [
    ...baseClasses,
    animationClasses[animation],
    className,
  ].join(' ');

  const style: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  if (lines === 1) {
    return <div className={skeletonClasses} style={style} />;
  }

  return (
    <div className="space-y-2">
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={i}
          className={skeletonClasses}
          style={{ ...style,
            width: i === lines - 1 ? '75%' : style.width, // Last line is shorter
          }}
        />
      ))}
    </div>
  );
};

// Suspense boundary with loading fallback
export interface SuspenseBoundaryProps { children: React.ReactNode;
  fallback?: React.ReactNode;
  loadingText?: string; }

export const SuspenseBoundary: React.FC<SuspenseBoundaryProps> = ({ children,
  fallback,
  loadingText = 'Loading content...', }) => {
  const defaultFallback = <Loading text={loadingText} variant="spinner" />;
  
  return (
    <Suspense fallback={fallback || defaultFallback}>
      {children}
    </Suspense>
  );
};

Loading.displayName = 'Loading';
Skeleton.displayName = 'Skeleton';
SuspenseBoundary.displayName = 'SuspenseBoundary';

export default Loading;