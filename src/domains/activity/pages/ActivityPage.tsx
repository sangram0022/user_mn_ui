import type { FC } from 'react';
import { Activity, BarChart3, CheckCircle, Clock, TrendingUp } from 'lucide-react';

import { useAuth } from 'src/domains/auth';
import Breadcrumb from '@shared/ui/Breadcrumb';

const ActivityPage: FC = () => { const { user } = useAuth();

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Breadcrumb Navigation */}
      <Breadcrumb />
      
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ margin: '0 0 0.5rem 0',
          color: '#111827',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <TrendingUp className="w-6 h-6" />
          Activity Dashboard
        </h1>
        <p style={{ margin: 0, color: '#6b7280' }}>
          Track your activity and engagement metrics
        </p>
      </div>

      {/* User Activity Overview */}
      <div style={{ background: 'white',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        marginBottom: '2rem',
        overflow: 'hidden'
      }}>
        <div style={{ background: '#f9fafb',
          padding: '1rem 1.5rem',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <h2 style={{ margin: 0, color: '#111827', fontSize: '1.125rem', fontWeight: '600' }}>
            Your Activity Overview
          </h2>
        </div>
        <div style={{ padding: '1.5rem' }}>
          <div style={{ display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem'
          }}>
            <div style={{ padding: '1rem',
              background: '#f0f9ff',
              borderRadius: '8px',
              border: '1px solid #bae6fd'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Activity className="w-4 h-4 text-blue-600" />
                <span style={{ color: '#2563eb', fontWeight: '500' }}>Activity Score</span>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>85%</div>
              <p style={{ margin: 0, color: '#1e40af', fontSize: '0.875rem' }}>
                Above average engagement
              </p>
            </div>

            <div style={{ padding: '1rem',
              background: '#f0fdf4',
              borderRadius: '8px',
              border: '1px solid #bbf7d0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span style={{ color: '#16a34a', fontWeight: '500' }}>Completed Tasks</span>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>23</div>
              <p style={{ margin: 0, color: '#15803d', fontSize: '0.875rem' }}>
                This month
              </p>
            </div>

            <div style={{ padding: '1rem',
              background: '#fefce8',
              borderRadius: '8px',
              border: '1px solid #fde68a'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Clock className="w-4 h-4 text-yellow-600" />
                <span style={{ color: '#ca8a04', fontWeight: '500' }}>Time Spent</span>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>142h</div>
              <p style={{ margin: 0, color: '#a16207', fontSize: '0.875rem' }}>
                Total this month
              </p>
            </div>

            <div style={{ padding: '1rem',
              background: '#fdf2f8',
              borderRadius: '8px',
              border: '1px solid #fbcfe8'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <BarChart3 className="w-4 h-4 text-pink-600" />
                <span style={{ color: '#be185d', fontWeight: '500' }}>Productivity</span>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>92%</div>
              <p style={{ margin: 0, color: '#9d174d', fontSize: '0.875rem' }}>
                Weekly average
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div style={{ background: 'white',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        overflow: 'hidden'
      }}>
        <div style={{ background: '#f9fafb',
          padding: '1rem 1.5rem',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <h2 style={{ margin: 0, color: '#111827', fontSize: '1.125rem', fontWeight: '600' }}>
            Recent Activity
          </h2>
        </div>
        <div style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '1rem',
              background: '#f9fafb',
              borderRadius: '8px'
            }}>
              <div style={{ width: '8px',
                height: '8px',
                background: '#3b82f6',
                borderRadius: '50%'
              }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '500', color: '#111827' }}>
                  Logged into the system
                </div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  {user?.last_login_at ? new Date(user.last_login_at).toLocaleString() : '2 hours ago'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '1rem',
              background: '#f9fafb',
              borderRadius: '8px'
            }}>
              <div style={{ width: '8px',
                height: '8px',
                background: '#10b981',
                borderRadius: '50%'
              }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '500', color: '#111827' }}>
                  Profile updated
                </div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  1 day ago
                </div>
              </div>
            </div>

            <div style={{ display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '1rem',
              background: '#f9fafb',
              borderRadius: '8px'
            }}>
              <div style={{ width: '8px',
                height: '8px',
                background: '#f59e0b',
                borderRadius: '50%'
              }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '500', color: '#111827' }}>
                  Completed workflow task
                </div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  3 days ago
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityPage;
