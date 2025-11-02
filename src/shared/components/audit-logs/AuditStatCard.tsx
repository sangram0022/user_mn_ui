/**
 * Audit Statistics Card Component
 * Reusable card for displaying audit log statistics
 */

interface StatCardProps {
  label: string;
  value: string | number;
  color?: string;
  icon?: string;
}

export function AuditStatCard({ label, value, color = '#08f', icon }: StatCardProps) {
  return (
    <div
      style={{
        backgroundColor: '#fff',
        border: `2px solid ${color}`,
        borderRadius: '8px',
        padding: '16px',
        textAlign: 'center',
        minWidth: '150px',
      }}
    >
      {icon && <div style={{ fontSize: '24px', marginBottom: '8px' }}>{icon}</div>}
      <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px', fontWeight: '500' }}>
        {label}
      </div>
      <div style={{ fontSize: '28px', fontWeight: 'bold', color }}>{value}</div>
    </div>
  );
}
