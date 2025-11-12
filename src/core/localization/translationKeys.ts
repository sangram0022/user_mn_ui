/**
 * Type-Safe Translation Keys
 * 
 * Centralized translation keys for type safety and autocomplete support.
 * Prevents runtime errors from missing or mistyped translation keys.
 * 
 * Usage:
 * ```typescript
 * import { TRANSLATION_KEYS } from '@/core/localization/translationKeys';
 * import { useTranslation } from 'react-i18next';
 * 
 * const { t } = useTranslation();
 * const message = t(TRANSLATION_KEYS.auth.login.title);
 * ```
 */

export const TRANSLATION_KEYS = {
  // Common translations
  common: {
    save: 'common.save',
    cancel: 'common.cancel',
    delete: 'common.delete',
    edit: 'common.edit',
    create: 'common.create',
    update: 'common.update',
    submit: 'common.submit',
    close: 'common.close',
    back: 'common.back',
    next: 'common.next',
    previous: 'common.previous',
    loading: 'common.loading',
    success: 'common.success',
    error: 'common.error',
    warning: 'common.warning',
    info: 'common.info',
    confirm: 'common.confirm',
    yes: 'common.yes',
    no: 'common.no',
    search: 'common.search',
    filter: 'common.filter',
    sort: 'common.sort',
    actions: 'common.actions',
    view: 'common.view',
    download: 'common.download',
    upload: 'common.upload',
  },

  // Authentication
  auth: {
    login: {
      title: 'auth.login.title',
      subtitle: 'auth.login.subtitle',
      email: 'auth.login.email',
      password: 'auth.login.password',
      rememberMe: 'auth.login.rememberMe',
      forgotPassword: 'auth.login.forgotPassword',
      submit: 'auth.login.submit',
      success: 'auth.login.success',
      error: 'auth.login.error',
    },
    register: {
      title: 'auth.register.title',
      subtitle: 'auth.register.subtitle',
      name: 'auth.register.name',
      email: 'auth.register.email',
      username: 'auth.register.username',
      password: 'auth.register.password',
      confirmPassword: 'auth.register.confirmPassword',
      submit: 'auth.register.submit',
      success: 'auth.register.success',
      error: 'auth.register.error',
    },
    logout: {
      confirm: 'auth.logout.confirm',
      success: 'auth.logout.success',
    },
    forgotPassword: {
      title: 'auth.forgotPassword.title',
      subtitle: 'auth.forgotPassword.subtitle',
      email: 'auth.forgotPassword.email',
      submit: 'auth.forgotPassword.submit',
      success: 'auth.forgotPassword.success',
      error: 'auth.forgotPassword.error',
    },
    resetPassword: {
      title: 'auth.resetPassword.title',
      subtitle: 'auth.resetPassword.subtitle',
      password: 'auth.resetPassword.password',
      confirmPassword: 'auth.resetPassword.confirmPassword',
      submit: 'auth.resetPassword.submit',
      success: 'auth.resetPassword.success',
      error: 'auth.resetPassword.error',
    },
  },

  // Validation messages
  validation: {
    required: 'validation.required',
    email: 'validation.email',
    minLength: 'validation.minLength',
    maxLength: 'validation.maxLength',
    pattern: 'validation.pattern',
    match: 'validation.match',
    unique: 'validation.unique',
    invalid: 'validation.invalid',
    passwordStrength: {
      weak: 'validation.passwordStrength.weak',
      medium: 'validation.passwordStrength.medium',
      strong: 'validation.passwordStrength.strong',
    },
    phone: {
      invalid: 'validation.phone.invalid',
      format: 'validation.phone.format',
    },
    date: {
      invalid: 'validation.date.invalid',
      past: 'validation.date.past',
      future: 'validation.date.future',
      range: 'validation.date.range',
    },
    url: {
      invalid: 'validation.url.invalid',
      format: 'validation.url.format',
    },
  },

  // Field names
  fields: {
    email: 'fields.email',
    password: 'fields.password',
    confirmPassword: 'fields.confirmPassword',
    username: 'fields.username',
    name: 'fields.name',
    firstName: 'fields.firstName',
    lastName: 'fields.lastName',
    phone: 'fields.phone',
    address: 'fields.address',
    city: 'fields.city',
    state: 'fields.state',
    country: 'fields.country',
    zipCode: 'fields.zipCode',
    role: 'fields.role',
    status: 'fields.status',
    createdAt: 'fields.createdAt',
    updatedAt: 'fields.updatedAt',
  },

  // Errors
  errors: {
    UNKNOWN: 'errors.UNKNOWN',
    NETWORK_ERROR: 'errors.NETWORK_ERROR',
    UNAUTHORIZED: 'errors.UNAUTHORIZED',
    FORBIDDEN: 'errors.FORBIDDEN',
    NOT_FOUND: 'errors.NOT_FOUND',
    VALIDATION_ERROR: 'errors.VALIDATION_ERROR',
    SERVER_ERROR: 'errors.SERVER_ERROR',
    TIMEOUT: 'errors.TIMEOUT',
    OFFLINE: 'errors.OFFLINE',
  },

  // User management
  users: {
    title: 'users.title',
    create: 'users.create',
    edit: 'users.edit',
    delete: 'users.delete',
    list: 'users.list',
    detail: 'users.detail',
    activate: 'users.activate',
    deactivate: 'users.deactivate',
    confirmDelete: 'users.confirmDelete',
  },

  // Admin
  admin: {
    dashboard: {
      title: 'admin.dashboard.title',
      stats: 'admin.dashboard.stats',
      users: 'admin.dashboard.users',
      activity: 'admin.dashboard.activity',
    },
    roles: {
      title: 'admin.roles.title',
      create: 'admin.roles.create',
      edit: 'admin.roles.edit',
      delete: 'admin.roles.delete',
    },
    auditLogs: {
      title: 'admin.auditLogs.title',
      action: 'admin.auditLogs.action',
      user: 'admin.auditLogs.user',
      timestamp: 'admin.auditLogs.timestamp',
      details: 'admin.auditLogs.details',
    },
  },
} as const;

/**
 * Type for all translation keys
 */
export type TranslationKey = typeof TRANSLATION_KEYS;

/**
 * Extract nested values from translation keys object
 */
type LeafValues<T> = T extends object
  ? { [K in keyof T]: LeafValues<T[K]> }[keyof T]
  : T;

export type TranslationKeyString = LeafValues<TranslationKey>;
