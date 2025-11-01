// ========================================
// Validation Messages
// Client-side validation error messages
// ========================================

export const validation = {
  // Required fields
  required: {
    generic: 'This field is required',
    email: 'Email is required',
    password: 'Password is required',
    username: 'Username is required',
    firstName: 'First name is required',
    lastName: 'Last name is required',
    phone: 'Phone number is required',
    confirmPassword: 'Please confirm your password',
  },

  // Email validation
  email: {
    invalid: 'Please enter a valid email address',
    format: 'Email format is invalid (e.g., user@example.com)',
    tooLong: 'Email address is too long (max 254 characters)',
  },

  // Password validation
  password: {
    tooShort: 'Password must be at least 8 characters long',
    tooLong: 'Password is too long (max 128 characters)',
    noUppercase: 'Password must contain at least one uppercase letter',
    noLowercase: 'Password must contain at least one lowercase letter',
    noNumber: 'Password must contain at least one number',
    noSpecialChar: 'Password must contain at least one special character (@$!%*?&#)',
    common: 'This password is too common. Please choose a more secure password',
    weak: 'Password is too weak. Please use a stronger password',
    mismatch: 'Passwords do not match',
  },

  // Username validation
  username: {
    tooShort: 'Username must be at least 3 characters long',
    tooLong: 'Username is too long (max 20 characters)',
    invalid: 'Username can only contain letters, numbers, and underscores',
    format: 'Username must start with a letter',
    reserved: 'This username is reserved and cannot be used',
  },

  // Phone validation
  phone: {
    invalid: 'Please enter a valid phone number',
    format: 'Phone format is invalid (e.g., +1234567890)',
    tooShort: 'Phone number is too short',
    tooLong: 'Phone number is too long',
  },

  // Name validation
  name: {
    tooShort: 'Name must be at least 2 characters long',
    tooLong: 'Name is too long (max 50 characters)',
    invalid: 'Name can only contain letters, spaces, hyphens, and apostrophes',
    format: 'Please enter a valid name',
  },

  // URL validation
  url: {
    invalid: 'Please enter a valid URL',
    format: 'URL format is invalid (e.g., https://example.com)',
    protocol: 'URL must start with http:// or https://',
  },

  // Date validation
  date: {
    invalid: 'Please enter a valid date',
    past: 'Date must be in the past',
    future: 'Date must be in the future',
    range: 'Date must be between {{min}} and {{max}}',
    tooOld: 'Date is too far in the past',
    tooRecent: 'Date is too recent',
  },

  // Number validation
  number: {
    invalid: 'Please enter a valid number',
    tooSmall: 'Number must be at least {{min}}',
    tooLarge: 'Number must be at most {{max}}',
    notInteger: 'Number must be a whole number',
    notPositive: 'Number must be positive',
  },

  // File validation
  file: {
    required: 'Please select a file',
    tooLarge: 'File size exceeds {{maxSize}}MB',
    invalidType: 'Invalid file type. Allowed: {{types}}',
    tooMany: 'Too many files. Maximum {{max}} files allowed',
  },

  // Custom field validation
  custom: {
    terms: 'You must agree to the terms and conditions',
    privacy: 'You must accept the privacy policy',
    age: 'You must be at least {{age}} years old',
    checkbox: 'This option is required',
  },
} as const;
