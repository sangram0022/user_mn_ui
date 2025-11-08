/**
 * Audit Log Row Component
 * Reusable row for displaying audit log entries in a table
 */

import type { AuditLog } from '@/domains/audit-logs/types/auditLog.types';
import { STATUS_COLORS, ACTION_ICONS } from '@/shared/constants/auditLogConstants';
import { ComponentErrorBoundary } from '@/shared/components/error/ModernErrorBoundary';

interface AuditLogRowProps {
  log: AuditLog;
  onArchive?: (id: string) => void;
  showArchiveButton?: boolean;
}

export function AuditLogRow({ log, onArchive, showArchiveButton = false }: AuditLogRowProps) {
  const statusColor = STATUS_COLORS[log.status] || '#999';
  const actionIcon = ACTION_ICONS[log.action] || '→';

  return (
    <tr style={{ borderBottom: '1px solid #eee' }}>
      <td style={{ padding: '12px', fontSize: '13px', color: '#666' }}>
        {new Date(log.timestamp).toLocaleString()}
      </td>
      <td style={{ padding: '12px', fontSize: '13px', color: '#333' }}>{log.user}</td>
      <td style={{ padding: '12px', fontSize: '13px', color: '#333' }}>
        <span style={{ marginRight: '6px' }}>{actionIcon}</span>
        {log.action}
      </td>
      <td style={{ padding: '12px', fontSize: '13px', color: '#333' }}>{log.resource}</td>
      <td style={{ padding: '12px', textAlign: 'center' }}>
        <span
          style={{
            display: 'inline-block',
            padding: '4px 12px',
            borderRadius: '12px',
            backgroundColor: `${statusColor}20`,
            color: statusColor,
            fontSize: '12px',
            fontWeight: '500',
            textTransform: 'capitalize',
          }}
        >
          {log.status}
        </span>
      </td>
      <td style={{ padding: '12px', fontSize: '13px', color: '#666' }}>{log.ipAddress}</td>
      <td style={{ padding: '12px', fontSize: '12px', color: '#999' }} title={log.details}>
        {log.details.length > 40 ? `${log.details.substring(0, 40)}...` : log.details}
      </td>
      {showArchiveButton && (
        <td style={{ padding: '12px', textAlign: 'center' }}>
          <button
            onClick={() => onArchive?.(log.id)}
            style={{
              padding: '4px 8px',
              fontSize: '12px',
              backgroundColor: '#f0f0f0',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer',
              color: '#666',
            }}
          >
            Archive
          </button>
        </td>
      )}
    </tr>
  );
}

function AuditLogRowWithErrorBoundary(props: AuditLogRowProps) {
  return (
    <ComponentErrorBoundary>
      <AuditLogRow {...props} />
    </ComponentErrorBoundary>
  );
}

export default AuditLogRowWithErrorBoundary;
