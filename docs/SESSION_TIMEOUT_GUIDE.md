# Session Timeout Monitoring - Implementation Guide

## Overview

The session timeout monitoring feature provides a user-friendly warning before JWT token expiration, allowing users to extend their session or logout gracefully.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│ AuthContext.tsx (Provider)                          │
│                                                     │
│  ┌──────────────────────────────────────────────┐ │
│  │ useSessionMonitor Hook                       │ │
│  │                                              │ │
│  │  • Check token expiry every 30 seconds      │ │
│  │  • Show warning 5 minutes before timeout    │ │
│  │  • Call onTimeout when expired              │ │
│  └──────────────────────────────────────────────┘ │
│                        │                            │
│                        ▼                            │
│  ┌──────────────────────────────────────────────┐ │
│  │ SessionTimeoutDialog Component               │ │
│  │                                              │ │
│  │  • Display countdown timer                  │ │
│  │  • "Continue Session" → refreshSession()    │ │
│  │  • "Logout" → logout()                      │ │
│  └──────────────────────────────────────────────┘ │
│                                                     │
└─────────────────────────────────────────────────────┘
                         │
                         ▼
        ┌─────────────────────────────────┐
        │ tokenService.ts                 │
        │                                 │
        │  • getTokenExpiryTime()        │
        │    → Returns seconds remaining │
        │  • refreshToken()              │
        │    → Gets new access token     │
        └─────────────────────────────────┘
```

## Components

### 1. useSessionMonitor Hook

**Location:** `src/shared/hooks/useSessionMonitor.ts`

**Purpose:** Monitor JWT token expiration and trigger warnings

**Configuration:**
```typescript
interface SessionMonitorOptions {
  warningMinutes?: number;      // Default: 5 minutes
  checkIntervalSeconds?: number; // Default: 30 seconds
  onTimeout: () => void;         // Callback when expired
  enabled?: boolean;             // Default: true
}
```

**Returns:**
```typescript
interface SessionState {
  showWarning: boolean;         // Whether to show dialog
  secondsRemaining: number | null; // Seconds until expiry
  isExpired: boolean;           // Whether session expired
}
```

**How It Works:**
1. Checks `tokenService.getTokenExpiryTime()` every 30 seconds
2. When time remaining ≤ 5 minutes → Sets `showWarning = true`
3. When time remaining ≤ 0 → Calls `onTimeout()`

### 2. SessionTimeoutDialog Component

**Location:** `src/shared/components/dialogs/SessionTimeoutDialog.tsx`

**Purpose:** Display warning dialog with countdown and action buttons

**Props:**
```typescript
interface SessionTimeoutDialogProps {
  isOpen: boolean;              // Whether dialog is visible
  secondsRemaining: number | null; // Seconds until timeout
  onExtend: () => void;         // Refresh token
  onLogout: () => void;         // Logout immediately
}
```

**Features:**
- ⏱️ Real-time countdown display (updates every second)
- 🎨 Beautiful glass-morphism design
- ♿ Accessible (keyboard navigation, ARIA labels)
- 🌐 Internationalized (i18next)

### 3. AuthContext Integration

**Location:** `src/domains/auth/context/AuthContext.tsx`

**Integration Code:**
```typescript
// Monitor session when authenticated
const { showWarning, secondsRemaining } = useSessionMonitor({
  warningMinutes: 5,
  onTimeout: logout,
  enabled: state.isAuthenticated,
});

// Handle session extension
const handleExtendSession = async () => {
  await refreshSession();
};

// Render dialog in Provider
return (
  <AuthContext.Provider value={value}>
    {children}
    <SessionTimeoutDialog
      isOpen={showWarning}
      secondsRemaining={secondsRemaining}
      onExtend={handleExtendSession}
      onLogout={logout}
    />
  </AuthContext.Provider>
);
```

## User Flow

### Normal Flow (Session Extended)
```
1. User is logged in
2. [55 minutes pass]
3. Warning dialog appears: "Session expiring in 5m 0s"
4. Countdown: 5:00 → 4:59 → 4:58 → ...
5. User clicks "Continue Session"
6. Token refreshed via refreshSession()
7. Dialog closes
8. User continues working
```

### Timeout Flow (User Inactive)
```
1. User is logged in
2. [55 minutes pass]
3. Warning dialog appears: "Session expiring in 5m 0s"
4. Countdown: 5:00 → 4:59 → ... → 0:00
5. onTimeout() called automatically
6. User logged out
7. Redirect to login page
```

## Configuration

### Change Warning Time
```typescript
// In AuthContext.tsx
useSessionMonitor({
  warningMinutes: 10, // 10 minutes instead of 5
  onTimeout: logout,
  enabled: state.isAuthenticated,
});
```

### Change Check Interval
```typescript
// In AuthContext.tsx
useSessionMonitor({
  warningMinutes: 5,
  checkIntervalSeconds: 60, // Check every 60s instead of 30s
  onTimeout: logout,
  enabled: state.isAuthenticated,
});
```

### Disable Monitoring
```typescript
// In AuthContext.tsx
useSessionMonitor({
  warningMinutes: 5,
  onTimeout: logout,
  enabled: false, // Completely disable monitoring
});
```

## Testing

### Manual Testing

#### Test 1: Warning Display
1. Login to the app
2. **Temporarily** modify `tokenService.ts`:
   ```typescript
   const expiresIn = 360; // 6 minutes instead of 3600
   ```
3. Wait 1 minute
4. Warning dialog should appear
5. Verify countdown displays: "5m 0s"

#### Test 2: Session Extension
1. Trigger warning dialog (see Test 1)
2. Click "Continue Session" button
3. Verify dialog closes
4. Verify new token stored (check localStorage)
5. Verify countdown resets

#### Test 3: Auto Logout
1. Trigger warning dialog (see Test 1)
2. Wait for countdown to reach 0:00
3. Verify automatic logout
4. Verify redirect to /login
5. Verify tokens cleared from localStorage

### Unit Testing

**File:** `tests/shared/hooks/useSessionMonitor.test.ts`

```typescript
import { renderHook, act } from '@testing-library/react';
import { useSessionMonitor } from '@/shared/hooks/useSessionMonitor';
import tokenService from '@/domains/auth/services/tokenService';

describe('useSessionMonitor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show warning when threshold reached', async () => {
    vi.spyOn(tokenService, 'getTokenExpiryTime').mockReturnValue(299); // 4m 59s

    const { result } = renderHook(() =>
      useSessionMonitor({
        warningMinutes: 5,
        onTimeout: vi.fn(),
      })
    );

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    expect(result.current.showWarning).toBe(true);
  });

  it('should call onTimeout when expired', async () => {
    const onTimeout = vi.fn();
    vi.spyOn(tokenService, 'getTokenExpiryTime').mockReturnValue(0);

    renderHook(() =>
      useSessionMonitor({
        warningMinutes: 5,
        onTimeout,
      })
    );

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    expect(onTimeout).toHaveBeenCalledTimes(1);
  });
});
```

## Troubleshooting

### Issue: Warning Not Showing

**Check:**
1. Is user authenticated? (`state.isAuthenticated === true`)
2. Is monitoring enabled? (`enabled: true`)
3. Check token expiry: `tokenService.getTokenExpiryTime()`
4. Check console for logs: `[SessionMonitor]`

### Issue: Dialog Shows Immediately

**Check:**
1. Token expiry time: Should be > 5 minutes
2. Check backend JWT expiry configuration
3. Verify `storeTokens()` correctly stores expiry time

### Issue: Countdown Not Updating

**Check:**
1. Verify `secondsRemaining` prop passed to dialog
2. Check dialog's `useEffect` dependency array
3. Verify `isOpen` prop is `true`

## Best Practices

### ✅ Do
- Keep warning time at 5 minutes (good UX balance)
- Use 30-second check interval (not too frequent, not too slow)
- Test with reduced token expiry during development
- Log all session events for debugging

### ❌ Don't
- Don't check every second (performance impact)
- Don't show warning too early (>10 minutes = annoying)
- Don't show warning too late (<2 minutes = not enough time)
- Don't forget to clear tokens on logout

## Future Enhancements

### Possible Improvements
1. **Sound Alert:** Play sound when warning shows
2. **Browser Notification:** Desktop notification support
3. **Activity Detection:** Reset timer on user activity
4. **Remember Preference:** Let users disable warnings
5. **Custom Messages:** Different messages based on role

### Example: Activity Detection
```typescript
// In useSessionMonitor.ts
useEffect(() => {
  const handleActivity = () => {
    // Reset warning shown flag
    warningShownRef.current = false;
  };

  window.addEventListener('mousemove', handleActivity);
  window.addEventListener('keypress', handleActivity);

  return () => {
    window.removeEventListener('mousemove', handleActivity);
    window.removeEventListener('keypress', handleActivity);
  };
}, []);
```

## References

- **Hook:** `src/shared/hooks/useSessionMonitor.ts`
- **Dialog:** `src/shared/components/dialogs/SessionTimeoutDialog.tsx`
- **Integration:** `src/domains/auth/context/AuthContext.tsx`
- **Token Service:** `src/domains/auth/services/tokenService.ts`

## Support

For issues or questions, check:
1. Console logs (look for `[SessionMonitor]`)
2. localStorage keys: `token_expires_at`
3. Token refresh flow in Network tab
4. Backend JWT expiry configuration
