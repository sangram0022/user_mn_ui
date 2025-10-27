/**
 * LocaleSelector Component
 *
 * Dropdown component to select and change the application locale.
 * Demonstrates usage of the localization system.
 *
 * @author GitHub Copilot
 */

import { useLocalization } from '../../hooks/localization/useLocalization';
import type { LocaleCode } from '../../types/localization.types';

// ============================================================================
// Locale Configuration
// ============================================================================

interface LocaleOption {
  code: LocaleCode;
  name: string;
  flag: string;
}

const LOCALE_OPTIONS: LocaleOption[] = [
  { code: 'en', name: 'English', flag: '' },
  { code: 'es', name: 'Espaol', flag: '' },
  { code: 'fr', name: 'Franais', flag: '' },
  { code: 'de', name: 'Deutsch', flag: '' },
  { code: 'it', name: 'Italiano', flag: '' },
  { code: 'pt', name: 'Portugus', flag: '' },
  { code: 'ja', name: '', flag: '' },
  { code: 'ko', name: '', flag: '' },
  { code: 'zh', name: '', flag: '' },
  { code: 'hi', name: '', flag: '' },
  { code: 'ar', name: '', flag: '' },
];

// ============================================================================
// Component Props
// ============================================================================

export interface LocaleSelectorProps {
  /** Custom CSS class */
  className?: string;

  /** Show flag emoji */
  showFlag?: boolean;

  /** Show full locale name */
  showName?: boolean;

  /** Dropdown position */
  placement?: 'bottom' | 'top' | 'left' | 'right';

  /** Callback when locale changes */
  onLocaleChange?: (locale: LocaleCode) => void;
}

// ============================================================================
// LocaleSelector Component
// ============================================================================

export function LocaleSelector({
  className = '',
  showFlag = true,
  showName = true,
  placement: _placement = 'bottom',
  onLocaleChange,
}: LocaleSelectorProps) {
  const { locale, setLocale, t, isLoading, error } = useLocalization();

  const handleLocaleChange = (newLocale: LocaleCode) => {
    setLocale(newLocale);
    onLocaleChange?.(newLocale);
  };

  const currentLocale = LOCALE_OPTIONS.find((option) => option.code === locale);

  if (isLoading) {
    return (
      <div className={`locale-selector loading ${className}`}>
        <div className="flex items-center gap-2">
          <div className="spinner spinner-sm" />
          <span className="text-sm text-[var(--color-text-secondary)]">{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`locale-selector error ${className}`}>
        <div className="flex items-center gap-2 text-[var(--color-error)]">
          <span className="text-xs" />
          <span className="text-sm">{t('errors.localization.loadFailed')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`locale-selector ${className}`}>
      <div className="relative inline-block">
        {/* Current Locale Button */}
        <button
          type="button"
          className="flex items-center gap-2 px-3 py-2 text-sm bg-[var(--color-surface-primary)] border border-[var(--color-border)] rounded-md hover:bg-[var(--color-surface-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
          aria-label={t('common.changeLanguage')}
          title={t('common.changeLanguage')}
        >
          {showFlag && currentLocale && (
            <span className="text-base" role="img" aria-label={currentLocale.name}>
              {currentLocale.flag}
            </span>
          )}

          {showName && currentLocale && <span className="font-medium">{currentLocale.name}</span>}

          {!showName && !showFlag && <span className="font-medium uppercase">{locale}</span>}

          <svg
            className="w-4 h-4 text-[var(--color-text-secondary)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown Menu - This would need proper dropdown logic */}
        <div className="hidden absolute z-50 mt-1 w-48 bg-[var(--color-surface-primary)] border border-[var(--color-border)] rounded-md shadow-lg">
          {LOCALE_OPTIONS.map((option) => (
            <button
              key={option.code}
              type="button"
              className={`w-full flex items-center gap-3 px-4 py-2 text-sm text-left hover:bg-[var(--color-surface-secondary)] ${
                option.code === locale
                  ? 'bg-[var(--color-primary)] text-[var(--color-primary)]'
                  : 'text-[var(--color-text-secondary)]'
              }`}
              onClick={() => handleLocaleChange(option.code)}
            >
              <span className="text-base" role="img" aria-label={option.name}>
                {option.flag}
              </span>
              <span className="flex-1">{option.name}</span>
              {option.code === locale && (
                <svg
                  className="w-4 h-4 text-[var(--color-primary)]"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Usage Examples Component
// ============================================================================

export function LocalizationDemo() {
  const {
    locale,
    t,
    formatDate,
    formatTime,
    formatNumber,
    formatCurrency,
    formatPercent,
    formatRelativeTime,
    isRTL,
  } = useLocalization();

  const now = new Date();
  const pastDate = new Date(now.getTime() - 2 * 60 * 60 * 1000); // 2 hours ago

  return (
    <div className={`localization-demo p-6 ${isRTL ? 'rtl' : 'ltr'}`}>
      <h2 className="text-2xl font-bold mb-4">{t('admin.dashboard.title')}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Messages */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">{t('common.messages')}</h3>

          <div className="space-y-2 text-sm">
            <p>
              <strong>{t('common.welcome')}:</strong> {t('auth.welcome', { name: 'John Doe' })}
            </p>
            <p>
              <strong>{t('common.status')}:</strong> {t('common.online')}
            </p>
            <p>
              <strong>{t('navigation.users')}:</strong> {t('users.totalUsers', { count: '1,234' })}
            </p>
          </div>
        </div>

        {/* Formatting Examples */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">{t('common.formatting')}</h3>

          <div className="space-y-2 text-sm">
            <p>
              <strong>{t('common.currentLocale')}:</strong> {locale}
            </p>
            <p>
              <strong>{t('common.date')}:</strong> {formatDate(now)}
            </p>
            <p>
              <strong>{t('common.time')}:</strong> {formatTime(now)}
            </p>
            <p>
              <strong>{t('common.number')}:</strong> {formatNumber(1234567.89)}
            </p>
            <p>
              <strong>{t('common.currency')}:</strong> {formatCurrency(1234.56)}
            </p>
            <p>
              <strong>{t('common.percentage')}:</strong> {formatPercent(85)}
            </p>
            <p>
              <strong>{t('common.relativeTime')}:</strong> {formatRelativeTime(pastDate)}
            </p>
          </div>
        </div>

        {/* Error Messages */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">{t('errors.title')}</h3>

          <div className="space-y-2 text-sm">
            <div className="p-3 bg-[var(--color-error)] border border-[var(--color-error)] rounded text-[var(--color-error)]">
              {t('errors.validation.required', { field: t('users.email') })}
            </div>
            <div className="p-3 bg-[var(--color-success)] border border-[var(--color-success)] rounded text-[var(--color-success)]">
              {t('success.user.created')}
            </div>
            <div className="p-3 bg-[var(--color-warning)] border border-[var(--color-warning)] rounded text-[var(--color-warning)]">
              {t('errors.network.timeout')}
            </div>
          </div>
        </div>

        {/* Admin Messages */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">{t('admin.title')}</h3>

          <div className="space-y-2 text-sm">
            <p>{t('admin.auditLogs.title')}</p>
            <p>{t('admin.roles.manage')}</p>
            <p>{t('admin.settings.system')}</p>
          </div>
        </div>
      </div>

      {/* Locale Selector */}
      <div className="mt-6 pt-6 border-t border-[var(--color-border)]">
        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
          {t('common.changeLanguage')}:
        </label>
        <LocaleSelector />
      </div>
    </div>
  );
}

// ============================================================================
// Default Export
// ============================================================================

export default LocaleSelector;
