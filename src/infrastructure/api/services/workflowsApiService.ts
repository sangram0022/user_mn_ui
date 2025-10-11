import { apiClient } from '../apiClient';

export interface WorkflowDefinition {
  id: string;
  name: string;
  description?: string;
  version: string;
  status: 'active' | 'inactive' | 'draft';
  created_at: string;
  updated_at: string;
  steps: WorkflowStep[];
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: 'approval' | 'notification' | 'action' | 'condition';
  config: Record<string, unknown>;
  order: number;
}

export interface WorkflowInstance {
  id: string;
  workflow_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  created_at: string;
  completed_at?: string;
  context: Record<string, unknown>;
  current_step?: string;
}

export interface CreateWorkflowData {
  name: string;
  description?: string;
  steps: Omit<WorkflowStep, 'id'>[];
}

export const workflowsApiService = {
  async getWorkflows(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<WorkflowDefinition[]> {
    const response = await apiClient.get<WorkflowDefinition[]>('/workflows', { params });
    return response.data;
  },

  async getWorkflowById(workflowId: string): Promise<WorkflowDefinition> {
    const response = await apiClient.get<WorkflowDefinition>(`/workflows/${workflowId}`);
    return response.data;
  },

  async createWorkflow(
    data: CreateWorkflowData
  ): Promise<{ workflow_id: string; message: string }> {
    const response = await apiClient.post<{ workflow_id: string; message: string }>(
      '/workflows',
      data
    );
    return response.data;
  },

  async updateWorkflow(
    workflowId: string,
    data: Partial<CreateWorkflowData>
  ): Promise<WorkflowDefinition> {
    const response = await apiClient.put<WorkflowDefinition>(`/workflows/${workflowId}`, data);
    return response.data;
  },

  async deleteWorkflow(workflowId: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/workflows/${workflowId}`);
    return response.data;
  },

  async executeWorkflow(
    workflowId: string,
    context: Record<string, unknown>
  ): Promise<{ instance_id: string; message: string }> {
    const response = await apiClient.post<{ instance_id: string; message: string }>(
      `/workflows/${workflowId}/execute`,
      { context }
    );
    return response.data;
  },

  async getWorkflowInstances(
    workflowId: string,
    params?: {
      page?: number;
      limit?: number;
      status?: string;
    }
  ): Promise<WorkflowInstance[]> {
    const response = await apiClient.get<WorkflowInstance[]>(`/workflows/${workflowId}/instances`, {
      params,
    });
    return response.data;
  },

  async getWorkflowInstance(workflowId: string, instanceId: string): Promise<WorkflowInstance> {
    const response = await apiClient.get<WorkflowInstance>(
      `/workflows/${workflowId}/instances/${instanceId}`
    );
    return response.data;
  },

  async cancelWorkflowInstance(
    workflowId: string,
    instanceId: string
  ): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(
      `/workflows/${workflowId}/instances/${instanceId}/cancel`
    );
    return response.data;
  },
};
