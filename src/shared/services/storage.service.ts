/**
 * Centralized Storage Service
 *
 * ✅ Single source of truth for all localStorage operations
 * ✅ Type-safe interface
 * ✅ Consistent error handling
 * ✅ Easy to mock for testing
 *
 * @module shared/services/storage
 */

import { safeLocalStorage } from '@shared/utils/safeLocalStorage';
import type { ThemeConfig } from '@contexts/ThemeContext';
import { logger } from '@shared/utils/logger';

// ============================================================================
// Storage Keys - Single source of truth
// ============================================================================

/**
 * All localStorage keys used in the application
 * Centralized to prevent key collision and typos
 */
export const STORAGE_KEYS = {
  // Theme
  THEME_CONFIG: 'app-theme-config',

  // Localization
  USER_LOCALE: 'user-locale',

  // App State (sidebar, notifications, etc - NOT auth or user)
  APP_STATE: 'app-state',

  // Auth (managed by tokenService and AuthProvider)
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_ID: 'user_id',
  USER_EMAIL: 'user_email',

  // User preferences
  SIDEBAR_STATE: 'sidebar-state',
} as const;

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * App state (sidebar, notifications, system health)
 * NOTE: Does NOT include user or authToken - those are managed by AuthProvider
 */
export interface AppStateStorage {
  sidebar: {
    isOpen: boolean;
    isCollapsed: boolean;
  };
  lastSyncTime?: number;
}

/**
 * Sidebar state for persistence
 */
export interface SidebarState {
  isOpen: boolean;
  isCollapsed: boolean;
}

// ============================================================================
// Storage Service Implementation
// ============================================================================

/**
 * Centralized storage service
 * All localStorage operations should go through this service
 */
export const storageService = {
  // ============================================================================
  // Theme Management
  // ============================================================================

  /**
   * Get theme configuration
   * @returns Theme config or null if not found
   */
  getTheme(): ThemeConfig | null {
    try {
      const data = safeLocalStorage.getItem(STORAGE_KEYS.THEME_CONFIG);
      if (!data) return null;

      const parsed = JSON.parse(data) as ThemeConfig;

      // Validate theme config structure
      if (parsed && typeof parsed === 'object' && 'palette' in parsed && 'mode' in parsed) {
        return parsed;
      }

      logger.warn('Invalid theme config in localStorage, clearing');
      safeLocalStorage.removeItem(STORAGE_KEYS.THEME_CONFIG);
      return null;
    } catch (error) {
      logger.error('Failed to get theme from storage', error as Error);
      return null;
    }
  },

  /**
   * Set theme configuration
   * @param theme Theme config to store
   */
  setTheme(theme: ThemeConfig): void {
    try {
      safeLocalStorage.setItem(STORAGE_KEYS.THEME_CONFIG, JSON.stringify(theme));
    } catch (error) {
      logger.error('Failed to set theme in storage', error as Error);
    }
  },

  /**
   * Clear theme configuration
   */
  clearTheme(): void {
    safeLocalStorage.removeItem(STORAGE_KEYS.THEME_CONFIG);
  },

  // ============================================================================
  // Localization
  // ============================================================================

  /**
   * Get user locale
   * @returns Locale code or null if not found
   */
  getLocale(): string | null {
    try {
      return safeLocalStorage.getItem(STORAGE_KEYS.USER_LOCALE);
    } catch (error) {
      logger.error('Failed to get locale from storage', error as Error);
      return null;
    }
  },

  /**
   * Set user locale
   * @param locale Locale code to store
   */
  setLocale(locale: string): void {
    try {
      safeLocalStorage.setItem(STORAGE_KEYS.USER_LOCALE, locale);
    } catch (error) {
      logger.error('Failed to set locale in storage', error as Error);
    }
  },

  /**
   * Clear user locale
   */
  clearLocale(): void {
    safeLocalStorage.removeItem(STORAGE_KEYS.USER_LOCALE);
  },

  // ============================================================================
  // App State (sidebar, notifications, system)
  // ============================================================================

  /**
   * Get app state
   * NOTE: Does NOT include user or auth - use AuthProvider for that
   * @returns App state or null if not found
   */
  getAppState(): AppStateStorage | null {
    try {
      const data = safeLocalStorage.getItem(STORAGE_KEYS.APP_STATE);
      if (!data) return null;

      const parsed = JSON.parse(data) as AppStateStorage;

      // Validate structure
      if (parsed && typeof parsed === 'object' && 'sidebar' in parsed) {
        return parsed;
      }

      logger.warn('Invalid app state in localStorage, clearing');
      safeLocalStorage.removeItem(STORAGE_KEYS.APP_STATE);
      return null;
    } catch (error) {
      logger.error('Failed to get app state from storage', error as Error);
      return null;
    }
  },

  /**
   * Set app state
   * @param state App state to store
   */
  setAppState(state: AppStateStorage): void {
    try {
      safeLocalStorage.setItem(STORAGE_KEYS.APP_STATE, JSON.stringify(state));
    } catch (error) {
      logger.error('Failed to set app state in storage', error as Error);
    }
  },

  /**
   * Clear app state
   */
  clearAppState(): void {
    safeLocalStorage.removeItem(STORAGE_KEYS.APP_STATE);
  },

  // ============================================================================
  // Sidebar State
  // ============================================================================

  /**
   * Get sidebar state
   * @returns Sidebar state or null if not found
   */
  getSidebarState(): SidebarState | null {
    try {
      const data = safeLocalStorage.getItem(STORAGE_KEYS.SIDEBAR_STATE);
      if (!data) return null;

      const parsed = JSON.parse(data) as SidebarState;

      // Validate structure
      if (parsed && typeof parsed === 'object' && 'isOpen' in parsed && 'isCollapsed' in parsed) {
        return parsed;
      }

      return null;
    } catch (error) {
      logger.error('Failed to get sidebar state from storage', error as Error);
      return null;
    }
  },

  /**
   * Set sidebar state
   * @param state Sidebar state to store
   */
  setSidebarState(state: SidebarState): void {
    try {
      safeLocalStorage.setItem(STORAGE_KEYS.SIDEBAR_STATE, JSON.stringify(state));
    } catch (error) {
      logger.error('Failed to set sidebar state in storage', error as Error);
    }
  },

  /**
   * Clear sidebar state
   */
  clearSidebarState(): void {
    safeLocalStorage.removeItem(STORAGE_KEYS.SIDEBAR_STATE);
  },

  // ============================================================================
  // Utility Methods
  // ============================================================================

  /**
   * Clear all application data from localStorage
   * Useful for logout or reset operations
   */
  clearAll(): void {
    try {
      // Clear theme
      this.clearTheme();

      // Clear locale
      this.clearLocale();

      // Clear app state
      this.clearAppState();

      // Clear sidebar state
      this.clearSidebarState();

      // Note: Auth tokens are cleared by tokenService

      logger.info('Cleared all storage data');
    } catch (error) {
      logger.error('Failed to clear all storage', error as Error);
    }
  },

  /**
   * Check if localStorage is available
   * @returns true if localStorage is available
   */
  isAvailable(): boolean {
    try {
      const testKey = '__storage_test__';
      safeLocalStorage.setItem(testKey, 'test');
      safeLocalStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Get storage usage information
   * @returns Object with storage info
   */
  getStorageInfo(): { isAvailable: boolean; keys: string[] } {
    try {
      const keys = Object.values(STORAGE_KEYS).filter((key) => safeLocalStorage.getItem(key));

      return {
        isAvailable: this.isAvailable(),
        keys,
      };
    } catch {
      return {
        isAvailable: false,
        keys: [],
      };
    }
  },
};

// ============================================================================
// Export for testing
// ============================================================================

export type StorageService = typeof storageService;
