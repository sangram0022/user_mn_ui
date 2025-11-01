/**
 * Reusable Loading Spinner Component
 * Single source of truth for all spinner loading states
 */

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  text?: string;
}

const SIZES = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
} as const;

export function LoadingSpinner({ 
  size = 'lg', 
  className = '',
  text 
}: LoadingSpinnerProps) {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div 
        className={`animate-spin rounded-full border-b-2 border-blue-600 ${SIZES[size]}`}
        role="status"
        aria-label="Loading"
      />
      {text && (
        <p className="mt-4 text-gray-600 dark:text-gray-400">{text}</p>
      )}
    </div>
  );
}

export function LoadingFallback({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner size="lg" text={text} />
    </div>
  );
}

export function InlineSpinner({ size = 'sm' }: { size?: 'sm' | 'md' }) {
  return (
    <div className={`animate-spin rounded-full border-b-2 border-current ${SIZES[size]}`} />
  );
}
