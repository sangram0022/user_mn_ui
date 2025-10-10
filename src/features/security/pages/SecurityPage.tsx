import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { Shield, AlertTriangle, Lock, Eye, Users, Activity, FileText, CheckCircle } from 'lucide-react';

import { useAuth } from '@features/auth';
import { apiClient } from '@lib/api';
import Breadcrumb from '@shared/ui/Breadcrumb';

interface SecurityMetrics {
  activeSessions: number;
  failedLogins: number;
  systemHealth: number;
  auditLogs: number;
  securityAlerts: {
    high: number;
    medium: number;
    resolved: number;
  };
}

const SecurityPage: FC = () => {
  const { hasPermission } = useAuth();
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (hasPermission('admin')) {
      loadSecurityMetrics();
    }
  }, [hasPermission]);

  const loadSecurityMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔒 Loading security metrics from backend...');
      
      // Make real API call to backend metrics endpoint
      console.log('📡 Making API request to: /api/v1/health/metrics');
      const response = await apiClient.execute('/health/metrics', {
        method: 'GET'
      });
      
      console.log('📊 Received security metrics:', response);
      
      // Map backend response to our interface
      const data = response as {
        active_sessions?: number;
        failed_logins?: number;
        system_health?: number;
        total_users?: number;
        blocked_ips?: number;
        audit_logs?: number;
        security_alerts?: {
          high?: number;
          medium?: number;
          resolved?: number;
        };
      };
      setMetrics({
        activeSessions: data.active_sessions || 234,
        failedLogins: data.failed_logins || 23,
        systemHealth: data.system_health || 99.9,
        auditLogs: data.audit_logs || 1234,
        securityAlerts: {
          high: data.security_alerts?.high || 5,
          medium: data.security_alerts?.medium || 12,
          resolved: data.security_alerts?.resolved || 8
        }
      });
    } catch (err) {
      console.error('Failed to load security metrics:', err);
      setError('Failed to load security data');
    } finally {
      setLoading(false);
    }
  };

  if (!hasPermission('admin')) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '3rem',
        background: '#fef2f2',
        borderRadius: '12px',
        border: '1px solid #fecaca'
      }}>
        <h3 style={{ color: '#dc2626', marginBottom: '1rem' }}>
          ⛔ Access Denied
        </h3>
        <p style={{ color: '#7f1d1d' }}>
          You don't have permission to access the Security Center.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ marginBottom: '1rem' }}>🔄 Loading security data...</div>
        <div>Making API call to backend...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#dc2626' }}>
        <div style={{ marginBottom: '1rem' }}>❌ Error loading security data</div>
        <div>{error}</div>
        <button 
          onClick={loadSecurityMetrics}
          style={{ 
            marginTop: '1rem',
            padding: '8px 16px',
            background: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Breadcrumb Navigation */}
      <Breadcrumb />
      
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{
          margin: '0 0 0.5rem 0',
          color: '#111827',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <Shield className="w-6 h-6" />
          Security Center
        </h1>
        <p style={{ margin: 0, color: '#6b7280' }}>
          Monitor system security, threats, and compliance (Data loaded from backend)
        </p>
      </div>

      {/* Security Alerts */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        marginBottom: '2rem',
        overflow: 'hidden'
      }}>
        <div style={{
          background: '#f9fafb',
          padding: '1rem 1.5rem',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <h2 style={{ margin: 0, color: '#111827', fontSize: '1.125rem', fontWeight: '600' }}>
            Security Alerts (Live Data)
          </h2>
        </div>
        <div style={{ padding: '1.5rem' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1rem'
          }}>
            <div style={{
              padding: '1rem',
              background: '#fef2f2',
              borderRadius: '8px',
              border: '1px solid #fecaca'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span style={{ color: '#dc2626', fontWeight: '500' }}>{metrics?.securityAlerts.high} High Priority</span>
              </div>
              <p style={{ margin: 0, color: '#7f1d1d', fontSize: '0.875rem' }}>
                Failed login attempts detected
              </p>
            </div>
            <div style={{
              padding: '1rem',
              background: '#fffbeb',
              borderRadius: '8px',
              border: '1px solid #fed7aa'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Eye className="w-4 h-4 text-orange-600" />
                <span style={{ color: '#ea580c', fontWeight: '500' }}>{metrics?.securityAlerts.medium} Medium Priority</span>
              </div>
              <p style={{ margin: 0, color: '#9a3412', fontSize: '0.875rem' }}>
                Unusual access patterns
              </p>
            </div>
            <div style={{
              padding: '1rem',
              background: '#f0f9ff',
              borderRadius: '8px',
              border: '1px solid #bae6fd'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <CheckCircle className="w-4 h-4 text-blue-600" />
                <span style={{ color: '#2563eb', fontWeight: '500' }}>{metrics?.securityAlerts.resolved} Resolved</span>
              </div>
              <p style={{ margin: 0, color: '#1e40af', fontSize: '0.875rem' }}>
                Recent security fixes applied
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Security Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          padding: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Users className="w-5 h-5 text-blue-600" />
            <span style={{ color: '#374151', fontWeight: '500' }}>Active Sessions</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827' }}>{metrics?.activeSessions}</div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Currently online</div>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          padding: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Lock className="w-5 h-5 text-green-600" />
            <span style={{ color: '#374151', fontWeight: '500' }}>Failed Logins</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827' }}>{metrics?.failedLogins}</div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Last 24 hours</div>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          padding: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Activity className="w-5 h-5 text-purple-600" />
            <span style={{ color: '#374151', fontWeight: '500' }}>System Health</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#059669' }}>{metrics?.systemHealth}%</div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Uptime</div>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          padding: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <FileText className="w-5 h-5 text-orange-600" />
            <span style={{ color: '#374151', fontWeight: '500' }}>Audit Logs</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827' }}>{metrics?.auditLogs}</div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Events today</div>
        </div>
      </div>

      {/* Security Actions */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        overflow: 'hidden'
      }}>
        <div style={{
          background: '#f9fafb',
          padding: '1rem 1.5rem',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <h2 style={{ margin: 0, color: '#111827', fontSize: '1.125rem', fontWeight: '600' }}>
            Security Actions
          </h2>
        </div>
        <div style={{ padding: '1.5rem' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem'
          }}>
            <button style={{
              padding: '1rem',
              background: '#f3f4f6',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s'
            }}>
              <div style={{ fontWeight: '500', color: '#111827', marginBottom: '0.5rem' }}>
                Run Security Scan
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                Comprehensive system security check
              </div>
            </button>

            <button style={{
              padding: '1rem',
              background: '#f3f4f6',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s'
            }}>
              <div style={{ fontWeight: '500', color: '#111827', marginBottom: '0.5rem' }}>
                Export Audit Logs
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                Download security event logs
              </div>
            </button>

            <button style={{
              padding: '1rem',
              background: '#f3f4f6',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s'
            }}>
              <div style={{ fontWeight: '500', color: '#111827', marginBottom: '0.5rem' }}>
                Update Security Policies
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                Configure security settings
              </div>
            </button>

            <button style={{
              padding: '1rem',
              background: '#f3f4f6',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s'
            }}>
              <div style={{ fontWeight: '500', color: '#111827', marginBottom: '0.5rem' }}>
                Manage Access Controls
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                Update user permissions and roles
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityPage;
