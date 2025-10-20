# Manual Testing Procedures

**Date**: October 20, 2025  
**Project**: User Management UI  
**Phase**: Phase 7 - Testing (Manual QA Procedures)

---

## 📚 Overview

This document provides step-by-step procedures for manually testing all features of the User Management UI application. Use this in conjunction with `QA_TESTING_CHECKLIST.md` to validate feature functionality before automated testing.

**Estimated Time**: 4-6 hours for full QA cycle  
**Recommended Frequency**: Before each release, after major changes

---

## 🚀 Getting Started

### Prerequisites

1. Clone and checkout the `master` branch
2. Install dependencies: `npm install`
3. Create `.env.local` file with test credentials:
   ```env
   VITE_API_BASE_URL=http://localhost:3000/api
   VITE_APP_NAME=User Management UI
   # Add other required environment variables
   ```
4. Start development server: `npm run dev`
5. Application running on `http://localhost:5173`

### Browser Setup

- Open browser DevTools (F12)
- Go to Console tab to check for errors
- Keep DevTools open during testing

---

## 🔐 Module 1: Authentication Flow

### 1.1 Initial Login Test

**Objective**: Verify user can login with valid credentials

**Steps**:

1. Navigate to application home
2. Click "Login" button or link
3. Enter admin email: `admin@example.com`
4. Enter password: `Test@123456`
5. Click "Sign In" button

**Expected Results** ✅:

- Login form submitted successfully
- No error messages shown
- Redirected to dashboard
- User profile available in header
- Logout button visible

**Test Result**: ☐ PASS ☐ FAIL  
**Notes**: ********\_********

---

### 1.2 Failed Login - Invalid Password

**Objective**: Verify error handling for invalid password

**Steps**:

1. Navigate to login page
2. Enter admin email: `admin@example.com`
3. Enter invalid password: `WrongPassword123`
4. Click "Sign In" button

**Expected Results** ✅:

- Form shows error message
- Error message is clear (e.g., "Invalid credentials")
- User remains on login page
- Email field retains entered value
- Password field is cleared

**Test Result**: ☐ PASS ☐ FAIL  
**Notes**: ********\_********

---

### 1.3 Failed Login - Invalid Email

**Objective**: Verify error handling for non-existent email

**Steps**:

1. Navigate to login page
2. Enter email: `nonexistent@example.com`
3. Enter password: `Test@123456`
4. Click "Sign In" button

**Expected Results** ✅:

- Form shows error message
- Error message indicates user not found
- User remains on login page
- Fields retain entered values (except password)

**Test Result**: ☐ PASS ☐ FAIL  
**Notes**: ********\_********

---

### 1.4 Session Persistence

**Objective**: Verify session maintains after page refresh

**Steps**:

1. Login successfully (from 1.1)
2. Press F5 to refresh page
3. Wait for page to load

**Expected Results** ✅:

- Page reloads without redirecting to login
- User remains logged in
- Dashboard displays correctly
- No error messages shown

**Test Result**: ☐ PASS ☐ FAIL  
**Notes**: ********\_********

---

### 1.5 Logout Test

**Objective**: Verify logout clears session

**Steps**:

1. Login successfully (from 1.1)
2. Click user avatar or profile button in header
3. Click "Logout" option
4. Confirm logout if prompted

**Expected Results** ✅:

- Logged out successfully
- Redirected to login page
- Session cleared
- Previous page cannot be accessed without login
- Attempting to revisit dashboard redirects to login

**Test Result**: ☐ PASS ☐ FAIL  
**Notes**: ********\_********

---

## 👥 Module 2: User Management (Admin Features)

### 2.1 Navigate to User Management

**Objective**: Verify admin can access user management

**Steps**:

1. Login as admin (use 1.1 procedures)
2. Click "Admin" or "Users" in navigation menu
3. Wait for page to load

**Expected Results** ✅:

- User list page loads successfully
- Users table displays
- Table shows columns: ID, Email, Name, Role, Status
- No error messages in console
- List is not empty (contains test users)

**Test Result**: ☐ PASS ☐ FAIL  
**Notes**: ********\_********

---

### 2.2 Search Users by Email

**Objective**: Verify search functionality filters users

**Steps**:

1. On user list page (from 2.1)
2. Locate search input field
3. Enter partial email: `test`
4. Press Enter or wait for real-time search

**Expected Results** ✅:

- List filters to show only matching users
- Users with "test" in email shown
- Count updates to show filtered results
- Search is case-insensitive
- Partial match works (doesn't need full email)

**Test Result**: ☐ PASS ☐ FAIL  
**Notes**: ********\_********

---

### 2.3 Filter Users by Role

**Objective**: Verify role filter works correctly

**Steps**:

1. On user list page (from 2.1)
2. Find "Role" filter dropdown
3. Select "Admin" role
4. Observe filtered results

**Expected Results** ✅:

- List shows only admin users
- All other users hidden
- Count shows admin-only count
- Filter persists until cleared
- Can select multiple roles (if applicable)

**Alternative Test - Filter by User Role**:

1. Select "User" role instead
2. Verify only regular users shown

**Test Result**: ☐ PASS ☐ FAIL  
**Notes**: ********\_********

---

### 2.4 Filter Users by Status

**Objective**: Verify status filter works

**Steps**:

1. On user list page (from 2.1)
2. Find "Status" filter dropdown
3. Select "Active" status
4. Observe filtered results

**Expected Results** ✅:

- List shows only active users
- Inactive users hidden
- Count updates correctly
- Can also filter by "Inactive" or "Suspended"

**Test Result**: ☐ PASS ☐ FAIL  
**Notes**: ********\_********

---

### 2.5 Combine Filters

**Objective**: Verify multiple filters work together

**Steps**:

1. On user list page (from 2.1)
2. Set Role filter to "Admin"
3. Set Status filter to "Active"
4. Observe combined results

**Expected Results** ✅:

- List shows only active admin users
- Both filters applied (AND logic)
- Count reflects combined filter
- Clear All Filters button visible and works

**Test Result**: ☐ PASS ☐ FAIL  
**Notes**: ********\_********

---

### 2.6 Clear Filters

**Objective**: Verify filters can be cleared

**Steps**:

1. After applying filters (from 2.5)
2. Click "Clear All Filters" button (or clear each individually)
3. Observe list resets

**Expected Results** ✅:

- All filters cleared
- List shows all users again
- Filter inputs reset to default state
- Count shows total user count

**Test Result**: ☐ PASS ☐ FAIL  
**Notes**: ********\_********

---

### 2.7 Export Users as CSV

**Objective**: Verify CSV export functionality

**Steps**:

1. On user list page with filters applied (optional)
2. Click "Export CSV" or "Download" button
3. File download starts
4. Save file to Downloads folder
5. Open file in spreadsheet application (Excel, Sheets)

**Expected Results** ✅:

- File downloads successfully
- Filename: `users_YYYY-MM-DD.csv` (with current date)
- File opens in spreadsheet application
- CSV contains all user columns
- CSV contains filtered users (respects applied filters)
- All data displays correctly in spreadsheet

**Test Result**: ☐ PASS ☐ FAIL  
**Notes**: ********\_********

---

### 2.8 Pagination (if applicable)

**Objective**: Verify pagination works

**Steps**:

1. On user list page with many users
2. Scroll to bottom to find pagination controls
3. Click "Next" button
4. Observe page change
5. Click "Previous" button
6. Observe return to previous page

**Expected Results** ✅:

- Page navigation works
- Different users shown on each page
- Page number indicator updates
- Next/Previous buttons enable/disable appropriately
- First page: Previous disabled
- Last page: Next disabled

**Test Result**: ☐ PASS ☐ FAIL  
**Notes**: ********\_********

---

## 📊 Module 3: Audit Log Management

### 3.1 Navigate to Audit Log

**Objective**: Verify admin can access audit logs

**Steps**:

1. Login as admin
2. Click "Admin" → "Audit Log" in navigation
3. Wait for page to load

**Expected Results** ✅:

- Audit log page loads successfully
- Log entries table displays
- Columns show: Timestamp, User, Action, Resource, Details
- Entries shown in reverse chronological order (newest first)
- No error messages in console

**Test Result**: ☐ PASS ☐ FAIL  
**Notes**: ********\_********

---

### 3.2 View Audit Statistics

**Objective**: Verify statistics display correctly

**Steps**:

1. On audit log page (from 3.1)
2. Look at statistics cards at top of page
3. Review displayed statistics

**Expected Results** ✅:

- Total Actions count shown
- Recent Users count shown
- Action breakdown pie/bar chart displayed
- Statistics appear accurate based on visible entries
- No error values (NaN or undefined)

**Test Result**: ☐ PASS ☐ FAIL  
**Notes**: ********\_********

---

### 3.3 Filter by Action Type

**Objective**: Verify action type filtering

**Steps**:

1. On audit log page (from 3.1)
2. Find "Action Type" filter dropdown
3. Select "CREATE" action type
4. Observe filtered results

**Expected Results** ✅:

- Log shows only CREATE actions
- All other actions hidden
- Count shows filtered total
- Can select other action types: UPDATE, DELETE, LOGIN, etc.

**Test Result**: ☐ PASS ☐ FAIL  
**Notes**: ********\_********

---

### 3.4 Filter by Date Range

**Objective**: Verify date range filtering

**Steps**:

1. On audit log page (from 3.1)
2. Find date range filter
3. Select start date: Today minus 7 days
4. Select end date: Today
5. Apply filter

**Expected Results** ✅:

- Log shows entries only within date range
- Entries outside range hidden
- Count reflects date-filtered results
- Date inputs retain selected values
- Can clear date filters independently

**Test Result**: ☐ PASS ☐ FAIL  
**Notes**: ********\_********

---

### 3.5 Filter by User

**Objective**: Verify filtering by specific user

**Steps**:

1. On audit log page (from 3.1)
2. Find "User" filter dropdown
3. Select a specific user
4. Observe filtered results

**Expected Results** ✅:

- Log shows only actions by selected user
- All other users' actions hidden
- Count shows user-specific total
- User name displays in filter

**Test Result**: ☐ PASS ☐ FAIL  
**Notes**: ********\_********

---

### 3.6 Export Audit Log as CSV

**Objective**: Verify audit log CSV export

**Steps**:

1. On audit log page with optional filters
2. Click "Export CSV" or "Download" button
3. File downloads
4. Open file in spreadsheet

**Expected Results** ✅:

- File downloads with name: `audit_log_YYYY-MM-DD.csv`
- CSV contains all log entries (respecting filters)
- Columns: Timestamp, User, Action, Resource, Details
- Data displays correctly in spreadsheet
- Timestamps formatted consistently

**Test Result**: ☐ PASS ☐ FAIL  
**Notes**: ********\_********

---

## 🏥 Module 4: Health Monitoring Dashboard

### 4.1 Navigate to Health Dashboard

**Objective**: Verify health monitoring page loads

**Steps**:

1. Login as admin
2. Click "Dashboard" in navigation
3. Wait for page to load

**Expected Results** ✅:

- Health monitoring dashboard displays
- All monitoring cards visible
- No error messages in console
- Icons render properly
- Layout responsive

**Test Result**: ☐ PASS ☐ FAIL  
**Notes**: ********\_********

---

### 4.2 Check System Status

**Objective**: Verify system status indicator

**Steps**:

1. On dashboard (from 4.1)
2. Look for "System Status" or "Overall Status" indicator
3. Note the displayed status and color

**Expected Results** ✅:

- Status shows: Healthy, Warning, or Critical
- Color coding applied:
  - Green = Healthy (all systems normal)
  - Yellow = Warning (minor issues)
  - Red = Critical (major issues)
- Status message is clear

**Test Result**: ☐ PASS ☐ FAIL  
**Notes**: ********\_********

---

### 4.3 Check Database Connection

**Objective**: Verify database health monitoring

**Steps**:

1. On dashboard (from 4.1)
2. Find "Database Connection" card
3. Note status and response time

**Expected Results** ✅:

- Status shows: Connected or Disconnected
- Response time displayed in milliseconds (ms)
- Color indicator shows:
  - Green: < 100ms (excellent)
  - Yellow: 100-500ms (good)
  - Red: > 500ms (poor)
- Trend indicator visible (up/down/stable)

**Test Result**: ☐ PASS ☐ FAIL  
**Notes**: ********\_********

---

### 4.4 Check CPU Usage

**Objective**: Verify CPU monitoring

**Steps**:

1. On dashboard (from 4.1)
2. Find "CPU Usage" card
3. Note percentage and progress bar

**Expected Results** ✅:

- CPU percentage displayed (0-100%)
- Progress bar shows usage level
- Color coding:
  - Green: < 50%
  - Yellow: 50-80%
  - Red: > 80%
- Trend arrow shows direction (up/down/flat)

**Test Result**: ☐ PASS ☐ FAIL  
**Notes**: ********\_********

---

### 4.5 Check Memory Usage

**Objective**: Verify memory monitoring

**Steps**:

1. On dashboard (from 4.1)
2. Find "Memory Usage" card
3. Note usage percentage and capacity

**Expected Results** ✅:

- Memory usage percentage displayed
- Progress bar shows usage level
- Color coding:
  - Green: < 60%
  - Yellow: 60-85%
  - Red: > 85%
- Used/Total memory displayed
- Trend arrow shows direction

**Test Result**: ☐ PASS ☐ FAIL  
**Notes**: ********\_********

---

### 4.6 Auto-Refresh Verification

**Objective**: Verify dashboard auto-refreshes

**Steps**:

1. On dashboard (from 4.1)
2. Note the timestamp on a card (e.g., "Last Updated: HH:MM:SS")
3. Wait 30-35 seconds without interaction
4. Observe if timestamp updates

**Expected Results** ✅:

- Timestamp updates after ~30 seconds
- Cards show new values
- No visual flicker during refresh
- Page remains interactive during refresh
- User can still interact while auto-refreshing

**Test Result**: ☐ PASS ☐ FAIL  
**Notes**: ********\_********

---

### 4.7 Manual Refresh Button

**Objective**: Verify manual refresh works

**Steps**:

1. On dashboard (from 4.1)
2. Find "Refresh" button (circular arrow icon)
3. Note timestamp on a card
4. Click refresh button
5. Observe immediate update

**Expected Results** ✅:

- Timestamp updates immediately
- All card values refresh
- Button shows loading state during refresh
- Refresh completes within 2 seconds
- User feedback clear (button animates)

**Test Result**: ☐ PASS ☐ FAIL  
**Notes**: ********\_********

---

### 4.8 Recent Activity Section

**Objective**: Verify recent activity displays

**Steps**:

1. On dashboard (from 4.1)
2. Scroll to find "Recent Activity" section
3. Review displayed activities

**Expected Results** ✅:

- Recent activities listed
- Each activity shows: timestamp, type, description
- Activities sorted chronologically (newest first)
- Appropriate icons for different activity types
- Activity feed not empty

**Test Result**: ☐ PASS ☐ FAIL  
**Notes**: ********\_********

---

## 👤 Module 5: Profile Management

### 5.1 Navigate to Profile

**Objective**: Verify user can access their profile

**Steps**:

1. Login as regular user
2. Click user avatar or name in header
3. Click "Profile" option

**Expected Results** ✅:

- Profile page loads successfully
- Multiple tabs visible (Profile, Security, Preferences, Privacy)
- User information displayed
- No error messages in console

**Test Result**: ☐ PASS ☐ FAIL  
**Notes**: ********\_********

---

### 5.2 View Profile Information

**Objective**: Verify profile information displays correctly

**Steps**:

1. On profile page (from 5.1)
2. Verify "Profile" tab is active
3. Review displayed information

**Expected Results** ✅:

- Name displayed correctly
- Email displayed correctly
- Role displayed correctly
- Last login date shown
- Profile picture/avatar shown
- All information matches backend data

**Test Result**: ☐ PASS ☐ FAIL  
**Notes**: ********\_********

---

### 5.3 Access Security Settings

**Objective**: Verify security tab accessible

**Steps**:

1. On profile page (from 5.1)
2. Click "Security" tab

**Expected Results** ✅:

- Security tab loads
- Change password option available
- Two-factor authentication settings shown
- Active sessions listed
- Security logs visible

**Test Result**: ☐ PASS ☐ FAIL  
**Notes**: ********\_********

---

### 5.4 Access Preferences

**Objective**: Verify preferences tab accessible

**Steps**:

1. On profile page (from 5.1)
2. Click "Preferences" tab

**Expected Results** ✅:

- Preferences tab loads
- Language selection dropdown visible
- Theme selection available
- Notification preferences shown
- Settings can be modified

**Test Result**: ☐ PASS ☐ FAIL  
**Notes**: ********\_********

---

### 5.5 Change Language Preference

**Objective**: Verify language can be changed

**Steps**:

1. On Preferences tab (from 5.4)
2. Find Language dropdown
3. Select different language (e.g., Spanish)
4. Page refreshes

**Expected Results** ✅:

- Language dropdown shows available options
- Can select new language
- Page language updates (if multi-language support exists)
- Selection persists on page reload
- UI text appears in selected language

**Test Result**: ☐ PASS ☐ FAIL  
**Notes**: ********\_********

---

### 5.6 Change Theme Preference

**Objective**: Verify theme can be changed

**Steps**:

1. On Preferences tab (from 5.4)
2. Find Theme selector (toggle or dropdown)
3. Switch from Light to Dark (or vice versa)
4. Page updates

**Expected Results** ✅:

- Theme toggle visible and clickable
- Dark theme applies (background dark, text light)
- Light theme applies (background light, text dark)
- Theme persists on page reload
- All colors update appropriately
- Text remains readable in both themes

**Test Result**: ☐ PASS ☐ FAIL  
**Notes**: ********\_********

---

## 🔐 Module 6: GDPR Features

### 6.1 Navigate to Privacy & Data Tab

**Objective**: Verify GDPR features accessible

**Steps**:

1. Login as regular user
2. Navigate to Profile page (use 5.1 procedures)
3. Click "Privacy & Data" tab

**Expected Results** ✅:

- Privacy & Data tab loads successfully
- Two main options visible:
  - Export My Data (Data Portability)
  - Delete My Account (Right to Erasure)
- GDPR compliance notice displayed
- Icons and descriptions clear

**Test Result**: ☐ PASS ☐ FAIL  
**Notes**: ********\_********

---

### 6.2 Export Personal Data - Initial Steps

**Objective**: Verify data export dialog opens

**Steps**:

1. On Privacy & Data tab (from 6.1)
2. Locate "Export My Data" or "Request Data Export" button
3. Click the button

**Expected Results** ✅:

- Dialog/modal appears
- Dialog title: "Export Your Data"
- Description explains what will be exported
- User consent confirmation shown
- Cancel and Proceed buttons visible
- Dialog is clear and not overwhelming

**Test Result**: ☐ PASS ☐ FAIL  
**Notes**: ********\_********

---

### 6.3 Export Personal Data - Proceed

**Objective**: Verify data export completes

**Steps**:

1. From export dialog (from 6.2)
2. Review what will be exported
3. Click "Proceed" or "Export" button

**Expected Results** ✅:

- Export begins (loading indicator shows)
- Export completes within 5 seconds
- JSON file downloads automatically
- File named: `user_data_export_YYYY-MM-DD_HH-MM-SS.json`
- Success notification shows
- Dialog closes after export

**Test Result**: ☐ PASS ☐ FAIL  
**Notes**: ********\_********

---

### 6.4 Verify Exported Data

**Objective**: Verify exported file contents are correct

**Steps**:

1. From completed export (from 6.3)
2. Open downloaded JSON file in text editor
3. Review structure and contents

**Expected Results** ✅:

- File is valid JSON (can be parsed)
- File contains user profile information (name, email, role)
- File contains user preferences (language, theme)
- File contains activity history
- File contains audit log entries (user's own actions)
- File is readable (indented JSON)
- File can be opened in JSON viewers
- All personal data is included

**Test Result**: ☐ PASS ☐ FAIL  
**Notes**: ********\_********

---

### 6.5 Delete Account - Initial Dialog

**Objective**: Verify account deletion dialog appears

**Steps**:

1. On Privacy & Data tab (from 6.1)
2. Locate "Delete My Account" or "Request Account Deletion" button
3. Note button color (should be red/warning)
4. Click the button

**Expected Results** ✅:

- Confirmation dialog appears
- Dialog title: "Delete Account?" or similar
- Clear warning message shown
- Warning explains consequences:
  - All data will be permanently deleted
  - Action cannot be undone
  - Session will be terminated
- Cancel and Confirm buttons visible
- Checkbox: "I understand..." required to confirm
- Confirm button disabled until checkbox checked

**Test Result**: ☐ PASS ☐ FAIL  
**Notes**: ********\_********

---

### 6.6 Delete Account - Confirm Checkbox

**Objective**: Verify confirmation checkbox requirement

**Steps**:

1. In deletion confirmation dialog (from 6.5)
2. Attempt to click "Confirm Delete" without checking checkbox
3. Verify button is disabled
4. Check the "I understand..." checkbox
5. Verify button becomes enabled

**Expected Results** ✅:

- Confirm button disabled initially
- Confirmation text clearly visible
- Clicking checkbox enables button
- Button transitions from disabled to enabled
- User must actively acknowledge consequences

**Test Result**: ☐ PASS ☐ FAIL  
**Notes**: ********\_********

---

### 6.7 Delete Account - Execute Deletion

**Objective**: Verify account deletion process

**Steps**:

1. In deletion dialog with checkbox checked (from 6.6)
2. Click "Confirm Delete" or "Delete Account" button

**Expected Results** ✅:

- Dialog shows loading state
- Deletion processing message appears
- Deletion completes within 10 seconds
- User is logged out
- Redirected to home page or login page
- Session cleared
- Success notification shown (or login page appears)

**Test Result**: ☐ PASS ☐ FAIL  
**Notes**: ********\_********

---

### 6.8 Verify Account Deleted

**Objective**: Verify account cannot be re-accessed

**Steps**:

1. After deletion (from 6.7)
2. Try to login with deleted account credentials
3. Attempt login with email: `[deleted user email]`
4. Enter any password

**Expected Results** ✅:

- Login fails with error: "User not found" or "Invalid credentials"
- Cannot login to deleted account
- Error message clear (no confusion)
- No data accessible
- Account confirmed permanently deleted

**Test Result**: ☐ PASS ☐ FAIL  
**Notes**: ********\_********

---

## 🔔 Module 7: Error Handling & Notifications

### 7.1 Network Error Handling

**Objective**: Verify network error handling

**Steps**:

1. Open DevTools (F12)
2. Go to Network tab
3. Click offline button (or use Chrome device emulation: Offline)
4. Perform an action that requires network (e.g., login, search)
5. Turn network back online

**Expected Results** ✅:

- Error message appears: "Unable to connect to server"
- Message is user-friendly (not technical)
- User can retry action
- No application crash
- UI remains functional
- Error auto-dismisses or has close button

**Test Result**: ☐ PASS ☐ FAIL  
**Notes**: ********\_********

---

### 7.2 Validation Error Handling

**Objective**: Verify form validation errors

**Steps**:

1. On any form (login, profile edit, etc.)
2. Leave required field empty
3. Submit form

**Expected Results** ✅:

- Error message shows for field
- Message indicates field is required
- Form not submitted
- Error icon displayed next to field
- Error color applied to field
- User guided to correct input

**Test Result**: ☐ PASS ☐ FAIL  
**Notes**: ********\_********

---

### 7.3 Authorization Error Handling

**Objective**: Verify authorization error when accessing restricted resource

**Steps**:

1. Login as regular user
2. Try to access admin page directly via URL
3. Example: `http://localhost:5173/admin/users`

**Expected Results** ✅:

- Access denied
- Redirected to appropriate page (dashboard or login)
- Error message shown: "You don't have permission"
- Message is clear and helpful
- No error in console

**Test Result**: ☐ PASS ☐ FAIL  
**Notes**: ********\_********

---

### 7.4 Toast Notification - Success

**Objective**: Verify success notifications

**Steps**:

1. Perform successful action (e.g., update profile, export data)
2. Observe notification

**Expected Results** ✅:

- Green success notification appears
- Message is clear and positive
- Notification positioned consistently (usually top-right)
- Notification auto-dismisses after ~5 seconds
- Can manually close via X button
- Multiple notifications stack properly

**Test Result**: ☐ PASS ☐ FAIL  
**Notes**: ********\_********

---

### 7.5 Toast Notification - Error

**Objective**: Verify error notifications

**Steps**:

1. Perform action that fails (e.g., invalid login, network error)
2. Observe notification

**Expected Results** ✅:

- Red/orange error notification appears
- Error message is clear and actionable
- Suggests next steps when possible
- Positioned consistently
- Can be manually dismissed
- Multiple errors stack properly

**Test Result**: ☐ PASS ☐ FAIL  
**Notes**: ********\_********

---

## 📱 Module 8: Mobile/Responsive Testing

### 8.1 Mobile Layout - 320px

**Objective**: Verify mobile layout on small screens

**Steps**:

1. Open DevTools (F12)
2. Click Device Toolbar (toggle device mode)
3. Select "iPhone SE" or 320px width
4. Navigate through application

**Expected Results** ✅:

- Layout adapts to mobile width
- No horizontal scrolling
- Navigation works (hamburger menu if used)
- Buttons are touch-friendly (44px minimum)
- Text readable without zoom
- Images scale appropriately
- Modals fit on screen
- No content cutoff

**Test Result**: ☐ PASS ☐ FAIL  
**Notes**: ********\_********

---

### 8.2 Tablet Layout - 768px

**Objective**: Verify tablet layout

**Steps**:

1. In DevTools device mode
2. Select "iPad" or set width to 768px
3. Navigate through application

**Expected Results** ✅:

- Layout optimized for tablet
- Two-column layout where applicable
- Navigation adapted for tablet
- Tables readable without scrolling
- Buttons appropriately sized
- Touch interactions work

**Test Result**: ☐ PASS ☐ FAIL  
**Notes**: ********\_********

---

### 8.3 Desktop Layout - 1920px

**Objective**: Verify full desktop layout

**Steps**:

1. Maximize browser to full width
2. Or set custom width to 1920px
3. Navigate through application

**Expected Results** ✅:

- Full multi-column layout
- Sidebar displays fully
- Content area optimal width
- No excessive whitespace
- All features accessible
- Responsive design respects desktop space

**Test Result**: ☐ PASS ☐ FAIL  
**Notes**: ********\_********

---

### 8.4 Orientation Change

**Objective**: Verify layout adapts to orientation changes

**Steps**:

1. In DevTools device mode with mobile selected
2. Rotate device (or toggle orientation)
3. Observe layout change

**Expected Results** ✅:

- Layout changes appropriately
- No data loss on rotation
- UI remains functional
- No layout breaks
- Content re-flows properly
- No need for manual refresh

**Test Result**: ☐ PASS ☐ FAIL  
**Notes**: ********\_********

---

## ✅ Test Report Compilation

### Summary

| Module             | Tests  | Passed | Failed | Status |
| ------------------ | ------ | ------ | ------ | ------ |
| Authentication     | 5      |        |        |        |
| User Management    | 8      |        |        |        |
| Audit Log          | 6      |        |        |        |
| Health Monitoring  | 8      |        |        |        |
| Profile Management | 6      |        |        |        |
| GDPR Features      | 8      |        |        |        |
| Error Handling     | 5      |        |        |        |
| Responsive Design  | 4      |        |        |        |
| **TOTAL**          | **50** |        |        |        |

---

### Issues Found

#### Critical Issues (Must Fix)

1.
2.
3.

#### Major Issues (Should Fix)

1.
2.
3.

#### Minor Issues (Nice to Fix)

1.
2.
3.

---

### Sign-Off

**Test Completion Date**: ******\_\_\_******  
**Tester Name**: ******\_\_\_******  
**Tester Email**: ******\_\_\_******  
**Environment**: Chrome / Firefox / Safari / Edge  
**Overall Status**: ☐ PASS ☐ WARNING ☐ FAIL

**Comments/Notes**:

---

---

---

---

**Document Version**: 1.0  
**Last Updated**: October 20, 2025  
**Reference**: QA_TESTING_CHECKLIST.md, PHASE7_TESTING_GUIDE.md
