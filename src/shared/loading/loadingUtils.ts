/**
 * Loading State Utilities
 * Utility functions and constants for loading states
 */

// Loading state hook utility
export interface LoadingState { isLoading: boolean;
  loadingText?: string;
  progress?: number;
  stage?: string; }

export interface LoadingConfig { initialState?: Partial<LoadingState>;
  reportThreshold?: number;
  onLoadingChange?: (isLoading: boolean) => void; }

// Default loading messages
export const DEFAULT_LOADING_MESSAGES = { generic: 'Loading...',
  data: 'Loading data...',
  saving: 'Saving...',
  processing: 'Processing...',
  uploading: 'Uploading...',
  deleting: 'Deleting...',
  authenticating: 'Authenticating...', } as const;

// Loading delay utility to prevent flash of loading state
export function withMinimumDelay<T>(
  promise: Promise<T>, 
  minimumDelay: number = 300
): Promise<T> { const delayPromise = new Promise(resolve => 
    setTimeout(resolve, minimumDelay)
  );
  
  return Promise.all([promise, delayPromise]).then(([result]) => result); }