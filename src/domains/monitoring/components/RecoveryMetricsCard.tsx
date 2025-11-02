import type React from 'react';
import styles from '../pages/ErrorDashboard.module.css';

interface RecoveryMetricsCardProps {
  recoveryRate: number;
  recoveredErrors: number;
  failedRecoveries: number;
  isLoading?: boolean;
}

export const RecoveryMetricsCard: React.FC<RecoveryMetricsCardProps> = ({
  recoveryRate,
  recoveredErrors,
  failedRecoveries,
  isLoading = false,
}) => {
  const getStatusClass = (rate: number) => {
    if (rate >= 90) return styles.statusHealthy;
    if (rate >= 70) return styles.statusCaution;
    if (rate >= 50) return styles.statusWarning;
    return styles.statusCritical;
  };

  const getStatusText = (rate: number) => {
    if (rate >= 90) return 'Excellent recovery';
    if (rate >= 70) return 'Good recovery';
    if (rate >= 50) return 'Fair recovery';
    return 'Poor recovery';
  };

  const totalAttempts = recoveredErrors + failedRecoveries;

  return (
    <div className={styles.chartCard}>
      <h3 className={styles.chartTitle}>Recovery Metrics</h3>
      {isLoading ? (
        <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
          Loading recovery data...
        </div>
      ) : (
        <div style={{ padding: '16px' }}>
          {/* Recovery Rate */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#999', marginBottom: '8px' }}>
              Recovery Rate
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ fontSize: '32px', fontWeight: 700, minWidth: '60px' }}>
                {recoveryRate}%
              </div>
              <div
                style={{
                  flex: 1,
                  height: '8px',
                  background: '#eee',
                  borderRadius: '4px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${recoveryRate}%`,
                    background: recoveryRate >= 70 ? '#4a4' : recoveryRate >= 50 ? '#f80' : '#f44',
                    transition: 'width 0.3s',
                  }}
                />
              </div>
            </div>
            <div className={getStatusClass(recoveryRate)} style={{ fontSize: '12px', marginTop: '8px' }}>
              {getStatusText(recoveryRate)}
            </div>
          </div>

          {/* Breakdown */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              padding: '12px 0',
              borderTop: '1px solid #eee',
              borderBottom: '1px solid #eee',
            }}
          >
            <div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#999', marginBottom: '4px' }}>
                RECOVERED
              </div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#4a4' }}>
                {recoveredErrors.toLocaleString()}
              </div>
              <div style={{ fontSize: '11px', color: '#999' }}>errors fixed</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#999', marginBottom: '4px' }}>
                FAILED
              </div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#f44' }}>
                {failedRecoveries.toLocaleString()}
              </div>
              <div style={{ fontSize: '11px', color: '#999' }}>recovery attempts</div>
            </div>
          </div>

          {/* Total */}
          <div style={{ padding: '12px 0', fontSize: '13px', color: '#666' }}>
            <span>Total attempts: </span>
            <strong>{totalAttempts.toLocaleString()}</strong>
          </div>
        </div>
      )}
    </div>
  );
};
