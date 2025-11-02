import type React from 'react';
import { useState } from 'react';
import styles from '../pages/ErrorDashboard.module.css';

interface ErrorItem {
  id: string;
  message: string;
  type: string;
  level: 'info' | 'warning' | 'error' | 'fatal';
  timestamp: number;
  count?: number;
}

interface ErrorListWithFiltersProps {
  errors: ErrorItem[];
  selectedErrorType?: string;
  selectedErrorLevel?: string;
  searchQuery?: string;
  isLoading?: boolean;
}

export const ErrorListWithFilters: React.FC<ErrorListWithFiltersProps> = ({
  errors,
  selectedErrorType = '',
  selectedErrorLevel = '',
  searchQuery = '',
  isLoading = false,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter errors based on criteria
  const filteredErrors = errors.filter((error) => {
    if (selectedErrorType && error.type !== selectedErrorType) return false;
    if (selectedErrorLevel && error.level !== selectedErrorLevel) return false;
    if (searchQuery && !error.message.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  // Paginate
  const totalPages = Math.ceil(filteredErrors.length / itemsPerPage);
  const paginatedErrors = filteredErrors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const getErrorLevelClass = (level: string) => {
    switch (level) {
      case 'fatal':
      case 'error':
        return styles.error;
      case 'warning':
        return styles.warning;
      default:
        return '';
    }
  };

  const getErrorIcon = (level: string) => {
    switch (level) {
      case 'fatal':
        return '⚠';
      case 'error':
        return '✕';
      case 'warning':
        return '!';
      default:
        return 'ℹ';
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const hours = Math.floor(diffMins / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className={styles.errorListSection}>
        <h3 className={styles.errorListTitle}>Recent Errors</h3>
        <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
          Loading errors...
        </div>
      </div>
    );
  }

  return (
    <div className={styles.errorListSection}>
      <h3 className={styles.errorListTitle}>Recent Errors ({filteredErrors.length})</h3>

      {paginatedErrors.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}>✓</div>
          <div className={styles.emptyStateText}>
            {searchQuery || selectedErrorType || selectedErrorLevel
              ? 'No errors match your filters'
              : 'No errors recorded'}
          </div>
        </div>
      ) : (
        <>
          <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
            {paginatedErrors.map((error) => (
              <div
                key={error.id}
                className={`${styles.errorItem} ${getErrorLevelClass(error.level)}`}
              >
                <div className={styles.errorIcon}>{getErrorIcon(error.level)}</div>
                <div className={styles.errorContent}>
                  <div className={styles.errorMessage}>{error.message}</div>
                  <div className={styles.errorMeta}>
                    <span className={styles.errorType}>{error.type}</span>
                    <span className={styles.errorTimestamp}>{formatTime(error.timestamp)}</span>
                    {error.count && error.count > 1 && (
                      <span style={{ color: '#f44', fontWeight: 500 }}>Occurred {error.count}x</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '12px', color: '#999' }}>
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                style={{
                  marginRight: '8px',
                  padding: '4px 8px',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  opacity: currentPage === 1 ? 0.5 : 1,
                }}
              >
                ← Previous
              </button>
              <span style={{ margin: '0 8px' }}>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                style={{
                  marginLeft: '8px',
                  padding: '4px 8px',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  opacity: currentPage === totalPages ? 0.5 : 1,
                }}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
