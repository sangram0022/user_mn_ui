# Data Test IDs Reference

This document lists all `data-testid` attributes added to components for E2E testing with Playwright.

## Why data-testid?

- **Translation-independent**: Works regardless of i18n state
- **More reliable**: Doesn't depend on UI text changes
- **Faster**: Direct element selection without complex queries
- **Maintainable**: Clear intent in test code

## Implemented Test IDs

### LoginPage.tsx ✅

| Element | Test ID | Description |
|---------|---------|-------------|
| Heading | `login-heading` | "Login" page title |
| Form | `login-form` | Main login form element |
| Email Input | `email-input` | Email address input field |
| Password Input | `password-input` | Password input field |
| Remember Me Checkbox | `remember-me-checkbox` | Remember me checkbox |
| Forgot Password Link | `forgot-password-link` | Link to forgot password page |
| Submit Button | `login-submit-button` | Login form submit button |
| Google Login Button | `google-login-button` | Google OAuth button |
| GitHub Login Button | `github-login-button` | GitHub OAuth button |
| Register Link | `register-link` | Link to registration page |

### RegisterPage.tsx ✅

| Element | Test ID | Description |
|---------|---------|-------------|
| Heading | `register-heading` | "Create Account" page title |
| Form | `register-form` | Main registration form element |
| First Name Input | `firstname-input` | First name input field |
| Last Name Input | `lastname-input` | Last name input field |
| Email Input | `email-input` | Email address input field |
| Password Input | `password-input` | Password input field |
| Password Strength | `password-strength-indicator` | Password strength indicator |
| Confirm Password Input | `confirm-password-input` | Password confirmation field |
| Terms Checkbox | `terms-checkbox` | Terms & conditions checkbox |
| Submit Button | `register-submit-button` | Registration submit button |
| Google Register Button | `google-register-button` | Google OAuth button |
| GitHub Register Button | `github-register-button` | GitHub OAuth button |
| Login Link | `login-link` | Link to login page |

### ForgotPasswordPage.tsx ⏳ (Pending)

| Element | Test ID | Description |
|---------|---------|-------------|
| Heading | `forgot-password-heading` | "Forgot Password" page title |
| Form | `forgot-password-form` | Email submission form |
| Email Input | `email-input` | Email address input field |
| Submit Button | `submit-button` | Send reset email button |
| Back to Login Link | `login-link` | Link back to login page |

### ResetPasswordPage.tsx ⏳ (Pending)

| Element | Test ID | Description |
|---------|---------|-------------|
| Heading | `reset-password-heading` | "Reset Password" page title |
| Form | `reset-password-form` | Password reset form |
| New Password Input | `new-password-input` | New password input field |
| Confirm Password Input | `confirm-password-input` | Password confirmation field |
| Submit Button | `reset-submit-button` | Reset password button |

### ChangePasswordPage.tsx ⏳ (Pending)

| Element | Test ID | Description |
|---------|---------|-------------|
| Heading | `change-password-heading` | "Change Password" page title |
| Form | `change-password-form` | Password change form |
| Current Password Input | `current-password-input` | Current password field |
| New Password Input | `new-password-input` | New password field |
| Confirm Password Input | `confirm-password-input` | Password confirmation field |
| Submit Button | `change-submit-button` | Change password button |

### ProfilePage.tsx ⏳ (Pending)

| Element | Test ID | Description |
|---------|---------|-------------|
| Heading | `profile-heading` | "Profile" page title |
| Form | `profile-form` | Profile edit form |
| First Name Input | `firstname-input` | First name field |
| Last Name Input | `lastname-input` | Last name field |
| Email Input | `email-input` | Email field (readonly) |
| Phone Input | `phone-input` | Phone number field |
| Save Button | `save-button` | Save changes button |

### VerifyEmailPage.tsx ⏳ (Pending)

| Element | Test ID | Description |
|---------|---------|-------------|
| Heading | `verify-email-heading` | "Email Verification" title |
| Success Message | `success-message` | Verification success message |
| Error Message | `error-message` | Verification error message |
| Login Link | `login-link` | Link to login page |

### VerifyEmailPendingPage.tsx ⏳ (Pending)

| Element | Test ID | Description |
|---------|---------|-------------|
| Heading | `pending-heading` | "Check Your Email" title |
| Email Display | `email-display` | Shows email sent to |
| Resend Button | `resend-button` | Resend verification button |
| Login Link | `login-link` | Link to login page |

## E2E Test Usage Pattern

```typescript
// ❌ OLD: Translation-dependent
await page.getByRole('heading', { name: /login/i }).toBeVisible();
await page.getByLabel(/email/i).fill('user@example.com');

// ✅ NEW: Translation-independent
await page.getByTestId('login-heading').toBeVisible();
await page.getByTestId('email-input').fill('user@example.com');
```

## Implementation Checklist

- [x] LoginPage - 10 test IDs
- [x] RegisterPage - 11 test IDs  
- [ ] ForgotPasswordPage - 5 test IDs
- [ ] ResetPasswordPage - 5 test IDs
- [ ] ChangePasswordPage - 6 test IDs
- [ ] ProfilePage - 6 test IDs
- [ ] VerifyEmailPage - 4 test IDs
- [ ] VerifyEmailPendingPage - 4 test IDs
- [ ] Update E2E tests to use test IDs
- [ ] Create Playwright auth setup

## Notes

- All `data-testid` values use kebab-case
- Input fields use `-input` suffix
- Buttons use `-button` suffix
- Forms use `-form` suffix
- Links use `-link` suffix
- Headings use `-heading` suffix
