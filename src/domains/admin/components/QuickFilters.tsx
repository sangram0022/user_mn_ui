/**
 * QuickFilters Component
 * Quick action buttons for common audit log filters
 */

import Button from '@/shared/components/ui/Button';

interface QuickFiltersProps {
  onQuickFilter: (type: 'today' | 'critical' | 'failed_logins') => void;
  activeFiltersCount: number;
  onClearFilters: () => void;
}

export default function QuickFilters({
  onQuickFilter,
  activeFiltersCount,
  onClearFilters,
}: QuickFiltersProps) {
  return (
    <div className="flex items-center gap-3">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onQuickFilter('today')}
      >
        Today's Logs
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onQuickFilter('critical')}
      >
        Critical Only
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onQuickFilter('failed_logins')}
      >
        Failed Logins
      </Button>
      {activeFiltersCount > 0 && (
        <Button variant="ghost" size="sm" onClick={onClearFilters}>
          Clear All Filters ({activeFiltersCount})
        </Button>
      )}
    </div>
  );
}
