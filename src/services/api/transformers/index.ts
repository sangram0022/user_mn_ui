/**
 * API Transformers Index
 * Central export for all data transformers
 * 
 * Transformers decouple API response formats from UI data requirements:
 * - Convert snake_case to camelCase
 * - Add computed properties for UI convenience
 * - Parse and format complex data structures
 * - Provide reverse transformers for API requests
 * 
 * @example
 * import { transformUser, transformAuthSession } from '@/services/api/transformers';
 */

// User transformers
export {
  transformUser,
  transformUserProfile,
  transformUsers,
  transformUserProfiles,
  transformUserUpdateToApi,
  type UserUI,
  type UserProfileUI,
} from './userTransformer';

// Auth transformers
export {
  transformAuthSession,
  transformRegistrationResult,
  parseJwtToken,
  extractUserInfoFromToken,
  isTokenExpired,
  getTokenExpiryTime,
  transformLoginToApi,
  transformRegistrationToApi,
  type AuthTokensUI,
  type AuthSessionUI,
  type RegistrationResultUI,
} from './authTransformer';

// Admin transformers
export {
  transformAdminStats,
  transformGrowthAnalytics,
  transformToChartData,
  type AdminStatsUI,
  type GrowthAnalyticsUI,
} from './adminTransformer';

