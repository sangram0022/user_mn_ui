/**
 * Workflow management adapter functions
 * Provides backward-compatible API wrappers for workflow operations
 */

import baseApiClient from '../apiClient';
import type { PendingWorkflow } from '@shared/types';
import type { ActionResponse } from './types';
import { createErrorResponse } from './types';

/**
 * Get pending workflows
 */
export async function getPendingWorkflows(): Promise<{
  success: boolean;
  data: PendingWorkflow[];
  message?: string;
}> {
  const workflows = await baseApiClient.getPendingApprovals();
  
  return {
    success: true,
    data: workflows,
    message: workflows.length ? undefined : 'No pending workflows.'
  };
}

/**
 * Approve a workflow request
 * Note: This is a stub until backend implementation is available
 */
export async function approveWorkflow(
  _requestId?: string | number,
  _payload?: unknown
): Promise<ActionResponse> {
  return createErrorResponse(
    'Workflow approvals are not yet integrated with the backend.'
  );
}

/**
 * Initiate user lifecycle process
 * Note: This is a stub until backend implementation is available
 */
export async function initiateUserLifecycle(
  ..._args: unknown[]
): Promise<ActionResponse> {
  return createErrorResponse(
    'Lifecycle automation is not yet available in this environment.'
  );
}
