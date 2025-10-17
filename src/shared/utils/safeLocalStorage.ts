/**
 * Safe LocalStorage Utility
 *
 * Provides safe access to localStorage with proper error handling for:
 * - Private browsing modes (Safari, Firefox)
 * - Server-Side Rendering (SSR)
 * - Storage quota exceeded errors
 * - Storage disabled by user
 *
 * @example
 * ```ts
 * import { safeLocalStorage } from '@shared/utils/safeLocalStorage';
 *
 * // Get item
 * const theme = safeLocalStorage.getItem('theme');
 *
 * // Set item
 * safeLocalStorage.setItem('theme', 'dark');
 *
 * // Remove item
 * safeLocalStorage.removeItem('theme');
 *
 * // Clear all
 * safeLocalStorage.clear();
 * ```
 */

/**
 * Check if localStorage is available and working
 */
function isLocalStorageAvailable(): boolean {
  // Check if we're in a browser environment
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
    return false;
  }

  try {
    const testKey = '__localStorage_test__';
    window.localStorage.setItem(testKey, 'test');
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    // localStorage is disabled or quota exceeded
    return false;
  }
}

/**
 * In-memory fallback storage for when localStorage is unavailable
 */
class MemoryStorage {
  private storage: Map<string, string> = new Map();

  getItem(key: string): string | null {
    return this.storage.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.storage.set(key, value);
  }

  removeItem(key: string): void {
    this.storage.delete(key);
  }

  clear(): void {
    this.storage.clear();
  }

  key(index: number): string | null {
    const keys = Array.from(this.storage.keys());
    return keys[index] ?? null;
  }

  get length(): number {
    return this.storage.size;
  }
}

/**
 * Safe localStorage wrapper with automatic fallback
 */
class SafeLocalStorage {
  private storage: Storage | MemoryStorage;
  private isAvailable: boolean;

  constructor() {
    this.isAvailable = isLocalStorageAvailable();
    this.storage = this.isAvailable ? window.localStorage : new MemoryStorage();
  }

  /**
   * Get item from storage
   * @param key - Storage key
   * @returns Value or null if not found
   */
  getItem(key: string): string | null {
    try {
      return this.storage.getItem(key);
    } catch (error) {
      console.warn(`[SafeLocalStorage] Failed to get item "${key}":`, error);
      return null;
    }
  }

  /**
   * Set item in storage
   * @param key - Storage key
   * @param value - Value to store
   * @returns true if successful, false otherwise
   */
  setItem(key: string, value: string): boolean {
    try {
      this.storage.setItem(key, value);
      return true;
    } catch (error) {
      if (error instanceof DOMException) {
        // Quota exceeded error
        if (error.name === 'QuotaExceededError') {
          console.error('[SafeLocalStorage] Storage quota exceeded. Consider clearing old data.');
          // Attempt to clear old data and retry
          this.clearOldData();
          try {
            this.storage.setItem(key, value);
            return true;
          } catch (retryError) {
            console.error('[SafeLocalStorage] Failed to set item after clearing:', retryError);
            return false;
          }
        }
      }
      console.error(`[SafeLocalStorage] Failed to set item "${key}":`, error);
      return false;
    }
  }

  /**
   * Remove item from storage
   * @param key - Storage key
   * @returns true if successful, false otherwise
   */
  removeItem(key: string): boolean {
    try {
      this.storage.removeItem(key);
      return true;
    } catch (error) {
      console.warn(`[SafeLocalStorage] Failed to remove item "${key}":`, error);
      return false;
    }
  }

  /**
   * Clear all storage
   * @returns true if successful, false otherwise
   */
  clear(): boolean {
    try {
      this.storage.clear();
      return true;
    } catch (error) {
      console.error('[SafeLocalStorage] Failed to clear storage:', error);
      return false;
    }
  }

  /**
   * Get storage key by index
   * @param index - Index of key
   * @returns Key name or null
   */
  key(index: number): string | null {
    try {
      return this.storage.key(index);
    } catch (error) {
      console.warn(`[SafeLocalStorage] Failed to get key at index ${index}:`, error);
      return null;
    }
  }

  /**
   * Get number of items in storage
   */
  get length(): number {
    try {
      return this.storage.length;
    } catch (error) {
      console.warn('[SafeLocalStorage] Failed to get storage length:', error);
      return 0;
    }
  }

  /**
   * Check if localStorage is actually available
   */
  get available(): boolean {
    return this.isAvailable;
  }

  /**
   * Get item and parse as JSON
   * @param key - Storage key
   * @returns Parsed object or null
   */
  getJSON<T = unknown>(key: string): T | null {
    const value = this.getItem(key);
    if (value === null) return null;

    try {
      return JSON.parse(value) as T;
    } catch (error) {
      console.warn(`[SafeLocalStorage] Failed to parse JSON for key "${key}":`, error);
      return null;
    }
  }

  /**
   * Set item as JSON
   * @param key - Storage key
   * @param value - Value to stringify and store
   * @returns true if successful, false otherwise
   */
  setJSON<T = unknown>(key: string, value: T): boolean {
    try {
      const serialized = JSON.stringify(value);
      return this.setItem(key, serialized);
    } catch (error) {
      console.error(`[SafeLocalStorage] Failed to stringify value for key "${key}":`, error);
      return false;
    }
  }

  /**
   * Clear old data based on timestamp
   * Removes items older than 30 days
   */
  private clearOldData(): void {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

    try {
      for (let i = this.storage.length - 1; i >= 0; i--) {
        const key = this.storage.key(i);
        if (!key) continue;

        // Check if key has timestamp pattern
        const value = this.storage.getItem(key);
        if (!value) continue;

        try {
          const parsed = JSON.parse(value);
          if (parsed && typeof parsed === 'object' && 'timestamp' in parsed) {
            if (parsed.timestamp < thirtyDaysAgo) {
              this.storage.removeItem(key);
              console.warn(`[SafeLocalStorage] Cleared old item: ${key}`);
            }
          }
        } catch {
          // Not JSON or doesn't have timestamp, skip
          continue;
        }
      }
    } catch (error) {
      console.error('[SafeLocalStorage] Error during clearOldData:', error);
    }
  }
}

/**
 * Export singleton instance
 */
export const safeLocalStorage = new SafeLocalStorage();

/**
 * For testing or custom implementations
 */
export { MemoryStorage, SafeLocalStorage, isLocalStorageAvailable };
