/**
 * @deprecated Legacy adapter exports removed. No adapters remain.
 */
import * as authAdapter from './authAdapter';
import * as userAdapter from './userAdapter';
import * as profileAdapter from './profileAdapter';
import * as analyticsAdapter from './analyticsAdapter';
import * as workflowAdapter from './workflowAdapter';
import * as requestAdapter from './requestAdapter';
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
