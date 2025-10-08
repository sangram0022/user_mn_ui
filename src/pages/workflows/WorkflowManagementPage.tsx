import type { FC } from 'react';
import { useCallback, useEffect, useId, useState } from 'react';

import { useAuth } from '@features/auth';
import { apiClient } from '@services/apiClientLegacy';
import Breadcrumb from '@shared/ui/Breadcrumb';

interface WorkflowAction {
  id: number;
  workflow_type: string;
  action_type: string;
  resource_type: string;
  resource_id: number;
  requested_by: {
    id: number;
    email: string;
    full_name: string;
  };
  approved_by?: {
    id: number;
    email: string;
    full_name: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  approved_at?: string;
  details: Record<string, unknown>;
  justification?: string;
}

interface WorkflowStats {
  total_pending: number;
  total_approved: number;
  total_rejected: number;
  pending_by_type: Array<{
    workflow_type: string;
    count: number;
  }>;
}

const WorkflowManagement: FC = () => {
  const { hasPermission, user } = useAuth();
  const [workflows, setWorkflows] = useState<WorkflowAction[]>([]);
  const [stats, setStats] = useState<WorkflowStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('pending');
  const [filterType, setFilterType] = useState<string>('');
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowAction | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const statusFilterId = useId();
  const typeFilterId = useId();

  useEffect(() => {
    loadWorkflows();
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, filterType]);

  const loadWorkflows = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🔄 Workflow: Loading workflows from backend...');

      const params: Record<string, string> = {};
      if (filterStatus) params.status = filterStatus;
      if (filterType) params.workflow_type = filterType;

      // Mock data since API method doesn't exist
      console.warn('⚠️ getPendingWorkflows API not implemented, using empty data');

      // Use empty data for now
      setWorkflows([]);
      console.log('📝 Using empty workflow data - backend not available');
      setWorkflows([]);
      setError('Workflow management temporarily unavailable');
      
    } catch (err: unknown) {
      setError(`Failed to load workflows: ${err instanceof Error ? err.message : 'Unknown error'}`);
      console.error('❌ Workflow error:', err);
      setWorkflows([]);
    } finally {
      setIsLoading(false);
    }
  }, [filterStatus, filterType]);

  const loadStats = useCallback(async () => {
    try {
      console.log('📊 Workflow: Loading workflow statistics...');
      
      // Mock data since API method doesn't exist
      console.warn('⚠️ getWorkflowStats API not implemented, using mock data');

      // If backend fails, use empty stats
      console.log('📊 Using empty workflow stats - backend not available');
      setStats({
        total_pending: 0,
        total_approved: 0,
        total_rejected: 0,
        pending_by_type: []
      });
      
    } catch (err: unknown) {
      console.error('❌ Workflow stats error:', err);
      setStats({
        total_pending: 0,
        total_approved: 0,
        total_rejected: 0,
        pending_by_type: []
      });
    }
  }, []);

  const handleWorkflowAction = async (workflowId: number, action: 'approve' | 'reject', justification?: string) => {
    try {
      setActionLoading(`${action}-${workflowId}`);
      
      await apiClient.approveWorkflow(workflowId.toString(), {
        action,
        comments: justification
      });

      await loadWorkflows();
      await loadStats();
      setShowModal(false);
      setSelectedWorkflow(null);
    } catch (err: unknown) {
      setError(`Failed to ${action} workflow: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setActionLoading(null);
    }
  };

  if (!hasPermission('workflow:read')) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '2rem',
        background: 'var(--background-secondary)',
        borderRadius: '12px',
        border: '1px solid var(--border-color)'
      }}>
        <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
          ⛔ Access Denied
        </h3>
        <p style={{ color: 'var(--text-secondary)' }}>
          You don't have permission to manage workflows.
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Breadcrumb Navigation */}
      <Breadcrumb />
      
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{
          margin: '0 0 0.5rem 0',
          color: 'var(--text-primary)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          ⚡ Workflow Management
        </h1>
        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
          Review and approve pending workflow actions
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <StatCard
            title="Pending Actions"
            value={stats.total_pending}
            icon="⏳"
            color="#f59e0b"
          />
          <StatCard
            title="Approved"
            value={stats.total_approved}
            icon="✅"
            color="#10b981"
          />
          <StatCard
            title="Rejected"
            value={stats.total_rejected}
            icon="❌"
            color="#ef4444"
          />
        </div>
      )}

      {/* Filters */}
      <div style={{
        background: 'var(--background-secondary)',
        padding: '1.5rem',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
        marginBottom: '2rem'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          alignItems: 'end'
        }}>
          <div>
            <label
              htmlFor={statusFilterId}
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: 'var(--text-primary)',
                fontWeight: '500'
              }}
            >
              Filter by Status
            </label>
            <select
              id={statusFilterId}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                background: 'var(--background-primary)',
                color: 'var(--text-primary)'
              }}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label
              htmlFor={typeFilterId}
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: 'var(--text-primary)',
                fontWeight: '500'
              }}
            >
              Filter by Type
            </label>
            <select
              id={typeFilterId}
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                background: 'var(--background-primary)',
                color: 'var(--text-primary)'
              }}
            >
              <option value="">All Types</option>
              <option value="user_activation">User Activation</option>
              <option value="user_deactivation">User Deactivation</option>
              <option value="role_change">Role Change</option>
              <option value="data_deletion">Data Deletion</option>
              <option value="bulk_operation">Bulk Operation</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={loadWorkflows}
              style={{
                padding: '0.75rem 1rem',
                background: 'var(--primary-color)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              🔍 Search
            </button>
            <button
              onClick={() => {
                setFilterStatus('');
                setFilterType('');
              }}
              style={{
                padding: '0.75rem 1rem',
                background: 'var(--text-light)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1rem',
          color: '#dc2626'
        }}>
          {error}
        </div>
      )}

      {/* Workflows List */}
      <div style={{
        background: 'var(--background-secondary)',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
        overflow: 'hidden'
      }}>
        {isLoading ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
            <div style={{ color: 'var(--text-secondary)' }}>Loading workflows...</div>
          </div>
        ) : workflows.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚡</div>
            <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>
              No Workflows Found
            </h3>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
              {filterStatus || filterType
                ? 'Try adjusting your filters'
                : 'No workflow actions are pending review'
              }
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {workflows.map((workflow, index) => (
              <WorkflowCard
                key={workflow.id}
                workflow={workflow}
                index={index}
                onView={() => {
                  setSelectedWorkflow(workflow);
                  setShowModal(true);
                }}
                onAction={handleWorkflowAction}
                hasApprovalPermission={hasPermission('workflow:approve')}
                actionLoading={actionLoading}
                currentUserId={typeof user?.id === 'string' ? parseInt(user.id, 10) : user?.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Workflow Detail Modal */}
      {showModal && selectedWorkflow && (
        <WorkflowModal
          workflow={selectedWorkflow}
          onAction={handleWorkflowAction}
          onClose={() => {
            setShowModal(false);
            setSelectedWorkflow(null);
          }}
          hasApprovalPermission={hasPermission('workflow:approve')}
          actionLoading={actionLoading}
          currentUserId={typeof user?.id === 'string' ? parseInt(user.id, 10) : user?.id}
        />
      )}
    </div>
  );
};

// Stat Card Component
const StatCard: FC<{
  title: string;
  value: number;
  icon: string;
  color: string;
}> = ({ title, value, icon }) => {
  return (
    <div style={{
      background: 'var(--background-secondary)',
      padding: '1.5rem',
      borderRadius: '12px',
      border: '1px solid var(--border-color)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
      }}>
        <div>
          <h3 style={{
            margin: '0 0 0.5rem 0',
            color: 'var(--text-secondary)',
            fontSize: '0.9rem',
            fontWeight: '500'
          }}>
            {title}
          </h3>
          <div style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: 'var(--text-primary)'
          }}>
            {value.toLocaleString()}
          </div>
        </div>
        <div style={{
          fontSize: '2rem',
          opacity: 0.7
        }}>
          {icon}
        </div>
      </div>
    </div>
  );
};

// Workflow Card Component
const WorkflowCard: FC<{
  workflow: WorkflowAction;
  index: number;
  onView: () => void;
  onAction: (id: number, action: 'approve' | 'reject', justification?: string) => void;
  hasApprovalPermission: boolean;
  actionLoading: string | null;
  currentUserId?: number;
}> = ({ workflow, index, onView, onAction, hasApprovalPermission, actionLoading, currentUserId }) => {
  const isLoading = (action: string) => actionLoading === `${action}-${workflow.id}`;
  const canApprove = hasApprovalPermission && workflow.status === 'pending' && workflow.requested_by.id !== currentUserId;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'approved': return '#10b981';
      case 'rejected': return '#ef4444';
      default: return 'var(--text-secondary)';
    }
  };

  const getWorkflowIcon = (type: string) => {
    switch (type) {
      case 'user_activation': return '✅';
      case 'user_deactivation': return '⏸️';
      case 'role_change': return '🔄';
      case 'data_deletion': return '🗑️';
      case 'bulk_operation': return '📦';
      default: return '⚡';
    }
  };

  return (
    <div style={{
      padding: '1.5rem',
      borderBottom: index < 10 ? '1px solid var(--border-color)' : 'none',
      backgroundColor: index % 2 === 0 ? 'var(--background-secondary)' : 'var(--background-primary)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '1rem'
      }}>
        <div style={{ flex: 1 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '0.75rem'
          }}>
            <span style={{ fontSize: '1.5rem' }}>
              {getWorkflowIcon(workflow.workflow_type)}
            </span>
            <div>
              <h4 style={{
                margin: '0 0 0.25rem 0',
                color: 'var(--text-primary)',
                textTransform: 'capitalize'
              }}>
                {workflow.workflow_type.replace('_', ' ')} - {workflow.action_type}
              </h4>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                fontSize: '0.85rem',
                color: 'var(--text-secondary)'
              }}>
                <span>Requested by: {workflow.requested_by.full_name || workflow.requested_by.email}</span>
                <span>•</span>
                <span>{new Date(workflow.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div style={{
            background: 'var(--background-primary)',
            padding: '0.75rem',
            borderRadius: '6px',
            border: '1px solid var(--border-color)',
            marginBottom: '1rem'
          }}>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <strong>Resource:</strong> {workflow.resource_type} (ID: {workflow.resource_id})
              {workflow.justification && (
                <>
                  <br />
                  <strong>Justification:</strong> {workflow.justification}
                </>
              )}
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <span style={{
              padding: '0.25rem 0.75rem',
              background: getStatusColor(workflow.status) + '20',
              color: getStatusColor(workflow.status),
              borderRadius: '16px',
              fontSize: '0.85rem',
              fontWeight: '500',
              textTransform: 'capitalize'
            }}>
              {workflow.status}
            </span>

            {workflow.approved_by && workflow.approved_at && (
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {workflow.status === 'approved' ? 'Approved' : 'Rejected'} by {workflow.approved_by.full_name || workflow.approved_by.email} on {new Date(workflow.approved_at).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        <div style={{
          display: 'flex',
          gap: '0.5rem',
          alignItems: 'flex-start'
        }}>
          <button
            onClick={onView}
            style={{
              padding: '0.5rem 1rem',
              background: 'var(--primary-color)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            View Details
          </button>

          {canApprove && (
            <>
              <button
                onClick={() => onAction(workflow.id, 'approve')}
                disabled={isLoading('approve') || isLoading('reject')}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.85rem'
                }}
              >
                {isLoading('approve') ? '...' : 'Approve'}
              </button>
              <button
                onClick={() => onAction(workflow.id, 'reject')}
                disabled={isLoading('approve') || isLoading('reject')}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.85rem'
                }}
              >
                {isLoading('reject') ? '...' : 'Reject'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Workflow Modal Component
const WorkflowModal: FC<{
  workflow: WorkflowAction;
  onAction: (id: number, action: 'approve' | 'reject', justification?: string) => void;
  onClose: () => void;
  hasApprovalPermission: boolean;
  actionLoading: string | null;
  currentUserId?: number;
}> = ({ workflow, onAction, onClose, hasApprovalPermission, actionLoading, currentUserId }) => {
  const [justification, setJustification] = useState('');
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const justificationId = useId();
  const justificationHintId = `${justificationId}-hint`;
  
  const isLoading = (action: string) => actionLoading === `${action}-${workflow.id}`;
  const canApprove = hasApprovalPermission && workflow.status === 'pending' && workflow.requested_by.id !== currentUserId;

  const handleAction = (action: 'approve' | 'reject') => {
    if (action === 'reject' && !justification.trim()) {
      alert('Justification is required for rejection');
      return;
    }
    onAction(workflow.id, action, justification || undefined);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'var(--background-secondary)',
        padding: '2rem',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
        width: '100%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>
            Workflow Details
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: 'var(--text-secondary)'
            }}
          >
            ×
          </button>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div>
            <strong style={{ color: 'var(--text-primary)' }}>Workflow Type:</strong>
            <span style={{ marginLeft: '0.5rem', color: 'var(--text-secondary)' }}>
              {workflow.workflow_type.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          
          <div>
            <strong style={{ color: 'var(--text-primary)' }}>Action:</strong>
            <span style={{ marginLeft: '0.5rem', color: 'var(--text-secondary)' }}>
              {workflow.action_type}
            </span>
          </div>
          
          <div>
            <strong style={{ color: 'var(--text-primary)' }}>Resource:</strong>
            <span style={{ marginLeft: '0.5rem', color: 'var(--text-secondary)' }}>
              {workflow.resource_type} (ID: {workflow.resource_id})
            </span>
          </div>
          
          <div>
            <strong style={{ color: 'var(--text-primary)' }}>Requested by:</strong>
            <span style={{ marginLeft: '0.5rem', color: 'var(--text-secondary)' }}>
              {workflow.requested_by.full_name || workflow.requested_by.email}
            </span>
          </div>
          
          <div>
            <strong style={{ color: 'var(--text-primary)' }}>Created:</strong>
            <span style={{ marginLeft: '0.5rem', color: 'var(--text-secondary)' }}>
              {new Date(workflow.created_at).toLocaleString()}
            </span>
          </div>

          {workflow.justification && (
            <div>
              <strong style={{ color: 'var(--text-primary)' }}>Justification:</strong>
              <div style={{
                marginTop: '0.5rem',
                padding: '0.75rem',
                background: 'var(--background-primary)',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                color: 'var(--text-secondary)'
              }}>
                {workflow.justification}
              </div>
            </div>
          )}

          <div>
            <strong style={{ color: 'var(--text-primary)' }}>Details:</strong>
            <div style={{
              marginTop: '0.5rem',
              padding: '0.75rem',
              background: 'var(--background-primary)',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              fontFamily: 'monospace',
              fontSize: '0.85rem'
            }}>
              <pre>{JSON.stringify(workflow.details, null, 2)}</pre>
            </div>
          </div>
        </div>

        {canApprove && (
          <div style={{ marginBottom: '1.5rem' }}>
            <label
              htmlFor={justificationId}
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: 'var(--text-primary)',
                fontWeight: '500'
              }}
            >
              Justification
            </label>
            <textarea
              id={justificationId}
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="Enter justification for your decision..."
              aria-describedby={justificationHintId}
              aria-required={actionType === 'reject'}
              style={{
                width: '100%',
                minHeight: '100px',
                padding: '0.75rem',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                background: 'var(--background-primary)',
                color: 'var(--text-primary)',
                resize: 'vertical'
              }}
            />
            <p
              id={justificationHintId}
              style={{
                marginTop: '0.5rem',
                color: 'var(--text-secondary)',
                fontSize: '0.85rem'
              }}
            >
              {actionType === 'reject'
                ? 'Justification is required when rejecting a workflow.'
                : 'Justification is optional when approving a workflow.'}
            </p>
          </div>
        )}

        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'var(--text-light)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
          
          {canApprove && (
            <>
              <button
                onClick={() => {
                  setActionType('reject');
                  handleAction('reject');
                }}
                disabled={isLoading('approve') || isLoading('reject')}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                {isLoading('reject') ? 'Rejecting...' : 'Reject'}
              </button>
              <button
                onClick={() => {
                  setActionType('approve');
                  handleAction('approve');
                }}
                disabled={isLoading('approve') || isLoading('reject')}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                {isLoading('approve') ? 'Approving...' : 'Approve'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkflowManagement;
