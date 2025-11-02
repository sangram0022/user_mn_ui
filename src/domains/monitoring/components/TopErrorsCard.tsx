import type React from 'react';
import styles from '../pages/ErrorDashboard.module.css';

interface TopError {
  id: string;
  type: string;
  message: string;
  count: number;
  percentage: number;
}

interface TopErrorsCardProps {
  topErrors: TopError[];
  isLoading?: boolean;
}

export const TopErrorsCard: React.FC<TopErrorsCardProps> = ({ topErrors, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className={styles.chartCard}>
        <h3 className={styles.chartTitle}>Top Error Types</h3>
        <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
          Loading top errors...
        </div>
      </div>
    );
  }

  if (!topErrors || topErrors.length === 0) {
    return (
      <div className={styles.chartCard}>
        <h3 className={styles.chartTitle}>Top Error Types</h3>
        <div className={styles.emptyState}>
          <div className={styles.emptyStateText}>No error data available</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.chartCard}>
      <h3 className={styles.chartTitle}>Top Error Types</h3>
      <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
        {topErrors.map((error, index) => {
          const getBarColor = (percentage: number) => {
            if (percentage > 30) return '#f44';
            if (percentage > 15) return '#f80';
            return '#08f';
          };

          return (
            <div
              key={error.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '30px 1fr auto',
                gap: '12px',
                alignItems: 'center',
                paddingBottom: '12px',
                marginBottom: '12px',
                borderBottom: '1px solid #eee',
              }}
            >
              {/* Rank */}
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color: index === 0 ? '#f80' : index === 1 ? '#999' : '#ddd',
                  textAlign: 'center',
                }}
              >
                {index === 0 && '🥇'}
                {index === 1 && '🥈'}
                {index === 2 && '🥉'}
                {index > 2 && index + 1}
              </div>

              {/* Error Info & Bar */}
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 500,
                    color: '#1a1a1a',
                    marginBottom: '4px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                  title={error.type}
                >
                  {error.type}
                </div>
                <div
                  style={{
                    fontSize: '11px',
                    color: '#999',
                    marginBottom: '6px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                  title={error.message}
                >
                  {error.message}
                </div>
                <div
                  style={{
                    height: '6px',
                    background: '#eee',
                    borderRadius: '3px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${error.percentage}%`,
                      background: getBarColor(error.percentage),
                      transition: 'width 0.3s',
                    }}
                  />
                </div>
              </div>

              {/* Count & Percentage */}
              <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#1a1a1a' }}>
                  {error.count.toLocaleString()}
                </div>
                <div style={{ fontSize: '11px', color: '#999' }}>{error.percentage}%</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
