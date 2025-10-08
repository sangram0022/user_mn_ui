/**
 * Legacy API Client - Backward Compatibility Layer
 *
 * This module provides backward compatibility with components that were using
 * the old apiClientComplete interface. It delegates to the new modular adapter
 * pattern while maintaining the expected method signatures and response formats.
 *
 * @deprecated Use the adapter pattern directly from @shared/services/api/adapters
 * This module exists only for backward compatibility during migration.
 *
 * Architecture:
 * - Delegates to modular adapters in @services/adapters
 * - Maintains legacy method signatures
 * - Provides type compatibility
 */

import { apiClientAdapter } from '@services/adapters';

// Re-export all adapter functionality
export const apiClient = apiClientAdapter;

// Re-export types for backward compatibility
export type { LegacyUser } from '@services/adapters';

// Deprecated - Use apiClient named export instead
export const apiClientLegacy = apiClientAdapter;

// Default export for backward compatibility
export default apiClientAdapter;
