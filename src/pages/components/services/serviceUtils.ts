// ========================================
// Service Utilities
// ========================================

import type { BadgeVariant } from '@/design-system/variants';

export const getComplexityColor = (complexity: string): BadgeVariant => {
  switch (complexity) {
    case 'Beginner': return 'success';
    case 'Intermediate': return 'warning';
    case 'Advanced': return 'danger';
    default: return 'gray';
  }
};

export const getCategoryColor = (category: string): BadgeVariant => {
  switch (category) {
    case 'Development': return 'primary';
    case 'Design': return 'secondary';
    case 'Marketing': return 'info';
    case 'Consulting': return 'warning';
    default: return 'gray';
  }
};
