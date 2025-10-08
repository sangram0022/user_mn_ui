/**
 * Legacy API Client - Backward Compatibility Layer
 * 
 * This module provides backward compatibility with components that were using
 * the old apiClientComplete interface. It delegates to the new modular adapter
 * pattern while maintaining the expected method signatures and response formats.
 * 
 * @deprecated Use the adapter pattern directly from @/services/adapters
 * This module exists only for backward compatibility during migration.
 * 
 * Architecture:
 * - Delegates to modular adapters in ./adapters
 * - Maintains legacy method signatures
 * - Provides type compatibility
 */

import { apiClientAdapter } from './adapters';

// Re-export all adapter functionality
export const apiClient = apiClientAdapter;

// Re-export types for backward compatibility
export type { LegacyUser } from './adapters';

// Deprecated - Use apiClient named export instead
export const apiClientLegacy = new Proxy<Record<string, never>>(
  {},
  {
    get() {
      throw new Error(
        'apiClientLegacy has been removed. Use apiClient from @services/apiClient instead.'
      );
    }
  }
) as never;

// Default export for backward compatibility
export default apiClientAdapter;
