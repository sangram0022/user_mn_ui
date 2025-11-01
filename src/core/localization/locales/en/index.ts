// ========================================
// English Localization - Master Export
// All UI text, error messages, validation messages
// ========================================

import { admin } from './admin.js';
import { auth } from './auth.js';
import { common } from './common.js';
import { errors } from './errors.js';
import { home } from './home.js';
import { profile } from './profile.js';
import { validation } from './validation.js';

export const en = {
  admin,
  auth,
  common,
  errors,
  home,
  profile,
  validation,
} as const;

export default en;
