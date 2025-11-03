/**
 * Formatters Module
 * Convenience re-exports of all formatting utilities
 * 
 * @module formatters
 * @example
 * import { formatShortDate, formatUserRole, formatCurrency } from '@/utils/formatters';
 */

// ============================================================================
// Date Formatters
// ============================================================================

export {
  formatShortDate,
  formatDateTime,
  formatLongDate,
  formatTime,
  formatRelativeTime,
  formatTimeAgo,
  formatExcelDate,
  formatISODate,
  formatFilenameDate,
  parseDate,
  isValidDate,
  isToday,
  isWithinDays,
  isInPast,
  isInFuture,
  DATE_FORMAT_CONSTANTS,
  type DateInput,
  type DateFormatOptions,
} from '../shared/utils/dateFormatters';

// ============================================================================
// Text Formatters
// ============================================================================

export {
  formatEnumValue,
  capitalizeFirst,
  capitalizeWords,
  formatUserRole,
  formatUserStatus,
  truncateText,
  slugify,
  getInitials,
  formatFullName,
  removeExtraWhitespace,
  camelToTitle,
  maskText,
  type UserRole,
  type UserStatus,
} from '../shared/utils/textFormatters';

// ============================================================================
// Export Utilities
// ============================================================================

export {
  exportData,
  generateFilename,
  validateExportData,
  formatExportData,
  type ExportFormat,
  type ExportOptions,
} from '../shared/utils/exportUtils';
