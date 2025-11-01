# 🚀 Quick Update Commands for Remaining Auth Pages

## Pattern to Follow

For each page, replace:
```typescript
// OLD (complex namespace approach):
const { t } = useTranslation(['auth', 'common', 'errors', 'validation']);
t('register.firstName')
t('register.lastName')

// NEW (simple flat approach):
const { t } = useTranslation();
t('auth.register.firstName')
t('auth.register.lastName')
```

---

## Pages to Update

### 1. RegisterPage.tsx
**Location**: `src/domains/auth/pages/RegisterPage.tsx`

**Steps**:
1. Change line ~14:
   ```typescript
   // From:
   const { t } = useTranslation(['auth', 'common', 'errors', 'validation']);
   
   // To:
   const { t } = useTranslation();
   ```

2. Find and replace all translation keys:
   ```typescript
   t('register.      →  t('auth.register.
   t('common.        →  t('common.
   t('validation.    →  t('validation.
   t('errors.        →  t('errors.
   ```

3. Common keys to update:
   - `register.title` → `auth.register.title`
   - `register.subtitle` → `auth.register.subtitle`
   - `register.firstName` → `auth.register.firstName`
   - `register.lastName` → `auth.register.lastName`
   - `register.email` → `auth.register.email`
   - `register.password` → `auth.register.password`
   - `register.confirmPassword` → `auth.register.confirmPassword`
   - `register.signUp` → `auth.register.signUp`
   - `register.signingUp` → `auth.register.signingUp`
   - `register.alreadyHaveAccount` → `auth.register.alreadyHaveAccount`
   - `register.signInLink` → `auth.register.signInLink`

---

### 2. ForgotPasswordPage.tsx
**Location**: `src/domains/auth/pages/ForgotPasswordPage.tsx`

**Steps**:
1. Change line ~13:
   ```typescript
   const { t } = useTranslation();
   ```

2. Update keys:
   - `forgotPassword.title` → `auth.forgotPassword.title`
   - `forgotPassword.subtitle` → `auth.forgotPassword.subtitle`
   - `forgotPassword.email` → `auth.forgotPassword.email`
   - `forgotPassword.emailPlaceholder` → `auth.forgotPassword.emailPlaceholder`
   - `forgotPassword.sendInstructions` → `auth.forgotPassword.sendInstructions`
   - `forgotPassword.sending` → `auth.forgotPassword.sending`
   - `forgotPassword.backToLogin` → `auth.forgotPassword.backToLogin`

---

### 3. ResetPasswordPage.tsx
**Location**: `src/domains/auth/pages/ResetPasswordPage.tsx`

**Steps**:
1. Change line ~14:
   ```typescript
   const { t } = useTranslation();
   ```

2. Update keys:
   - `resetPassword.title` → `auth.resetPassword.title`
   - `resetPassword.subtitle` → `auth.resetPassword.subtitle`
   - `resetPassword.newPassword` → `auth.resetPassword.newPassword`
   - `resetPassword.confirmPassword` → `auth.resetPassword.confirmPassword`
   - `resetPassword.reset` → `auth.resetPassword.reset`
   - `resetPassword.resetting` → `auth.resetPassword.resetting`

---

### 4. ChangePasswordPage.tsx
**Location**: `src/domains/auth/pages/ChangePasswordPage.tsx`

**Steps**:
1. Change line ~13:
   ```typescript
   const { t } = useTranslation();
   ```

2. Update keys:
   - `changePassword.title` → `auth.changePassword.title`
   - `changePassword.currentPassword` → `auth.changePassword.currentPassword`
   - `changePassword.newPassword` → `auth.changePassword.newPassword`
   - `changePassword.confirmPassword` → `auth.changePassword.confirmPassword`
   - `changePassword.change` → `auth.changePassword.change`
   - `changePassword.changing` → `auth.changePassword.changing`

---

### 5. VerifyEmailPage.tsx
**Location**: `src/domains/auth/pages/VerifyEmailPage.tsx`

**Steps**:
1. Add useTranslation if not present:
   ```typescript
   import { useTranslation } from 'react-i18next';
   
   const { t } = useTranslation();
   ```

2. Replace hardcoded text with translation keys:
   - `t('auth.verifyEmail.title')`
   - `t('auth.verifyEmail.verifying')`
   - `t('auth.verifyEmail.success')`
   - `t('auth.verifyEmail.error')`

---

## Automated Find & Replace Pattern

For VS Code:

1. **Find**: `t\('(register|forgotPassword|resetPassword|changePassword|verifyEmail)\.`
2. **Replace**: `t('auth.$1.`
3. **Use regex**: ✅ Enable
4. **Scope**: Current file

This will automatically prefix all auth keys with `auth.`

---

## Testing Each Page

After updating each page:

1. **Save the file**
2. **Check browser** (http://localhost:5173/[page-route])
3. **Verify**:
   - ✅ All text displays correctly
   - ✅ No raw keys showing (e.g., `auth.register.title`)
   - ✅ No console errors
   - ✅ Form works as expected

---

## Verification Checklist

- [ ] RegisterPage updated and tested
- [ ] ForgotPasswordPage updated and tested
- [ ] ResetPasswordPage updated and tested
- [ ] ChangePasswordPage updated and tested
- [ ] VerifyEmailPage updated and tested
- [ ] All pages show correct translations
- [ ] No console errors
- [ ] All forms functional

---

## Quick Commands

### Start Dev Server
```bash
npm run dev
```

### Test All Auth Routes
```
http://localhost:5173/login           ✅ DONE
http://localhost:5173/register        ⏳ TODO
http://localhost:5173/forgot-password ⏳ TODO
http://localhost:5173/reset-password  ⏳ TODO
http://localhost:5173/change-password ⏳ TODO
http://localhost:5173/verify-email    ⏳ TODO
```

### Check for Inline Styles (Should be none)
```bash
grep -r "style={{" src/domains/auth/pages/
```

### Find Remaining Old Pattern
```bash
grep -r "useTranslation(\[" src/domains/auth/pages/
```

Should only return empty results after migration.

---

## Time Estimate

- **RegisterPage**: 10 minutes
- **ForgotPasswordPage**: 5 minutes
- **ResetPasswordPage**: 5 minutes
- **ChangePasswordPage**: 5 minutes
- **VerifyEmailPage**: 5 minutes
- **Testing all pages**: 10 minutes

**Total**: ~40 minutes

---

## After Completion

### Cleanup Old Files
```bash
rm -rf src/core/localization/locales/en/*.ts
# Keep only: src/core/localization/i18n.ts
```

### Final Verification
```bash
npm run build
npm run lint
npm run type-check
```

All should pass without errors.

---

## Need Help?

Refer to:
- **LOCALIZATION_GUIDE.md** - Complete guide
- **LOCALIZATION_MIGRATION_COMPLETE.md** - This migration summary
- **public/locales/en/translation.json** - All available keys
- **LoginPage.tsx** - Working example

---

**Good luck! The hardest part is done. Now it's just copy-paste pattern! 🚀**
