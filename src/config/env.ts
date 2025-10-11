/**
 * Environment Configuration
 * Centralized access to environment variables with type safety
 */

import { BACKEND_CONFIG } from '../shared/config/api';

export const env = {
  // API Configuration
  API_BASE_URL: BACKEND_CONFIG.API_BASE_URL,

  // Application Environment
  MODE: import.meta.env.MODE,
  DEV: import.meta.env.DEV,
  PROD: import.meta.env.PROD,

  // Feature Flags
  ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  ENABLE_DEBUG: import.meta.env.VITE_ENABLE_DEBUG === 'true',
} as const;

// Type definitions for import.meta.env
declare global {
  interface ImportMetaEnv {
    readonly VITE_API_BASE_URL?: string;
    readonly VITE_ENABLE_ANALYTICS?: string;
    readonly VITE_ENABLE_DEBUG?: string;
    MODE: string;
    DEV: boolean;
    PROD: boolean;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

export default env;
