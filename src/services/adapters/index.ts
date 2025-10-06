/**
 * API Client Adapter
 * 
 * This module provides a backward-compatible interface that wraps the modern
 * apiClient with legacy response formats. It follows the adapter pattern to
 * maintain compatibility with existing UI components while the backend
 * interface evolves.
 * 
 * Architecture:
 * - Types and utilities in ./types.ts
 * - Grouped adapters by domain (auth, user, profile, analytics, workflow)
 * - Single unified export that matches the legacy interface
 * 
 * Usage:
 *   import { apiClient } from '@/services/adapters';
 *   const result = await apiClient.register({ ... });
 */

// Import all adapter modules
import * as authAdapter from './authAdapter';
import * as userAdapter from './userAdapter';
import * as profileAdapter from './profileAdapter';
import * as analyticsAdapter from './analyticsAdapter';
import * as workflowAdapter from './workflowAdapter';
import * as requestAdapter from './requestAdapter';

// Re-export types for consumers
export type {
  StandardResponse,
  PageInfo,
  LegacyUser,
  LegacyUsersResponse,
  LegacyRolesResponse,
  ActionResponse,
  ProfileResponse,
  AnalyticsResponse,
  RegisterResponseWrapper
} from './types';

/**
 * Unified API client adapter
 * Provides backward-compatible interface for all API operations
 */
export const apiClientAdapter = {
  // Authentication operations
  register: authAdapter.register,
  forgotPassword: authAdapter.forgotPassword,
  resetPassword: authAdapter.resetPassword,
  resendVerificationEmail: authAdapter.resendVerificationEmail,
  verifyEmail: authAdapter.verifyEmail,
  changePassword: authAdapter.changePassword,

  // User management operations
  getUsers: userAdapter.getUsers,
  getRoles: userAdapter.getRoles,
  createUser: userAdapter.createUser,
  updateUser: userAdapter.updateUser,
  deleteUser: userAdapter.deleteUser,

  // Profile operations
  getProfile: profileAdapter.getProfile,
  updateProfile: profileAdapter.updateProfile,

  // Analytics operations
  getUserAnalytics: analyticsAdapter.getUserAnalytics,
  getLifecycleAnalytics: analyticsAdapter.getLifecycleAnalytics,

  // Workflow operations
  getPendingWorkflows: workflowAdapter.getPendingWorkflows,
  approveWorkflow: workflowAdapter.approveWorkflow,
  initiateUserLifecycle: workflowAdapter.initiateUserLifecycle,

  // Generic request handler
  makeRequest: requestAdapter.makeRequest
};

// Export as default for easier import
export default apiClientAdapter;
