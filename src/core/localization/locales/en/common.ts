// ========================================
// Common UI Localization
// Shared UI elements, buttons, labels
// ========================================

export const common = {
  // Actions
  actions: {
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    create: 'Create',
    update: 'Update',
    submit: 'Submit',
    close: 'Close',
    confirm: 'Confirm',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    finish: 'Finish',
    search: 'Search',
    filter: 'Filter',
    reset: 'Reset',
    clear: 'Clear',
    apply: 'Apply',
    upload: 'Upload',
    download: 'Download',
    export: 'Export',
    import: 'Import',
    refresh: 'Refresh',
    retry: 'Retry',
    requestNew: 'Request new link',
    loading: 'Loading...',
    processing: 'Processing...',
    saving: 'Saving...',
    deleting: 'Deleting...',
  },

  // Status
  status: {
    active: 'Active',
    inactive: 'Inactive',
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    completed: 'Completed',
    cancelled: 'Cancelled',
    draft: 'Draft',
    published: 'Published',
    archived: 'Archived',
    redirecting: 'Redirecting to login page...',
  },

  // Confirmation Messages
  confirmations: {
    deleteTitle: 'Confirm Delete',
    deleteMessage: 'Are you sure you want to delete this item? This action cannot be undone.',
    unsavedChanges: 'You have unsaved changes. Are you sure you want to leave?',
  },

  // Navigation
  navigation: {
    home: 'Home',
    dashboard: 'Dashboard',
    profile: 'Profile',
    settings: 'Settings',
    help: 'Help',
    about: 'About',
    contact: 'Contact',
  },

  // Time & Dates
  time: {
    justNow: 'Just now',
    minuteAgo: '1 minute ago',
    minutesAgo: '{{count}} minutes ago',
    hourAgo: '1 hour ago',
    hoursAgo: '{{count}} hours ago',
    dayAgo: '1 day ago',
    daysAgo: '{{count}} days ago',
    weekAgo: '1 week ago',
    weeksAgo: '{{count}} weeks ago',
    monthAgo: '1 month ago',
    monthsAgo: '{{count}} months ago',
    yearAgo: '1 year ago',
    yearsAgo: '{{count}} years ago',
  },

  // Pagination
  pagination: {
    showing: 'Showing {{from}} to {{to}} of {{total}} results',
    page: 'Page {{current}} of {{total}}',
    rowsPerPage: 'Rows per page:',
  },

  // Form Labels
  form: {
    required: 'Required',
    optional: 'Optional',
    selectPlaceholder: 'Select an option',
    searchPlaceholder: 'Search...',
    noResults: 'No results found',
    noData: 'No data available',
  },

  // Success Messages
  success: {
    saved: 'Changes saved successfully',
    created: 'Created successfully',
    updated: 'Updated successfully',
    deleted: 'Deleted successfully',
    uploaded: 'Uploaded successfully',
    copied: 'Copied to clipboard',
    emailSent: 'Check your email',
  },

  // Error Messages (Generic)
  error: {
    generic: 'Something went wrong. Please try again.',
    networkError: 'Network error. Please check your connection.',
    serverError: 'Server error. Please try again later.',
    notFound: 'The requested resource was not found.',
    unauthorized: 'You are not authorized to perform this action.',
    forbidden: 'Access denied.',
    timeout: 'Request timed out. Please try again.',
  },
} as const;
